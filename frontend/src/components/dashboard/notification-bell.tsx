"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CalendarCheck, Inbox, Loader2, MessagesSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  api,
  ApiError,
  type ApiConversation,
  type ApiMeetingRequest,
} from "@/lib/api";
import { isStaff, useAuth } from "@/lib/auth";
import { formatRelativeDay } from "@/lib/utils";

/** Matches the chat widget, so the two never disagree for long. */
const POLL_MS = 15000;

type Item = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  href: string;
};

/**
 * The topbar bell, driven by real data.
 *
 * It used to be a `<Button>` with no handler and no href, next to a red dot
 * that was hardcoded into the markup — so it always claimed there was
 * something waiting, and clicking it did nothing at all.
 *
 * What counts as a notification depends on who's asking. A member wants to
 * know when someone has replied to them and when a meeting they asked for has
 * been given a time; staff want to know what's queued up for them. Both are
 * counted from endpoints that already exist, so nothing here is invented.
 */
export function NotificationBell() {
  const { user, ready } = useAuth();
  const staff = isStaff(user);

  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!user) return;

    try {
      const next: Item[] = [];

      if (staff) {
        const [chatRes, requestRes] = await Promise.all([
          api.get<{ conversations: ApiConversation[] }>("/api/conversations"),
          api.get<{ requests: ApiMeetingRequest[] }>("/api/requests"),
        ]);

        const waiting = chatRes.conversations.filter((c) => c.status === "WAITING");
        const openRequests = requestRes.requests.filter(
          (r) => r.status === "NEW" || r.status === "REVIEWING",
        );

        for (const chat of waiting.slice(0, 5)) {
          next.push({
            id: `chat-${chat.id}`,
            icon: MessagesSquare,
            title: `${chat.member.name} is waiting for a reply`,
            detail: formatRelativeDay(chat.lastMessageAt),
            href: staffChatHref(user?.role),
          });
        }

        for (const request of openRequests.slice(0, 5)) {
          next.push({
            id: `req-${request.id}`,
            icon: Inbox,
            title: `${request.name} asked for a meeting`,
            detail: `${request.reference} · needs a time`,
            href: staffRequestHref(user?.role),
          });
        }
      } else {
        const [unread, requestRes] = await Promise.all([
          api.get<{ count: number }>("/api/conversations/unread-count"),
          api.get<{ requests: ApiMeetingRequest[] }>("/api/requests/mine"),
        ]);

        if (unread.count > 0) {
          next.push({
            id: "unread",
            icon: MessagesSquare,
            title:
              unread.count === 1
                ? "You have a new reply"
                : `You have ${unread.count} new replies`,
            detail: "Open your chat to read it",
            href: "/chat",
          });
        }

        // Only meetings still ahead of us — a confirmed time that has already
        // passed isn't news.
        const upcoming = requestRes.requests.filter(
          (r) =>
            r.status === "SCHEDULED" &&
            r.scheduledFor &&
            new Date(r.scheduledFor).getTime() > Date.now(),
        );

        for (const request of upcoming.slice(0, 5)) {
          next.push({
            id: `sched-${request.id}`,
            icon: CalendarCheck,
            title: "Your meeting has a time",
            detail: formatRelativeDay(request.scheduledFor!),
            href: "/dashboard/sessions",
          });
        }
      }

      setItems(next);
    } catch (error) {
      // Silent: a bell that can't count is not worth a toast on every poll.
      if (!(error instanceof ApiError)) throw error;
    } finally {
      setLoading(false);
    }
  }, [user, staff]);

  React.useEffect(() => {
    if (!ready || !user) return;

    void load();
    const timer = window.setInterval(() => {
      if (!document.hidden) void load();
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [ready, user, load]);

  // Refresh the moment it's opened, so the list matches the badge.
  React.useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const count = items.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            count > 0
              ? `Notifications, ${count} waiting`
              : "Notifications, none waiting"
          }
        >
          <Bell className="size-4.5" />
          {count > 0 && (
            <span className="bg-destructive text-destructive-foreground ring-background absolute -top-0.5 -right-0.5 grid min-w-4 place-items-center rounded-full px-1 text-[0.625rem] font-semibold ring-2">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-border/70 border-b px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
        </div>

        {loading && items.length === 0 ? (
          <div className="text-muted-foreground flex items-center gap-2 px-4 py-8 text-sm">
            <Loader2 className="size-3.5 animate-spin" /> Checking…
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm font-medium">You&rsquo;re all caught up</p>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              {staff
                ? "No chats waiting and no requests without a time."
                : "We&rsquo;ll let you know here when someone replies."}
            </p>
          </div>
        ) : (
          <ul className="max-h-80 overflow-y-auto py-1.5">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="hover:bg-accent flex gap-3 px-4 py-2.5 transition-colors"
                >
                  <span className="bg-primary/8 text-primary mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg">
                    <item.icon className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {item.title}
                    </span>
                    <span className="text-muted-foreground block truncate text-xs">
                      {item.detail}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

/** Admins and listeners read the same queues through different panels. */
function staffChatHref(role?: string) {
  return role === "ADMIN" ? "/admin/messages" : "/listener/chats";
}

function staffRequestHref(role?: string) {
  return role === "ADMIN" ? "/admin/tickets" : "/listener/requests";
}
