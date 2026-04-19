"use client";

import { useState } from "react";
import { useProgressData, type ViewType } from "@/hooks/use-progress-data";
import { useSubjects } from "@/hooks/use-subjects";
import { useExamResults } from "@/hooks/use-exam-results";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  CheckIcon,
  BarChart2Icon,
  TrendingUpIcon as LineChartIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudentGoals } from "@/hooks/use-student-goals";

type TimeFilter = "week" | "month" | "all";
type ChartType = "line" | "bar";

const TIME_FILTERS: { label: string; value: TimeFilter }[] = [
  { label: "1H", value: "week" },
  { label: "1A", value: "month" },
  { label: "Tümü", value: "all" },
];

const VIEW_TYPES: { label: string; value: ViewType }[] = [
  { label: "Genel", value: "general" },
  { label: "Branş", value: "branch" },
  { label: "Kurum", value: "official" },
];

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

function applyTimeFilter<T extends { date: string }>(
  points: T[],
  filter: TimeFilter,
): T[] {
  if (filter === "all") return points;
  const now = new Date();
  const cutoff =
    filter === "week"
      ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return points.filter((p) => new Date(p.date + "T00:00:00") >= cutoff);
}

function SubjectChart({
  subject_name,
  points,
  maxPossibleNet,
  chartType,
  targetNet,
}: {
  subject_name: string;
  points: {
    date: string;
    exam_name: string;
    net: number;
    correct: number;
    incorrect: number;
    empty: number;
  }[];
  maxPossibleNet: number;
  chartType: ChartType;
  targetNet?: number;
}) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  const filtered = applyTimeFilter(points, timeFilter);
  const chartData = filtered.map((p, idx) => ({
    ...p,
    label: `${idx + 1}`,
    fullLabel: `${formatDate(p.date)} · ${p.exam_name}`,
  }));

  const first = filtered[0]?.net ?? 0;
  const last = filtered[filtered.length - 1]?.net ?? 0;
  const diff = filtered.length >= 2 ? last - first : null;

  return (
    <div className="rounded-2xl bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/80 gap-4 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          {diff === null ? (
            <MinusIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          ) : diff > 0 ? (
            <TrendingUpIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
          ) : diff < 0 ? (
            <TrendingDownIcon className="h-3.5 w-3.5 text-red-500 shrink-0" />
          ) : (
            <MinusIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          )}
          <p className="text-sm font-semibold truncate">{subject_name}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {diff !== null && (
            <span
              className={cn(
                "text-xs font-semibold tabular-nums",
                diff > 0
                  ? "text-green-500"
                  : diff < 0
                    ? "text-red-500"
                    : "text-muted-foreground",
              )}
            >
              {diff > 0 ? "+" : ""}
              {diff.toFixed(2)} net
            </span>
          )}
          <span className="text-xs text-muted-foreground hidden sm:block">
            İlk:{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {first.toFixed(2)}
            </span>
          </span>
          <span className="text-xs text-muted-foreground hidden sm:block">
            Son:{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {last.toFixed(2)}
            </span>
          </span>
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-border/80 bg-muted">
            {TIME_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setTimeFilter(f.value)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap",
                  timeFilter === f.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-2">
        {filtered.length === 0 ? (
          <div className="h-36 flex items-center justify-center text-xs text-muted-foreground">
            Bu zaman aralığında sonuç bulunamadı.
          </div>
        ) : filtered.length < 2 ? (
          <div className="h-36 flex items-center justify-center text-xs text-muted-foreground">
            Grafik için en az 2 sonuç gerekli.
          </div>
        ) : (
          <ChartContainer
            config={{ net: { label: "Net" } }}
            className="h-36 sm:h-40 md:h-44 lg:h-48 xl:h-52 w-full"
          >
            {chartType === "line" ? (
              <LineChart
                data={chartData}
                margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  horizontal={true}
                  vertical={false}
                  stroke="#000000"
                  strokeDasharray="4 4"
                  strokeOpacity={0.1}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  tickLine={true}
                  axisLine={true}
                  tickFormatter={(_, idx) =>
                    formatDate(filtered[idx]?.date ?? "")
                  }
                />
                <YAxis
                  domain={[0, maxPossibleNet]}
                  tick={{ fontSize: 10 }}
                  tickLine={true}
                  axisLine={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.fullLabel ?? ""
                      }
                      formatter={(value) => [`${Number(value).toFixed(2)} Net`]}
                    />
                  }
                />
                {targetNet && targetNet > 0 && (
                  <ReferenceLine
                    y={targetNet}
                    stroke="oklch(0.627 0.194 149.21)"
                    strokeDasharray="5 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Hedef: ${targetNet}`,
                      position: "insideTopRight",
                      fontSize: 10,
                      fill: "oklch(0.627 0.194 149.21)",
                    }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="net"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            ) : (
              <BarChart
                data={chartData}
                margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  horizontal={true}
                  vertical={false}
                  stroke="#000000"
                  strokeDasharray="4 4"
                  strokeOpacity={0.1}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  tickLine={true}
                  axisLine={true}
                  tickFormatter={(_, idx) =>
                    formatDate(filtered[idx]?.date ?? "")
                  }
                />
                <YAxis
                  domain={[0, maxPossibleNet]}
                  tick={{ fontSize: 10 }}
                  tickLine={true}
                  axisLine={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.fullLabel ?? ""
                      }
                      formatter={(value) => [`${Number(value).toFixed(2)} Net`]}
                    />
                  }
                />
                {targetNet && targetNet > 0 && (
                  <ReferenceLine
                    y={targetNet}
                    stroke="oklch(0.627 0.194 149.21)"
                    strokeDasharray="5 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Hedef: ${targetNet}`,
                      position: "insideTopRight",
                      fontSize: 10,
                      fill: "oklch(0.627 0.194 149.21)",
                    }}
                  />
                )}
                <Bar dataKey="net" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {chartData.map((entry, index) => {
                    const prev = chartData[index - 1]?.net ?? entry.net;
                    const isUp = entry.net >= prev;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === 0
                            ? "hsl(var(--primary))"
                            : isUp
                              ? "oklch(0.627 0.194 149.21)"
                              : "oklch(0.628 0.224 22.22)"
                        }
                        fillOpacity={0.85}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            )}
          </ChartContainer>
        )}
      </div>
    </div>
  );
}

