"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, ChevronRightIcon, UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useUserRole } from "@/hooks/use-user-role";
import type { Student } from "@/hooks/use-students";

interface StudentsTableProps {
  students: Student[];
  onAddStudent?: () => void;
  routePrefix?: string; // override için, default userData.role'den gelir
}

export function StudentsTable({
  students,
  onAddStudent,
  routePrefix,
}: StudentsTableProps) {
  const { userData } = useUserRole();
  const [search, setSearch] = useState("");
  const router = useRouter();

  const prefix = routePrefix ?? `/dashboard/${userData?.role}`;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = q
      ? students.filter(
          (s) =>
            `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
            s.student_number?.toLowerCase().includes(q) ||
            s.grade?.toLowerCase().includes(q) ||
            s.branch?.toLowerCase().includes(q),
        )
      : students;

    return [...list].sort((a, b) => {
      if (a.is_active === b.is_active) return 0;
      return a.is_active ? -1 : 1;
    });
  }, [students, search]);

  const initials = (first: string, last: string) =>
    `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();

  return (
    <div className="rounded-2xl bg-card overflow-hidden">
      {/* Arama + Buton */}
      <div className="p-4 border-b bg-muted/80 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="İsim, numara, sınıf veya alan ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-card"
          />
        </div>
        {onAddStudent && (
          <Button
            onClick={onAddStudent}
            className="hover:bg-primary/90 cursor-pointer shrink-0"
          >
            <span className="hidden sm:inline">Öğrenci Ekle</span>
            <span className="sm:hidden">+</span>
          </Button>
        )}
      </div>

      {/* Tablo */}
      {filtered.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-3 text-center px-4">
          <UsersIcon className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {search ? "Arama sonucu bulunamadı." : "Henüz öğrenci bulunmuyor."}
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
                  Öğrenci
                </th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                  Numara
                </th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                  Sınıf
                </th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                  Alan
                </th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((student, index) => (
                <tr
                  key={student.id}
                  onClick={() =>
                    router.push(`${prefix}/students/${student.id}`)
                  }
                  className="hover:bg-muted/40 transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-3.5 text-muted-foreground tabular-nums">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center font-medium px-2 py-2 rounded-full shrink-0 ${
                        student.is_active
                          ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${student.is_active ? "bg-green-500" : "bg-destructive"}`}
                      />
                    </span>
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
                        <p
                          className={`font-medium leading-tight ${!student.is_active ? "text-muted-foreground" : ""}`}
                        >
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
                      <Badge variant="secondary">{student.branch}</Badge>
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

      {filtered.length > 0 && (
        <div className="px-4 py-3 border-t bg-muted/80 text-xs text-muted-foreground">
          {search
            ? `${filtered.length} sonuç gösteriliyor`
            : `${students.length} öğrenci`}
        </div>
      )}
    </div>
  );
}
