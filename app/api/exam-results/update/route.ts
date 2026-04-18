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

    const { data: member } = await adminSupabase
      .from("organization_members")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .single();

    if (!member || (member.role !== "teacher" && member.role !== "admin"))
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

    const { result_id, sections } = await req.json();

    if (!result_id || !sections?.length)
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik." },
        { status: 400 },
      );

    const { data: examResult } = await adminSupabase
      .from("exam_results")
      .select(
        `
        id,
        students!inner(organization_id),
        exams!inner(
          subject_id,
          exam_template_id,
          exam_templates(base_score, max_score, wrong_penalty, sections)
        )
      `,
      )
      .eq("id", result_id)
      .single();

    const student = Array.isArray(examResult?.students)
      ? examResult.students[0]
      : examResult?.students;

    if (!examResult || student?.organization_id !== member.organization_id)
      return NextResponse.json({ error: "Geçersiz sonuç." }, { status: 400 });

    const exam = Array.isArray(examResult?.exams)
      ? examResult.exams[0]
      : examResult?.exams;
    const tmpl = Array.isArray(exam?.exam_templates)
      ? exam.exam_templates[0]
      : exam?.exam_templates;

    const base_score = tmpl?.base_score ?? 100;
    const max_score = tmpl?.max_score ?? 500;
    const template_wrong_penalty = tmpl?.wrong_penalty ?? 0.25;
    const templateSections: any[] = tmpl?.sections ?? [];

    const templateSectionMap = Object.fromEntries(
      templateSections.map((s: any) => [s.key, s]),
    );

    const subjectResultIds = sections
      .map((s: any) => s.subject_id)
      .filter(Boolean);
    const { data: existingSubjectResults } =
      subjectResultIds.length > 0
        ? await adminSupabase
            .from("subject_results")
            .select(
              "id, subject_id, subjects(id, slug, coefficient, wrong_penalty)",
            )
            .in("id", subjectResultIds)
        : { data: [] };

    const subjectResultMap = Object.fromEntries(
      (existingSubjectResults ?? []).map((sr: any) => [sr.id, sr]),
    );

    let total_correct = 0;
    let total_incorrect = 0;
    let total_empty = 0;
    let total_net = 0;
    let total_score_raw = 0;

    const updates = sections.map((s: any) => {
      const existingSR = subjectResultMap[s.subject_id];
      const subjectRow = Array.isArray(existingSR?.subjects)
        ? existingSR.subjects[0]
        : existingSR?.subjects;
      const templateSection = templateSectionMap[subjectRow?.slug];

      const coefficient =
        templateSection?.coefficient ?? subjectRow?.coefficient ?? 1.0;
      const wrong_penalty = subjectRow?.wrong_penalty ?? template_wrong_penalty;

      const correct = s.correct || 0;
      const incorrect = s.incorrect || 0;
      const empty = Math.max(0, s.questions - correct - incorrect);
      const net = Math.round((correct - incorrect * wrong_penalty) * 100) / 100;
      const score = Math.round(net * coefficient * 100) / 100;

      total_correct += correct;
      total_incorrect += incorrect;
      total_empty += empty;
      total_net += net;
      total_score_raw += score;

      return { id: s.subject_id, correct, incorrect, empty, net, score };
    });

    // Teorik max: tüm sorular doğru yapılsaydı alınacak puan
    const theoreticalMax =
      base_score +
      sections.reduce((sum: number, s: any) => {
        const existingSR = subjectResultMap[s.subject_id];
        const subjectRow = Array.isArray(existingSR?.subjects)
          ? existingSR.subjects[0]
          : existingSR?.subjects;
        const templateSection = templateSectionMap[subjectRow?.slug];
        const coefficient =
          templateSection?.coefficient ?? subjectRow?.coefficient ?? 1.0;
        return sum + (s.questions || 0) * coefficient;
      }, 0);

    const ham_puan = base_score + total_score_raw;
    const total_score =
      Math.round((ham_puan / theoreticalMax) * max_score * 100) / 100;

    const { error: resultError } = await adminSupabase
      .from("exam_results")
      .update({
        total_correct,
        total_incorrect,
        total_empty,
        total_net: Math.round(total_net * 100) / 100,
        total_score,
      })
      .eq("id", result_id);
    if (resultError) throw resultError;

    for (const u of updates) {
      const { error } = await adminSupabase
        .from("subject_results")
        .update({
          correct: u.correct,
          incorrect: u.incorrect,
          empty: u.empty,
          net: u.net,
          score: u.score,
        })
        .eq("id", u.id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
