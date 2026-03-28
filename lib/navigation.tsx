import {
  LayoutDashboardIcon,
  UsersIcon,
  ChartBarIcon,
  FileChartColumnIcon,
  Settings2Icon,
  ClipboardListIcon,
  TargetIcon,
  GraduationCapIcon,
  FileTextIcon,
} from "lucide-react";

type UserRole = "admin" | "teacher" | "student";

export function getNavItems(role: UserRole) {
  const navMain = {
    admin: [
      {
        group: "Genel",
        items: [
          {
            title: "Genel Bakış",
            url: "/dashboard/admin",
            icon: <LayoutDashboardIcon />,
          },
        ],
      },
      {
        group: "Yönetim",
        items: [
          {
            title: "Öğretmenler",
            url: "/dashboard/admin/teachers",
            icon: <UsersIcon />,
          },
          {
            title: "Öğrenciler",
            url: "/dashboard/admin/students",
            icon: <GraduationCapIcon />,
          },
          {
            title: "Sınavlar",
            url: "/dashboard/admin/exams",
            icon: <ClipboardListIcon />,
          },
          {
            title: "Sınav Şablonları",
            url: "/dashboard/admin/exam-templates",
            icon: <FileTextIcon />,
          },
        ],
      },
      {
        group: "Kurum",
        items: [
          {
            title: "Raporlar",
            url: "/dashboard/admin/reports",
            icon: <FileChartColumnIcon />,
          },
          {
            title: "Ayarlar",
            url: "/dashboard/admin/settings",
            icon: <Settings2Icon />,
          },
        ],
      },
    ],
    teacher: [
      {
        group: "Genel",
        items: [
          {
            title: "Panom",
            url: "/dashboard/teacher",
            icon: <LayoutDashboardIcon />,
          },
        ],
      },
      {
        group: "Öğrenciler",
        items: [
          {
            title: "Öğrencilerim",
            url: "/dashboard/teacher/students",
            icon: <UsersIcon />,
          },
          {
            title: "Konu Analizi",
            url: "/dashboard/teacher/analytics",
            icon: <ClipboardListIcon />,
          },
        ],
      },
      {
        group: "Sınavlar",
        items: [
          {
            title: "Sonuç Girişi",
            url: "/dashboard/teacher/exam-entry",
            icon: <UsersIcon />,
          },
          {
            title: "Sınav Geçmişi",
            url: "/dashboard/teacher/exam-history",
            icon: <ClipboardListIcon />,
          },
        ],
      },
      {
        group: "Rehberlik",
        items: [
          {
            title: "Görüşme Notları",
            url: "/dashboard/teacher/meeting-notes",
            icon: <FileChartColumnIcon />,
          },
          {
            title: "Raporlar",
            url: "/dashboard/teacher/reports",
            icon: <FileChartColumnIcon />,
          },
        ],
      },
    ],
    student: [
      {
        group: "Genel",
        items: [
          {
            title: "Özet",
            url: "/dashboard/student",
            icon: <LayoutDashboardIcon />,
          },
        ],
      },
      {
        group: "Performans",
        items: [
          {
            title: "Sınav Sonuçlarım",
            url: "/dashboard/student/exam-results",
            icon: <ClipboardListIcon />,
          },
          {
            title: "Gelişim Grafiğim",
            url: "/dashboard/student/my-progress",
            icon: <ChartBarIcon />,
          },
        ],
      },
      {
        group: "Rehberlik",
        items: [
          {
            title: "Notlarım",
            url: "/dashboard/student/notes",
            icon: <LayoutDashboardIcon />,
          },
          {
            title: "Hedeflerim",
            url: "/dashboard/student/goals",
            icon: <TargetIcon />,
          },
        ],
      },
    ],
  };

  return { navMain: navMain[role] };
}
