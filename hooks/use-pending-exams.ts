import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";

export interface PendingExam {
  id: string;
  title: string;
  date: string;
  exam_template_id: string | null;
  subject_id: string | null;
  exam_templates: { name: string; category: string; sections: any[] } | null;
  subjects: {
    name: string;
    category: string;
    default_questions: number;
    slug: string;
  } | null;
}

export function usePendingExams() {
  const [exams, setExams] = useState<PendingExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingExams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı.");

      const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!student) throw new Error("Öğrenci kaydı bulunamadı.");

      // Atanan sınavları çek
      const { data: assignments, error: assignError } = await supabase
        .from("exam_assignments")
        .select(
          `
          exam_id,
          exams (
            id, title, date, exam_template_id, subject_id,
            exam_templates ( name, category, sections ),
            subjects ( name, category, default_questions, slug )
          )
        `,
        )
        .eq("student_id", student.id);
      if (assignError) throw assignError;

      // Girilmiş sonuçları çek
      const { data: results } = await supabase
        .from("exam_results")
        .select("exam_id")
        .eq("student_id", student.id);

      const completedExamIds = new Set(
        (results ?? []).map((r: any) => r.exam_id),
      );

      // Henüz sonuç girilmemiş sınavlar
      const pending = (assignments ?? [])
        .map((a: any) => {
          const exam = Array.isArray(a.exams) ? a.exams[0] : a.exams;
          return exam;
        })
        .filter((exam: any) => exam && !completedExamIds.has(exam.id))
        .sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

      setExams(pending);
    } catch (err) {
      setError("Bekleyen sınavlar yüklenirken bir hata oluştu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingExams();
  }, [fetchPendingExams]);

  return { exams, loading, error, refetch: fetchPendingExams };
}
