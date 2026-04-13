import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";

export interface Exam {
  id: string;
  title: string;
  date: string;
  is_official: boolean;
  exam_template_id: string | null;
  subject_id: string | null;
  created_at: string;
  exam_templates: { name: string; category: string } | null;
  subjects: { name: string; category: string } | null;
  assignment_count: number;
}

export function useExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı.");

      const { data: member } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();
      if (!member) throw new Error("Organizasyon bulunamadı.");

      const { data, error } = await supabase
        .from("exams")
        .select(
          `
    id, title, date, is_official, exam_template_id, subject_id, created_at,
    exam_templates (name, category),
    subjects (name, category),
    exam_assignments (id)
  `,
        )
        .eq("organization_id", member.organization_id)
        .eq("is_official", true)
        .order("date", { ascending: false });

      if (error) throw error;

      const mapped = (data ?? []).map((e: any) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        is_official: e.is_official,
        exam_template_id: e.exam_template_id,
        subject_id: e.subject_id,
        created_at: e.created_at,
        exam_templates: e.exam_templates,
        subjects: e.subjects,
        assignment_count: e.exam_assignments?.length ?? 0,
      }));

      setExams(mapped);
    } catch (err) {
      setError("Sınavlar yüklenirken bir hata oluştu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  return { exams, loading, error, refetch: fetchExams };
}
