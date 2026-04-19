"use client";
import { PageHeader } from "@/components/page-header";
import { ProgressView } from "@/components/progress-view";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function MyProgressPage() {
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    async function get() {
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
    }
    get();
  }, []);

  return (
    <div className="flex flex-col px-4 md:px-6 gap-6">
      <PageHeader
        title="Gelişim Grafiğim"
        description="Sınav sonuçlarınızın zaman içindeki değişimini görüntüleyin."
      />
      {studentId && <ProgressView studentId={studentId} />}
    </div>
  );
}
