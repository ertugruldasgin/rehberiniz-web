import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export interface DashboardStats {
  totalStudents: number;
  inactiveStudents: number;
  categoryAverages: Record<string, number>;
  monthlyCategoryAverages: Record<string, number>;
  categoryTrends: Record<string, { date: string; avg: number }[]>;
  topStudent: { name: string; net: number } | null;
  mostImproved: { name: string; diff: number } | null;
  totalTeachers: number;
  studentsPerTeacher: number;
  recentOfficialCount: number;
  totalExamCount: number;
  overallAvgNet: number;
  monthlyAvgNet: number;
  monthlyAvgChange: number;
}

const VALID_CATEGORIES = new Set([
  "TYT",
  "AYT-SAY",
  "AYT-EA",
  "AYT-SÖZ",
  "LGS",
  "YDT",
]);

function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Pazartesi
  return d.toISOString().split("T")[0];
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
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

      const orgId = member.organization_id;

      const { data: students } = await supabase
        .from("students")
        .select(
          "id, first_name, last_name, profiles!students_user_id_fkey1(is_active)",
        )
        .eq("organization_id", orgId);

      const totalStudents = students?.length ?? 0;
      const inactiveStudents =
        students?.filter((s: any) => !(s.profiles?.is_active ?? true)).length ??
        0;

      const studentIds = (students ?? []).map((s: any) => s.id);
      const studentNameMap = new Map<string, string>();
      for (const s of students as any[]) {
        studentNameMap.set(s.id, `${s.first_name} ${s.last_name}`);
      }

      const { data: teachers } = await supabase
        .from("organization_members")
        .select("id")
        .eq("organization_id", orgId)
        .eq("role", "teacher");

      const totalTeachers = teachers?.length ?? 0;
      const studentsPerTeacher =
        totalTeachers > 0
          ? Math.round((totalStudents / totalTeachers) * 10) / 10
          : 0;

      const emptyStats = {
        totalStudents,
        inactiveStudents,
        categoryAverages: {},
        monthlyCategoryAverages: {},
        categoryTrends: {},
        topStudent: null,
        mostImproved: null,
        totalTeachers,
        studentsPerTeacher,
        recentOfficialCount: 0,
        totalExamCount: 0,
        overallAvgNet: 0,
        monthlyAvgNet: 0,
        monthlyAvgChange: 0,
      };

      if (studentIds.length === 0) {
        setStats(emptyStats);
        setLoading(false);
        return;
      }

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const { data: results } = await supabase
        .from("exam_results")
        .select(
          `
          student_id,
          exam_id,
          total_net,
          created_at,
          exams!inner (
            is_official,
            exam_template_id,
            exam_templates ( category ),
            subjects ( category )
          )
        `,
        )
        .in("student_id", studentIds)
        .order("created_at", { ascending: false });

      if (!results || results.length === 0) {
        setStats(emptyStats);
        setLoading(false);
        return;
      }

      const recentResults = results.filter(
        (r: any) => new Date(r.created_at) >= oneMonthAgo,
      );

      // Toplam deneme sayısı — son 1 ay, unique exam_id
      const totalExamCount = new Set(recentResults.map((r: any) => r.exam_id))
        .size;

      // Son 1 ay kurum sınavı sayısı
      const recentOfficialCount = new Set(
        recentResults
          .filter((r: any) => {
            const exam = Array.isArray(r.exams) ? r.exams[0] : r.exams;
            return exam?.is_official;
          })
          .map((r: any) => r.exam_id),
      ).size;

      // Official + şablonlu — genel
      const officialResults = results.filter((r: any) => {
        const exam = Array.isArray(r.exams) ? r.exams[0] : r.exams;
        return exam?.is_official && !!exam?.exam_template_id;
      });

      // Official + şablonlu — son 1 ay
      const recentOfficialResults = recentResults.filter((r: any) => {
        const exam = Array.isArray(r.exams) ? r.exams[0] : r.exams;
        return exam?.is_official && !!exam?.exam_template_id;
      });

      // Genel ortalama net
      const overallAvgNet =
        officialResults.length > 0
          ? Math.round(
              (officialResults.reduce(
                (s: number, r: any) => s + r.total_net,
                0,
              ) /
                officialResults.length) *
                100,
            ) / 100
          : 0;

      // Son 1 ay ortalama net
      const monthlyAvgNet =
        recentOfficialResults.length > 0
          ? Math.round(
              (recentOfficialResults.reduce(
                (s: number, r: any) => s + r.total_net,
                0,
              ) /
                recentOfficialResults.length) *
                100,
            ) / 100
          : 0;

      // Yüzdelik değişim
      const monthlyAvgChange =
        overallAvgNet > 0
          ? Math.round(
              ((monthlyAvgNet - overallAvgNet) / overallAvgNet) * 100 * 10,
            ) / 10
          : 0;

      // Genel category ortalamaları
      const categoryNets = new Map<string, number[]>();
      for (const r of officialResults as any[]) {
        const exam = Array.isArray(r.exams) ? r.exams[0] : r.exams;
        const category =
          exam?.exam_templates?.category ?? exam?.subjects?.category ?? null;
        if (!category || !VALID_CATEGORIES.has(category)) continue;
        if (!categoryNets.has(category)) categoryNets.set(category, []);
        categoryNets.get(category)!.push(r.total_net);
      }

      const categoryAverages: Record<string, number> = {};
      for (const [cat, nets] of categoryNets.entries()) {
        categoryAverages[cat] =
          Math.round((nets.reduce((s, n) => s + n, 0) / nets.length) * 100) /
          100;
      }

      // Son 1 ay category ortalamaları
      const monthlyCategoryNets = new Map<string, number[]>();
      for (const r of recentOfficialResults as any[]) {
        const exam = Array.isArray(r.exams) ? r.exams[0] : r.exams;
        const category =
          exam?.exam_templates?.category ?? exam?.subjects?.category ?? null;
        if (!category || !VALID_CATEGORIES.has(category)) continue;
        if (!monthlyCategoryNets.has(category))
          monthlyCategoryNets.set(category, []);
        monthlyCategoryNets.get(category)!.push(r.total_net);
      }

      const monthlyCategoryAverages: Record<string, number> = {};
      for (const [cat, nets] of monthlyCategoryNets.entries()) {
        monthlyCategoryAverages[cat] =
          Math.round((nets.reduce((s, n) => s + n, 0) / nets.length) * 100) /
          100;
      }

      // Category bazlı aylık trend
      const categoryTrendMap = new Map<string, Map<string, number[]>>();
      for (const r of officialResults as any[]) {
        const exam = Array.isArray(r.exams) ? r.exams[0] : r.exams;
        const category =
          exam?.exam_templates?.category ?? exam?.subjects?.category ?? null;
        if (!category || !VALID_CATEGORIES.has(category)) continue;

        const weekKey = getWeekKey(new Date(r.created_at)); // monthKey → weekKey
        if (!categoryTrendMap.has(category))
          categoryTrendMap.set(category, new Map());
        const trendMap = categoryTrendMap.get(category)!;
        if (!trendMap.has(weekKey)) trendMap.set(weekKey, []);
        trendMap.get(weekKey)!.push(r.total_net);
      }

      const categoryTrends: Record<string, { date: string; avg: number }[]> =
        {};
      for (const [cat, trendMap] of categoryTrendMap.entries()) {
        categoryTrends[cat] = Array.from(trendMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, nets]) => ({
            date,
            avg:
              Math.round(
                (nets.reduce((s, n) => s + n, 0) / nets.length) * 100,
              ) / 100,
          }));
      }

      // Öğrenci bazında sonuçları grupla
      const studentMap = new Map<
        string,
        { name: string; nets: { net: number; date: string }[] }
      >();
      for (const r of results as any[]) {
        const id = r.student_id;
        if (!studentMap.has(id)) {
          studentMap.set(id, { name: studentNameMap.get(id) ?? "—", nets: [] });
        }
        studentMap.get(id)!.nets.push({ net: r.total_net, date: r.created_at });
      }

      // En başarılı
      let topStudent: DashboardStats["topStudent"] = null;
      let topNet = -Infinity;
      for (const [, v] of studentMap.entries()) {
        const lastNet = v.nets[0]?.net ?? 0;
        if (lastNet > topNet) {
          topNet = lastNet;
          topStudent = { name: v.name, net: Math.round(lastNet * 100) / 100 };
        }
      }

      // En çok gelişen
      let mostImproved: DashboardStats["mostImproved"] = null;
      let bestDiff = -Infinity;
      for (const [, v] of studentMap.entries()) {
        if (v.nets.length < 2) continue;
        const sorted = [...v.nets].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        const diff = sorted[sorted.length - 1].net - sorted[0].net;
        if (diff > bestDiff) {
          bestDiff = diff;
          mostImproved = { name: v.name, diff: Math.round(diff * 100) / 100 };
        }
      }

      setStats({
        totalStudents,
        inactiveStudents,
        categoryAverages,
        monthlyCategoryAverages,
        categoryTrends,
        topStudent,
        mostImproved,
        totalTeachers,
        studentsPerTeacher,
        recentOfficialCount,
        totalExamCount,
        overallAvgNet,
        monthlyAvgNet,
        monthlyAvgChange,
      });
      setLoading(false);
    }
    fetch();
  }, []);

  return { stats, loading };
}
