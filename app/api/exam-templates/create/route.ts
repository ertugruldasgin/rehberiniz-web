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

    const { name, category, sections } = await req.json();

    if (!name?.trim() || !category?.trim() || !sections?.length) {
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik." },
        { status: 400 },
      );
    }

    for (const s of sections) {
      if (
        !s.key?.trim() ||
        !s.label?.trim() ||
        !s.questions ||
        s.questions < 1
      ) {
        return NextResponse.json(
          { error: "Geçersiz bölüm bilgisi." },
          { status: 400 },
        );
      }
    }

    const { error } = await adminSupabase.from("exam_templates").insert({
      organization_id: member.organization_id,
      name: name.trim(),
      category: category.trim(),
      sections,
    });
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
