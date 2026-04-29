"use client";

import { useState } from "react";
import { useStudentGoals } from "@/hooks/use-student-goals";
import { Subject, useSubjects } from "@/hooks/use-subjects";
import {
  EXAM_TYPES,
  EXAM_TYPE_LABELS,
  EXAM_TYPE_SUBJECT_SLUGS,
  SUBJECT_GROUPS,
  SLUG_TO_GROUP,
  type ExamType,
  EXAM_TYPE_SCORE_CONFIG,
} from "@/lib/exam-type-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  PencilIcon,
  CheckIcon,
  XIcon,
  TargetIcon,
  ChevronDownIcon,
} from "lucide-react";

interface StudentGoalsViewProps {
  studentId: string;
  canEdit?: boolean;
}

interface GoalRow {
  subject_id: string;
  subject_name: string;
  subject_slug: string;
  target_net: number;
  default_questions: number;
  coefficient: number;
}

// Üst grup label'ları
const GROUP_LABELS: Record<string, string> = {
  "tyt-sosyal": "Sosyal Bilimler",
  "tyt-fen": "Fen Bilimleri",
};

export function StudentGoalsView({
  studentId,
  canEdit = false,
}: StudentGoalsViewProps) {
  const { goals, loading, refetch } = useStudentGoals(studentId);
  const { subjects } = useSubjects();

  const [selectedExamType, setSelectedExamType] = useState<ExamType>("TYT");
  const [editing, setEditing] = useState(false);
  const [editRows, setEditRows] = useState<GoalRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );

  const slugs = EXAM_TYPE_SUBJECT_SLUGS[selectedExamType];
  const examSubjects = slugs
    .map((slug) => subjects.find((s) => s.slug === slug))
    .filter(Boolean) as typeof subjects;

  const currentGoals = goals.filter((g) => g.exam_type === selectedExamType);

  type DisplayItem =
    | { type: "subject"; subject: Subject }
    | {
        type: "group";
        groupSlug: string;
        childSlugs: string[];
        children: Subject[];
      };

  function buildDisplayGroups(): DisplayItem[] {
    const handled = new Set<string>();
    const items: DisplayItem[] = [];

    for (const slug of slugs) {
      if (handled.has(slug)) continue;
      const parentSlug = SLUG_TO_GROUP[slug];

      if (parentSlug && SUBJECT_GROUPS[parentSlug]) {
        if (
          !items.find((i) => i.type === "group" && i.groupSlug === parentSlug)
        ) {
          const childSlugs = SUBJECT_GROUPS[parentSlug];
          const children = childSlugs
            .map((cs) => subjects.find((s) => s.slug === cs))
            .filter((s): s is Subject => Boolean(s));
          items.push({
            type: "group",
            groupSlug: parentSlug,
            childSlugs,
            children,
          });
          childSlugs.forEach((cs) => handled.add(cs));
        }
      } else {
        const subject = subjects.find((s) => s.slug === slug);
        if (subject) items.push({ type: "subject", subject });
        handled.add(slug);
      }
    }
    return items;
  }

  const displayGroups = buildDisplayGroups();

  const { base_score, max_score } = EXAM_TYPE_SCORE_CONFIG[selectedExamType];

  function calcScore(
    rows: {
      target_net: number;
      coefficient: number;
      default_questions: number;
    }[],
  ) {
    const rawScore =
      base_score + rows.reduce((s, r) => s + r.target_net * r.coefficient, 0);
    const theoreticalMax =
      base_score +
      rows.reduce((s, r) => s + r.default_questions * r.coefficient, 0);
    return theoreticalMax > 0
      ? Math.round((rawScore / theoreticalMax) * max_score * 100) / 100
      : 0;
  }

  const targetScore = calcScore(
    examSubjects.map((s) => ({
      target_net:
        currentGoals.find(
          (g) =>
            g.subject_id === s.id &&
            !Object.keys(SUBJECT_GROUPS).includes(g.subject_slug),
        )?.target_net ?? 0,
      coefficient: s.coefficient,
      default_questions: s.default_questions,
    })),
  );

  const editScore = calcScore(editRows);

  function startEditing() {
    setEditRows(
      examSubjects.map((s) => {
        const existing = currentGoals.find((g) => g.subject_id === s.id);
        return {
          subject_id: s.id,
          subject_name: s.name,
          subject_slug: s.slug,
          target_net: existing?.target_net ?? 0,
          default_questions: s.default_questions,
          coefficient: s.coefficient,
        };
      }),
    );
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setEditRows([]);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/student-goals/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          exam_type: selectedExamType,
          goals: editRows.map((r) => ({
            subject_id: r.subject_id,
            subject_slug: r.subject_slug,
            target_net: r.target_net,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bir hata oluştu.");
      toast.success("Hedefler kaydedildi.");
      setEditing(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  const editTotal = editRows.reduce((s, r) => s + (r.target_net || 0), 0);

  // Toplam hedef net — sadece alt derslerden (üst grupları hariç tut)
  const totalTarget = currentGoals
    .filter((g) => !Object.keys(SUBJECT_GROUPS).includes(g.subject_slug))
    .reduce((s, g) => s + g.target_net, 0);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alan seçici */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted w-fit flex-wrap">
        {EXAM_TYPES.map((type) => {
          const typeGoals = goals.filter(
            (g) =>
              g.exam_type === type &&
              g.target_net > 0 &&
              !Object.keys(SUBJECT_GROUPS).includes(g.subject_slug),
          );
          return (
            <button
              key={type}
              type="button"
              onClick={() => {
                setSelectedExamType(type);
                setEditing(false);
                setEditRows([]);
                setExpandedGroups({});
              }}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5",
                selectedExamType === type
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {EXAM_TYPE_LABELS[type]}
              {typeGoals.length > 0 && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                    selectedExamType === type
                      ? "bg-primary/10 text-primary"
                      : "bg-muted-foreground/20 text-muted-foreground",
                  )}
                >
                  {typeGoals.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: ders hedefleri */}
        <div className="lg:col-span-2 rounded-2xl bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/80">
            <div className="flex items-center gap-2">
              <TargetIcon className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">
                {EXAM_TYPE_LABELS[selectedExamType]} Hedefleri
              </p>
            </div>
            {canEdit && !editing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={startEditing}
                className="gap-1.5 cursor-pointer h-8"
              >
                <PencilIcon className="h-3.5 w-3.5" />
                Düzenle
              </Button>
            )}
            {canEdit && editing && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="gap-1.5 cursor-pointer h-8 text-muted-foreground"
                >
                  <XIcon className="h-3.5 w-3.5" />
                  İptal
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="gap-1.5 cursor-pointer h-8"
                >
                  <CheckIcon className="h-3.5 w-3.5" />
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </div>
            )}
          </div>

          {examSubjects.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Bu alan için ders bulunamadı.
            </div>
          ) : editing ? (
            // Edit modu — alt dersler gruplu gösterilir
            <div className="divide-y">
              {displayGroups.map((item) => {
                if (item.type === "subject") {
                  const row = editRows.find(
                    (r) => r.subject_id === item.subject.id,
                  );
                  if (!row) return null;
                  const pct = Math.min(
                    (row.target_net / row.default_questions) * 100,
                    100,
                  );
                  return (
                    <div key={item.subject.id} className="px-5 py-3 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-medium">
                          {item.subject.name}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          <Input
                            type="number"
                            min={0}
                            max={row.default_questions}
                            step={0.5}
                            value={row.target_net || ""}
                            onChange={(e) =>
                              setEditRows((prev) =>
                                prev.map((r) =>
                                  r.subject_id === row.subject_id
                                    ? {
                                        ...r,
                                        target_net: Math.min(
                                          parseFloat(e.target.value) || 0,
                                          r.default_questions,
                                        ),
                                      }
                                    : r,
                                ),
                              )
                            }
                            placeholder="0"
                            className="w-20 h-8 text-center tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            disabled={saving}
                          />
                          <span className="text-xs text-muted-foreground w-12">
                            / {row.default_questions} net
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/60 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                }

                // Grup
                const groupRows = item.children
                  .map((child) =>
                    editRows.find((r) => r.subject_id === child.id),
                  )
                  .filter(Boolean) as GoalRow[];
                const groupTotal = groupRows.reduce(
                  (s, r) => s + (r.target_net || 0),
                  0,
                );
                const groupMax = groupRows.reduce(
                  (s, r) => s + r.default_questions,
                  0,
                );
                const groupPct =
                  groupMax > 0
                    ? Math.min((groupTotal / groupMax) * 100, 100)
                    : 0;

                return (
                  <div key={item.groupSlug}>
                    {/* Grup başlığı */}
                    <div className="px-5 py-3 bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {GROUP_LABELS[item.groupSlug] ?? item.groupSlug}
                        </p>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          Toplam:{" "}
                          <span className="font-bold text-foreground">
                            {groupTotal}
                          </span>{" "}
                          / {groupMax} net
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/40 transition-all"
                          style={{ width: `${groupPct}%` }}
                        />
                      </div>
                    </div>
                    {/* Alt dersler */}
                    {groupRows.map((row) => {
                      const pct = Math.min(
                        (row.target_net / row.default_questions) * 100,
                        100,
                      );
                      return (
                        <div
                          key={row.subject_id}
                          className="px-5 py-3 pl-8 space-y-2 border-t"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-sm font-medium">
                              {row.subject_name}
                            </p>
                            <div className="flex items-center gap-2 shrink-0">
                              <Input
                                type="number"
                                min={0}
                                max={row.default_questions}
                                step={0.5}
                                value={row.target_net || ""}
                                onChange={(e) =>
                                  setEditRows((prev) =>
                                    prev.map((r) =>
                                      r.subject_id === row.subject_id
                                        ? {
                                            ...r,
                                            target_net: Math.min(
                                              parseFloat(e.target.value) || 0,
                                              r.default_questions,
                                            ),
                                          }
                                        : r,
                                    ),
                                  )
                                }
                                placeholder="0"
                                className="w-20 h-8 text-center tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                disabled={saving}
                              />
                              <span className="text-xs text-muted-foreground w-12">
                                / {row.default_questions} net
                              </span>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary/60 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : (
            // Görüntüleme modu — gruplu
            <div className="divide-y">
              {displayGroups.map((item) => {
                if (item.type === "subject") {
                  const goal = currentGoals.find(
                    (g) => g.subject_id === item.subject.id,
                  );
                  const maxNet = item.subject.default_questions;
                  const pct = goal
                    ? Math.min((goal.target_net / maxNet) * 100, 100)
                    : 0;
                  return (
                    <div key={item.subject.id} className="px-5 py-3 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-medium">
                          {item.subject.name}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {goal && goal.target_net > 0 ? (
                            <>
                              <span className="text-sm font-bold tabular-nums text-primary">
                                {goal.target_net}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                / {maxNet} net
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Hedef girilmemiş
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                }

                // Grup görüntüleme
                const parentGoal = currentGoals.find(
                  (g) => g.subject_slug === item.groupSlug,
                );
                const groupTotal = parentGoal?.target_net ?? 0;
                const groupMax = item.children.reduce(
                  (s, c) => s + c.default_questions,
                  0,
                );
                const groupPct =
                  groupMax > 0
                    ? Math.min((groupTotal / groupMax) * 100, 100)
                    : 0;
                const isExpanded = expandedGroups[item.groupSlug] ?? false;

                return (
                  <div key={item.groupSlug}>
                    {/* Grup satırı — tıklanınca açılır */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedGroups((prev) => ({
                          ...prev,
                          [item.groupSlug]: !prev[item.groupSlug],
                        }))
                      }
                      className="w-full px-5 py-3 space-y-2 text-left hover:bg-muted/20 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <ChevronDownIcon
                            className={cn(
                              "h-3.5 w-3.5 text-muted-foreground transition-transform",
                              isExpanded && "rotate-180",
                            )}
                          />
                          <p className="text-sm font-semibold">
                            {GROUP_LABELS[item.groupSlug] ?? item.groupSlug}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {groupTotal > 0 ? (
                            <>
                              <span className="text-sm font-bold tabular-nums text-primary">
                                {groupTotal}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                / {groupMax} net
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Hedef girilmemiş
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${groupPct}%` }}
                        />
                      </div>
                    </button>

                    {/* Alt dersler — expand edilince */}
                    {isExpanded &&
                      item.children.map((child) => {
                        const childGoal = currentGoals.find(
                          (g) => g.subject_id === child.id,
                        );
                        const childMax = child.default_questions;
                        const childPct = childGoal
                          ? Math.min(
                              (childGoal.target_net / childMax) * 100,
                              100,
                            )
                          : 0;
                        return (
                          <div
                            key={child.id}
                            className="px-5 py-2.5 pl-10 space-y-1.5 border-t bg-muted/10"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-xs font-medium text-muted-foreground">
                                {child.name}
                              </p>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {childGoal && childGoal.target_net > 0 ? (
                                  <>
                                    <span className="text-xs font-bold tabular-nums text-primary">
                                      {childGoal.target_net}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">
                                      / {childMax} net
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-[11px] text-muted-foreground">
                                    —
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="h-1 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary/60 transition-all"
                                style={{ width: `${childPct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sağ: özet */}
        <div className="space-y-4">
          {/* Toplam net kartı */}
          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {editing ? "Hedef Toplam Net" : "Toplam Hedef Net"}
            </p>
            <p className="text-4xl font-bold tabular-nums text-primary">
              {editing ? editTotal.toFixed(2) : totalTarget.toFixed(2)}
            </p>
          </div>

          {/* Hedef puan kartı */}
          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Hedef Puan
              </p>
              <p className="text-xs text-muted-foreground">
                {max_score} üzerinden yaklaşık puan
              </p>
            </div>
            <p className="text-4xl font-bold tabular-nums text-primary">
              {editing ? editScore.toFixed(2) : targetScore.toFixed(2)}
            </p>
          </div>

          {/* Ders dağılımı özeti */}
          {!editing && (
            <div className="rounded-2xl border bg-card p-5 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Ders Dağılımı
              </p>
              <div className="space-y-2.5">
                {displayGroups.map((item) => {
                  if (item.type === "subject") {
                    const goal = currentGoals.find(
                      (g) => g.subject_id === item.subject.id,
                    );
                    const maxNet = item.subject.default_questions;
                    const pct = goal
                      ? Math.min((goal.target_net / maxNet) * 100, 100)
                      : 0;
                    return (
                      <div key={item.subject.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground truncate max-w-30">
                            {item.subject.name}
                          </span>
                          <span
                            className={cn(
                              "tabular-nums font-semibold",
                              goal && goal.target_net > 0
                                ? "text-primary"
                                : "text-muted-foreground/40",
                            )}
                          >
                            {goal?.target_net ?? 0}
                          </span>
                        </div>
                        <div className="h-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/70 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  }

                  // Grup özet
                  const parentGoal = currentGoals.find(
                    (g) => g.subject_slug === item.groupSlug,
                  );
                  const groupTotal = parentGoal?.target_net ?? 0;
                  const groupMax = item.children.reduce(
                    (s, c) => s + c.default_questions,
                    0,
                  );
                  const groupPct =
                    groupMax > 0
                      ? Math.min((groupTotal / groupMax) * 100, 100)
                      : 0;
                  return (
                    <div key={item.groupSlug} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground truncate max-w-30">
                          {GROUP_LABELS[item.groupSlug] ?? item.groupSlug}
                        </span>
                        <span
                          className={cn(
                            "tabular-nums font-semibold",
                            groupTotal > 0
                              ? "text-primary"
                              : "text-muted-foreground/40",
                          )}
                        >
                          {groupTotal}
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/70 transition-all"
                          style={{ width: `${groupPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
