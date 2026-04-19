"use client";

import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { Calendar } from "@/components/ui/calendar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { getNavItems } from "@/lib/navigation";
import { useUserRole } from "@/hooks/use-user-role";
import { tr } from "date-fns/locale";

function LiveClock({ timeZone }: { timeZone?: string }) {
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) return null;

  const time = now.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone,
  });

  const date = now.toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone,
  });

  return (
    <div className="px-3 py-3 border border-sidebar-border rounded-lg bg-sidebar text-center space-y-0.5">
      <p className="text-2xl font-bold tabular-nums tracking-tight">{time}</p>
      <p className="text-xs text-muted-foreground capitalize">{date}</p>
    </div>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { userData, loading } = useUserRole();
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [timeZone, setTimeZone] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  if (loading) {
    return (
      <Sidebar {...props}>
        <SidebarHeader>
          <div className="p-4">
            <Skeleton className="h-8 w-32" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  if (!userData) return null;

  const { navMain } = getNavItems(userData.role);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5! bg-sidebar!"
            >
              <a href="/dashboard">
                <span className="text-2xl font-bold">Rehberiniz</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain groups={navMain} />
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 pb-2 space-y-2">
          <LiveClock timeZone={timeZone} />
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            timeZone={timeZone}
            locale={tr}
            className="w-full bg-sidebar rounded-lg border border-sidebar-border [&_button[data-selected-single=true]]:font-bold"
          />
        </div>
        <NavUser
          user={{
            name: userData.full_name,
            email: userData.email,
            avatar_url: userData.avatar_url ?? "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
