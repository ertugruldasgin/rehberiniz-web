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

    if (!member || !["admin", "teacher"].includes(member.role)) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }

    const body = await req.json();
    const {
      first_name,
      last_name,
      email,
      password,
      student_number,
      grade,
      branch,
    } = body;

    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik." },
        { status: 400 },
      );
    }

    // 1. Auth'da kullanıcı oluştur
    // Trigger handle_new_user otomatik profiles'a ekleyecek
    const { data: newUser, error: authError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: `${first_name} ${last_name}`,
          role: "student",
        },
      });
    if (authError)
      return NextResponse.json({ error: authError.message }, { status: 400 });

    // 2. Organization member ekle
    const { error: memberError } = await adminSupabase
      .from("organization_members")
      .insert({
        organization_id: member.organization_id,
        user_id: newUser.user.id,
        role: "student",
      });
    if (memberError) throw memberError;

    // 3. Students tablosuna ekle
    const { error: studentError } = await adminSupabase
      .from("students")
      .insert({
        first_name,
        last_name,
        student_number: student_number || null,
        grade: grade || null,
        branch: branch || null,
        organization_id: member.organization_id,
        user_id: newUser.user.id,
        teacher_id: member.id,
      });
    if (studentError) throw studentError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
