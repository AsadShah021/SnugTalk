import {
  CalendarClock,
  Headphones,
  MessageSquareText,
  Mic,
  Video,
} from "lucide-react";

import type { NavItem, SessionMode, SessionModeMeta } from "@/types";

export const site = {
  name: "SnugTalk",
  tagline: "Everyone deserves someone who truly listens.",
  description:
    "SnugTalk is a small team of trained listeners. Chat with us now, or request a voice or Google Meet conversation and we'll confirm a time. Not therapy — real people who listen.",
  /**
   * Canonical origin, used for metadata, OG tags and the sitemap. Set
   * NEXT_PUBLIC_SITE_URL to move domains without touching code — the default
   * is the staging domain we launched on.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://snugtalk.tech",
  locale: "en_US",
  /**
   * Must match the domain we actually own. This read `@snugtalk.com` — a
   * domain belonging to someone else — so every "contact us" link on the site
   * sent mail to a stranger, and none of it ever reached us.
   */
  email: "hello@snugtalk.tech",
  twitter: "@snugtalk",
  /** Typical turnaround we promise on a meeting request. */
  requestResponseTime: "4 hours",
  keywords: [
    "human listener",
    "someone to talk to",
    "live chat listener",
    "idea validation",
    "business brainstorming",
    "confidence building",
    "non-judgmental listening",
    "google meet sessions",
    "subscription listening platform",
  ],
} as const;

/**
 * The one line that keeps this product legally and ethically legible.
 * Rendered anywhere a visitor might mistake us for a clinical service.
 */
export const disclaimer =
  "SnugTalk is not therapy, counseling, or mental health treatment. Our listeners are trained to listen — not to diagnose or treat. If you are in crisis, please contact your local emergency services.";

export const sessionModes: SessionModeMeta[] = [
  {
    id: "text",
    label: "Live chat with us",
    short: "Chat",
    description:
      "Open a chat and write. One of us reads it and replies in the same thread — no appointment, no waiting room.",
    icon: MessageSquareText,
    duration: "Start instantly",
    tone: "teal",
    booking: "instant",
  },
  {
    id: "voice",
    label: "Voice conversation",
    short: "Voice call",
    description:
      "A call with no camera. Just a voice on the other end, fully present. Tell us when suits and we'll confirm.",
    icon: Mic,
    duration: "30 or 45 min",
    tone: "violet",
    booking: "request",
  },
  {
    id: "meet-audio",
    label: "Google Meet audio",
    short: "Meet audio",
    description:
      "A scheduled audio session with a calendar invite, joined straight from your dashboard.",
    icon: Headphones,
    duration: "45 min",
    tone: "amber",
    booking: "request",
  },
  {
    id: "meet-video",
    label: "Google Meet video",
    short: "Meet video",
    description:
      "Face-to-face when you want to be seen as well as heard. Camera always optional.",
    icon: Video,
    duration: "45 or 60 min",
    tone: "rose",
    booking: "request",
    requiresPlan: "professional",
  },
];

export const sessionModeMap = Object.fromEntries(
  sessionModes.map((mode) => [mode.id, mode]),
) as Record<SessionMode, SessionModeMeta>;

/** The three formats that go through the request form rather than starting instantly. */
export const requestableModes = sessionModes.filter(
  (mode) => mode.booking === "request",
);

/*
 * Testing-phase navigation. Services, Our team, Pricing and About are parked —
 * their pages live under app/(marketing) as `_services`, `_listeners`,
 * `_pricing` and `_about`. To bring one back: drop the underscore from the
 * folder name and restore its entry below.
 */
/**
 * Header links. Deliberately empty: the landing page's only job is to get
 * someone to Get started or Log in, and anchor links competing with those CTAs
 * just gave people somewhere else to go. The sections still exist on the page
 * and are still linked from the footer.
 *
 * Every render site guards on `length`, so adding entries here brings the nav
 * back with no other changes.
 */
export const mainNav: NavItem[] = [];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Product",
    items: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Company",
    items: [{ label: "Contact", href: `mailto:${site.email}` }],
  },
  {
    title: "Resources",
    items: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
      { label: "Safety & crisis resources", href: "/#safety" },
    ],
  },
];

/** Post-login actions — both require an account. */
export const quickActions: NavItem[] = [
  { label: "Send a message", href: "/chat", icon: MessageSquareText },
  { label: "Schedule a meeting", href: "/book", icon: CalendarClock },
];
