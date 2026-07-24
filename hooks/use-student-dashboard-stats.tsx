import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export interface SubjectResult {
  subject_id: string;
  subject_name: string;
  subject_slug: string;
  last_net: number;
  target_net: number | null;
  diff: number | null;
}

export interface StudentDashboardStats {
  lastOfficialExamName: string | null;
  lastOfficialExamDate: string | null;
  lastOfficialTotalNet: number | null;
  lastOfficialSubjects: SubjectResult[];
  lastGeneralExamName: string | null;
  lastGeneralExamDate: string | null;
  lastGeneralTotalNet: number | null;
  lastGeneralSubjects: SubjectResult[];
  targetNet: number | null;
}

export function useStudentDashboardStats(studentId: string) {
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    async function fetch() {
      const supabase = createClient();

      // Hedefler
      const { data: goals } = await supabase
        .from("student_goals")
        .select("subject_id, target_net")
        .eq("student_id", studentId);

      const goalMap = new Map<string, number>();
      let targetNet = 0;
      for (const g of goals ?? []) {
        goalMap.set(g.subject_id, g.target_net);
        targetNet += g.target_net;
      }

      // Sınav sonuçları
      const { data: examResults } = await supabase
        .from("exam_results")
        .select(
          `
          id,
          exam_id,
          total_net,
          created_at,
          subject_results (
            subject_id,
            net,
            subjects ( id, name, slug )
          ),
          exams!inner (
            id,
            name,
            is_official,
            is_standalone
          )
        `,
        )
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      const emptyStats: StudentDashboardStats = {
        lastOfficialExamName: null,
        lastOfficialExamDate: null,
        lastOfficialTotalNet: null,
        lastOfficialSubjects: [],
        lastGeneralExamName: null,
        lastGeneralExamDate: null,
        lastGeneralTotalNet: null,
        lastGeneralSubjects: [],
        targetNet: targetNet > 0 ? targetNet : null,
      };

      if (!examResults || examResults.length === 0) {
        setStats(emptyStats);
        setLoading(false);
        return;
      }

      function buildSubjectResults(result: any): SubjectResult[] {
        return (result.subject_results ?? [])
          .map((sr: any) => {
            const subject = Array.isArray(sr.subjects)
              ? sr.subjects[0]
              : sr.subjects;
            if (!subject) return null;
            const target = goalMap.get(subject.id) ?? null;
            return {
              subject_id: subject.id,
              subject_name: subject.name,
              subject_slug: subject.slug,
              last_net: sr.net,
              target_net: target,
              diff: target !== null ? sr.net - target : null,
            };
          })
          .filter(Boolean) as SubjectResult[];
      }

      // Son kurum sınavı
      const lastOfficial = examResults.find((r: any) => {
        const exam = Array.isArray(r.exams) ? r.exams[0] : r.exams;
        return exam?.is_official;
      });

      let lastOfficialExamName = null;
      let lastOfficialExamDate = null;
      let lastOfficialTotalNet = null;
      let lastOfficialSubjects: SubjectResult[] = [];

      if (lastOfficial) {
        const exam = Array.isArray(lastOfficial.exams)
          ? lastOfficial.exams[0]
          : lastOfficial.exams;
        lastOfficialExamName = exam?.name ?? null;
        lastOfficialExamDate = lastOfficial.created_at;
        lastOfficialTotalNet = lastOfficial.total_net;
        lastOfficialSubjects = buildSubjectResults(lastOfficial);
      }

      // Son genel deneme
      const lastGeneral = examResults.find((r: any) => {
        const exam = Array.isArray(r.exams) ? r.exams[0] : r.exams;
        return !exam?.is_official && !exam?.is_standalone;
      });

      let lastGeneralExamName = null;
      let lastGeneralExamDate = null;
      let lastGeneralTotalNet = null;
      let lastGeneralSubjects: SubjectResult[] = [];

      if (lastGeneral) {
        const exam = Array.isArray(lastGeneral.exams)
          ? lastGeneral.exams[0]
          : lastGeneral.exams;
        lastGeneralExamName = exam?.name ?? null;
        lastGeneralExamDate = lastGeneral.created_at;
        lastGeneralTotalNet = lastGeneral.total_net;
        lastGeneralSubjects = buildSubjectResults(lastGeneral);
      }

      setStats({
        lastOfficialExamName,
        lastOfficialExamDate,
        lastOfficialTotalNet,
        lastOfficialSubjects,
        lastGeneralExamName,
        lastGeneralExamDate,
        lastGeneralTotalNet,
        lastGeneralSubjects,
        targetNet: targetNet > 0 ? targetNet : null,
      });
      setLoading(false);
    }

    fetch();
  }, [studentId]);

  return { stats, loading };
}
