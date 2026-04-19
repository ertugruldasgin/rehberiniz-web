import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export interface Subject {
  id: string;
  name: string;
  slug: string;
  category: string;
  default_questions: number;
  coefficient: number;
  wrong_penalty: number;
}

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data } = await supabase
        .from("subjects")
        .select(
          "id, name, slug, category, default_questions, coefficient, wrong_penalty",
        )
        .order("name");
      setSubjects(data ?? []);
      setLoading(false);
    }
    fetch();
  }, []);

  return { subjects, loading };
}
