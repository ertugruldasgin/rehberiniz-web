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

    if (!member || (member.role !== "teacher" && member.role !== "admin")) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }

    const { result_id, sections } = await req.json();

    if (!result_id || !sections?.length) {
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik." },
        { status: 400 },
      );
    }

    const { data: examResult } = await adminSupabase
      .from("exam_results")
      .select("id, students!inner(organization_id)")
      .eq("id", result_id)
      .single();

    const student = Array.isArray(examResult?.students)
      ? examResult.students[0]
      : examResult?.students;

    if (!examResult || student?.organization_id !== member.organization_id) {
      return NextResponse.json({ error: "Geçersiz sonuç." }, { status: 400 });
    }

    // Toplam hesapla
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

    const { error: resultError } = await adminSupabase
      .from("exam_results")
      .update({ total_correct, total_incorrect, total_empty, total_net })
      .eq("id", result_id);
    if (resultError) throw resultError;

    for (const s of sections) {
      const { error } = await adminSupabase
        .from("subject_results")
        .update({
          correct: s.correct || 0,
          incorrect: s.incorrect || 0,
          empty: s.empty || 0,
          net: s.net || 0,
        })
        .eq("id", s.subject_id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
