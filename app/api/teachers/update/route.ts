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

    const { teacher_member_id, full_name, title } = await req.json();

    if (!teacher_member_id || !full_name?.trim()) {
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik." },
        { status: 400 },
      );
    }

    // Öğretmenin aynı organizasyonda olduğunu doğrula
    const { data: teacherMember } = await adminSupabase
      .from("organization_members")
      .select("user_id, organization_id")
      .eq("id", teacher_member_id)
      .single();

    if (
      !teacherMember ||
      teacherMember.organization_id !== member.organization_id
    ) {
      return NextResponse.json(
        { error: "Geçersiz öğretmen." },
        { status: 400 },
      );
    }

    const { error: profileError } = await adminSupabase
      .from("profiles")
      .update({
        full_name: full_name.trim(),
        title: title?.trim() || null,
      })
      .eq("id", teacherMember.user_id);
    if (profileError) throw profileError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
