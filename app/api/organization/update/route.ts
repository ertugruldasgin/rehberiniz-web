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

    const { name, is_active, phone, email, website, address } =
      await req.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Kurum adı zorunludur." },
        { status: 400 },
      );
    }

    const { error } = await adminSupabase
      .from("organizations")
      .update({
        name: name.trim(),
        is_active,
        phone: phone || null,
        email: email || null,
        website: website || null,
        address: address || null,
      })
      .eq("id", member.organization_id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
