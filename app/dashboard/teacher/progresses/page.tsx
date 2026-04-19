import { PageHeader } from "@/components/page-header";
import React from "react";

const Progresses = () => {
  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <PageHeader
        title="Gelişim Grafikleri"
        description="Öğrencilerinizin gelişim grafiklerini görüntüleyin."
      />
    </div>
  );
};

export default Progresses;
