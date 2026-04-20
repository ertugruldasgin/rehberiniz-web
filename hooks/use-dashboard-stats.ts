import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export interface DashboardStats {
  totalStudents: number;
  inactiveStudents: number;
  categoryAverages: Record<string, number>;
  topStudent: { name: string; net: number } | null;
  mostImproved: { name: string; diff: number } | null;
  totalTeachers: number;
  studentsPerTeacher: number;
}

const VALID_CATEGORIES = new Set([
  "TYT",
  "AYT-SAY",
  "AYT-EA",
  "AYT-SÖZ",
  "LGS",
  "YDT",
]);

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

      // Öğrenciler
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

      // Öğretmenler
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

      if (studentIds.length === 0) {
        setStats({
          totalStudents,
          inactiveStudents,
          categoryAverages: {},
          topStudent: null,
          mostImproved: null,
          totalTeachers,
          studentsPerTeacher,
        });
        setLoading(false);
        return;
      }

      // Sınav sonuçları
      const { data: results } = await supabase
        .from("exam_results")
        .select(
          `
          student_id,
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
        setStats({
          totalStudents,
          inactiveStudents,
          categoryAverages: {},
          topStudent: null,
          mostImproved: null,
          totalTeachers,
          studentsPerTeacher,
        });
        setLoading(false);
        return;
      }

      // Category bazlı net ortalamaları — sadece şablon kullanan veya kurum sınavları
      const categoryNets = new Map<string, number[]>();
      for (const r of results as any[]) {
        const exam = Array.isArray(r.exams) ? r.exams[0] : r.exams;
        const hasTemplate = !!exam?.exam_template_id;
        const isOfficial = exam?.is_official;
        if (!hasTemplate || !isOfficial) continue;

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

      // Öğrenci bazında sonuçları grupla
      const studentMap = new Map<
        string,
        { name: string; nets: { net: number; date: string }[] }
      >();
      for (const r of results as any[]) {
        const id = r.student_id;
        if (!studentMap.has(id)) {
          studentMap.set(id, {
            name: studentNameMap.get(id) ?? "—",
            nets: [],
          });
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
        topStudent,
        mostImproved,
        totalTeachers,
        studentsPerTeacher,
      });
      setLoading(false);
    }
    fetch();
  }, []);

  return { stats, loading };
}
