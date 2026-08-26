"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Inbox,
  LayoutDashboard,
  Loader2,
  MessagesSquare,
  UserRoundCheck,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/dashboard/app-shell";
import { api, type AdminStats } from "@/lib/api";
import { landingFor, useAuth } from "@/lib/auth";

/** Refresh the sidebar badges often enough that new work is noticed. */
const POLL_MS = 15000;

/**
 * Admin-only shell.
 *
 * The API enforces the role on every `/api/admin/*` endpoint, so this guard is
 * about not showing an admin-shaped page to someone who will only get 403s
 * from it — Next middleware can see that a session exists, but not whose.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [stats, setStats] = React.useState<AdminStats | null>(null);

  const isAdmin = user?.role === "ADMIN";

  React.useEffect(() => {
    // Send them to their own home rather than always to /dashboard: a listener
    // bounced here would otherwise land on the member dashboard and be bounced
    // straight back out of it by `MemberOnly`.
    if (ready && !isAdmin) router.replace(landingFor(user));
  }, [ready, isAdmin, user, router]);

  React.useEffect(() => {
    if (!isAdmin) return;

    const load = async () => {
      try {
        const { stats: next } = await api.get<{ stats: AdminStats }>("/api/admin/stats");
        setStats(next);
      } catch {
        // Badge counts are decoration — never interrupt the page for them.
      }
    };

    void load();
    const timer = window.setInterval(() => {
      if (!document.hidden) void load();
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [isAdmin]);

  if (!ready || !isAdmin) {
    return (
      <div className="text-muted-foreground flex min-h-dvh items-center justify-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" /> Checking your access…
      </div>
    );
  }

  const sections = [
    {
      items: [
        { label: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
        {
          label: "Tickets",
          href: "/admin/tickets",
          icon: Inbox,
          badge: stats?.requests.open || undefined,
        },
        {
          label: "Messages",
          href: "/admin/messages",
          icon: MessagesSquare,
          badge: stats?.chats.waiting || undefined,
        },
      ],
    },
    {
      title: "Manage",
      items: [
        { label: "Users", href: "/admin/users", icon: Users },
        { label: "Connection requests", href: "/admin/connections", icon: UserRoundCheck },
      ],
    },
  ];

  return (
    <AppShell
      sections={sections}
      user={{ name: user.name, caption: "Administrator", href: "/admin/users" }}
      searchPlaceholder="Search tickets, messages and users…"
      primaryAction={{ label: "Open tickets", href: "/admin/tickets" }}
    >
      {children}
    </AppShell>
  );
}
