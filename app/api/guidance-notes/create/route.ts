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
      .select("id, organization_id, role")
      .eq("user_id", user.id)
      .single();

    if (!member || member.role !== "teacher") {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }

    const { student_id, category, content, meeting_date, is_private } =
      await req.json();

    if (!student_id || !category?.trim() || !content?.trim() || !meeting_date) {
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik." },
        { status: 400 },
      );
    }

    const { data: student } = await adminSupabase
      .from("students")
      .select("id, organization_id")
      .eq("id", student_id)
      .single();

    if (!student || student.organization_id !== member.organization_id) {
      return NextResponse.json({ error: "Geçersiz öğrenci." }, { status: 400 });
    }

    const { error } = await adminSupabase.from("guidance_notes").insert({
      student_id,
      teacher_id: user.id,
      organization_id: member.organization_id,
      category: category.trim(),
      content: content.trim(),
      meeting_date,
      is_private: is_private ?? true,
    });
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
