import { PageHeader } from "@/components/page-header";

export default function StudentDashboard() {
  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <PageHeader
        title="Özet"
        description="Sınav sonuçlarınızı genel olarak görüntüleyin."
      />
    </div>
  );
}
