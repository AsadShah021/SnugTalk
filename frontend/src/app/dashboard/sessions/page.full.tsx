import Link from "next/link";
import { CalendarPlus } from "lucide-react";

import { PageHeader } from "@/components/dashboard/app-shell";
import { SessionCard } from "@/components/dashboard/session-card";
import { Rating } from "@/components/shared/rating";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PendingRequestCard } from "@/components/dashboard/pending-request-card";
import { meetingRequests, pastSessions, upcomingSessions } from "@/lib/data/demo";
import { getListener } from "@/lib/data/listeners";
import { sessionModeMap } from "@/lib/data/site";
import { formatDate } from "@/lib/utils";

export default function SessionsPage() {
  const totalMinutes = pastSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const pending = meetingRequests.filter(
    (request) => request.status === "new" || request.status === "reviewing",
  );

  return (
    <>
      <PageHeader
        title="Sessions"
        description="Confirmed times, requests still with the team, and everything you've already talked through."
        actions={
          <Button asChild variant="gradient">
            <Link href="/book">
              <CalendarPlus className="size-4" /> Request a meeting
            </Link>
          </Button>
        }
      />

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Confirmed ({upcomingSessions.length})</TabsTrigger>
          <TabsTrigger value="pending">Requested ({pending.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastSessions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="flex flex-col gap-4">
          {upcomingSessions.map((session, index) => (
            <SessionCard key={session.id} session={session} featured={index === 0} />
          ))}
        </TabsContent>

        <TabsContent value="pending" className="flex flex-col gap-4">
          {pending.length > 0 ? (
            <>
              <p className="text-muted-foreground text-sm">
                These are with the team. Nothing is counted against your monthly
                allowance until we confirm a time.
              </p>
              {pending.map((request) => (
                <PendingRequestCard key={request.id} request={request} />
              ))}
            </>
          ) : (
            <div className="border-border/70 flex flex-col items-center gap-3 rounded-2xl border border-dashed p-14 text-center">
              <p className="text-sm font-medium">No requests waiting</p>
              <p className="text-muted-foreground max-w-xs text-sm">
                Every meeting you&rsquo;ve asked for has a confirmed time.
              </p>
              <Button asChild size="sm" variant="outline">
                <Link href="/book">Request a meeting</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="flex flex-col gap-4">
          <Card className="bg-muted/40">
            <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
              {[
                { label: "Sessions completed", value: `${pastSessions.length}` },
                { label: "Minutes talked", value: `${totalMinutes}` },
                {
                  label: "Average rating you gave",
                  value: (
                    pastSessions.reduce((sum, s) => sum + (s.rating ?? 0), 0) /
                    pastSessions.filter((s) => s.rating).length
                  ).toFixed(1),
                },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-xl font-semibold tracking-[-0.03em] tabular-nums">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground text-xs">{stat.label}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {pastSessions.map((session) => {
            const listener = getListener(session.listenerId);
            const mode = sessionModeMap[session.mode];
            return (
              <Card key={session.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{listener?.name}</p>
                      <span className="text-muted-foreground text-xs">
                        {formatDate(session.startsAt, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        · {mode.short} · {session.durationMinutes} min
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm">{session.topic}</p>
                    {session.notes && (
                      <p className="text-muted-foreground border-border/60 mt-3 border-l-2 pl-3 text-xs leading-relaxed">
                        {session.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {session.rating && <Rating value={session.rating} />}
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/book?listener=${session.listenerId}`}>Request again</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </>
  );
}
