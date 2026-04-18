"use client";

import { PageHeader } from "@/components/page-header";
import { useMeetingNotes } from "@/hooks/use-meeting-notes";
import { Input } from "@/components/ui/input";
import {
  FileQuestionMark,
  LockIcon,
  LockOpenIcon,
  SearchIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

const STUDENT_COLORS = [
  {
    bg: "bg-blue-200 dark:bg-blue-900",
    text: "text-blue-950 dark:text-blue-100",
    badge: "bg-blue-300/60 text-blue-900 dark:bg-blue-800 dark:text-blue-200",
    meta: "text-blue-700 dark:text-blue-400",
  },
  {
    bg: "bg-purple-200 dark:bg-purple-900",
    text: "text-purple-950 dark:text-purple-100",
    badge:
      "bg-purple-300/60 text-purple-900 dark:bg-purple-800 dark:text-purple-200",
    meta: "text-purple-700 dark:text-purple-400",
  },
  {
    bg: "bg-green-200 dark:bg-green-900",
    text: "text-green-950 dark:text-green-100",
    badge:
      "bg-green-300/60 text-green-900 dark:bg-green-800 dark:text-green-200",
    meta: "text-green-700 dark:text-green-400",
  },
  {
    bg: "bg-orange-200 dark:bg-orange-900",
    text: "text-orange-950 dark:text-orange-100",
    badge:
      "bg-orange-300/60 text-orange-900 dark:bg-orange-800 dark:text-orange-200",
    meta: "text-orange-700 dark:text-orange-400",
  },
  {
    bg: "bg-rose-200 dark:bg-rose-900",
    text: "text-rose-950 dark:text-rose-100",
    badge: "bg-rose-300/60 text-rose-900 dark:bg-rose-800 dark:text-rose-200",
    meta: "text-rose-700 dark:text-rose-400",
  },
  {
    bg: "bg-teal-200 dark:bg-teal-900",
    text: "text-teal-950 dark:text-teal-100",
    badge: "bg-teal-300/60 text-teal-900 dark:bg-teal-800 dark:text-teal-200",
    meta: "text-teal-700 dark:text-teal-400",
  },
];

export default function MeetingNotesPage() {
  const { notes, loading, error } = useMeetingNotes();
  const [search, setSearch] = useState("");

  // Her öğrenciye sabit renk ata
  const studentColorMap: Record<string, (typeof STUDENT_COLORS)[0]> = {};
  let colorIndex = 0;
  for (const note of notes) {
    if (note.student && !studentColorMap[note.student.id]) {
      studentColorMap[note.student.id] =
        STUDENT_COLORS[colorIndex % STUDENT_COLORS.length];
      colorIndex++;
    }
  }

  const filteredNotes = notes.filter((n) => {
    if (!search.trim()) return true;
    const fullName =
      `${n.student?.first_name ?? ""} ${n.student?.last_name ?? ""}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  const grouped: Record<string, { studentName: string; notes: typeof notes }> =
    {};
  for (const note of filteredNotes) {
    const studentId = note.student?.id ?? "unknown";
    const studentName = note.student
      ? `${note.student.first_name} ${note.student.last_name}`
      : "Bilinmeyen Öğrenci";
    if (!grouped[studentId]) grouped[studentId] = { studentName, notes: [] };
    grouped[studentId].notes.push(note);
  }

  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <PageHeader
          title="Görüşme Notları"
          description="Öğrencilerinizle yaptığınız görüşme notlarını görüntüleyin."
        />
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Öğrenci ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 w-64 bg-card"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-5 w-32 rounded-lg bg-muted animate-pulse" />
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
                {[...Array(3)].map((_, j) => (
                  <div
                    key={j}
                    className="break-inside-avoid mb-4 h-32 rounded-sm bg-muted animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12 text-sm text-destructive">
          {error}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="p-12 flex flex-col items-center gap-3 text-center">
          <FileQuestionMark className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground/60">
            Arama sonucu bulunamadı.
          </p>
          <p className="text-xs text-muted-foreground/40">
            Öğrenci detay sayfasından "Rehberlik Notu" kategorisiyle not
            ekleyin.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(
            ([studentId, { studentName, notes: studentNotes }]) => {
              const colors = studentColorMap[studentId] ?? STUDENT_COLORS[0];
              return (
                <div key={studentId} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 rounded-md shrink-0">
                      <AvatarImage
                        src={
                          notes.find((n) => n.student?.id === studentId)
                            ?.student?.avatar_url ?? ""
                        }
                        className="rounded-md object-cover"
                      />
                      <AvatarFallback
                        className={cn(
                          "rounded-md text-[10px] font-bold",
                          colors.badge,
                        )}
                      >
                        {studentName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Link
                      href={`/dashboard/teacher/students/${studentId}`}
                      className="text-sm font-semibold hover:underline"
                    >
                      {studentName}
                    </Link>
                    <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded-full bg-muted">
                      {studentNotes.length}
                    </span>
                  </div>

                  <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
                    {studentNotes.map((note) => (
                      <div key={note.id} className="break-inside-avoid mb-4">
                        <div
                          className={cn(
                            "relative p-5 space-y-3 rounded-l-lg rounded-tr-lg",
                            colors.bg,
                            "before:content-[''] before:absolute before:bottom-0 before:right-0",
                            "before:w-8 before:h-8",
                            "before:border-l-16 before:border-t-16 before:border-r-16 before:border-b-16",
                            "before:border-l-transparent before:border-t-transparent",
                            "before:border-r-white/30 before:border-b-white/30",
                            "dark:before:border-r-black/20 dark:before:border-b-black/20",
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1 text-xs">
                              {note.is_private ? (
                                <>
                                  <LockIcon
                                    className={cn("h-3 w-3", colors.meta)}
                                  />
                                  <span className={colors.meta}>Gizli</span>
                                </>
                              ) : (
                                <>
                                  <LockOpenIcon
                                    className={cn("h-3 w-3", colors.meta)}
                                  />
                                  <span className={colors.meta}>
                                    Paylaşıldı
                                  </span>
                                </>
                              )}
                            </span>
                            <span className={cn("text-[11px]", colors.meta)}>
                              {new Date(note.meeting_date).toLocaleDateString(
                                "tr-TR",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
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
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}
