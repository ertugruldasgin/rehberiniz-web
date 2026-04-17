import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";

export interface MeetingNote {
  id: string;
  category: string;
  content: string;
  meeting_date: string;
  is_private: boolean;
  student: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
}

export function useMeetingNotes() {
  const [notes, setNotes] = useState<MeetingNote[]>([]);
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

      const { data, error } = await supabase
        .from("guidance_notes")
        .select(
          `
          id, category, content, meeting_date, is_private,
          students ( id, first_name, last_name, user_id,
            profiles!students_user_id_fkey1 ( avatar_url )
          )
        `,
        )
        .eq("teacher_id", user.id)
        .eq("category", "Rehberlik Notu")
        .order("meeting_date", { ascending: false });

      if (error) throw error;

      setNotes(
        (data ?? []).map((n: any) => ({
          id: n.id,
          category: n.category,
          content: n.content,
          meeting_date: n.meeting_date,
          is_private: n.is_private,
          student: n.students
            ? {
                id: n.students.id,
                first_name: n.students.first_name,
                last_name: n.students.last_name,
                avatar_url:
                  (Array.isArray(n.students.profiles)
                    ? n.students.profiles[0]
                    : n.students.profiles
                  )?.avatar_url ?? null,
              }
            : null,
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
  return { notes, loading, error, refetch: fetchNotes };
}
