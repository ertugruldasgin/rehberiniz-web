import { PageHeader } from "@/components/page-header";
import React from "react";

const Analytics = () => {
  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <PageHeader
        title="Konu Analizi"
        description="Öğrencilerinizin sınav sonuçlarını analiz edin."
      />
    </div>
  );
};

export default Analytics;
