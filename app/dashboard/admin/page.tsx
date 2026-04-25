"use client";

import { PageHeader } from "@/components/page-header";
import { StatCard, type StatCardProps } from "@/components/stat-card";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { AddStudentSheet } from "@/components/add-student-sheet";
import { AddTeacherDialog } from "@/components/add-teacher-sheet";
import {
  UsersIcon,
  TrendingUpIcon,
  TrophyIcon,
  SigmaIcon,
  UserRoundIcon,
  GraduationCapIcon,
  BuildingIcon,
  ClipboardListIcon,
} from "lucide-react";
import { useState } from "react";
import { AddMemberButton } from "@/components/add-member-button";
import { CategoryTrendCharts } from "@/components/category-trend-charts";

const CATEGORY_LABELS: Record<string, string> = {
  TYT: "TYT",
  "AYT-SAY": "AYT Sayısal",
  "AYT-EA": "AYT EA",
  "AYT-SÖZ": "AYT Sözel",
  LGS: "LGS",
  YDT: "YDT",
};

export default function AdminDashboard() {
  const { stats, loading } = useDashboardStats();
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);

  const statCards = (
    <div className="space-y-5">
      {/* Kurum Özeti */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Kurum Özeti
        </p>
        <div className="grid grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-3">
          <StatCard
            title="Toplam Öğrenci"
            value={loading ? "..." : (stats?.totalStudents ?? 0)}
            sub={loading ? "" : `${stats?.inactiveStudents ?? 0} pasif hesap`}
            icon={UsersIcon}
            bgIcon={UsersIcon}
            variant="default"
          />
          <StatCard
            title="Toplam Öğretmen"
            value={loading ? "..." : (stats?.totalTeachers ?? 0)}
            sub={
              loading
                ? ""
                : `${stats?.studentsPerTeacher ?? 0} öğrenci / öğretmen`
            }
            icon={UserRoundIcon}
            bgIcon={UserRoundIcon}
            variant="default"
          />
          <StatCard
            title="Son 1 Ay Kurum Sınavı"
            value={loading ? "..." : (stats?.recentOfficialCount ?? 0)}
            sub="yapılan kurum sınavı"
            icon={BuildingIcon}
            bgIcon={BuildingIcon}
            variant="default"
          />
          <StatCard
            title="Son 1 Ay Deneme"
            value={loading ? "..." : (stats?.totalExamCount ?? 0)}
            sub="girilen toplam sonuç"
            icon={ClipboardListIcon}
            bgIcon={ClipboardListIcon}
            variant="default"
          />
        </div>
      </div>

      {/* Performans */}
      {!loading &&
        stats?.monthlyCategoryAverages &&
        Object.keys(stats.monthlyCategoryAverages).length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Son 1 Ay Performans
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-3">
              {Object.entries(stats.monthlyCategoryAverages).map(
                ([cat, avg]) => {
                  const overall = stats.categoryAverages[cat];
                  const change =
                    overall > 0
                      ? Math.round(((avg - overall) / overall) * 100 * 10) / 10
                      : 0;
                  return (
                    <StatCard
                      key={`monthly-${cat}`}
                      title={`${CATEGORY_LABELS[cat] ?? cat} Ort. Net`}
                      value={avg}
                      sub={
                        change !== 0
                          ? `${change > 0 ? "+" : ""}%${change} genel ortalamaya göre`
                          : `Genel ort: ${overall}`
                      }
                      icon={SigmaIcon}
                      bgIcon={SigmaIcon}
                      variant={change >= 0 ? "success" : "danger"}
                    />
                  );
                },
              )}
            </div>
          </div>
        )}

      {/* Öne Çıkanlar */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Öne Çıkanlar
        </p>
        <div className="grid grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-3">
          <StatCard
            title="En Başarılı"
            value={loading ? "..." : (stats?.topStudent?.name ?? "—")}
            sub={
              loading
                ? ""
                : stats?.topStudent
                  ? `${stats.topStudent.net} net`
                  : "Henüz sonuç yok"
            }
            icon={TrophyIcon}
            bgIcon={TrophyIcon}
            variant="warning"
          />
          <StatCard
            title="En Çok Gelişen"
            value={loading ? "..." : (stats?.mostImproved?.name ?? "—")}
            sub={
              loading
                ? ""
                : stats?.mostImproved
                  ? `+${stats.mostImproved.diff} net gelişim`
                  : "Henüz yeterli veri yok"
            }
            icon={TrendingUpIcon}
            bgIcon={TrendingUpIcon}
            variant="success"
          />
          <AddMemberButton
            title="Öğrenci Ekle"
            sub="Yeni Öğrenci"
            icon={GraduationCapIcon}
            bgIcon={GraduationCapIcon}
            variant="default"
            onClick={() => setAddStudentOpen(true)}
          />
          <AddMemberButton
            title="Öğretmen Ekle"
            sub="Yeni Öğretmen"
            icon={UserRoundIcon}
            bgIcon={UserRoundIcon}
            variant="default"
            onClick={() => setAddTeacherOpen(true)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <PageHeader
        title="Genel Bakış"
        description="Kurumunuzun genel durumunu görüntüleyin."
      />

      {/* xl+ — yan yana */}
      <div className="hidden xl:grid xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2">{statCards}</div>
        <div className="xl:col-span-3">
          <CategoryTrendCharts
            categoryTrends={stats?.categoryTrends ?? {}}
            loading={loading}
          />
        </div>
      </div>

      {/* xl altı — alt alta */}
      <div className="xl:hidden space-y-6">
        {statCards}
        <CategoryTrendCharts
          categoryTrends={stats?.categoryTrends ?? {}}
          loading={loading}
        />
      </div>

      <AddStudentSheet
        open={addStudentOpen}
        onOpenChange={setAddStudentOpen}
        onSuccess={() => {}}
      />
      <AddTeacherDialog
        open={addTeacherOpen}
        onOpenChange={setAddTeacherOpen}
        onSuccess={() => {}}
      />
    </div>
  );
}
