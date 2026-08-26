import { site } from "@/lib/data/site";
import type { Faq, Testimonial } from "@/types";

/**
 * EMPTY ON PURPOSE.
 *
 * Every quote here used to be invented, with invented names. Publishing a made-up
 * review is deceptive advertising (FTC endorsement guides in the US, Australian
 * Consumer Law s18 here) — and on a product whose entire promise is honesty
 * about being heard, it is the worst possible thing to fake.
 *
 * Add entries only when a real member has said the words and agreed to them
 * being published. The section hides itself while this is empty.
 */
export const testimonials: Testimonial[] = [];

/*
 * Testing-phase FAQ. Questions about pricing, favourite listeners, feedback
 * mode, anonymous mode and standing check-ins are parked with the features they
 * describe — restore them here when those come back.
 */
export const faqs: Faq[] = [
  {
    question: "Is this therapy?",
    answer:
      "No. SnugTalk is not therapy, counseling, or mental health treatment, and we do not diagnose, treat, or give clinical advice. This is a human connection service: trained people who give you their full attention while you think out loud. If you are looking for clinical care, or you are in crisis, please contact a licensed provider or your local emergency services — we keep a list of resources on our safety page.",
    category: "basics",
  },
  {
    question: "Who exactly am I talking to?",
    answer:
      "Us. SnugTalk is a small in-house team of trained listeners — never AI, and never freelancers we've never met. We don't run a marketplace and we're not recruiting: the same few people answer every chat and every meeting.",
    category: "basics",
  },
  {
    question: "How does the chat work?",
    answer:
      "Open a chat from any page and start writing — no appointment needed. Whoever is on shift reads it and replies in the same thread, usually within a few minutes during our hours and by the next morning outside them. You can write three words or three paragraphs, leave and come back hours later, and pick the thread up exactly where you left it. Nobody will rush you toward a call.",
    category: "sessions",
  },
  {
    question: "How do I get a voice or video meeting?",
    answer:
      `You send us a short request rather than picking a slot from a calendar — your name, your email, and what you'd like to talk about. We're notified straight away, a real person reads it, and we email you to agree a time that suits you, usually within ${site.requestResponseTime}. We do it this way on purpose: you get matched thoughtfully rather than by whoever happens to have a gap.`,
    category: "sessions",
  },
  {
    question: "How do Google Meet sessions work?",
    answer:
      "Once we've agreed a time, we generate the Google Meet link and send a calendar invitation to you and your listener. You don't need a Google account to join — the link works in any modern browser, and your camera is always optional.",
    category: "sessions",
  },
  {
    question: "Are conversations confidential?",
    answer:
      "Yes. Chats are encrypted in transit and at rest, and only you and the listener replying can read them. We never sell data, never train models on your conversations, and never share anything with employers, insurers, or advertisers. Live sessions are not recorded. Notes are written only if you ask for them, and you can delete any note — or your whole account and history — at any time.",
    category: "privacy",
  },
];

/**
 * Deliberately not numbers.
 *
 * These used to be "9,600+ conversations held" and "4.9/5 average rating",
 * both computed from a list of people who do not exist. Everything here now is
 * a statement of how the service works, which is true on day one and does not
 * quietly become a lie as the product changes.
 */
export const trustStats = [
  { value: "Real people", label: "Never AI, never scripted" },
  { value: "Private", label: "Encrypted, never recorded" },
  { value: site.requestResponseTime, label: "Typical reply to a request" },
  { value: "Not therapy", label: "And we always say so" },
];

export const trustPoints = [
  "Real people, never AI",
  "Chat replies in minutes",
  "End-to-end encrypted",
  "Nothing recorded",
];
