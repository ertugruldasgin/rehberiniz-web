import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";

export interface SubjectAverage {
  subject_name: string;
  category: string;
  avg_net: number;
  avg_correct: number;
  avg_incorrect: number;
  result_count: number;
}

export function useSubjectAverages() {
  const [averages, setAverages] = useState<SubjectAverage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAverages = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: member } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();
      if (!member) return;

      // Kurumun tüm öğrencilerinin subject_results'larını çek
      const { data, error } = await supabase
        .from("subject_results")
        .select(
          `
          correct, incorrect, net,
          subjects ( name, category ),
          exam_results (
            students ( organization_id )
          )
        `,
        )
        .not("subjects", "is", null);

      if (error) throw error;

      // Organizasyona göre filtrele ve grupla
      const orgFiltered = (data ?? []).filter((r: any) => {
        const student = Array.isArray(r.exam_results?.students)
          ? r.exam_results.students[0]
          : r.exam_results?.students;
        return student?.organization_id === member.organization_id;
      });

      const grouped: Record<
        string,
        {
          name: string;
          category: string;
          nets: number[];
          corrects: number[];
          incorrects: number[];
        }
      > = {};

      for (const r of orgFiltered) {
        const subject = Array.isArray(r.subjects) ? r.subjects[0] : r.subjects;
        if (!subject) continue;
        const key = subject.name;
        if (!grouped[key]) {
          grouped[key] = {
            name: subject.name,
            category: subject.category,
            nets: [],
            corrects: [],
            incorrects: [],
          };
        }
        grouped[key].nets.push(r.net);
        grouped[key].corrects.push(r.correct);
        grouped[key].incorrects.push(r.incorrect);
      }

      const result = Object.values(grouped)
        .map((g) => ({
          subject_name: g.name,
          category: g.category,
          avg_net:
            Math.round(
              (g.nets.reduce((a, b) => a + b, 0) / g.nets.length) * 100,
            ) / 100,
          avg_correct:
            Math.round(
              (g.corrects.reduce((a, b) => a + b, 0) / g.corrects.length) * 100,
            ) / 100,
          avg_incorrect:
            Math.round(
              (g.incorrects.reduce((a, b) => a + b, 0) / g.incorrects.length) *
                100,
            ) / 100,
          result_count: g.nets.length,
        }))
        .sort((a, b) => a.category.localeCompare(b.category));

      setAverages(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAverages();
  }, [fetchAverages]);
  return { averages, loading };
}
