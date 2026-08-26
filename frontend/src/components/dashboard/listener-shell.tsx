"use client";

import Link from "next/link";
import {
  CalendarRange,
  Inbox,
  LayoutDashboard,
  MessagesSquare,
  UserRoundCheck,
} from "lucide-react";

import { AppShell } from "@/components/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";

/*
 * Only the pages with real data behind them.
 *
 * Appointments, client notes, earnings, ratings & reviews and session history
 * are parked as `page.full.tsx` under app/listener — every one of them rendered
 * `lib/data/demo`, so a listener saw invented clients, invented money and
 * invented five-star reviews from members who don't exist. Restore each link
 * alongside its page when the endpoint behind it exists. See TESTING-SCOPE.md.
 */
const sections = [
  {
    title: "Needs you",
    items: [
      { label: "Overview", href: "/listener", icon: LayoutDashboard, exact: true },
      { label: "Live chats", href: "/listener/chats", icon: MessagesSquare },
      { label: "Meeting requests", href: "/listener/requests", icon: Inbox },
      { label: "Connection requests", href: "/listener/connections", icon: UserRoundCheck },
    ],
  },
  {
    title: "Your practice",
    items: [
      { label: "Availability", href: "/listener/availability", icon: CalendarRange },
    ],
  },
];

export function ListenerShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <AppShell
      sections={sections}
      // The real signed-in user. This was hardcoded to "Amara Okonkwo · Senior
      // listener · 6 yrs" — a fictional person, shown to whichever actual
      // member of the team was logged in.
      user={{
        name: user?.name ?? "Your account",
        caption: user?.email ?? "Signed in",
        href: "/listener/availability",
      }}
      searchPlaceholder="Search chats, requests, clients and notes…"
      primaryAction={{ label: "Open requests", href: "/listener/requests" }}
      sidebarFooter={
        <div className="border-sidebar-border bg-sidebar-accent/50 rounded-2xl border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium">Accepting new clients</p>
              <p className="text-muted-foreground mt-0.5 text-[0.6875rem]">
                Shown in the directory
              </p>
            </div>
            <Switch defaultChecked aria-label="Accepting new clients" />
          </div>
          <Button asChild size="sm" variant="outline" className="mt-3 w-full">
            <Link href="/">View the public site</Link>
          </Button>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
