"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { useStudentDashboardStats } from "@/hooks/use-student-dashboard-stats";
import {
  TrophyIcon,
  TargetIcon,
  ClipboardListIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EXAM_TYPE_LABELS: Record<string, string> = {
  TYT: "TYT",
  "AYT-SAY": "AYT Sayısal",
  "AYT-EA": "AYT EA",
  "AYT-SÖZ": "AYT Sözel",
  LGS: "LGS",
  YDT: "YDT",
};

const EXAM_TYPE_VARIANTS: Record<
  string,
  "primary" | "success" | "warning" | "danger" | "default"
> = {
  TYT: "primary",
  "AYT-SAY": "primary",
  "AYT-EA": "primary",
  "AYT-SÖZ": "primary",
  LGS: "primary",
  YDT: "primary",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function SubjectRow({
  subject_name,
  last_net,
  target_net,
  diff,
}: {
  subject_name: string;
  last_net: number;
  target_net: number | null;
  diff: number | null;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b last:border-0">
      <p className="text-sm text-muted-foreground truncate">{subject_name}</p>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-semibold tabular-nums">
          {last_net.toFixed(2)}
        </span>
        {target_net !== null && (
          <span className="text-xs text-muted-foreground tabular-nums">
            / {target_net} hedef
          </span>
        )}
        {diff !== null && (
          <span
            className={cn(
              "text-xs font-semibold tabular-nums flex items-center gap-0.5",
              diff > 0
                ? "text-green-500"
                : diff < 0
                  ? "text-red-500"
                  : "text-muted-foreground",
            )}
          >
            {diff > 0 ? (
              <TrendingUpIcon className="h-3 w-3" />
            ) : diff < 0 ? (
              <TrendingDownIcon className="h-3 w-3" />
            ) : (
              <MinusIcon className="h-3 w-3" />
            )}
            {diff > 0 ? "+" : ""}
            {diff.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}

function ExamCard({
  title,
  examName,
  examDate,
  totalNet,
  subjects,
  loading,
}: {
  title: string;
  examName: string | null;
  examDate: string | null;
  totalNet: number | null;
  subjects: {
    subject_id: string;
    subject_name: string;
    subject_slug: string;
    last_net: number;
    target_net: number | null;
    diff: number | null;
  }[];
  loading: boolean;
}) {
  if (loading) {
    return <div className="h-64 rounded-2xl bg-muted animate-pulse" />;
  }

  return (
    <div className="rounded-2xl bg-card overflow-hidden">
      <div className="px-5 py-4 border-b bg-muted/80 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
          {examName ? (
            <p className="text-sm font-semibold mt-0.5">{examName}</p>
          ) : (
            <p className="text-sm text-muted-foreground mt-0.5">
              Henüz sonuç yok
            </p>
          )}
        </div>
        {examDate && (
          <p className="text-xs text-muted-foreground">
            {formatDate(examDate)}
          </p>
        )}
      </div>

      {totalNet !== null && subjects.length > 0 ? (
        <div className="px-5 py-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground">Toplam Net</p>
            <p className="text-2xl font-bold tabular-nums">
              {totalNet.toFixed(2)}
            </p>
          </div>
          <div>
            {subjects.map((s) => (
              <SubjectRow key={s.subject_id} {...s} />
            ))}
          </div>
        </div>
      ) : (
        <div className="px-5 py-12 flex items-center justify-center text-sm text-muted-foreground">
          Henüz sonuç girilmemiş.
        </div>
      )}
    </div>
  );
}

export default function StudentDashboard() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [idLoading, setIdLoading] = useState(true);

  useEffect(() => {
    async function getStudent() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("students")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        setStudentId(data?.id ?? null);
      } finally {
        setIdLoading(false);
      }
    }
    getStudent();
  }, []);

  const { stats, loading } = useStudentDashboardStats(studentId ?? "");
  const isLoading = idLoading || loading;

  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <PageHeader
        title="Özet"
        description="Sınav sonuçlarınızı genel olarak görüntüleyin."
      />

      {/* Üst stat kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <StatCard
          title="Son Kurum Sınavı"
          value={
            isLoading ? "..." : (stats?.lastOfficialTotalNet?.toFixed(2) ?? "—")
          }
          sub={
            isLoading ? "" : (stats?.lastOfficialExamName ?? "Henüz sonuç yok")
          }
          icon={TrophyIcon}
          bgIcon={TrophyIcon}
          variant="warning"
        />
        <StatCard
          title="Son Genel Deneme"
          value={
            isLoading ? "..." : (stats?.lastGeneralTotalNet?.toFixed(2) ?? "—")
          }
          sub={
            isLoading ? "" : (stats?.lastGeneralExamName ?? "Henüz sonuç yok")
          }
          icon={ClipboardListIcon}
          bgIcon={ClipboardListIcon}
          variant="primary"
        />

        {/* Alan bazlı hedef netleri */}
        {!isLoading &&
          stats?.examTypeTargets &&
          stats.examTypeTargets.map(({ exam_type, target_net }) => (
            <StatCard
              key={exam_type}
              title={`${EXAM_TYPE_LABELS[exam_type] ?? exam_type} Hedefi`}
              value={target_net.toFixed(2)}
              sub="toplam hedef net"
              icon={TargetIcon}
              bgIcon={TargetIcon}
              variant={EXAM_TYPE_VARIANTS[exam_type] ?? "default"}
            />
          ))}
      </div>

      {/* Alt — son sınav detayları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ExamCard
          title="Son Kurum Sınavı"
          examName={stats?.lastOfficialExamName ?? null}
          examDate={stats?.lastOfficialExamDate ?? null}
          totalNet={stats?.lastOfficialTotalNet ?? null}
          subjects={stats?.lastOfficialSubjects ?? []}
          loading={isLoading}
        />
        <ExamCard
          title="Son Genel Deneme"
          examName={stats?.lastGeneralExamName ?? null}
          examDate={stats?.lastGeneralExamDate ?? null}
          totalNet={stats?.lastGeneralTotalNet ?? null}
          subjects={stats?.lastGeneralSubjects ?? []}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
