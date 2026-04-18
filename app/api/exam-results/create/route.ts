import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

    const body = await req.json();
    const {
      title,
      date,
      template_id,
      subject_id,
      sections,
      exam_id,
      student_id,
    } = body;

    if (!sections?.length)
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik." },
        { status: 400 },
      );

    let student: { id: string; organization_id: string } | null = null;

    if (student_id) {
      const { data: member } = await adminSupabase
        .from("organization_members")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .single();

      if (!member || (member.role !== "teacher" && member.role !== "admin"))
        return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

      const { data } = await adminSupabase
        .from("students")
        .select("id, organization_id")
        .eq("id", student_id)
        .single();

      if (!data || data.organization_id !== member.organization_id)
        return NextResponse.json(
          { error: "Geçersiz öğrenci." },
          { status: 400 },
        );

      student = data;
    } else {
      const { data } = await adminSupabase
        .from("students")
        .select("id, organization_id")
        .eq("user_id", user.id)
        .single();
      student = data;
    }

    if (!student)
      return NextResponse.json(
        { error: "Öğrenci kaydı bulunamadı." },
        { status: 404 },
      );

    let finalExamId: string;
    let templateData: {
      base_score: number;
      max_score: number;
      wrong_penalty: number;
      sections: any[];
    } | null = null;

    if (exam_id) {
      finalExamId = exam_id;
      const { data: examRow } = await adminSupabase
        .from("exams")
        .select(
          "exam_template_id, exam_templates(base_score, max_score, wrong_penalty, sections)",
        )
        .eq("id", exam_id)
        .single();
      const tmpl = Array.isArray(examRow?.exam_templates)
        ? examRow.exam_templates[0]
        : examRow?.exam_templates;
      if (tmpl) templateData = tmpl;
    } else {
      if (!title || !date)
        return NextResponse.json(
          { error: "Zorunlu alanlar eksik." },
          { status: 400 },
        );
      if (!template_id && !subject_id)
        return NextResponse.json(
          { error: "Şablon veya ders seçiniz." },
          { status: 400 },
        );

      if (template_id) {
        const { data: tmpl } = await adminSupabase
          .from("exam_templates")
          .select("base_score, max_score, wrong_penalty, sections")
          .eq("id", template_id)
          .single();
        if (tmpl) templateData = tmpl;
      }

      const { data: exam, error: examError } = await adminSupabase
        .from("exams")
        .insert({
          title,
          date,
          organization_id: student.organization_id,
          exam_template_id: template_id ?? null,
          subject_id: subject_id ?? null,
          is_official: false,
        })
        .select("id")
        .single();
      if (examError) throw examError;

      finalExamId = exam.id;
    }

    const slugs = sections.map((s: any) => s.key).filter(Boolean);
    const { data: subjectRows } =
      slugs.length > 0
        ? await adminSupabase
            .from("subjects")
            .select("id, slug, coefficient, wrong_penalty")
            .in("slug", slugs)
        : { data: [] };

    const subjectMap = Object.fromEntries(
      (subjectRows ?? []).map((s) => [s.slug, s]),
    );

    const templateSectionMap = Object.fromEntries(
      (templateData?.sections ?? []).map((s: any) => [s.key, s]),
    );

    const base_score = templateData?.base_score ?? 100;
    const max_score = templateData?.max_score ?? 500;
    const template_wrong_penalty = templateData?.wrong_penalty ?? 0.25;

    let total_correct = 0;
    let total_incorrect = 0;
    let total_empty = 0;
    let total_net = 0;
    let total_score_raw = 0;

    const subjectResults = sections.map((s: any) => {
      const subjectRow = subjectMap[s.key];
      const templateSection = templateSectionMap[s.key];

      const coefficient =
        templateSection?.coefficient ?? subjectRow?.coefficient ?? 1.0;
      const wrong_penalty = subjectRow?.wrong_penalty ?? template_wrong_penalty;

      const correct = s.correct || 0;
      const incorrect = s.incorrect || 0;
      const empty = Math.max(0, (s.questions || 0) - correct - incorrect);
      const net = Math.round((correct - incorrect * wrong_penalty) * 100) / 100;
      const score = Math.round(net * coefficient * 100) / 100;

      total_correct += correct;
      total_incorrect += incorrect;
      total_empty += empty;
      total_net += net;
      total_score_raw += score;

      return {
        exam_result_id: "",
        subject_id: subjectRow?.id ?? null,
        section_label: s.label,
        is_standalone: !exam_id && !!subject_id,
        correct,
        incorrect,
        empty,
        net,
        score,
      };
    });

    // Teorik max: tüm sorular doğru yapılsaydı alınacak puan
    const theoreticalMax =
      base_score +
      sections.reduce((sum: number, s: any) => {
        const subjectRow = subjectMap[s.key];
        const templateSection = templateSectionMap[s.key];
        const coefficient =
          templateSection?.coefficient ?? subjectRow?.coefficient ?? 1.0;
        return sum + (s.questions || 0) * coefficient;
      }, 0);

    const ham_puan = base_score + total_score_raw;
    const total_score =
      Math.round((ham_puan / theoreticalMax) * max_score * 100) / 100;

    const { data: examResult, error: resultError } = await adminSupabase
      .from("exam_results")
      .insert({
        student_id: student.id,
        exam_id: finalExamId,
        total_correct,
        total_incorrect,
        total_empty,
        total_net: Math.round(total_net * 100) / 100,
        total_score,
      })
      .select("id")
      .single();
    if (resultError) throw resultError;

    const finalSubjectResults = subjectResults.map((sr: any) => ({
      ...sr,
      exam_result_id: examResult.id,
    }));

    if (finalSubjectResults.length > 0) {
      const { error: subjectError } = await adminSupabase
        .from("subject_results")
        .insert(finalSubjectResults);
      if (subjectError) {
        console.error("subject_results insert error:", subjectError);
        throw subjectError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