interface ProgressViewProps {
  studentId: string;
}

export function ProgressView({ studentId }: ProgressViewProps) {
  const [viewType, setViewType] = useState<ViewType>("general");
  const [showOfficial, setShowOfficial] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>("line");

  const { goals: studentGoals } = useStudentGoals(studentId);
  const { results } = useExamResults(studentId);
  const { data, loading } = useProgressData(studentId, viewType, showOfficial);
  const { subjects } = useSubjects();

  const generalCount = results.filter(
    (r) => !r.is_standalone && (showOfficial || !r.is_official),
  ).length;
  const branchCount = results.filter(
    (r) => r.is_standalone && (showOfficial || !r.is_official),
  ).length;
  const officialCount = results.filter((r) => r.is_official).length;

  const counts: Record<ViewType, number> = {
    general: generalCount,
    branch: branchCount,
    official: officialCount,
  };

  const categories = data.map((d) => d.category);
  const filtered = selectedCategory
    ? data.filter((d) => d.category === selectedCategory)
    : data;

  function handleViewChange(v: ViewType) {
    setViewType(v);
    setSelectedCategory(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filtreler */}
      <div className="flex flex-row flex-wrap gap-3 items-center">
        {/* View tipi */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted w-fit">
          {VIEW_TYPES.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => handleViewChange(v.value)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                viewType === v.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v.label}
              {!loading && (
                <span
                  className={cn(
                    "ml-1.5 text-xs px-1.5 py-0.5 rounded-full",
                    viewType === v.value
                      ? "bg-muted text-muted-foreground"
                      : "bg-muted/50 text-muted-foreground/70",
                  )}
                >
                  {counts[v.value]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Kurum sınavları toggle */}
        {viewType !== "official" && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted w-fit">
            <button
              type="button"
              onClick={() => setShowOfficial((p) => !p)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-2",
                showOfficial
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "h-3.5 w-3.5 rounded-sm border-2 flex items-center justify-center shrink-0 transition-all",
                  showOfficial
                    ? "bg-primary border-primary"
                    : "border-current opacity-50",
                )}
              >
                {showOfficial && (
                  <CheckIcon className="h-2.5 w-2.5 text-primary-foreground" />
                )}
              </div>
              Kurum Sınavları
            </button>
          </div>
        )}

        {/* Grafik tipi toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
          <button
            type="button"
            onClick={() => setChartType("line")}
            className={cn(
              "px-2.5 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5",
              chartType === "line"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LineChartIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Çizgi</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType("bar")}
            className={cn(
              "px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5",
              chartType === "bar"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <BarChart2Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Bar</span>
          </button>
        </div>

        {/* Kategori dropdown */}
        {!loading && categories.length > 1 && (
          <Select
            value={selectedCategory ?? "all"}
            onValueChange={(val) =>
              setSelectedCategory(val === "all" ? null : val)
            }
          >
            <SelectTrigger className="h-10! w-48 shrink-0 hover:cursor-pointer">
              <SelectValue placeholder="Tüm Kategoriler" />
            </SelectTrigger>
            <SelectContent className="p-1">
              <SelectItem value="all" className="hover:cursor-pointer">
                Tüm Kategoriler
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem
                  key={cat}
                  value={cat}
                  className="rounded-lg cursor-pointer py-1 px-3"
                >
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* İçerik */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-52 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <TrendingUpIcon className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">
            {viewType === "general"
              ? "Henüz genel deneme sonucu girilmemiş."
              : viewType === "branch"
                ? "Henüz branş denemesi sonucu girilmemiş."
                : "Henüz kurum sınavı sonucu girilmemiş."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {filtered.map((categoryData) => (
            <div key={categoryData.category} className="space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-sm text-muted-foreground font-bold">
                  {categoryData.category}
                </h2>
                <div className="flex-1 h-px bg-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {categoryData.subjects.length} ders
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {categoryData.subjects.map((subject) => {
                  const subjectDef = subjects.find(
                    (s) => s.id === subject.subject_id,
                  );
                  const goalForSubject = studentGoals.find(
                    (g) => g.subject_id === subject.subject_id,
                  );
                  return (
                    <SubjectChart
                      key={subject.subject_id}
                      subject_name={subject.subject_name}
                      points={subject.points}
                      maxPossibleNet={subjectDef?.default_questions ?? 40}
                      chartType={chartType}
                      targetNet={goalForSubject?.target_net}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
