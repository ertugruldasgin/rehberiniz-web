"use client";

import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ExamResult } from "@/types/exam";

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function useCompactMode() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);
  const fullWidthRef = useRef<number>(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scrollContainer = el.querySelector<HTMLElement>(
      '[data-slot="table-container"]',
    );
    if (!scrollContainer) return;

    const check = () => {
      const { scrollWidth, clientWidth } = scrollContainer;
      if (!isCompact) {
        if (scrollWidth > clientWidth) {
          fullWidthRef.current = scrollWidth;
          setIsCompact(true);
        }
      } else {
        if (clientWidth >= fullWidthRef.current && fullWidthRef.current > 0) {
          setIsCompact(false);
        }
      }
    };

    const raf = requestAnimationFrame(check);
    const ro = new ResizeObserver(check);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [isCompact]);

  return { containerRef, isCompact };
}

interface ExamResultsTableProps {
  results: ExamResult[];
  type: "general" | "branch";
  className?: string;
  onRowClick?: (result: ExamResult) => void;
}

export function ExamResultsTable({
  results,
  type,
  className,
  onRowClick,
}: ExamResultsTableProps) {
  if (results.length === 0) return null;

  //const effectiveType = results[0]?.subjects?.length === 1 ? "branch" : type;
  const effectiveType = results[0]?.is_standalone ? "branch" : type;

  if (effectiveType === "branch")
    return (
      <BranchResultsTable
        results={results}
        className={className}
        onRowClick={onRowClick}
      />
    );
  return (
    <GeneralResultsTable
      results={results}
      className={className}
      onRowClick={onRowClick}
    />
  );
}

