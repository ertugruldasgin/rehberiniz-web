import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import type { ExamResult } from "@/types/exam";

async function fetchResults(
  supabase: any,
  studentId: string,
): Promise<ExamResult[]> {
  const { data, error } = await supabase
    .from("exam_results")
    .select(
      `
    id,
    total_correct,
    total_incorrect,
    total_empty,
    total_net,
    total_score,
    exams (
      title,
      date,
      is_official,
      exam_template_id,
      subject_id,
      exam_templates (
        name,
        category
      ),
      subjects (
        name,
        category
      )
    ),
    subject_results (
      id,
      correct,
      incorrect,
      empty,
      net,
      is_standalone,
      section_label,
      subjects (
        name
      )
    )
  `,
    )
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((r: any) => {
    const exam = Array.isArray(r.exams) ? r.exams[0] : r.exams;
    const isBranch = !exam?.exam_template_id && !!exam?.subject_id;

    const firstSubjectResult = r.subject_results?.[0];

    const category = isBranch
      ? (firstSubjectResult?.subjects?.name ??
        firstSubjectResult?.section_label ??
        "Diğer")
      : (exam?.exam_templates?.name ?? exam?.title ?? "Diğer");

    return {
      id: r.id,
      exam_name: exam?.title ?? "—",
      exam_date: exam?.date ?? "",
      is_standalone: isBranch,
      is_official: exam?.is_official ?? false,
      category,
      total_correct: r.total_correct,
      total_incorrect: r.total_incorrect,
      total_empty: r.total_empty,
      total_net: r.total_net,
      total_score: r.total_score,
      subjects: (r.subject_results ?? []).map((s: any) => ({
        subject_id: s.id,
        subject_name: s.subjects?.name ?? s.section_label ?? "—",
        correct: s.correct,
        incorrect: s.incorrect,
        empty: s.empty,
        net: s.net,
      })),
    };
  });
}

export function useMyExamResults() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
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

      const data = await fetchResults(supabase, student.id);
      setResults(data);
    } catch (err) {
      setError("Sonuçlar yüklenirken bir hata oluştu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);
  return { results, loading, error, refetch: fetch };
}

export function useExamResults(studentId: string) {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const data = await fetchResults(supabase, studentId);
      setResults(data);
    } catch (err) {
      setError("Sonuçlar yüklenirken bir hata oluştu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetch();
  }, [fetch]);
  return { results, loading, error, refetch: fetch };
}
