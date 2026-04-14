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

    const { template_id } = await req.json();
    if (!template_id) {
      return NextResponse.json(
        { error: "Şablon ID gerekli." },
        { status: 400 },
      );
    }

    const { data: template } = await adminSupabase
      .from("exam_templates")
      .select("organization_id")
      .eq("id", template_id)
      .single();

    if (!template || template.organization_id !== member.organization_id) {
      return NextResponse.json({ error: "Geçersiz şablon." }, { status: 400 });
    }

    const { count } = await adminSupabase
      .from("exams")
      .select("*", { count: "exact", head: true })
      .eq("exam_template_id", template_id);

    if (count && count > 0) {
      return NextResponse.json(
        {
          error: `Bu şablon ${count} sınavda kullanılıyor. Şablonu silmek için önce ilgili sınavları silin.`,
        },
        { status: 409 },
      );
    }

    const { error } = await adminSupabase
      .from("exam_templates")
      .delete()
      .eq("id", template_id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
