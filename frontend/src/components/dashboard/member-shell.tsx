"use client";

import {
  CalendarDays,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  UserRoundCheck,
} from "lucide-react";

import { ChatWidget } from "@/components/chat/chat-widget";
import { AppShell } from "@/components/dashboard/app-shell";
import { useAuth } from "@/lib/auth";

/*
 * Testing-phase member navigation: the two things an account can actually do,
 * plus settings. Notes, saved ideas, favourite listeners and subscription are
 * parked with the features they belong to — their pages still exist and are
 * still routable, they're just not linked. See TESTING-SCOPE.md.
 */
const sections = [
  {
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true },
      { label: "Messages", href: "/chat", icon: MessagesSquare },
      { label: "Meetings", href: "/dashboard/sessions", icon: CalendarDays },
      { label: "Choose a listener", href: "/dashboard/listeners", icon: UserRoundCheck },
    ],
  },
  {
    title: "Account",
    items: [{ label: "Settings", href: "/dashboard/settings", icon: Settings }],
  },
];

/*
 * Members only. `MemberOnly` in the layout above sends staff to their own
 * panel before this renders, so the "Staff" section that used to be appended
 * here — a cross-link to /admin or /listener — no longer has anyone to show
 * it to. Staff sign in straight into their own dashboard instead.
 */
export function MemberShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <AppShell
      sections={sections}
      user={{
        name: user?.name ?? "Your account",
        caption: user?.email ?? "Signed in",
        href: "/dashboard/settings",
      }}
      primaryAction={{ label: "Schedule a meeting", href: "/book" }}
    >
      {children}
      <ChatWidget />
    </AppShell>
  );
}
