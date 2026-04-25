"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react";

type TimeFilter = "1ay" | "3ay" | "6ay" | "tumu";

const TIME_FILTERS: { label: string; value: TimeFilter }[] = [
  { label: "1A", value: "1ay" },
  { label: "3A", value: "3ay" },
  { label: "6A", value: "6ay" },
  { label: "Tümü", value: "tumu" },
];

const CATEGORY_LABELS: Record<string, string> = {
  TYT: "TYT",
  "AYT-SAY": "AYT Sayısal",
  "AYT-EA": "AYT EA",
  "AYT-SÖZ": "AYT Sözel",
  LGS: "LGS",
  YDT: "YDT",
};

function formatWeekKey(key: string) {
  return new Date(key + "T00:00:00").toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.toISOString().split("T")[0];
}

// applyTimeFilter'ı düzelt:
function applyTimeFilter(
  points: { date: string; avg: number }[],
  filter: TimeFilter,
) {
  if (filter === "tumu") return points;
  const now = new Date();
  const months = filter === "1ay" ? 1 : filter === "3ay" ? 3 : 6;
  const cutoff = new Date(now.getTime() - months * 30 * 24 * 60 * 60 * 1000);
  const cutoffKey = getWeekKey(cutoff);
  return points.filter((p) => p.date >= cutoffKey);
}
function CategoryTrendChart({
  category,
  points,
}: {
  category: string;
  points: { date: string; avg: number }[];
}) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("tumu");

  const filtered = applyTimeFilter(points, timeFilter);
  const chartData = filtered.map((p) => ({
    ...p,
    label: formatWeekKey(p.date),
  }));

  const first = filtered[0]?.avg ?? 0;
  const last = filtered[filtered.length - 1]?.avg ?? 0;
  const diff = filtered.length >= 2 ? last - first : null;
  const maxAvg = Math.max(...filtered.map((p) => p.avg), 1);

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
          <p className="text-sm font-semibold truncate">
            {CATEGORY_LABELS[category] ?? category} Ortalama Net Trendi
          </p>
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
            Güncel:{" "}
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
            Bu zaman aralığında veri bulunamadı.
          </div>
        ) : filtered.length < 2 ? (
          <div className="h-36 flex items-center justify-center text-xs text-muted-foreground">
            Grafik için en az 2 haftalık veri gerekli.
          </div>
        ) : (
          <ChartContainer
            config={{ avg: { label: "Ort. Net" } }}
            className="h-36 sm:h-40 md:h-44 w-full"
          >
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
              />
              <YAxis
                domain={[0, Math.ceil(maxAvg * 1.2)]}
                tick={{ fontSize: 10 }}
                tickLine={true}
                axisLine={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => label}
                    formatter={(value) => [
                      `${Number(value).toFixed(2)} Net`,
                      "Ortalama",
                    ]}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="avg"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </div>
    </div>
  );
}

interface CategoryTrendChartsProps {
  categoryTrends: Record<string, { date: string; avg: number }[]>;
  loading?: boolean;
}

export function CategoryTrendCharts({
  categoryTrends,
  loading,
}: CategoryTrendChartsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-52 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  const entries = Object.entries(categoryTrends);
  if (entries.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Kurum Sınavı Net Ortalamaları
      </h2>
      <div className="flex flex-col gap-4">
        {entries.map(([cat, points]) => (
          <CategoryTrendChart key={cat} category={cat} points={points} />
        ))}
      </div>
    </div>
  );
}
