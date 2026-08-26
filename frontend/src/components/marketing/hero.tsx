import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { HeroVisual } from "@/components/marketing/hero-visual";
import { AuroraBackdrop } from "@/components/motion/aurora-backdrop";
import { Reveal, Stagger, RevealItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { trustPoints } from "@/lib/data/marketing";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 lg:pt-44 lg:pb-28">
      <AuroraBackdrop intensity="default" className="mask-fade-b" />
      <div
        aria-hidden
        className="bg-grid mask-fade-b pointer-events-none absolute inset-0 opacity-50"
      />

      <div className="container-page relative">
        <Stagger className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <RevealItem>
            <Link
              href="/sign-in"
              className="glass group mb-8 inline-flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-1.5 text-xs font-medium"
            >
              <span className="bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem]">
                <span className="bg-primary-foreground size-1.5 rounded-full" />
                Online now
              </span>
              <span className="text-muted-foreground">
                Real people, not AI — create an account to talk
              </span>
              <ArrowRight className="text-muted-foreground size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </RevealItem>

          <RevealItem>
            <h1 className="text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.035em] sm:text-6xl lg:text-[4.25rem]">
              Everyone deserves someone who{" "}
              <span className="text-gradient font-display text-[1.08em] italic">
                truly listens
              </span>
              .
            </h1>
          </RevealItem>

          <RevealItem>
            <p className="text-muted-foreground mx-auto mt-7 max-w-2xl text-base leading-relaxed sm:text-lg">
              Whether it&rsquo;s your next startup, a difficult decision, or simply
              something on your mind — talk to a real person who listens without
              judgment. Create a free account, then message us any time or
              schedule a voice or face-to-face conversation.
            </p>
          </RevealItem>

          {/* One button. "Get started" and "Log in" both pointed at /sign-in,
              so this was two buttons for one destination — and offering a
              choice that isn't a choice just makes people stop and read twice.
              The sign-in screen serves returning and new visitors alike. */}
          <RevealItem className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Button asChild size="xl" variant="gradient" className="w-full sm:w-auto">
              <Link href="/sign-in">
                Get started
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </RevealItem>

          {/* The avatar row and the "4.9" rating that used to sit here were both
              fabricated — invented faces, and a score averaged over sessions
              that never happened. What remains describes how the service works,
              which is true on day one. */}
          <RevealItem className="mt-9 flex flex-col items-center gap-5 sm:flex-row sm:gap-7">
            <ul className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
              {trustPoints.slice(0, 3).map((point) => (
                <li key={point} className="flex items-center gap-1.5">
                  <ShieldCheck className="text-success size-3.5" />
                  {point}
                </li>
              ))}
            </ul>
          </RevealItem>
        </Stagger>

        <div className="mt-16 sm:mt-20">
          <HeroVisual />
        </div>

        <Reveal delay={0.2} className="mt-14 text-center">
          <p className="text-muted-foreground mx-auto max-w-2xl text-xs leading-relaxed">
            SnugTalk is a human connection service — not therapy, counseling, or
            mental health treatment.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
