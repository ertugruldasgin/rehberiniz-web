import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";

export interface MyGuidanceNote {
  id: string;
  category: string;
  content: string;
  meeting_date: string;
  created_at: string;
  teacher: { full_name: string; avatar_url: string | null } | null;
}

export function useMyGuidanceNotes() {
  const [notes, setNotes] = useState<MyGuidanceNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
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
        .maybeSingle();
      if (!student) throw new Error("Öğrenci kaydı bulunamadı.");

      const { data, error } = await supabase
        .from("guidance_notes")
        .select(
          `
          id, category, content, meeting_date, created_at,
          profiles!guidance_notes_teacher_id_fkey (full_name, avatar_url)
        `,
        )
        .eq("student_id", student.id)
        .eq("is_private", false)
        .order("meeting_date", { ascending: false });

      if (error) throw error;

      setNotes(
        (data ?? []).map((n: any) => ({
          id: n.id,
          category: n.category,
          content: n.content,
          meeting_date: n.meeting_date,
          created_at: n.created_at,
          teacher: Array.isArray(n.profiles) ? n.profiles[0] : n.profiles,
        })),
      );
    } catch (err) {
      setError("Notlar yüklenirken bir hata oluştu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);
  return { notes, loading, error };
}
