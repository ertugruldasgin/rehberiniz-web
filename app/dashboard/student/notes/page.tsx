import { PageHeader } from "@/components/page-header";
import React from "react";

const Notes = () => {
  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <PageHeader title="Notlarım" description="Notlarınızı görüntüleyin." />
    </div>
  );
};

export default Notes;
