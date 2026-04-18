import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";

export interface ExamRanking {
  student_id: string;
  first_name: string;
  last_name: string;
  student_number: string | null;
  grade: string | null;
  total_correct: number;
  total_incorrect: number;
  total_empty: number;
  total_net: number;
  total_score: number;
  subjects: {
    subject_name: string;
    correct: number;
    incorrect: number;
    empty: number;
    net: number;
  }[];
}

export interface AssignedStudent {
  student_id: string;
  first_name: string;
  last_name: string;
  student_number: string | null;
  grade: string | null;
}

export function useExamRankings(examId: string | null) {
  const [rankings, setRankings] = useState<ExamRanking[]>([]);
  const [assigned, setAssigned] = useState<AssignedStudent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!examId) return;
    setLoading(true);
    try {
      const supabase = createClient();

      // Sonuçları çek
      const { data: resultsData, error } = await supabase
        .from("exam_results")
        .select(
          `
          total_correct,
          total_incorrect,
          total_empty,
          total_net,
          total_score,
          students (
            id,
            first_name,
            last_name,
            student_number,
            grade
          ),
          subject_results (
            correct,
            incorrect,
            empty,
            net,
            section_label,
            subjects ( name )
          )
        `,
        )
        .eq("exam_id", examId)
        .order("total_net", { ascending: false });

      if (error) throw error;

      const mappedRankings = (resultsData ?? []).map((r: any) => {
        const student = Array.isArray(r.students) ? r.students[0] : r.students;
        return {
          student_id: student?.id ?? "",
          first_name: student?.first_name ?? "—",
          last_name: student?.last_name ?? "—",
          student_number: student?.student_number ?? null,
          grade: student?.grade ?? null,
          total_correct: r.total_correct,
          total_incorrect: r.total_incorrect,
          total_empty: r.total_empty,
          total_net: r.total_net,
          total_score: r.total_score,
          subjects: (r.subject_results ?? []).map((s: any) => ({
            subject_name: s.subjects?.name ?? s.section_label ?? "—",
            correct: s.correct,
            incorrect: s.incorrect,
            empty: s.empty,
            net: s.net,
          })),
        };
      });

      setRankings(mappedRankings);

      // Tüm atanmış öğrencileri çek
      const { data: assignedData } = await supabase
        .from("exam_assignments")
        .select(`students ( id, first_name, last_name, student_number, grade )`)
        .eq("exam_id", examId);

      const resultStudentIds = new Set(mappedRankings.map((r) => r.student_id));

      setAssigned(
        (assignedData ?? [])
          .map((a: any) => {
            const s = Array.isArray(a.students) ? a.students[0] : a.students;
            return {
              student_id: s?.id ?? "",
              first_name: s?.first_name ?? "—",
              last_name: s?.last_name ?? "—",
              student_number: s?.student_number ?? null,
              grade: s?.grade ?? null,
            };
          })
          .filter((s) => !resultStudentIds.has(s.student_id)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { rankings, assigned, loading, refetch: fetch };
}
