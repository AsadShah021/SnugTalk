import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Clock3,
  Inbox,
  MessagesSquare,
  Star,
  Users,
  Wallet,
} from "lucide-react";

import { ListenerAvatar } from "@/components/brand/listener-avatar";
import { PageHeader } from "@/components/dashboard/app-shell";
import { AppointmentRow } from "@/components/dashboard/appointment-row";
import { EarningsChart } from "@/components/dashboard/earnings-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { Rating } from "@/components/shared/rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  appointments,
  availability,
  clientNotes,
  earningsSeries,
  listenerReviewFeed,
  meetingRequests,
  teamChats,
} from "@/lib/data/demo";
import { formatCurrency, formatDate, formatRelativeDay } from "@/lib/utils";

export default function ListenerOverviewPage() {
  const [nextAppointment, ...later] = appointments;
  const monthEarnings = earningsSeries[earningsSeries.length - 1].amount;
  const previousEarnings = earningsSeries[earningsSeries.length - 2].amount;
  const growth = Math.round(((monthEarnings - previousEarnings) / previousEarnings) * 100);
  const enabledDays = availability.filter((day) => day.enabled).length;
  const waitingChats = teamChats.filter((chat) => chat.status === "waiting").length;
  const openRequests = meetingRequests.filter(
    (request) => request.status === "new" || request.status === "reviewing",
  ).length;

  return (
    <>
      <PageHeader
        title="Good morning, Amara"
        description={`${waitingChats} ${waitingChats === 1 ? "chat is" : "chats are"} waiting for a reply and ${openRequests} meeting ${openRequests === 1 ? "request needs" : "requests need"} a time.`}
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

      {/* What's actually waiting on a person right now */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <Link href="/listener/chats" className="group">
          <Card className="border-warning/30 bg-warning/[0.035] hover:border-warning/50 h-full p-5 transition-colors">
            <div className="flex items-start gap-4">
              <span className="bg-warning/15 text-warning grid size-11 shrink-0 place-items-center rounded-xl">
                <MessagesSquare className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {waitingChats} chats waiting for a reply
                </p>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  Longest wait is 2 minutes. Someone is typing on the other end
                  right now.
                </p>
              </div>
              <ArrowRight className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Card>
        </Link>

        <Link href="/listener/requests" className="group">
          <Card className="border-info/30 bg-info/[0.035] hover:border-info/50 h-full p-5 transition-colors">
            <div className="flex items-start gap-4">
              <span className="bg-info/15 text-info grid size-11 shrink-0 place-items-center rounded-xl">
                <Inbox className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {openRequests} meeting requests to schedule
                </p>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  Pick a time from the days they offered and the invitation goes
                  out automatically.
                </p>
              </div>
              <ArrowRight className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Card>
        </Link>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Earnings this month"
          value={formatCurrency(monthEarnings)}
          icon={Wallet}
          tone="brand"
          trend={{ value: `+${growth}%`, direction: "up" }}
        />
        <StatCard
          label="Sessions this week"
          value="14"
          hint="4 remaining"
          icon={CalendarClock}
        />
        <StatCard
          label="Average rating"
          value="4.9"
          hint="From 412 reviews"
          icon={Star}
          trend={{ value: "+0.1", direction: "up" }}
        />
        <StatCard
          label="Active clients"
          value="23"
          hint="3 new this month"
          icon={Users}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div>
            <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
              Next appointment
            </h2>
            <AppointmentRow appointment={nextAppointment} featured />
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Later</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/listener/appointments">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {later.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border-border/60 flex items-center gap-3.5 rounded-2xl border p-3.5"
                >
                  <ListenerAvatar name={appointment.clientName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {appointment.clientName}
                      </p>
                      {appointment.isNewClient && (
                        <Badge variant="warning" className="text-[0.625rem]">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground truncate text-xs">
                      {appointment.topic}
                    </p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-xs font-medium">
                      {formatRelativeDay(appointment.startsAt)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatDate(appointment.startsAt, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Earnings</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/listener/earnings">Details</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <EarningsChart data={earningsSeries} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>This week</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Booked hours</span>
                  <span className="font-semibold tabular-nums">14 / 20</span>
                </div>
                <Progress value={70} />
              </div>
              <dl className="border-border/60 grid grid-cols-2 gap-3 border-t pt-4 text-xs">
                <div>
                  <dt className="text-muted-foreground">Days open</dt>
                  <dd className="mt-0.5 font-semibold tabular-nums">{enabledDays} / 7</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Avg session</dt>
                  <dd className="mt-0.5 font-semibold">44 min</dd>
                </div>
              </dl>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/listener/availability">Edit availability</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Recent reviews</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/listener/reviews">All</Link>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {listenerReviewFeed.slice(0, 2).map((review) => (
                <div key={review.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Rating value={review.rating} />
                    <span className="text-muted-foreground ml-auto text-xs">
                      {formatRelativeDay(review.date)}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    &ldquo;{review.body}&rdquo;
                  </p>
                  <p className="text-xs font-medium">{review.author}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock3 className="text-muted-foreground size-4" />
                Needs a note
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              {clientNotes.slice(0, 3).map((note) => (
                <Link
                  key={note.id}
                  href="/listener/clients"
                  className="border-border/60 hover:border-primary/25 flex items-center gap-3 rounded-xl border p-3 transition-colors"
                >
                  <ListenerAvatar name={note.clientName} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{note.clientName}</p>
                    <p className="text-muted-foreground truncate text-[0.6875rem]">
                      {note.sessionCount} sessions
                    </p>
                  </div>
                  <ArrowRight className="text-muted-foreground size-3.5" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
