import { PageHeader } from "@/components/page-header";
import { GuidanceNotesGrid } from "@/components/guidance-notes-grid";

export default function NotesPage() {
  return (
    <div className="flex flex-col px-4 md:px-6 space-y-6">
      <PageHeader
        title="Rehberlik Notlarım"
        description="Öğretmeninizin sizinle paylaştığı rehberlik notları."
      />

      <GuidanceNotesGrid />
    </div>
  );
}
