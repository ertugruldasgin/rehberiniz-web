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

    const { student_id } = await req.json();
    if (!student_id)
      return NextResponse.json({ error: "Öğrenci ID eksik." }, { status: 400 });

    // Öğrencinin user_id'sini al
    const { data: studentData } = await adminSupabase
      .from("students")
      .select("user_id")
      .eq("id", student_id)
      .single();

    if (!studentData)
      return NextResponse.json(
        { error: "Öğrenci bulunamadı." },
        { status: 404 },
      );

    const studentUserId = studentData.user_id;

    // 1. students tablosundan sil
    const { error: studentError } = await adminSupabase
      .from("students")
      .delete()
      .eq("id", student_id);
    if (studentError) throw studentError;

    // 2. organization_members tablosundan sil
    const { error: memberError } = await adminSupabase
      .from("organization_members")
      .delete()
      .eq("user_id", studentUserId);
    if (memberError) throw memberError;

    // 3. Auth'dan sil (profiles trigger ile otomatik silinir)
    const { error: authError } =
      await adminSupabase.auth.admin.deleteUser(studentUserId);
    if (authError) throw authError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