function GeneralResultsTable({
  results,
  className,
  onRowClick,
}: {
  results: ExamResult[];
  className?: string;
  onRowClick?: (result: ExamResult) => void;
}) {
  const { containerRef, isCompact } = useCompactMode();
  const subjects = results[0].subjects.map((s) => s.subject_name);

  return (
    <div
      ref={containerRef}
      className={cn("rounded-lg overflow-hidden", className)}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-muted/40">
            <TableHead className="sticky left-0 z-10 w-[140px] min-w-[140px] sm:w-[200px] sm:min-w-[200px] lg:w-[320px] lg:min-w-[320px] xl:w-[400px] xl:min-w-[400px] max-w-[400px]">
              Deneme Adı
            </TableHead>
            {subjects.map((subject) => (
              <TableHead
                key={subject}
                colSpan={isCompact ? 1 : 4}
                className="text-center"
              >
                {subject}
              </TableHead>
            ))}
            <TableHead colSpan={isCompact ? 1 : 4} className="text-center">
              Toplam
            </TableHead>
          </TableRow>
          {!isCompact && (
            <TableRow className="border-border bg-muted/20">
              <TableHead className="sticky left-0 z-10 w-[140px] min-w-[140px] sm:w-[200px] sm:min-w-[200px] lg:w-[320px] lg:min-w-[320px] xl:w-[400px] xl:min-w-[400px] max-w-[400px]" />
              {[...subjects, "Toplam"].map((name) => (
                <SubHeaders key={`sub-${name}`} />
              ))}
            </TableRow>
          )}
        </TableHeader>
        <TableBody className="bg-card">
          {results.map((result) => (
            <TableRow
              key={result.id}
              className={cn(
                "border-border",
                onRowClick &&
                  "cursor-pointer hover:bg-muted/40 transition-colors",
              )}
              onClick={() => onRowClick?.(result)}
            >
              <TableCell className="sticky left-0 z-10 w-[140px] min-w-[140px] sm:w-[200px] sm:min-w-[200px] lg:w-[320px] lg:min-w-[320px] xl:w-[400px] xl:min-w-[400px] max-w-[400px] font-medium">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm leading-tight truncate">
                    {result.exam_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(result.exam_date)}
                  </span>
                </div>
              </TableCell>
              {result.subjects.map((s) =>
                isCompact ? (
                  <TableCell
                    key={`${result.id}-${s.subject_name}`}
                    className="text-center tabular-nums"
                  >
                    <span className="font-semibold">{s.net.toFixed(2)}</span>
                  </TableCell>
                ) : (
                  <SubjectCells
                    key={`${result.id}-${s.subject_name}`}
                    correct={s.correct}
                    incorrect={s.incorrect}
                    empty={s.empty}
                    net={s.net}
                  />
                ),
              )}
              {isCompact ? (
                <TableCell className="text-center tabular-nums font-bold">
                  {result.total_net.toFixed(2)}
                </TableCell>
              ) : (
                <SubjectCells
                  correct={result.total_correct}
                  incorrect={result.total_incorrect}
                  empty={result.total_empty}
                  net={result.total_net}
                  isTotal
                />
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function BranchResultsTable({
  results,
  className,
  onRowClick,
}: {
  results: ExamResult[];
  className?: string;
  onRowClick?: (result: ExamResult) => void;
}) {
  return (
    <div className={cn("rounded-lg overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-muted/40">
            <TableHead className="w-[140px] min-w-[140px] sm:w-[200px] sm:min-w-[200px] lg:w-[320px] lg:min-w-[320px] xl:w-[400px] xl:min-w-[400px] max-w-[400px]">
              Deneme Adı
            </TableHead>
            <TableHead className="text-center text-xs font-normal text-green-600 dark:text-green-400">
              D
            </TableHead>
            <TableHead className="text-center text-xs font-normal text-red-500 dark:text-red-400">
              Y
            </TableHead>
            <TableHead className="text-center text-xs font-normal text-muted-foreground">
              B
            </TableHead>
            <TableHead className="text-center">Net</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-card">
          {results.map((result) => (
            <TableRow
              key={result.id}
              className={cn(
                "border-border",
                onRowClick &&
                  "cursor-pointer hover:bg-muted/40 transition-colors",
              )}
              onClick={() => onRowClick?.(result)}
            >
              <TableCell className="w-[140px] min-w-[140px] sm:w-[200px] sm:min-w-[200px] lg:w-[320px] lg:min-w-[320px] xl:w-[400px] xl:min-w-[400px] max-w-[400px] font-medium">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm leading-tight truncate">
                    {result.exam_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(result.exam_date)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center tabular-nums text-green-600 dark:text-green-400">
                {result.subjects[0]?.correct ?? 0}
              </TableCell>
              <TableCell className="text-center tabular-nums text-red-500 dark:text-red-400">
                {result.subjects[0]?.incorrect ?? 0}
              </TableCell>
              <TableCell className="text-center tabular-nums text-muted-foreground">
                {result.subjects[0]?.empty ?? 0}
              </TableCell>
              <TableCell className="text-center tabular-nums font-bold">
                {(result.subjects[0]?.net ?? 0).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SubHeaders() {
  return (
    <>
      <TableHead className="w-10 text-center text-xs font-normal text-green-600 dark:text-green-400">
        D
      </TableHead>
      <TableHead className="w-10 text-center text-xs font-normal text-red-500 dark:text-red-400">
        Y
      </TableHead>
      <TableHead className="w-10 text-center text-xs font-normal text-muted-foreground">
        B
      </TableHead>
      <TableHead className="w-10 text-center text-xs font-normal">
        Net
      </TableHead>
    </>
  );
}

function SubjectCells({
  correct,
  incorrect,
  empty,
  net,
  isTotal = false,
}: {
  correct: number;
  incorrect: number;
  empty: number;
  net: number;
  isTotal?: boolean;
}) {
  return (
    <>
      <TableCell className="text-center tabular-nums text-green-600 dark:text-green-400">
        {correct}
      </TableCell>
      <TableCell className="text-center tabular-nums text-red-500 dark:text-red-400">
        {incorrect}
      </TableCell>
      <TableCell className="text-center tabular-nums text-muted-foreground">
        {empty}
      </TableCell>
      <TableCell
        className={cn("text-center tabular-nums", isTotal && "font-bold")}
      >
        {net.toFixed(2)}
      </TableCell>
    </>
  );
}
