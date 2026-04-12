import { PageHeader } from "@/components/page-header";
import React from "react";

const ExamHistory = () => {
  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <PageHeader
        title="Sınav Geçmişi"
        description="Öğrencilerinizin sınav geçmişini görüntüleyin."
      />
    </div>
  );
};

export default ExamHistory;
