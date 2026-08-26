import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AuroraBackdrop } from "@/components/motion/aurora-backdrop";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { trustPoints } from "@/lib/data/marketing";

export function CtaSection() {
  return (
    <section className="relative px-5 pb-20 sm:px-8 lg:pb-28">
      <div className="container-page px-0!">
        <Reveal preset="scale">
          <div className="border-border/70 bg-card relative overflow-hidden rounded-[2rem] border px-6 py-16 text-center sm:px-12 sm:py-20">
            <AuroraBackdrop intensity="bold" />
            <div
              aria-hidden
              className="bg-dots pointer-events-none absolute inset-0 opacity-30"
            />

            <div className="relative mx-auto flex max-w-2xl flex-col items-center">
              <h2 className="text-3xl leading-[1.1] font-semibold tracking-[-0.03em] sm:text-4xl lg:text-5xl">
                Someone is ready to listen{" "}
                <span className="font-display text-[1.08em] italic">right now</span>.
              </h2>
              <p className="text-muted-foreground mt-5 max-w-lg text-base leading-relaxed">
                Creating an account takes a minute and costs nothing. Once
                you&rsquo;re in you can message us whenever you like, or ask for
                a voice or face-to-face conversation. No pressure at any step.
              </p>

              <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Button asChild size="xl" variant="gradient" className="w-full sm:w-auto">
                  <Link href="/sign-in">
                    Get started <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="xl" variant="outline" className="w-full sm:w-auto">
                  <Link href="/sign-in">Log in</Link>
                </Button>
              </div>

              <ul className="text-muted-foreground mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
                {trustPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
