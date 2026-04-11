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
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (!member || !["admin", "teacher"].includes(member.role))
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });

    const body = await req.json();
    const { student_id, first_name, last_name, student_number, grade, branch } =
      body;

    if (!student_id || !first_name || !last_name)
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik." },
        { status: 400 },
      );

    const { error: studentError } = await adminSupabase
      .from("students")
      .update({
        first_name,
        last_name,
        student_number: student_number || null,
        grade: grade || null,
        branch: branch || null,
      })
      .eq("id", student_id);

    if (studentError) throw studentError;

    // profiles tablosundaki full_name'i de güncelle
    const { data: studentData } = await adminSupabase
      .from("students")
      .select("user_id")
      .eq("id", student_id)
      .single();

    if (studentData?.user_id) {
      await adminSupabase
        .from("profiles")
        .update({ full_name: `${first_name} ${last_name}` })
        .eq("id", studentData.user_id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
