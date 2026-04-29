import { LockIcon } from "lucide-react";

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export function ComingSoon({
  title = "Çok Yakında!",
  description = "Bu sayfa henüz hazır değil. Çok yakında burada olacak.",
}: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-24 gap-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
        <LockIcon className="h-7 w-7 text-muted-foreground/50" />
      </div>
      <div className="space-y-1.5">
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      </div>
    </div>
  );
}
