import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";

export interface TeacherDetail {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  title: string | null;
  created_at: string;
  is_active: boolean;
  last_sign_in_at: string | null;
}

export function useTeacher(id: string) {
  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeacher = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      const { data, error: teacherError } = await supabase
        .from("organization_members")
        .select("id, user_id, created_at")
        .eq("id", id)
        .single();
      if (teacherError) throw teacherError;

      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "full_name, email, avatar_url, title, is_active, last_sign_in_at",
        )
        .eq("id", data.user_id)
        .single();

      setTeacher({
        id: data.id,
        user_id: data.user_id,
        full_name: profile?.full_name ?? "—",
        email: profile?.email ?? null,
        avatar_url: profile?.avatar_url ?? null,
        title: profile?.title ?? null,
        created_at: data.created_at,
        is_active: profile?.is_active ?? true,
        last_sign_in_at: profile?.last_sign_in_at ?? null,
      });
    } catch (err) {
      setError("Öğretmen bilgileri yüklenirken bir hata oluştu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTeacher();
  }, [fetchTeacher]);

  return { teacher, loading, error, refetch: fetchTeacher };
}
