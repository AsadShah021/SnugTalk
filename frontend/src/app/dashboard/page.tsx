"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Clock3,
  MessagesSquare,
  ShieldCheck,
  Video,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { firstName, useAuth } from "@/lib/auth";
import { site } from "@/lib/data/site";
import { cn } from "@/lib/utils";

/*
 * Testing-phase dashboard: the two things an account can do, and nothing else.
 *
 * The richer overview — upcoming sessions, standing check-in, session stats,
 * recent notes, subscription usage and favourite listeners — is preserved in
 * `page.full.tsx` beside this file. See TESTING-SCOPE.md to restore it.
 */
const actions = [
  {
    href: "/chat",
    icon: MessagesSquare,
    title: "Send us a message",
    body: "Write whatever's on your mind. Someone on the team reads it and replies in the same thread — no appointment needed.",
    cta: "Open chat",
    tone: "from-[var(--brand-teal)] to-[var(--brand-violet-soft)]",
    meta: "Usually answered in minutes",
  },
  {
    href: "/book",
    icon: CalendarClock,
    title: "Schedule a meeting",
    body: "Prefer to talk out loud? Tell us what you'd like to discuss and we'll email you to agree a time.",
    cta: "Request a time",
    tone: "from-[var(--brand-violet)] to-[var(--brand-rose)]",
    meta: `A person replies within ${site.requestResponseTime}`,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader
        title={`Good to see you, ${firstName(user)}`}
        description="Two ways to talk to us. Start wherever feels easiest — you can switch at any point."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group border-border/70 bg-card hover:border-primary/35 hover:shadow-lift relative flex flex-col gap-4 overflow-hidden rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1"
              >
                <span
                  className={cn(
                    "grid size-12 place-items-center rounded-2xl bg-linear-to-br text-white",
                    action.tone,
                  )}
                >
                  <action.icon className="size-5.5" />
                </span>

                <div className="flex-1">
                  <h2 className="text-base font-semibold">{action.title}</h2>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {action.body}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground text-xs">{action.meta}</span>
                  <span className="text-primary inline-flex items-center gap-1 text-sm font-medium">
                    {action.cta}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Nothing scheduled yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Once we&rsquo;ve agreed a time, your meeting appears here with a
                Join button and a Google Meet link. You can reschedule or cancel
                free of charge up to four hours beforehand.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Button asChild variant="gradient" size="sm">
                  <Link href="/book">
                    <Video className="size-3.5" /> Schedule your first meeting
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/chat">
                    <MessagesSquare className="size-3.5" /> Message us instead
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          {/* An "On shift now" card used to list three invented listeners here.
              Showing a signed-in member fictional people they might then sit
              waiting for is the worst kind of placeholder. Bring it back when a
              real presence endpoint exists to drive it. */}
          <Card>
            <CardHeader>
              <CardTitle>How replies work</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Whoever is free picks up your message, and you&rsquo;ll always
                see who replied. If you&rsquo;d rather talk to one particular
                person, ask and we&rsquo;ll arrange it.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="text-muted-foreground size-4" />
                Your privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground flex flex-col gap-3 text-sm leading-relaxed">
              <p className="flex items-start gap-2.5">
                <Clock3 className="mt-0.5 size-3.5 shrink-0" />
                Sessions are never recorded, and chats are encrypted in transit
                and at rest.
              </p>
              <p>
                SnugTalk is a listening service — not therapy, counseling or
                crisis support.{" "}
                <Link href="/#safety" className="text-foreground underline underline-offset-2">
                  Safety resources
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
