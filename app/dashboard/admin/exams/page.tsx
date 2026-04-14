"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ExamsList } from "@/components/exams-list";
import { AddExamDialog } from "@/components/add-exam-dialog";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

export default function ExamsPage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="w-full px-4 md:px-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <PageHeader
          title="Sınavlar"
          description="Kurumsal sınavları görüntüleyin ve yönetin."
        />
        <Button
          onClick={() => setAddOpen(true)}
          className="cursor-pointer shrink-0"
        >
          <span className="hidden sm:inline">Sınav Oluştur</span>
          <span className="sm:hidden">
            <PlusIcon className="h-4 w-4" />
          </span>
        </Button>
      </div>

      <ExamsList canDelete />

      <AddExamDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={() => {}}
      />
    </div>
  );
}
