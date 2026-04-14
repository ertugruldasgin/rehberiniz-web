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

    const { exam_id } = await req.json();
    if (!exam_id) {
      return NextResponse.json({ error: "Sınav ID gerekli." }, { status: 400 });
    }

    const { data: exam } = await adminSupabase
      .from("exams")
      .select("organization_id")
      .eq("id", exam_id)
      .single();

    if (!exam || exam.organization_id !== member.organization_id) {
      return NextResponse.json({ error: "Geçersiz sınav." }, { status: 400 });
    }

    const { error } = await adminSupabase
      .from("exams")
      .delete()
      .eq("id", exam_id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
