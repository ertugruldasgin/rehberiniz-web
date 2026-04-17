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

    const { note_id, category, content, meeting_date, is_private } =
      await req.json();

    if (!note_id || !category?.trim() || !content?.trim() || !meeting_date) {
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik." },
        { status: 400 },
      );
    }

    const { data: note } = await adminSupabase
      .from("guidance_notes")
      .select("teacher_id")
      .eq("id", note_id)
      .single();

    if (!note || note.teacher_id !== user.id) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }

    const { error } = await adminSupabase
      .from("guidance_notes")
      .update({
        category: category.trim(),
        content: content.trim(),
        meeting_date,
        is_private: is_private ?? true,
      })
      .eq("id", note_id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
