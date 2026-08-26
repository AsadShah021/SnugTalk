"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { CalendarClock, Check, Ear, Video } from "lucide-react";

import { ModeBadge } from "@/components/shared/mode-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Twelve bars that breathe like someone is mid-sentence. */
function Waveform({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-8 items-center gap-[3px]", className)} aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="animate-waveform bg-primary/70 w-[3px] rounded-full"
          style={{
            height: `${28 + ((i * 37) % 60)}%`,
            animationDelay: `${(i % 6) * 0.13}s`,
            animationDuration: `${1 + (i % 4) * 0.18}s`,
          }}
        />
      ))}
    </div>
  );
}

const chatBeats = [
  { author: "listener" as const, text: "Take your time. What's actually on your mind?" },
  { author: "me" as const, text: "I think I already know what I want to do." },
  { author: "listener" as const, text: "Say it out loud and let's see how it sounds." },
];

/*
 * An illustration of the product, not a claim about it. It used to put a named
 * face — "Amara Okonkwo" — in the seat, alongside a second invented name in the
 * schedule and two made-up figures on the floating chips. A mock-up may show how
 * the interface is laid out; it may not introduce people who don't exist.
 */
export function HeroVisual() {
  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);
  const rotateX = useSpring(rotateXRaw, { stiffness: 180, damping: 24 });
  const rotateY = useSpring(rotateYRaw, { stiffness: 180, damping: 24 });
  const glareX = useTransform(rotateY, [-8, 8], ["25%", "75%"]);

  const [beat, setBeat] = React.useState(1);

  React.useEffect(() => {
    const timer = window.setInterval(
      () => setBeat((b) => (b + 1) % (chatBeats.length + 1)),
      2600,
    );
    return () => window.clearInterval(timer);
  }, []);

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateYRaw.set(px * 12);
    rotateXRaw.set(-py * 8);
  }

  function handleLeave() {
    rotateYRaw.set(0);
    rotateXRaw.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 48, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, ease: easeOutExpo, delay: 0.35 }}
      className="relative mx-auto w-full max-w-4xl [perspective:1600px]"
    >
      <motion.div
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="glass-strong relative rounded-[2rem] p-2 sm:p-3"
      >
        {/* Specular sweep that tracks the pointer */}
        <motion.div
          aria-hidden
          style={{ left: glareX }}
          className="pointer-events-none absolute inset-y-0 w-1/2 -translate-x-1/2 rounded-[2rem] bg-linear-to-r from-transparent via-white/10 to-transparent dark:via-white/5"
        />

        <div className="bg-card/80 relative overflow-hidden rounded-[1.6rem]">
          {/* Window chrome */}
          <div className="border-border/60 flex items-center gap-2 border-b px-5 py-3.5">
            <div className="flex gap-1.5" aria-hidden>
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
            </div>
            <div className="text-muted-foreground mx-auto flex items-center gap-1.5 text-xs">
              <span className="bg-success size-1.5 rounded-full" />
              Session in progress · encrypted
            </div>
          </div>

          <div className="grid gap-0 sm:grid-cols-[1.15fr_1fr]">
            {/* Live session panel */}
            <div className="border-border/60 flex flex-col gap-5 p-5 sm:border-r sm:p-6">
              <div className="flex items-start gap-3.5">
                <span
                  aria-hidden
                  className="from-[var(--brand-violet)] to-[var(--brand-teal)] relative grid size-14 shrink-0 place-items-center rounded-full bg-linear-to-br text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
                >
                  <Ear className="size-6" />
                  <span className="absolute right-0 bottom-0 flex size-3">
                    <span className="bg-success ring-background inline-flex size-3 rounded-full ring-2" />
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">Your listener</p>
                  <p className="text-muted-foreground truncate text-xs">
                    A real person, connected
                  </p>
                </div>
                <ModeBadge mode="meet-video" />
              </div>

              <div className="border-border/60 bg-muted/40 relative overflow-hidden rounded-2xl border p-5">
                <div className="bg-brand-violet/12 absolute -top-10 -right-8 size-32 rounded-full blur-2xl" />
                <p className="text-muted-foreground relative mb-3 text-xs font-medium">
                  Now talking about
                </p>
                <p className="relative text-[0.95rem] leading-snug font-medium">
                  &ldquo;Whether to raise, or stay small and profitable.&rdquo;
                </p>
                <div className="relative mt-4 flex items-center justify-between gap-3">
                  <Waveform />
                  <span className="text-muted-foreground font-mono text-xs tabular-nums">
                    31:04
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success">
                  <Check className="size-3" /> Never recorded
                </Badge>
                <Badge variant="muted">Notes on</Badge>
              </div>
            </div>

            {/* Sidebar: next up + chat */}
            <div className="flex flex-col gap-4 p-5 sm:p-6">
              <div className="border-border/60 flex items-center gap-3 rounded-2xl border p-3.5">
                <span className="bg-brand-amber/14 text-brand-amber grid size-9 shrink-0 place-items-center rounded-xl">
                  <CalendarClock className="size-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">Thursday, 9:00 AM</p>
                  <p className="text-muted-foreground truncate text-[0.6875rem]">
                    Google Meet · link emailed
                  </p>
                </div>
                <Button size="icon-sm" variant="subtle" className="ml-auto" tabIndex={-1}>
                  <Video className="size-3.5" />
                </Button>
              </div>

              <div className="flex flex-col gap-2.5">
                {chatBeats.map((message, index) => (
                  <motion.div
                    key={message.text}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{
                      opacity: index < beat ? 1 : 0.25,
                      y: index < beat ? 0 : 6,
                    }}
                    transition={{ duration: 0.45, ease: easeOutExpo }}
                    className={cn(
                      "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed",
                      message.author === "me"
                        ? "bg-primary text-primary-foreground ml-auto rounded-br-md"
                        : "bg-muted rounded-bl-md",
                    )}
                  >
                    {message.text}
                  </motion.div>
                ))}
              </div>

              <div className="border-border/60 text-muted-foreground mt-auto flex items-center gap-2 rounded-full border px-3.5 py-2 text-[0.6875rem]">
                <span className="flex gap-0.5" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="bg-muted-foreground/50 size-1 animate-bounce rounded-full"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </span>
                Someone is typing
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating context chips */}
      <motion.div
        initial={{ opacity: 0, x: -20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.9 }}
        className="glass animate-float absolute -bottom-6 -left-3 hidden rounded-2xl px-4 py-3 sm:block lg:-left-10"
      >
        {/* Was "Average session — 42 minutes", an average of no sessions. */}
        <p className="text-muted-foreground text-[0.6875rem]">Every session</p>
        <p className="text-lg font-semibold tracking-tight">Never recorded</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: easeOutExpo, delay: 1.05 }}
        style={{ animationDelay: "-4s" }}
        className="glass animate-float absolute -top-5 -right-3 hidden rounded-2xl px-4 py-3 sm:block lg:-right-10"
      >
        <div className="flex items-center gap-2.5">
          <span className="bg-success/15 text-success grid size-8 place-items-center rounded-full">
            <Check className="size-4" />
          </span>
          <div>
            <p className="text-xs font-semibold">Answered by a person</p>
            <p className="text-muted-foreground text-[0.6875rem]">Never a bot, never a script</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
