"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { isStaff, staffHome, useAuth } from "@/lib/auth";

/**
 * The mirror of `StaffOnly` — keeps staff out of the member-side screens.
 *
 * Messaging the team and requesting a meeting are things a *member* does. An
 * admin who opens them is writing to their own inbox and booking a session
 * with themselves, and the request would land in the ticket queue they
 * administer. So staff are sent to their own panel instead.
 *
 * Impersonation still works: while an admin is viewing SnugTalk as a member,
 * the session's role really is MEMBER, so this guard lets them through and
 * they see exactly what that person sees — which is the point of it.
 */
export function MemberOnly({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const blocked = isStaff(user);

  React.useEffect(() => {
    if (ready && blocked) router.replace(staffHome(user));
  }, [ready, blocked, user, router]);

  if (!ready || blocked) {
    return (
      <div className="text-muted-foreground flex min-h-dvh items-center justify-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" /> Taking you to your dashboard…
      </div>
    );
  }

  return <>{children}</>;
}
