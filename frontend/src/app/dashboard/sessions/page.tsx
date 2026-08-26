"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CalendarPlus,
  Clock3,
  Loader2,
  Video,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  api,
  ApiError,
  type ApiMeetingRequest,
  type RequestStatus,
} from "@/lib/api";
import { formatDate } from "@/lib/utils";

/*
 * The member's own meeting requests, straight from `GET /api/requests/mine`.
 *
 * This page used to render `lib/data/demo` — invented past sessions with
 * invented listeners, invented ratings and a "minutes talked" total. Every
 * signed-in member saw the same fictional history presented as their own. The
 * richer version is parked beside this file as `page.full.tsx`; restore it once
 * there are real sessions, notes and ratings to put in it.
 */

const statusTone: Record<RequestStatus, "info" | "warning" | "success" | "muted"> = {
  NEW: "info",
  REVIEWING: "warning",
  SCHEDULED: "success",
  DECLINED: "muted",
};

const statusLabel: Record<RequestStatus, string> = {
  NEW: "With the team",
  REVIEWING: "Being arranged",
  SCHEDULED: "Confirmed",
  DECLINED: "Not scheduled",
};

function RequestCard({ request }: { request: ApiMeetingRequest }) {
  const confirmed = request.status === "SCHEDULED" && request.scheduledFor;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusTone[request.status]}>
              {statusLabel[request.status]}
            </Badge>
            <span className="text-muted-foreground font-mono text-xs">
              {request.reference}
            </span>
            <span className="text-muted-foreground text-xs">
              Asked {formatDate(request.createdAt, { month: "short", day: "numeric" })}
            </span>
          </div>

          <p className="mt-3 text-sm leading-relaxed">{request.topic}</p>

          {confirmed && (
            <p className="text-foreground mt-3 flex items-center gap-2 text-sm font-medium">
              <CalendarCheck className="text-success size-4 shrink-0" />
              {formatDate(request.scheduledFor!, {
                weekday: "long",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          )}

          {request.assignedListener && (
            <p className="text-muted-foreground mt-1.5 text-xs">
              With {request.assignedListener.name}
            </p>
          )}

          {request.status === "DECLINED" && (
            <p className="text-muted-foreground mt-2 flex items-start gap-2 text-xs leading-relaxed">
              <XCircle className="mt-0.5 size-3.5 shrink-0" />
              We couldn&rsquo;t arrange this one. Message us and we&rsquo;ll find
              another way.
            </p>
          )}
        </div>

        {confirmed && request.meetUrl && (
          <Button asChild size="sm" variant="gradient" className="shrink-0">
            <a href={request.meetUrl} target="_blank" rel="noreferrer">
              <Video className="size-3.5" /> Join
            </a>
          </Button>
        )}
      </div>
    </Card>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-border/70 flex flex-col items-center gap-3 rounded-2xl border border-dashed p-14 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">{body}</p>
      <Button asChild size="sm" variant="outline">
        <Link href="/book">Request a meeting</Link>
      </Button>
    </div>
  );
}

export default function SessionsPage() {
  const [requests, setRequests] = React.useState<ApiMeetingRequest[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const { requests: list } = await api.get<{ requests: ApiMeetingRequest[] }>(
          "/api/requests/mine",
        );
        if (active) setRequests(list);
      } catch (error) {
        // A bounce to sign-in is the middleware doing its job, not an error
        // worth shouting about.
        if (active && !(error instanceof ApiError && error.isUnauthorized)) {
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Couldn't load your meetings.",
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

  const confirmed = requests.filter((r) => r.status === "SCHEDULED");
  const waiting = requests.filter(
    (r) => r.status === "NEW" || r.status === "REVIEWING",
  );
  const closed = requests.filter((r) => r.status === "DECLINED");

  return (
    <>
      <PageHeader
        title="Meetings"
        description="Times we've confirmed, and requests still with the team."
        actions={
          <Button asChild variant="gradient">
            <Link href="/book">
              <CalendarPlus className="size-4" /> Request a meeting
            </Link>
          </Button>
        }
      />

      {loading ? (
        <div className="text-muted-foreground flex items-center gap-2 py-16 text-sm">
          <Loader2 className="size-4 animate-spin" /> Loading your meetings…
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title="No meetings yet"
          body="Tell us what you'd like to talk about and we'll email you to agree a time. Nothing is booked until you say yes to it."
        />
      ) : (
        <Tabs defaultValue={confirmed.length > 0 ? "confirmed" : "waiting"}>
          <TabsList>
            <TabsTrigger value="confirmed">
              Confirmed ({confirmed.length})
            </TabsTrigger>
            <TabsTrigger value="waiting">Requested ({waiting.length})</TabsTrigger>
            {closed.length > 0 && (
              <TabsTrigger value="closed">Closed ({closed.length})</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="confirmed" className="flex flex-col gap-4">
            {confirmed.length > 0 ? (
              confirmed.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <EmptyState
                title="Nothing confirmed yet"
                body="Once we've agreed a time it appears here with a Join link."
              />
            )}
          </TabsContent>

          <TabsContent value="waiting" className="flex flex-col gap-4">
            {waiting.length > 0 ? (
              <>
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Clock3 className="size-3.5 shrink-0" />
                  These are with the team. We&rsquo;ll email you as soon as we
                  have a time.
                </p>
                {waiting.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </>
            ) : (
              <EmptyState
                title="No requests waiting"
                body="Every meeting you've asked for has an answer."
              />
            )}
          </TabsContent>

          {closed.length > 0 && (
            <TabsContent value="closed" className="flex flex-col gap-4">
              {closed.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </TabsContent>
          )}
        </Tabs>
      )}
    </>
  );
}
