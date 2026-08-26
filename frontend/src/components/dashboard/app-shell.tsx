"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Plus } from "lucide-react";

import {
  AppSidebar,
  type SidebarSection,
} from "@/components/dashboard/app-sidebar";
import { ImpersonationBanner } from "@/components/dashboard/impersonation-banner";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { ThemeToggle } from "@/components/brand/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function AppShell({
  sections,
  user,
  sidebarFooter,
  primaryAction,
  children,
}: {
  sections: SidebarSection[];
  user: { name: string; caption: string; href: string };
  sidebarFooter?: React.ReactNode;
  primaryAction?: { label: string; href: string };
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    /*
     * The shell owns the viewport height and scrolls internally, rather than
     * letting the window scroll.
     *
     * That's what lets a full-height panel (the chat inbox) say `flex-1` and
     * actually get the space that's left. The previous approach subtracted a
     * hardcoded `9.5rem` for the chrome, which under-counted the topbar, the
     * main padding and the page header — so the reply box ended up below the
     * fold with nothing able to scroll to it.
     */
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* Outside the grid — a banner shouldn't become a grid column. */}
      <ImpersonationBanner />

      <div className="bg-muted/30 flex min-h-0 flex-1 lg:grid lg:grid-cols-[16.5rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="bg-sidebar border-sidebar-border hidden h-full overflow-y-auto border-r lg:block">
        <AppSidebar sections={sections} user={user} footer={sidebarFooter} />
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Top bar */}
        {/* Opaque, not `.glass`. Dashboard content scrolls directly beneath this
            bar, and a translucent one lets headings bleed through it. */}
        <header className="bg-background border-border/70 z-40 flex h-16 shrink-0 items-center gap-3 border-b px-4 sm:px-6 lg:px-8">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[17rem] p-0" showClose={false}>
              <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
              <AppSidebar
                sections={sections}
                user={user}
                footer={sidebarFooter}
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>

          {/* A search box sat here with a placeholder and an aria-label but no
              state, no handler and no endpoint behind it — typing did nothing.
              The admin user list has its own working search; this one only
              promised a feature that didn't exist. */}

          <div className="ml-auto flex items-center gap-1.5">
            <NotificationBell />
            <ThemeToggle />
            {primaryAction && (
              <Button asChild variant="gradient" size="sm" className="ml-1.5">
                <Link href={primaryAction.href}>
                  <Plus className="size-3.5" />
                  <span className="hidden sm:inline">{primaryAction.label}</span>
                </Link>
              </Button>
            )}
          </div>
        </header>

        {/*
         * A plain block, deliberately — not a flex column.
         *
         * As a flex column this clipped long pages: flex items shrink by
         * default, so a tall table shrank to the leftover height instead of
         * overflowing, nothing exceeded `main`, and no scrollbar ever appeared.
         * The admin user list simply stopped mid-row.
         *
         * Pages that want to fill the viewport and scroll internally (the chat
         * inboxes) opt in with `FullHeight` below, rather than every ordinary
         * page having to defend itself with `shrink-0`.
         */}
        <main
          id="main"
          className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
      </div>
    </div>
  );
}

/**
 * Opt-in full-height page body, for screens that should fill the viewport and
 * scroll inside themselves instead of scrolling the page — the chat inboxes.
 *
 * `main` has a definite height, so `h-full` here resolves against it; the page
 * header stays `shrink-0` and whatever follows can take `min-h-0 flex-1`.
 */
export function FullHeight({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full min-h-0 flex-col">{children}</div>;
}

/** Page title block used at the top of every dashboard route. */
export function PageHeader({
  title,
  description,
  badge,
  actions,
  className,
}: {
  title: string;
  description?: string;
  badge?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-7 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-[-0.025em]">{title}</h1>
          {badge && <Badge variant="brand">{badge}</Badge>}
        </div>
        {description && (
          <p className="text-muted-foreground mt-1.5 text-sm">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}
