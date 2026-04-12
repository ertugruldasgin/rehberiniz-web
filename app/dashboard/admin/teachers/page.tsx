import { PageHeader } from "@/components/page-header";
import React from "react";

const Teachers = () => {
  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <PageHeader
        title="Öğretmenler"
        description="Öğretmenlerinizi görüntüleyin."
      />
    </div>
  );
};

export default Teachers;
