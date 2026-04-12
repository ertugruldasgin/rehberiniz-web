import { PageHeader } from "@/components/page-header";
import React from "react";

const Settings = () => {
  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <PageHeader
        title="Ayarlar"
        description="Kurumunuzun ayarlarını görüntüleyin."
      />
    </div>
  );
};

export default Settings;
