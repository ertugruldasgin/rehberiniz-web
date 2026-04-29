import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/page-header";
import React from "react";

const Reports = () => {
  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <PageHeader
        title="Raporlar"
        description="Öğrencilerinizin raporlarını oluşturun."
      />
      <ComingSoon />
    </div>
  );
};

export default Reports;
