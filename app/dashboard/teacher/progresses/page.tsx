"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { StudentSidebar } from "@/components/student-sidebar";
import { ProgressView } from "@/components/progress-view";
import { useStudents } from "@/hooks/use-students";
import { useUserRole } from "@/hooks/use-user-role";
import { TrendingUpIcon, ArrowLeftIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function ProgressesPage() {
  const { userData } = useUserRole();
  const { students, loading: studentsLoading } = useStudents(userData?.id);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedStudent = students.find((s) => s.id === selectedId) ?? null;

  function handleSelectStudent(id: string) {
    setSelectedId(id);
  }

  return (
    <div className="flex flex-col px-4 md:px-6 gap-4 h-full">
      <PageHeader
        title="Gelişim Grafikleri"
        description="Öğrencilerinizin gelişim grafiklerini görüntüleyin."
      />

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Sol sidebar — sadece md+ */}
        <div className="hidden md:block shrink-0 w-64 overflow-hidden">
          <StudentSidebar
            students={students}
            loading={studentsLoading}
            selectedId={selectedId}
            onSelect={handleSelectStudent}
            className="h-full"
          />
        </div>

        {/* Sağ içerik */}
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
          {!selectedId ? (
            <>
              {/* Mobil: liste */}
              <div className="md:hidden">
                <StudentSidebar
                  students={students}
                  loading={studentsLoading}
                  selectedId={selectedId}
                  onSelect={handleSelectStudent}
                />
              </div>
              {/* Desktop: ortalanmış mesaj */}
              <div className="hidden md:flex h-full flex-col items-center justify-center gap-3 text-center">
                <div className="h-12 w-12 flex items-center justify-center">
                  <TrendingUpIcon className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Bir öğrenci seçin
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Soldan bir öğrenci seçerek gelişim grafiklerini
                  görüntüleyebilirsiniz.
                </p>
              </div>
            </>
          ) : (
            <div key={selectedId} className="space-y-5 pb-6">
              {/* Öğrenci banner */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="md:hidden flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                </button>

                {selectedStudent && (
                  <>
                    <Avatar className="h-9 w-9 rounded-xl shrink-0">
                      <AvatarImage
                        src={selectedStudent.avatar_url ?? undefined}
                        className="rounded-xl object-cover"
                      />
                      <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-xs font-semibold">
                        {selectedStudent.first_name[0]}
                        {selectedStudent.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/teacher/students/${selectedStudent.id}`}
                        className="text-sm font-semibold hover:underline cursor-pointer truncate block"
                      >
                        {selectedStudent.first_name} {selectedStudent.last_name}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedStudent.grade
                          ? `${selectedStudent.grade} - `
                          : ""}
                        {selectedStudent.student_number ?? "—"}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <ProgressView studentId={selectedId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
