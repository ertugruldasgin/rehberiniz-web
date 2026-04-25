import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  bgIcon?: LucideIcon;
  variant?: "default" | "success" | "danger" | "warning" | "primary";
  className?: string;
  href?: string;
}

const variantStyles = {
  default: {
    card: "bg-card",
    icon: "text-muted-foreground/20",
    iconFg: "text-muted-foreground",
    iconBg: "bg-muted",
  },
  success: {
    card: "bg-green-50",
    icon: "text-green-500/20",
    iconFg: "text-green-600 dark:text-green-400",
    iconBg: "bg-green-100 dark:bg-green-900/40",
  },
  danger: {
    card: "bg-red-50",
    icon: "text-red-500/20",
    iconFg: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-100 dark:bg-red-900/40",
  },
  warning: {
    card: "bg-amber-50",
    icon: "text-amber-500/20",
    iconFg: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
  },
  primary: {
    card: "bg-primary/5",
    icon: "text-primary/15",
    iconFg: "text-primary",
    iconBg: "bg-primary/10",
  },
};

export function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  bgIcon: BgIcon,
  variant = "default",
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "relative rounded-2xl px-4 py-3 flex flex-col overflow-hidden min-h-[160px]",
        "transition-all duration-200 hover:shadow-md cursor-default",
        styles.card,
        className,
      )}
    >
      {BgIcon && (
        <BgIcon
          className={cn("absolute -bottom-4 right-0 h-28 w-28", styles.icon)}
          strokeWidth={1}
        />
      )}

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
        {Icon && (
          <div
            className={cn(
              "h-7 w-7 rounded-lg flex items-center justify-center shrink-0",
              styles.iconBg,
            )}
          >
            <Icon className={cn("h-3.5 w-3.5", styles.iconFg)} />
          </div>
        )}
      </div>

      <p
        className={cn(
          "font-bold text-foreground leading-none tabular-nums relative z-10 flex-1 flex items-center py-2",
          typeof value === "number"
            ? "text-4xl md:text-5xl"
            : "text-3xl md:text-4xl",
        )}
      >
        {value}
      </p>

      {/* Alt bilgi */}
      <p className="text-xs text-muted-foreground relative z-10 min-h-4">
        {sub ?? ""}
      </p>
    </div>
  );
}
