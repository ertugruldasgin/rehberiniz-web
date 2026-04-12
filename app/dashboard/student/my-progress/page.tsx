import { PageHeader } from "@/components/page-header";
import React from "react";

const MyProgress = () => {
  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <PageHeader
        title="Gelişim Grafiğim"
        description="Zaman içerisindeki gelişiminizi görüntüleyin."
      />
    </div>
  );
};

export default MyProgress;
