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

      if (!member || (member.role !== "teacher" && member.role !== "admin")) {
        return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
      }

      const { data } = await adminSupabase
        .from("students")
        .select("id, organization_id")
        .eq("id", student_id)
        .single();

      if (!data || data.organization_id !== member.organization_id) {
        return NextResponse.json(
          { error: "Geçersiz öğrenci." },
          { status: 400 },
        );
      }

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

    if (exam_id) {
      finalExamId = exam_id;
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

    const total_correct = sections.reduce(
      (s: number, r: any) => s + (r.correct || 0),
      0,
    );
    const total_incorrect = sections.reduce(
      (s: number, r: any) => s + (r.incorrect || 0),
      0,
    );
    const total_empty = sections.reduce(
      (s: number, r: any) => s + (r.empty || 0),
      0,
    );
    const total_net = sections.reduce(
      (s: number, r: any) => s + (r.net || 0),
      0,
    );

    const { data: examResult, error: resultError } = await adminSupabase
      .from("exam_results")
      .insert({
        student_id: student.id,
        exam_id: finalExamId,
        total_correct,
        total_incorrect,
        total_empty,
        total_net,
      })
      .select("id")
      .single();
    if (resultError) throw resultError;

    // subjects tablosundan slug -> id eşlemesi (genel/branş için)
    const slugs = sections.map((s: any) => s.key).filter(Boolean);
    const { data: subjectRows } =
      slugs.length > 0
        ? await adminSupabase
            .from("subjects")
            .select("id, slug")
            .in("slug", slugs)
        : { data: [] };

    const subjectMap = Object.fromEntries(
      (subjectRows ?? []).map((s) => [s.slug, s.id]),
    );

    const subjectResults = sections.map((s: any) => ({
      exam_result_id: examResult.id,
      subject_id: subjectMap[s.key] ?? null,
      section_label: s.label,
      is_standalone: !exam_id && !!subject_id,
      correct: s.correct || 0,
      incorrect: s.incorrect || 0,
      empty: s.empty || 0,
      net: s.net || 0,
    }));

    if (subjectResults.length > 0) {
      const { error: subjectError } = await adminSupabase
        .from("subject_results")
        .insert(subjectResults);
      if (subjectError) throw subjectError;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
