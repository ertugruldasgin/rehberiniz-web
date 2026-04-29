import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const SUPER_ADMIN_TOKEN = process.env.SUPER_ADMIN_TOKEN!;

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("x-super-admin-token");
    if (token !== SUPER_ADMIN_TOKEN) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    const { orgName, orgSlug, adminFullName, adminEmail, adminPassword } =
      await req.json();

    if (
      !orgName ||
      !orgSlug ||
      !adminFullName ||
      !adminEmail ||
      !adminPassword
    ) {
      return NextResponse.json(
        { error: "Tüm alanlar zorunludur." },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // 1. Kullanıcı oluştur
    const { data: userData, error: userError } =
      await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { full_name: adminFullName },
      });

    if (userError || !userData.user) {
      console.error("Kullanıcı oluşturma hatası:", userError);
      return NextResponse.json(
        { error: userError?.message ?? "Kullanıcı oluşturulamadı." },
        { status: 500 },
      );
    }

    const userId = userData.user.id;

    // 2. Profile güncelle
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: adminFullName, role: "admin" })
      .eq("id", userId);

    if (profileError) {
      console.error("Profil güncelleme hatası:", profileError);
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 },
      );
    }

    // 3. Organizasyon oluştur
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({ name: orgName, slug: orgSlug })
      .select()
      .single();

    if (orgError || !org) {
      console.error("Organizasyon oluşturma hatası:", orgError);
      return NextResponse.json(
        { error: orgError?.message ?? "Kurum oluşturulamadı." },
        { status: 500 },
      );
    }

    // 4. Organization member oluştur
    const { error: memberError } = await supabase
      .from("organization_members")
      .insert({ organization_id: org.id, user_id: userId, role: "admin" });

    if (memberError) {
      console.error("Üye oluşturma hatası:", memberError);
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      org: { id: org.id, name: org.name, slug: org.slug },
      admin: { id: userId, email: adminEmail },
    });
  } catch (err) {
    console.error("Super admin genel hata:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Beklenmedik bir hata oluştu.",
      },
      { status: 500 },
    );
  }
}
