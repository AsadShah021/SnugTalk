import { ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Shown wherever a heavier personal conversation is offered.
 *
 * These topics are the ones most likely to be mistaken for therapy, and the
 * ones where someone might actually be in danger. The notice is deliberately
 * plain rather than reassuring: it says what we are not, and puts the route to
 * real help one tap away instead of buried on another page.
 */
export function BoundaryNotice({
  variant = "default",
  className,
}: {
  variant?: "default" | "compact";
  className?: string;
}) {
  if (variant === "compact") {
    return (
      <p
        className={cn(
          "text-muted-foreground flex items-start gap-2 text-xs leading-relaxed",
          className,
        )}
      >
        <ShieldAlert className="text-warning mt-0.5 size-3.5 shrink-0" />
        <span>
          We listen — we don&rsquo;t diagnose or treat. If you&rsquo;re at risk of
          harm, contact your local emergency services.
        </span>
      </p>
    );
  }

  return (
    <aside
      className={cn(
        "border-warning/30 bg-warning/[0.04] rounded-2xl border p-5",
        className,
      )}
    >
      <div className="flex gap-3.5">
        <span className="bg-warning/15 text-warning grid size-9 shrink-0 place-items-center rounded-xl">
          <ShieldAlert className="size-4.5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">
            Before you start — what this is and isn&rsquo;t
          </h3>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            This is one of our heavier conversations, so we want to be exact.
            Your listener is trained to listen and will give you their full
            attention without judging you. They are{" "}
            <span className="text-foreground font-medium">
              not a therapist or a counsellor
            </span>
            , they cannot diagnose or treat anything, and they will not give you
            legal or medical advice. If what you need is clinical care, a good
            session here ends with them saying so.
          </p>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            We are also not an emergency service and chats are not monitored for
            emergencies. If you are in danger or thinking about harming yourself,
            please contact your local emergency services rather than waiting for
            a reply here.
          </p>
        </div>
      </div>
    </aside>
  );
}
