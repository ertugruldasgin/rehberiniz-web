"use client";

import { PageHeader } from "@/components/page-header";
import { ExamsList } from "@/components/exams-list";

export default function ExamHistoryPage() {
  return (
    <div className="w-full px-4 md:px-6 space-y-6">
      <PageHeader
        title="Sınav Geçmişi"
        description="Öğrencilerinize atanan kurumsal sınavları görüntüleyin."
      />
      <ExamsList canDelete={false} />
    </div>
  );
}
