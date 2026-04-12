import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";

export interface StudentDetail {
  id: string;
  first_name: string;
  last_name: string;
  student_number: string | null;
  grade: string | null;
  branch: string | null;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  is_active: boolean;
}

export function useStudent(id: string) {
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      const { data, error: studentError } = await supabase
        .from("students")
        .select(
          `
          id,
          first_name,
          last_name,
          student_number,
          grade,
          branch,
          created_at,
          profiles!students_user_id_fkey1 (avatar_url, email, last_sign_in_at, is_active)
        `,
        )
        .eq("id", id)
        .single();

      if (studentError) throw studentError;

      setStudent({
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        student_number: data.student_number,
        grade: data.grade,
        branch: data.branch,
        created_at: data.created_at,
        avatar_url: (data.profiles as any)?.avatar_url ?? null,
        email: (data.profiles as any)?.email ?? null,
        is_active: (data.profiles as any)?.is_active ?? true,
        last_sign_in_at: (data.profiles as any)?.last_sign_in_at ?? null,
      });
    } catch (err) {
      setError("Öğrenci bilgileri yüklenirken bir hata oluştu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  return { student, loading, error, refetch: fetchStudent };
}
