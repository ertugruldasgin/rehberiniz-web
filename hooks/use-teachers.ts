import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";

export interface Teacher {
  id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  title: string | null;
  last_sign_in_at: string | null;
  is_active: boolean;
  student_count: number;
}

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async () => {
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

      // Önce organization_members'dan teacher'ları çek
      const { data: members, error: membersError } = await supabase
        .from("organization_members")
        .select("id, user_id, created_at, students(id)")
        .eq("organization_id", member.organization_id)
        .eq("role", "teacher");
      if (membersError) throw membersError;

      // Sonra profiles'dan bilgileri çek
      const userIds = (members ?? []).map((m) => m.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email, avatar_url, title, is_active, last_sign_in_at",
        )
        .in("id", userIds);
      if (profilesError) throw profilesError;

      const profileMap = Object.fromEntries(
        (profiles ?? []).map((p) => [p.id, p]),
      );

      const mapped = (members ?? []).map((m: any) => ({
        id: m.id,
        full_name: profileMap[m.user_id]?.full_name ?? "—",
        email: profileMap[m.user_id]?.email ?? null,
        avatar_url: profileMap[m.user_id]?.avatar_url ?? null,
        title: profileMap[m.user_id]?.title ?? null,
        is_active: profileMap[m.user_id]?.is_active ?? true,
        last_sign_in_at: profileMap[m.user_id]?.last_sign_in_at ?? null,
        student_count: Array.isArray(m.students) ? m.students.length : 0,
      }));

      setTeachers(mapped);
    } catch (err) {
      setError("Öğretmenler yüklenirken bir hata oluştu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return { teachers, loading, error, refetch: fetchTeachers };
}
