"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStudents } from "@/hooks/use-students";
import {
  SearchIcon,
  ChevronRightIcon,
  UsersIcon,
  AlertCircleIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { AddStudentSheet } from "@/components/add-student-sheet";

export default function StudentsPage() {
  const { students, loading, error, refetch } = useStudents();
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return students;
    return students.filter(
      (s) =>
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
        s.student_number?.toLowerCase().includes(q) ||
        s.grade?.toLowerCase().includes(q) ||
        s.branch?.toLowerCase().includes(q),
    );
  }, [students, search]);

  const initials = (first: string, last: string) =>
    `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();

  // Skeleton
  if (loading) {
    return (
      <div className="w-full px-4 md:px-6 py-6 md:py-8 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-44 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-72 rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="rounded-2xl border bg-card p-5 sm:p-6 space-y-4">
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

  // Hata
  if (error) {
    return (
      <div className="w-full px-4 md:px-6 py-6 md:py-8">
        <div className="rounded-2xl border bg-card p-8 flex flex-col items-center gap-3 text-center">
          <AlertCircleIcon className="h-8 w-8 text-destructive" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-6 space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Öğrenciler</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Toplam {students.length} öğrenci listeleniyor.
          </p>
        </div>
        <Button
          onClick={() => setSheetOpen(true)}
          className="hover:bg-primary/90 hover:cursor-pointer"
        >
          Öğrenci Ekle
        </Button>
      </div>
      <AddStudentSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={refetch}
      />

      {/* Tablo kartı */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        {/* Arama */}
        <div className="p-4 border-b">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="İsim, numara, sınıf veya şube ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        </div>

        {/* Tablo */}
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center px-4">
            <UsersIcon className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {search
                ? "Arama sonucu bulunamadı."
                : "Henüz öğrenci bulunmuyor."}
            </p>
            {search && (
              <Button variant="ghost" size="sm" onClick={() => setSearch("")}>
                Aramayı temizle
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 w-12">
                    #
                  </th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">
                    Öğrenci
                  </th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                    Numara
                  </th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                    Sınıf
                  </th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                    Şube
                  </th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((student, index) => (
                  <tr
                    key={student.id}
                    onClick={() =>
                      router.push(`/dashboard/students/${student.id}`)
                    }
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5 text-muted-foreground tabular-nums">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {student.avatar_url ? (
                          <img
                            src={student.avatar_url}
                            alt={`${student.first_name} ${student.last_name}`}
                            className="h-8 w-8 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                            {initials(student.first_name, student.last_name)}
                          </div>
                        )}

                        <div>
                          <p className="font-medium leading-tight">
                            {student.first_name} {student.last_name}
                          </p>
                          {student.student_number && (
                            <p className="text-xs text-muted-foreground sm:hidden">
                              #{student.student_number}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell">
                      {student.student_number ?? (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      {student.grade ? (
                        <Badge variant="secondary">{student.grade}</Badge>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      {student.branch ? (
                        <Badge variant="outline">{student.branch}</Badge>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
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

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t bg-muted/20 text-xs text-muted-foreground">
            {search
              ? `${filtered.length} sonuç gösteriliyor`
              : `${students.length} öğrenci`}
          </div>
        )}
      </div>
    </div>
  );
}
