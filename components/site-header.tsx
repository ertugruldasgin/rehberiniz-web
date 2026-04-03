"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserRole } from "@/hooks/use-user-tole";

const pageTitles: Record<string, string> = {
  // Admin
  "/dashboard/admin": "Genel / Genel Bakış",
  "/dashboard/admin/teachers": "Yönetim / Öğretmenler",
  "/dashboard/admin/students": "Yönetim / Öğrenciler",
  "/dashboard/admin/exams": "Yönetim / Sınavlar",
  "/dashboard/admin/exam-templates": "Yönetim / Sınav Şablonları",
  "/dashboard/admin/reports": "Kurum / Raporlar",
  "/dashboard/admin/settings": "Kurum / Ayarlar",

  // Teacher
  "/dashboard/teacher": "Genel / Panom",
  "/dashboard/teacher/students": "Öğrenciler /Öğrencilerim",
  "/dashboard/teacher/analytics": "Öğrenciler / Konu Analizi",
  "/dashboard/teacher/exam-entry": "Sınavlar / Sonuç Girişi",
  "/dashboard/teacher/exam-history": "Sınavlar / Sınav Geçmişi",
  "/dashboard/teacher/meeting-notes": "Rehberlik / Görüşme Notları",
  "/dashboard/teacher/reports": "Rehberlik / Raporlar",

  // Student
  "/dashboard/student": "Genel / Özet",
  "/dashboard/student/exam-results": "Performans / Sınav Sonuçlarım",
  "/dashboard/student/my-progress": "Performans / Gelişim Grafiğim",
  "/dashboard/student/notes": "Rehberlik / Notlarım",
  "/dashboard/student/goals": "Rehberlik / Hedeflerim",

  // Genel
  "/dashboard/profile": "Profil",
};

export function SiteHeader() {
  const pathname = usePathname();
  const { userData } = useUserRole();

  const pageTitle = pageTitles[pathname] ?? "Rehberiniz";

  const initials = userData?.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-muted transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{pageTitle}</h1>

        <div className="ml-auto flex items-center gap-3">
          {userData && (
            <>
              <div className="hidden flex-col text-right sm:flex">
                <span className="text-sm font-medium leading-tight">
                  {userData.full_name}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
