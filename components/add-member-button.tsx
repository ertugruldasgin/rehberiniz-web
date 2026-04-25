import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function AddMemberButton({
  title,
  sub,
  icon: Icon,
  bgIcon: BgIcon,
  variant = "default",
  onClick,
  className,
}: {
  title: string;
  sub: string;
  icon: LucideIcon;
  bgIcon: LucideIcon;
  variant?: "default" | "success" | "danger" | "warning" | "primary";
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "relative rounded-2xl px-4 py-3 flex flex-col overflow-hidden min-h-[160px]",
        "border-2 border-dashed border-border bg-card",
        "hover:border-primary/40 hover:bg-primary/5 hover:shadow-md",
        "transition-all duration-200 cursor-pointer group",
        className,
      )}
    >
      <BgIcon
        className="absolute -bottom-4 right-0 h-28 w-28 text-muted-foreground/10 group-hover:text-primary/10 transition-colors"
        strokeWidth={1}
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-left text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
        <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-muted group-hover:bg-primary/10 transition-colors">
          <PlusIcon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
      <p className="font-bold text-foreground leading-none text-3xl md:text-4xl text-left flex-1 flex items-center relative z-10 group-hover:text-primary transition-colors">
        {sub}
      </p>
      <p className="text-xs text-left text-muted-foreground min-h-4">
        {title} hesabı oluştur
      </p>
    </button>
  );
}
