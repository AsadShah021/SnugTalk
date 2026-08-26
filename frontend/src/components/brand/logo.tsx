"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { site } from "@/lib/data/site";

/**
 * The mark: a speech bubble with a play triangle inside it — the two things an
 * account can actually do here, in one shape. Chat, and a conversation you
 * start.
 *
 * Two solid masses and nothing finer, which is what lets it survive being
 * shrunk to a 16px browser tab. The previous mark put a thin spiral inside the
 * bubble; below about 24px it closed up into a blob.
 */
export function LogoMark({ className }: { className?: string }) {
  /*
   * The gradient needs an id, and this component renders more than once per
   * page — header, footer, and the mobile menu. A hardcoded id put duplicates
   * in the DOM, which is invalid and leaves the gradient resolving against
   * whichever copy the browser happened to index first. `useId` is stable
   * across server and client render, so hydration still matches.
   */
  const gradientId = React.useId();

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={cn("size-8", className)}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="4"
          y1="3"
          x2="28"
          y2="29"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--brand-violet)" />
          <stop offset="0.55" stopColor="var(--brand-violet-soft)" />
          <stop offset="1" stopColor="var(--brand-amber)" />
        </linearGradient>
      </defs>

      <path
        d="M16 3.5c7.18 0 12.5 4.6 12.5 10.7 0 6.1-5.32 10.7-12.5 10.7-1.16 0-2.29-.1-3.36-.3l-5.3 3.16a.9.9 0 0 1-1.36-.86l.36-4.6C3.6 20.3 3.5 17.3 3.5 14.2 3.5 8.1 8.82 3.5 16 3.5Z"
        fill={`url(#${gradientId})`}
      />

      {/* Nudged right of true centre: a triangle looks off-centre when it is
          mathematically centred, because its visual mass sits to the left. */}
      <path
        d="M13.6 10.6l6.5 3.2a.6.6 0 0 1 0 1.08l-6.5 3.2a.6.6 0 0 1-.87-.54v-6.4a.6.6 0 0 1 .87-.54Z"
        fill="white"
        fillOpacity="0.95"
      />
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
  showWordmark = true,
}: {
  className?: string;
  href?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={`${site.name} home`}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-full transition-opacity hover:opacity-85 focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none",
        className,
      )}
    >
      <LogoMark className="size-8 transition-transform duration-500 group-hover:rotate-[-6deg]" />
      {showWordmark && (
        <span className="text-[1.0625rem] font-semibold tracking-[-0.02em]">
          Snug<span className="text-primary">Talk</span>
        </span>
      )}
    </Link>
  );
}
