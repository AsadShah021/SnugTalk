import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { Logo, LogoMark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/brand/theme-toggle";
import { AuroraBackdrop } from "@/components/motion/aurora-backdrop";
import { trustPoints } from "@/lib/data/marketing";
import { site } from "@/lib/data/site";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative min-h-dvh lg:grid lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="bg-muted/30 relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        <AuroraBackdrop intensity="bold" />
        <div
          aria-hidden
          className="bg-dots pointer-events-none absolute inset-0 opacity-30"
        />

        <div className="relative">
          <Logo />
        </div>

        {/*
         * This was a testimonial: an invented member, "Dara Osei · Founder ·
         * Professional plan", quoted praising a session that never happened.
         * It's the last of the fabricated reviews.
         *
         * A founder's note belongs here and would be honest — Shafqat really is
         * the founder. But the words have to be his. `lib/data/founders.ts`
         * already holds his name, role and photo with an empty `letter` waiting
         * for exactly that; drop it in and this panel can carry it.
         */}
        <div className="relative max-w-md">
          <p className="text-2xl leading-[1.35] font-semibold tracking-[-0.025em]">
            {site.tagline}
          </p>
          <p className="text-muted-foreground mt-5 leading-relaxed">
            Chat with us any time, or ask for a voice or Google Meet
            conversation and we&rsquo;ll find a time that suits you. Real
            people, no scripts, no judgment.
          </p>
        </div>

        <ul className="text-muted-foreground relative flex flex-wrap gap-x-6 gap-y-2 text-xs">
          {trustPoints.map((point) => (
            <li key={point} className="flex items-center gap-1.5">
              <ShieldCheck className="text-success size-3.5" />
              {point}
            </li>
          ))}
        </ul>
      </aside>

      {/* Form panel */}
      <main
        id="main"
        className="relative flex min-h-dvh flex-col px-5 py-8 sm:px-8 lg:px-12"
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span className="lg:hidden">
              <LogoMark className="size-6" />
            </span>
            <span className="hidden lg:inline">Back to site</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}
