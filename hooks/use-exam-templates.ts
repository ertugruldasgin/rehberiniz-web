import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";

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

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: member } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const { data } = await supabase
      .from("exam_templates")
      .select("id, name, category, sections")
      .or(
        `organization_id.eq.${member?.organization_id},organization_id.is.null`,
      )
      .order("name");

    setTemplates(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return { templates, loading, refetch: fetchTemplates };
}
