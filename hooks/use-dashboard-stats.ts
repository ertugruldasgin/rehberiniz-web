import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";

export interface DashboardStats {
  student_count: number;
  active_student_count: number;
  teacher_count: number;
  exam_count: number;
  exam_count_last_month: number;
  avg_net: number | null;
  top_student: { name: string; avg_net: number; exam_count: number } | null;
  top_teacher: { name: string; avg_net: number; student_count: number } | null;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
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

      const orgId = member.organization_id;
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const [
        { count: student_count },
        { count: active_student_count },
        { count: teacher_count },
        { count: exam_count },
        { count: exam_count_last_month },
        { data: students },
        { data: allExamResults },
        { data: officialExamResults },
      ] = await Promise.all([
        supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", orgId),
        supabase
          .from("students")
          .select("id, profiles!students_user_id_fkey1(is_active)", {
            count: "exact",
            head: true,
          })
          .eq("organization_id", orgId),
        supabase
          .from("organization_members")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", orgId)
          .eq("role", "teacher"),
        supabase
          .from("exams")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", orgId)
          .eq("is_official", true),
        supabase
          .from("exams")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", orgId)
          .eq("is_official", true)
          .gte("date", oneMonthAgo.toISOString().split("T")[0]),
        supabase
          .from("students")
          .select("id, first_name, last_name, teacher_id")
          .eq("organization_id", orgId),
        // Ortalama net için tüm sonuçlar
        supabase
          .from("exam_results")
          .select(
            "total_net, student_id, students!inner(organization_id, teacher_id)",
          )
          .eq("students.organization_id", orgId),
        // Top student/teacher için sadece kurumsal sınavlar
        supabase
          .from("exam_results")
          .select(
            "total_net, student_id, students!inner(organization_id, teacher_id), exams!inner(is_official)",
          )
          .eq("students.organization_id", orgId)
          .eq("exams.is_official", true),
      ]);

      // Ortalama net — tüm sonuçlar
      const allNets = (allExamResults ?? [])
        .map((r: any) => r.total_net)
        .filter((n: number) => n > 0);
      const avg_net =
        allNets.length > 0
          ? Math.round(
              (allNets.reduce((a: number, b: number) => a + b, 0) /
                allNets.length) *
                100,
            ) / 100
          : null;

      // En iyi öğrenci — sadece kurumsal sınavlar
      const studentNetMap: Record<string, number[]> = {};
      for (const r of officialExamResults ?? []) {
        if (!studentNetMap[r.student_id]) studentNetMap[r.student_id] = [];
        studentNetMap[r.student_id].push(r.total_net);
      }

      let top_student: DashboardStats["top_student"] = null;
      let topStudentAvg = -Infinity;
      for (const [studentId, nets] of Object.entries(studentNetMap)) {
        const avg = nets.reduce((a, b) => a + b, 0) / nets.length;
        if (avg > topStudentAvg) {
          topStudentAvg = avg;
          const s = (students ?? []).find((s: any) => s.id === studentId);
          if (s) {
            top_student = {
              name: `${s.first_name} ${s.last_name}`,
              avg_net: Math.round(avg * 100) / 100,
              exam_count: nets.length,
            };
          }
        }
      }

      // En iyi öğretmen — öğrencilerinin kurumsal sınavlardaki ortalama neti
      const teacherNetMap: Record<string, number[]> = {};
      for (const r of officialExamResults ?? []) {
        const student = (students ?? []).find(
          (s: any) => s.id === r.student_id,
        );
        if (!student?.teacher_id) continue;
        if (!teacherNetMap[student.teacher_id])
          teacherNetMap[student.teacher_id] = [];
        teacherNetMap[student.teacher_id].push(r.total_net);
      }

      let top_teacher: DashboardStats["top_teacher"] = null;
      let topTeacherAvg = -Infinity;

      if (Object.keys(teacherNetMap).length > 0) {
        const { data: teachers } = await supabase
          .from("organization_members")
          .select("id, profiles!organization_members_user_id_fkey(full_name)")
          .eq("organization_id", orgId)
          .eq("role", "teacher");

        for (const [teacherId, nets] of Object.entries(teacherNetMap)) {
          const avg = nets.reduce((a, b) => a + b, 0) / nets.length;
          if (avg > topTeacherAvg) {
            topTeacherAvg = avg;
            const t = (teachers ?? []).find((t: any) => t.id === teacherId);
            const profile = Array.isArray(t?.profiles)
              ? t.profiles[0]
              : t?.profiles;
            if (profile) {
              top_teacher = {
                name: profile.full_name,
                avg_net: Math.round(avg * 100) / 100,
                student_count: nets.length,
              };
            }
          }
        }
      }

      setStats({
        student_count: student_count ?? 0,
        active_student_count: active_student_count ?? 0,
        teacher_count: teacher_count ?? 0,
        exam_count: exam_count ?? 0,
        exam_count_last_month: exam_count_last_month ?? 0,
        avg_net,
        top_student,
        top_teacher,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  return { stats, loading };
}
