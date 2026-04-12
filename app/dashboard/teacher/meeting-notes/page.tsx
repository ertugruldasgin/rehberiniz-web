import { PageHeader } from "@/components/page-header";
import React from "react";

const MeetingNotes = () => {
  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <PageHeader
        title="Görüşme Notları"
        description="Öğrencilerinizle yaptığınız görüşme notlarını görüntüleyin."
      />
    </div>
  );
};

export default MeetingNotes;
