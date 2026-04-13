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

    if (!member || member.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }

    const { title, date, template_id, subject_id, student_ids } =
      await req.json();

    if (!title?.trim() || !date || !student_ids?.length) {
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik." },
        { status: 400 },
      );
    }

    if (!template_id && !subject_id) {
      return NextResponse.json(
        { error: "Şablon veya ders seçilmeli." },
        { status: 400 },
      );
    }

    // 1. Sınav oluştur
    const { data: exam, error: examError } = await adminSupabase
      .from("exams")
      .insert({
        organization_id: member.organization_id,
        title: title.trim(),
        date,
        exam_template_id: template_id || null,
        subject_id: subject_id || null,
        is_official: true,
      })
      .select("id")
      .single();
    if (examError) throw examError;

    // 2. Atamalar oluştur
    const assignments = student_ids.map((student_id: string) => ({
      exam_id: exam.id,
      student_id,
    }));

    const { error: assignError } = await adminSupabase
      .from("exam_assignments")
      .insert(assignments);
    if (assignError) throw assignError;

    return NextResponse.json({ success: true, exam_id: exam.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
