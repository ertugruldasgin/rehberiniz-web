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
import { useUserRole } from "@/hooks/use-user-tole";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { userData, loading } = useUserRole();
  const [date, setDate] = React.useState<Date | undefined>(new Date());

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
        <div className="px-2 pb-2">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="w-full bg-sidebar rounded-lg border border-sidebar-border"
          />
        </div>
        <NavUser
          user={{
            name: userData.full_name,
            email: userData.email,
            avatar: userData.avatar_url ?? "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
