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

export interface ExamTypeTarget {
  exam_type: string;
  target_net: number;
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
  examTypeTargets: ExamTypeTarget[]; // alan bazlı hedef netler
}

export function useStudentDashboardStats(studentId: string) {
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    async function fetch() {
      const supabase = createClient();

      // Hedefler — slug bilgisiyle birlikte subjects join et
      const { data: goals } = await supabase
        .from("student_goals")
        .select("subject_id, target_net, exam_type, subjects ( slug )")
        .eq("student_id", studentId);

      const GROUP_SLUGS = new Set(["tyt-sosyal", "tyt-fen"]);

      const examTypeMap = new Map<string, number>();
      const goalMap = new Map<string, number>();

      for (const g of goals ?? []) {
        const subject = Array.isArray(g.subjects) ? g.subjects[0] : g.subjects;
        const slug = subject?.slug ?? "";

        goalMap.set(g.subject_id, g.target_net);

        // Üst grupları (tyt-sosyal, tyt-fen) toplama dahil etme
        if (!GROUP_SLUGS.has(slug)) {
          const prev = examTypeMap.get(g.exam_type) ?? 0;
          examTypeMap.set(g.exam_type, prev + g.target_net);
        }
      }

      const examTypeTargets: ExamTypeTarget[] = Array.from(
        examTypeMap.entries(),
      ).map(([exam_type, target_net]) => ({ exam_type, target_net }));

      // Sınav sonuçları — subject_results exam_result_id'ye bağlı
      const { data: examResults } = await supabase
        .from("exam_results")
        .select(
          `
          id,
          exam_id,
          total_net,
          created_at,
          exams!inner (
            id,
            title,
            is_official,
            subject_id
          ),
          subject_results (
            subject_id,
            net,
            subjects ( id, name, slug )
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
        examTypeTargets,
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

      // Son kurum sınavı — is_official: true, subject_id null (genel sınav)
      const lastOfficial = examResults.find((r: any) => {
        const exam = Array.isArray(r.exams) ? r.exams[0] : r.exams;
        return exam?.is_official && !exam?.subject_id;
      });

      let lastOfficialExamName = null;
      let lastOfficialExamDate = null;
      let lastOfficialTotalNet = null;
      let lastOfficialSubjects: SubjectResult[] = [];

      if (lastOfficial) {
        const exam = Array.isArray(lastOfficial.exams)
          ? lastOfficial.exams[0]
          : lastOfficial.exams;
        lastOfficialExamName = exam?.title ?? null;
        lastOfficialExamDate = lastOfficial.created_at;
        lastOfficialTotalNet = lastOfficial.total_net;
        lastOfficialSubjects = buildSubjectResults(lastOfficial);
      }

      // Son genel deneme — is_official: false, subject_id null
      const lastGeneral = examResults.find((r: any) => {
        const exam = Array.isArray(r.exams) ? r.exams[0] : r.exams;
        return !exam?.is_official && !exam?.subject_id;
      });

      let lastGeneralExamName = null;
      let lastGeneralExamDate = null;
      let lastGeneralTotalNet = null;
      let lastGeneralSubjects: SubjectResult[] = [];

      if (lastGeneral) {
        const exam = Array.isArray(lastGeneral.exams)
          ? lastGeneral.exams[0]
          : lastGeneral.exams;
        lastGeneralExamName = exam?.title ?? null;
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
        examTypeTargets,
      });
      setLoading(false);
    }

    fetch();
  }, [studentId]);

  return { stats, loading };
}
