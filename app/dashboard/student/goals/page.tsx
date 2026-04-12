import { PageHeader } from "@/components/page-header";
import React from "react";

const Goals = () => {
  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <PageHeader
        title="Hedeflerim"
        description="Hedeflerinizi görüntüleyin."
      />
    </div>
  );
};

export default Goals;
