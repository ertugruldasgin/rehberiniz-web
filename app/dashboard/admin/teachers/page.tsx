"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTeachers } from "@/hooks/use-teachers";
import {
  SearchIcon,
  ChevronRightIcon,
  UsersIcon,
  AlertCircleIcon,
  PlusIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import { AddTeacherDialog } from "@/components/add-teacher-sheet";

export default function TeachersPage() {
  const { teachers, loading, error, refetch } = useTeachers();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = q
      ? teachers.filter(
          (t) =>
            t.full_name.toLowerCase().includes(q) ||
            t.email?.toLowerCase().includes(q),
        )
      : teachers;

    return [...list].sort((a, b) => {
      if (a.is_active === b.is_active) return 0;
      return a.is_active ? -1 : 1;
    });
  }, [teachers, search]);

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (loading) {
    return (
      <div className="w-full px-4 md:px-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-44 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-72 rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-4">
          <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4 md:px-6 py-6">
        <div className="rounded-2xl border bg-card p-8 flex flex-col items-center gap-3 text-center">
          <AlertCircleIcon className="h-8 w-8 text-destructive" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 space-y-6">
      <PageHeader
        title="Öğretmenler"
        description={`Toplam ${teachers.length} öğretmen listeleniyor.`}
      />

      <div className="rounded-2xl bg-card overflow-hidden">
        {/* Arama */}
        <div className="p-4 border-b bg-muted/80 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="İsim veya e-posta ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-card"
            />
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            className="cursor-pointer shrink-0"
          >
            <span className="hidden sm:inline">Öğretmen Ekle</span>
            <span className="sm:hidden">
              <PlusIcon className="h-4 w-4" />
            </span>
          </Button>
        </div>
        <AddTeacherDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          onSuccess={refetch}
        />

        {/* Tablo */}
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center px-4">
            <UsersIcon className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {search
                ? "Arama sonucu bulunamadı."
                : "Henüz öğretmen bulunmuyor."}
            </p>
            {search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearch("")}
                className="cursor-pointer"
              >
                Aramayı temizle
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/80">
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 w-12">
                    #
                  </th>
                  <th className="text-center font-medium text-muted-foreground px-4 py-3 w-16">
                    Durum
                  </th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">
                    Öğretmen
                  </th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                    E-posta
                  </th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                    Öğrenci Sayısı
                  </th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((teacher, index) => (
                  <tr
                    key={teacher.id}
                    onClick={() =>
                      router.push(`/dashboard/admin/teachers/${teacher.id}`)
                    }
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5 text-muted-foreground tabular-nums">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center font-medium px-2 py-2 rounded-full shrink-0 ${
                          teacher.is_active
                            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${teacher.is_active ? "bg-green-500" : "bg-destructive"}`}
                        />
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {teacher.avatar_url ? (
                          <img
                            src={teacher.avatar_url}
                            alt={teacher.full_name}
                            className="h-8 w-8 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                            {initials(teacher.full_name)}
                          </div>
                        )}
                        <div>
                          <p
                            className={`font-medium leading-tight ${!teacher.is_active ? "text-muted-foreground" : ""}`}
                          >
                            {teacher.full_name}
                          </p>
                          {teacher.email && (
                            <p className="text-xs text-muted-foreground sm:hidden truncate max-w-[180px]">
                              {teacher.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell">
                      {teacher.email ?? (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-sm font-medium">
                        {teacher.student_count}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        öğrenci
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <ChevronRightIcon className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="px-4 py-3 text-xs text-muted-foreground">
            {search
              ? `${filtered.length} / ${teachers.length} öğretmen`
              : `${teachers.length} öğretmen`}
          </div>
        )}
      </div>
    </div>
  );
}
