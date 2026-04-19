import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { SUBJECT_GROUPS, SLUG_TO_GROUP } from "@/lib/exam-type-map";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

    const { student_id, exam_type, goals } = await req.json();
    // goals: { subject_id: string, subject_slug: string, target_net: number }[]

    if (!student_id || !exam_type || !goals?.length)
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik." },
        { status: 400 },
      );

    // Üst grup subject'lerin id'lerini çek
    const parentSlugs = [
      ...new Set(
        goals.map((g: any) => SLUG_TO_GROUP[g.subject_slug]).filter(Boolean),
      ),
    ];

    let parentSubjects: { id: string; slug: string }[] = [];
    if (parentSlugs.length > 0) {
      const { data } = await adminSupabase
        .from("subjects")
        .select("id, slug")
        .in("slug", parentSlugs);
      parentSubjects = data ?? [];
    }

    // Üst grup net toplamlarını hesapla
    const parentGoals: {
      subject_id: string;
      subject_slug: string;
      target_net: number;
    }[] = [];

    for (const [parentSlug, childSlugs] of Object.entries(SUBJECT_GROUPS)) {
      const parentSubject = parentSubjects.find((s) => s.slug === parentSlug);
      if (!parentSubject) continue;

      // Bu gruba ait olan ve goals içinde olan alt derslerin toplamı
      const groupTotal = goals
        .filter((g: any) => childSlugs.includes(g.subject_slug))
        .reduce((sum: number, g: any) => sum + (g.target_net || 0), 0);

      // Eğer bu gruba ait en az bir alt ders varsa üst grubu da kaydet
      const hasAnyChild = goals.some((g: any) =>
        childSlugs.includes(g.subject_slug),
      );
      if (hasAnyChild) {
        parentGoals.push({
          subject_id: parentSubject.id,
          subject_slug: parentSlug,
          target_net: groupTotal,
        });
      }
    }

    // Mevcut hedefleri sil (alt + üst grup dahil)
    await adminSupabase
      .from("student_goals")
      .delete()
      .eq("student_id", student_id)
      .eq("exam_type", exam_type);

    // Alt dersler + üst grupları birleştir
    const allGoals = [...goals, ...parentGoals];

    const rows = allGoals.map((g: any) => ({
      student_id,
      exam_type,
      subject_id: g.subject_id,
      target_net: g.target_net || 0,
      set_by: user.id,
    }));

    const { error } = await adminSupabase.from("student_goals").insert(rows);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
