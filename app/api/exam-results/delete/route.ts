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

    const { result_id } = await req.json();
    if (!result_id)
      return NextResponse.json({ error: "Sonuç ID gerekli." }, { status: 400 });

    const { data: result } = await adminSupabase
      .from("exam_results")
      .select("id, students!inner(organization_id)")
      .eq("id", result_id)
      .single();

    const student = Array.isArray(result?.students)
      ? result.students[0]
      : result?.students;
    if (!result || student?.organization_id !== member.organization_id) {
      return NextResponse.json({ error: "Geçersiz sonuç." }, { status: 400 });
    }

    const { error } = await adminSupabase
      .from("exam_results")
      .delete()
      .eq("id", result_id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
