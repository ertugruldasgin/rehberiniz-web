"use client";

import { PageHeader } from "@/components/page-header";
import { StudentGoalsView } from "@/components/student-goals-view";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function GoalsPage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getStudent() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("students")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        setStudentId(data?.id ?? null);
      } finally {
        setLoading(false);
      }
    }
    getStudent();
  }, []);

  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <PageHeader
        title="Hedeflerim"
        description="Ders bazlı net hedeflerinizi görüntüleyin ve düzenleyin."
      />
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : studentId ? (
        <StudentGoalsView studentId={studentId} canEdit={true} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Öğrenci kaydı bulunamadı.
        </p>
      )}
    </div>
  );
}
