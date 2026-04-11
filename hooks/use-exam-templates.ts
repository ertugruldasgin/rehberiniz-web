import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export interface ExamSection {
  key: string;
  label: string;
  questions: number;
}

export interface ExamTemplate {
  id: string;
  name: string;
  category: string;
  sections: ExamSection[];
}

export function useExamTemplates() {
  const [templates, setTemplates] = useState<ExamTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data } = await supabase
        .from("exam_templates")
        .select("id, name, category, sections")
        .order("name");

      setTemplates(data ?? []);
      setLoading(false);
    }
    fetch();
  }, []);

  return { templates, loading };
}
