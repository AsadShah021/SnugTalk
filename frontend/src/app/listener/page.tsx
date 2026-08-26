"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Inbox,
  Loader2,
  MessagesSquare,
  UserRoundCheck,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  api,
  ApiError,
  type ApiConversation,
  type ApiMeetingRequest,
} from "@/lib/api";
import { firstName, useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

/*
 * The team overview, counted from the two endpoints that actually exist:
 * `GET /api/conversations` and `GET /api/requests`.
 *
 * What was here before was built entirely on `lib/data/demo` — invented
 * earnings with a month-on-month growth figure, invented appointments,
 * invented client notes, and a review feed with ratings from members who
 * don't exist. It greeted whoever signed in as "Amara". The old page is
 * parked beside this one as `page.full.tsx`; bring it back a section at a
 * time, as each one gets a real endpoint behind it.
 */

type Tile = {
  label: string;
  value: number;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  hint: string;
  urgent: boolean;
};

export default function ListenerOverviewPage() {
  const { user } = useAuth();
  const [chats, setChats] = React.useState<ApiConversation[]>([]);
  const [requests, setRequests] = React.useState<ApiMeetingRequest[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const [chatRes, requestRes] = await Promise.all([
          api.get<{ conversations: ApiConversation[] }>("/api/conversations"),
          api.get<{ requests: ApiMeetingRequest[] }>("/api/requests"),
        ]);
        if (!active) return;
        setChats(chatRes.conversations);
        setRequests(requestRes.requests);
      } catch (error) {
        if (active && !(error instanceof ApiError && error.isUnauthorized)) {
          toast.error(
            error instanceof ApiError ? error.message : "Couldn't load your queues.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const waitingChats = chats.filter((c) => c.status === "WAITING").length;
  const openRequests = requests.filter(
    (r) => r.status === "NEW" || r.status === "REVIEWING",
  ).length;
  const unassignedChats = chats.filter(
    (c) => !c.assignedListener && c.status !== "CLOSED",
  ).length;

  const tiles: Tile[] = [
    {
      label: "Chats waiting",
      value: waitingChats,
      href: "/listener/chats",
      icon: MessagesSquare,
      hint: "Nobody has replied yet",
      urgent: waitingChats > 0,
    },
    {
      label: "Requests without a time",
      value: openRequests,
      href: "/listener/requests",
      icon: Inbox,
      hint: "Waiting on us to schedule",
      urgent: openRequests > 0,
    },
    {
      label: "Chats unassigned",
      value: unassignedChats,
      href: "/listener/chats",
      icon: UserRoundCheck,
      hint: "Open, but nobody owns them",
      urgent: false,
    },
  ];

  const summary = loading
    ? "Counting what's waiting…"
    : waitingChats === 0 && openRequests === 0
      ? "Nothing is waiting on you right now."
      : `${waitingChats} ${waitingChats === 1 ? "chat is" : "chats are"} waiting for a reply and ${openRequests} meeting ${openRequests === 1 ? "request needs" : "requests need"} a time.`;

  return (
    <>
      <PageHeader
        title={`Good to see you, ${firstName(user)}`}
        description={summary}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/listener/chats">
                <MessagesSquare className="size-4" /> Live chats
              </Link>
            </Button>
            <Button asChild variant="gradient">
              <Link href="/listener/requests">
                Meeting requests <ArrowRight className="size-4" />
              </Link>
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="text-muted-foreground flex items-center gap-2 py-16 text-sm">
          <Loader2 className="size-4 animate-spin" /> Loading your queues…
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {tiles.map((tile) => (
              <Link
                key={tile.label}
                href={tile.href}
                className={cn(
                  "group border-border/70 bg-card hover:border-primary/35 hover:shadow-lift flex flex-col gap-3 rounded-3xl border p-5 transition-all duration-300 hover:-translate-y-1",
                  tile.urgent && "border-primary/35",
                )}
              >
                <span
                  className={cn(
                    "grid size-10 place-items-center rounded-xl",
                    tile.urgent
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <tile.icon className="size-4.5" />
                </span>
                <p className="text-3xl font-semibold tracking-[-0.03em] tabular-nums">
                  {tile.value}
                </p>
                <div>
                  <p className="text-sm font-medium">{tile.label}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">{tile.hint}</p>
                </div>
              </Link>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>What this dashboard covers</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground flex flex-col gap-3 text-sm leading-relaxed">
              <p>
                Live chats, meeting requests and connection requests are wired to
                the real database — what you see here is what members have
                actually sent.
              </p>
              <p>
                Appointments, earnings, client notes, session history and reviews
                aren&rsquo;t in the product yet, so they&rsquo;re not shown. They
                come back as each one gets real data behind it.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
