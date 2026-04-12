import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { PageHeader } from "@/components/page-header";

export default function StudentDashboard() {
  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <PageHeader
        title="Panom"
        description="Öğrencilerinizin sınav sonuçlarını genel olarak görüntüleyin."
      />

      <ChartAreaInteractive />
    </div>
  );
}
