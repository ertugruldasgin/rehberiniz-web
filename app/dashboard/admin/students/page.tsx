"use client";

import { useStudents } from "@/hooks/use-students";
import { AlertCircleIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StudentsTable } from "@/components/students-table";
import { AddStudentSheet } from "@/components/add-student-sheet";
import { useState } from "react";

export default function StudentsPage() {
  const { students, loading, error, refetch } = useStudents();
  const [sheetOpen, setSheetOpen] = useState(false);

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
      <PageHeader
        title="Öğrenciler"
        description={`Toplam ${students.length} öğrenci listeleniyor.`}
      />
      <StudentsTable
        students={students}
        routePrefix="/dashboard/admin"
        onAddStudent={() => setSheetOpen(true)}
      />
      <AddStudentSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
