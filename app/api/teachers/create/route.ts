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

    const { full_name, email, password, title } = await req.json();

    if (!full_name || !email || !password) {
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik." },
        { status: 400 },
      );
    }

    // 1. Auth'da kullanıcı oluştur
    const { data: newUser, error: authError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          role: "teacher",
        },
      });
    if (authError)
      return NextResponse.json({ error: authError.message }, { status: 400 });

    // 2. Profiles'a title ve role ekle
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .update({
        title: title || null,
        role: "teacher",
      })
      .eq("id", newUser.user.id);
    if (profileError) throw profileError;

    // 3. Organization member ekle
    const { error: memberError } = await adminSupabase
      .from("organization_members")
      .insert({
        organization_id: member.organization_id,
        user_id: newUser.user.id,
        role: "teacher",
      });
    if (memberError) throw memberError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
