import { PageHeader } from "@/components/page-header";
import React from "react";

const ExamEntry = () => {
  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <PageHeader
        title="Sonuç Girişi"
        description="Öğrencilerinizin sınav sonuçlarını girin."
      />
    </div>
  );
};

export default ExamEntry;
