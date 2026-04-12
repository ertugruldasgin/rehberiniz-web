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
      teacher_member_id,
    } = body;

    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik." },
        { status: 400 },
      );
    }

    // Admin ise teacher_member_id zorunlu
    if (member.role === "admin" && !teacher_member_id) {
      return NextResponse.json(
        { error: "Öğretmen seçimi zorunludur." },
        { status: 400 },
      );
    }

    // teacher_id: admin ise seçilen öğretmen, teacher ise kendisi
    const teacherId = member.role === "admin" ? teacher_member_id : member.id;

    // Seçilen öğretmen bu organizasyona ait mi kontrol et
    if (member.role === "admin") {
      const { data: teacherMember } = await adminSupabase
        .from("organization_members")
        .select("id, organization_id")
        .eq("id", teacher_member_id)
        .single();

      if (
        !teacherMember ||
        teacherMember.organization_id !== member.organization_id
      ) {
        return NextResponse.json(
          { error: "Geçersiz öğretmen seçimi." },
          { status: 400 },
        );
      }
    }

    // 1. Auth'da kullanıcı oluştur
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
        user_id: newUser.user.id,
        organization_id: member.organization_id,
        teacher_id: teacherId,
      });
    if (studentError) throw studentError;

    // 4. Profiles'a title ekle
    const { error: titleError } = await adminSupabase
      .from("profiles")
      .update({ title: "Öğrenci" })
      .eq("id", newUser.user.id);
    if (titleError) throw titleError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
