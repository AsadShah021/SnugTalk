"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BellRing,
  CalendarCheck,
  Check,
  Loader2,
  Mail,
  MessageSquareText,
  Send,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError, type ApiMeetingRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { site } from "@/lib/data/site";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Testing-phase meeting request: name, email, and what they'd like to talk
 * about. Nothing else.
 *
 * The richer version — session format, preferred dates, time windows, urgency,
 * preferred listener, feedback mode, anonymous mode and recurring check-ins —
 * is preserved in `meeting-request-form.full.tsx` alongside this file. Swap the
 * import in app/(marketing)/book/page.tsx to bring it back.
 */
export function MeetingRequestForm() {
  const { user } = useAuth();
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent">("idle");
  const [name, setName] = React.useState("");
  const [reference, setReference] = React.useState("");

  // Members reach this form signed in, so their details are already known.
  React.useEffect(() => {
    if (user) setName((current) => current || user.name);
  }, [user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");

    try {
      const { request } = await api.post<{ request: ApiMeetingRequest }>("/api/requests", {
        name: String(form.get("name") ?? "").trim(),
        email: String(form.get("email") ?? "").trim(),
        topic: String(form.get("topic") ?? "").trim(),
      });

      setReference(request.reference);
      setStatus("sent");
      toast.success("Request sent to the team", {
        description: `We'll email you to arrange a time, usually within ${site.requestResponseTime}.`,
      });
    } catch (error) {
      setStatus("idle");
      toast.error(
        error instanceof ApiError ? error.message : "Couldn't send that. Try again.",
      );
    }
  }

  /* ------------------------------ Confirmation ----------------------------- */

  if (status === "sent") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: easeOutExpo }}
        className="mx-auto max-w-xl"
      >
        <div className="border-border/70 bg-card relative overflow-hidden rounded-3xl border p-8 text-center sm:p-12">
          <div
            aria-hidden
            className="bg-success/10 absolute -top-28 left-1/2 size-72 -translate-x-1/2 rounded-full blur-3xl"
          />

          <div className="relative">
            <span className="bg-success/15 text-success mx-auto mb-6 grid size-16 place-items-center rounded-full">
              <BellRing className="size-8" />
            </span>

            <h2 className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
              Your request is with us
            </h2>
            <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm leading-relaxed">
              A real person reads every request. We&rsquo;ll email you to arrange
              a time that suits you — usually within {site.requestResponseTime}.
            </p>

            <div className="border-border/60 bg-muted/35 mt-8 flex items-center justify-between gap-3 rounded-2xl border p-5">
              <span className="text-muted-foreground text-xs">Reference</span>
              <span className="font-mono text-sm font-semibold">{reference}</span>
            </div>

            <ol className="mt-6 flex flex-col gap-3 text-left">
              {[
                { icon: Check, label: "Request received", done: true },
                { icon: Mail, label: "We read it and get in touch", done: false },
                { icon: CalendarCheck, label: "We agree a time and send the invite", done: false },
              ].map((step) => (
                <li
                  key={step.label}
                  className="border-border/60 flex items-center gap-3 rounded-xl border p-3.5"
                >
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full",
                      step.done ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <step.icon className="size-3.5" />
                  </span>
                  <span className={cn("text-sm", step.done ? "font-medium" : "text-muted-foreground")}>
                    {step.label}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" variant="gradient">
                <Link href="/chat">
                  <MessageSquareText className="size-4" />
                  Chat with us while you wait
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/">Back to home</Link>
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="text-muted-foreground hover:text-foreground mt-6 text-xs underline underline-offset-4"
            >
              Send another request
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  /* --------------------------------- Form --------------------------------- */

  return (
    <div className="mx-auto max-w-xl">
      <form
        onSubmit={handleSubmit}
        className="border-border/70 bg-card flex flex-col gap-5 rounded-3xl border p-6 sm:p-8"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="req-name">Your name</Label>
          <Input
            id="req-name"
            name="name"
            required
            autoComplete="name"
            placeholder="Alex Morgan"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="req-email">Email</Label>
          <Input
            id="req-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            defaultValue={user?.email ?? ""}
            key={user?.email ?? "anon"}
          />
          <p className="text-muted-foreground text-xs">
            This is how we&rsquo;ll reach you to arrange the time. Nothing else is
            ever sent to it.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="req-topic">What would you like to talk about?</Label>
          <Textarea
            id="req-topic"
            name="topic"
            required
            rows={5}
            placeholder="Anything at all — a business idea, a decision you're stuck on, or something that's just been on your mind. A sentence is plenty, and “not sure yet” is a perfectly good answer."
          />
          <p className="text-muted-foreground text-xs">
            Only the person you speak with reads this.
          </p>
        </div>

        <Button
          type="submit"
          size="xl"
          variant="gradient"
          disabled={status === "sending"}
          className="mt-1 w-full"
        >
          {status === "sending" ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Sending…
            </>
          ) : (
            <>
              <Send className="size-4" /> Send request
            </>
          )}
        </Button>

        <p className="text-muted-foreground flex items-start gap-2 text-xs leading-relaxed">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
          Nothing is booked yet — we&rsquo;ll agree a time with you first.
          SnugTalk is a listening service, not therapy or crisis support.
        </p>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        Don&rsquo;t want to wait?{" "}
        <Link href="/chat" className="text-foreground font-medium underline underline-offset-4">
          Start a chat instead
        </Link>{" "}
        — someone&rsquo;s usually there now.
      </p>
    </div>
  );
}
