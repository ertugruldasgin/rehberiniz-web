import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import type { ExamType } from "@/lib/exam-type-map";

export interface StudentGoal {
  id: string;
  exam_type: ExamType;
  subject_id: string;
  subject_name: string;
  subject_slug: string;
  target_net: number;
  set_by: string;
  set_by_name: string;
}

export function useStudentGoals(studentId: string | null) {
  const [goals, setGoals] = useState<StudentGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("student_goals")
        .select(
          `
          id,
          exam_type,
          subject_id,
          target_net,
          set_by,
          subjects ( name, slug ),
          profiles ( full_name )
        `,
        )
        .eq("student_id", studentId);

      if (error) throw error;

      setGoals(
        (data ?? []).map((g: any) => ({
          id: g.id,
          exam_type: g.exam_type,
          subject_id: g.subject_id,
          subject_name: g.subjects?.name ?? "—",
          subject_slug: g.subjects?.slug ?? "",
          target_net: g.target_net,
          set_by: g.set_by,
          set_by_name: g.profiles?.full_name ?? "—",
        })),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { goals, loading, refetch: fetch };
}
