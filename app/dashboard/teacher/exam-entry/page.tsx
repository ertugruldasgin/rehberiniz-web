"use client";

import { PageHeader } from "@/components/page-header";
import { StudentSidebar } from "@/components/student-sidebar";
import { useStudents } from "@/hooks/use-students";
import { useUserRole } from "@/hooks/use-user-role";
import { useState } from "react";
import { UsersIcon } from "lucide-react";

export default function ExamEntryPage() {
  const { userData } = useUserRole();
  const { students, loading } = useStudents(userData?.id);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );

  return (
    <div className="h-full flex flex-col px-4 md:px-6 space-y-6">
      <PageHeader
        title="Sınav Geçmişi"
        description="Öğrencilerinizin sınav sonuçlarını görüntüleyin."
      />
      <div className="flex flex-1 min-h-0 overflow-hidden gap-6">
        {/* sidebar */}
        <div className="shrink-0 w-64 rounded-2xl overflow-hidden">
          <StudentSidebar
            students={students}
            loading={loading}
            selectedId={selectedStudentId}
            onSelect={setSelectedStudentId}
            className="h-full"
          />
        </div>

        {/* Sağ içerik */}
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
          {!selectedStudentId ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Bir öğrenci seçin
              </p>
              <p className="text-xs text-muted-foreground/60">
                Soldan bir öğrenci seçerek sınav sonuçlarını
                görüntüleyebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="space-y-6">{/* içerik */}</div>
          )}
        </div>
      </div>
    </div>
  );
}
