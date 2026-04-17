"use client";

import { BookOpenIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMyGuidanceNotes } from "@/hooks/use-my-guidance-notes";

const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; badge: string; meta: string }
> = {
  Akademik: {
    bg: "bg-blue-200 dark:bg-blue-900",
    text: "text-blue-950 dark:text-blue-100",
    badge: "bg-blue-300/60 text-blue-900 dark:bg-blue-800 dark:text-blue-200",
    meta: "text-blue-700 dark:text-blue-400",
  },
  Kişisel: {
    bg: "bg-purple-200 dark:bg-purple-900",
    text: "text-purple-950 dark:text-purple-100",
    badge:
      "bg-purple-300/60 text-purple-900 dark:bg-purple-800 dark:text-purple-200",
    meta: "text-purple-700 dark:text-purple-400",
  },
  Kariyer: {
    bg: "bg-green-200 dark:bg-green-900",
    text: "text-green-950 dark:text-green-100",
    badge:
      "bg-green-300/60 text-green-900 dark:bg-green-800 dark:text-green-200",
    meta: "text-green-700 dark:text-green-400",
  },
  Aile: {
    bg: "bg-orange-200 dark:bg-orange-900",
    text: "text-orange-950 dark:text-orange-100",
    badge:
      "bg-orange-300/60 text-orange-900 dark:bg-orange-800 dark:text-orange-200",
    meta: "text-orange-700 dark:text-orange-400",
  },
  Diğer: {
    bg: "bg-amber-200 dark:bg-amber-900",
    text: "text-amber-950 dark:text-amber-100",
    badge:
      "bg-amber-300/60 text-amber-900 dark:bg-amber-800 dark:text-amber-200",
    meta: "text-amber-700 dark:text-amber-400",
  },
};

const DEFAULT_COLOR = {
  bg: "bg-muted",
  text: "text-foreground",
  badge: "bg-muted-foreground/20 text-foreground",
  meta: "text-muted-foreground",
};

export function GuidanceNotesGrid() {
  const { notes, loading, error } = useMyGuidanceNotes();

  if (loading) {
    return (
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="break-inside-avoid rounded-sm bg-muted animate-pulse mb-4"
            style={{ height: `${120 + (i % 3) * 40}px` }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-destructive font-medium">
        {error}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-card/50 p-12 flex flex-col items-center gap-3 text-center">
        <BookOpenIcon className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground/60">
          Henüz paylaşılan not bulunmuyor
        </p>
        <p className="text-xs text-muted-foreground/40">
          Öğretmeniniz bir not paylaştığında burada görünecek.
        </p>
      </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
      {notes.map((note) => {
        const colors = CATEGORY_COLORS[note.category] ?? DEFAULT_COLOR;
        return (
          <div key={note.id} className="break-inside-avoid mb-4 relative">
            <div
              className={cn(
                "relative p-5 space-y-3 rounded-l-lg rounded-tr-lg overflow-hidden",
                colors.bg,
                // Kıvrık köşe efekti
                "before:content-[''] before:absolute before:bottom-0 before:right-0",
                "before:w-8 before:h-8",
                "before:border-l-16 before:border-t-16",
                "before:border-l-transparent before:border-t-transparent",
                "before:border-r-16 before:border-b-16",
                "before:border-r-white/30 before:border-b-white/30",
                "dark:before:border-r-black/20 dark:before:border-b-black/20",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full",
                    colors.badge,
                  )}
                >
                  {note.category}
                </span>
                <span className={cn("text-[11px]", colors.meta)}>
                  {new Date(note.meeting_date).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <p
                className={cn(
                  "text-sm leading-relaxed whitespace-pre-wrap font-medium",
                  colors.text,
                )}
              >
                {note.content}
              </p>

              {note.teacher && (
                <div
                  className={cn(
                    "pt-2 border-t border-black/10 dark:border-white/10 flex items-center gap-1.5",
                    colors.meta,
                  )}
                >
                  <div
                    className={cn(
                      "h-5 w-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0",
                      colors.badge,
                    )}
                  >
                    {note.teacher.full_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <p className="text-[11px] truncate">
                    {note.teacher.full_name}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
