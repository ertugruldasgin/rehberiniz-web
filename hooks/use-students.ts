import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_number: string | null;
  grade: string | null;
  branch: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı.");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const { data: member, error: memberError } = await supabase
        .from("organization_members")
        .select("id, organization_id")
        .eq("user_id", user.id)
        .single();
      if (memberError) throw memberError;

      const isAdmin = profile?.role === "admin";

      let query = supabase
        .from("students")
        .select(
          `
          id,
          first_name,
          last_name,
          student_number,
          grade,
          branch,
          profiles!students_user_id_fkey1 (avatar_url, is_active)
        `,
        )
        .order("first_name");

      // Admin ise tüm organizasyonun öğrencileri, teacher ise sadece kendi öğrencileri
      if (isAdmin) {
        query = query.eq("organization_id", member.organization_id);
      } else {
        query = query.eq("teacher_id", member.id);
      }

      const { data, error: studentsError } = await query;
      if (studentsError) throw studentsError;

      const mapped = (data ?? []).map((s: any) => ({
        id: s.id,
        first_name: s.first_name,
        last_name: s.last_name,
        student_number: s.student_number,
        grade: s.grade,
        branch: s.branch,
        avatar_url: s.profiles?.avatar_url ?? null,
        is_active: (s.profiles as any)?.is_active ?? true,
      }));

      setStudents(mapped);
    } catch (err) {
      setError("Öğrenciler yüklenirken bir hata oluştu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, loading, error, refetch: fetchStudents };
}
