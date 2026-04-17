import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";

export interface GuidanceNote {
  id: string;
  category: string;
  content: string;
  meeting_date: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  teacher: { full_name: string; avatar_url: string | null } | null;
}

export function useGuidanceNotes(studentId: string) {
  const [notes, setNotes] = useState<GuidanceNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("guidance_notes")
        .select(
          `
          id, category, content, meeting_date, is_private, created_at, updated_at,
          profiles!guidance_notes_teacher_id_fkey (full_name, avatar_url)
        `,
        )
        .eq("student_id", studentId)
        .order("meeting_date", { ascending: false });

      if (error) throw error;

      setNotes(
        (data ?? []).map((n: any) => ({
          id: n.id,
          category: n.category,
          content: n.content,
          meeting_date: n.meeting_date,
          is_private: n.is_private,
          created_at: n.created_at,
          updated_at: n.updated_at,
          teacher: Array.isArray(n.profiles) ? n.profiles[0] : n.profiles,
        })),
      );
    } catch (err) {
      setError("Rehberlik notları yüklenirken bir hata oluştu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);
  return { notes, loading, error, refetch: fetchNotes };
}
