import { PageHeader } from "@/components/page-header";
import React from "react";

const ExamTemplates = () => {
  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <PageHeader
        title="Sınav Şablonları"
        description="Sınav şablonlarınızı görüntüleyin ve oluşturun."
      />
    </div>
  );
};

export default ExamTemplates;
