"use client";

import { Input } from "@/components/ui/input";
import { SearchIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Student } from "@/hooks/use-students";

interface StudentSidebarProps {
  students: Student[];
  loading?: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  className?: string;
}

export function StudentSidebar({
  students,
  loading = false,
  selectedId,
  onSelect,
  className,
}: StudentSidebarProps) {
  const [search, setSearch] = useState("");

  const filtered = students
    .filter((s) => {
      const q = search.toLowerCase().trim();
      return (
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
        (s.student_number?.toLowerCase() ?? "").includes(q) ||
        (s.grade?.toLowerCase() ?? "").includes(q) ||
        (s.branch?.toLowerCase() ?? "").includes(q)
      );
    })
    .sort((a, b) => {
      if (a.is_active === b.is_active) return 0;
      return a.is_active ? -1 : 1;
    });

  return (
    <div className={cn("flex flex-col h-full bg-card rounded-2xl", className)}>
      {/* Arama */}
      <div className="p-3 border-b bg-muted/80 shrink-0 rounded-t-2xl">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="İsim, numara, sınıf ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-card border border-muted focus-visible:ring-2"
          />
        </div>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-2 space-y-0.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <div className="h-8 w-8 rounded-lg bg-muted animate-pulse shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-2.5 w-16 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 px-4 text-center">
            <UsersIcon className="h-7 w-7 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground/60">
              {search ? "Sonuç bulunamadı." : "Öğrenci bulunmuyor."}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {filtered.map((s) => {
              const initials =
                `${s.first_name[0] ?? ""}${s.last_name[0] ?? ""}`.toUpperCase();
              const isSelected = selectedId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelect(s.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer",
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/60",
                  )}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {s.avatar_url ? (
                      <img
                        src={s.avatar_url}
                        alt={`${s.first_name} ${s.last_name}`}
                        className="h-8 w-8 rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        className={cn(
                          "h-8 w-8 rounded-lg text-xs font-semibold flex items-center justify-center",
                          isSelected
                            ? "bg-primary/20 text-primary"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {initials}
                      </div>
                    )}
                    <span
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card",
                        s.is_active ? "bg-green-500" : "bg-destructive",
                      )}
                    />
                  </div>

                  {/* Bilgi */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-xs font-medium truncate leading-tight",
                        isSelected ? "text-primary" : "text-foreground",
                        !s.is_active && "text-muted-foreground",
                      )}
                    >
                      {s.first_name} {s.last_name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {s.grade ? `${s.grade} - ` : ""}
                      {s.student_number ?? "—"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Alt bilgi */}
      {!loading && students.length > 0 && (
        <div className="px-4 py-3 shrink-0">
          <p className="text-[11px] text-muted-foreground">
            {filtered.length !== students.length
              ? `${filtered.length} / ${students.length} öğrenci`
              : `${students.length} öğrenci`}
          </p>
        </div>
      )}
    </div>
  );
}
