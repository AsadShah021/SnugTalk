import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Privacy policy",
  description:
    "What SnugTalk collects, what we never do with it, and how to delete everything.",
  path: "/privacy",
});

const sections: LegalSection[] = [
  {
    heading: "What we collect",
    paragraphs: [
      "We collect the minimum needed to run a scheduling and messaging product: your name, email address, timezone, billing details (held by our payment processor, never by us), and the content of the text conversations you choose to have.",
    ],
    bullets: [
      "Account details — name, email, timezone, preferred conversation format",
      "Booking data — which listener, which format, when, and any topic note you write",
      "Message content — encrypted in transit and at rest",
      "Basic product analytics — page views and feature usage, never tied to conversation content",
    ],
  },
  {
    heading: "What we never do",
    paragraphs: [
      "These are commitments, not preferences, and they are not subject to change by a quiet policy update.",
    ],
    bullets: [
      "We never sell or rent your personal data to anyone",
      "We never train AI models on your conversations",
      "We never record voice or video sessions",
      "We never share anything with employers, insurers, or advertisers",
      "We never use conversation content to target marketing at you",
    ],
  },
  {
    heading: "Voice and video sessions",
    paragraphs: [
      "Voice calls and Google Meet sessions are not recorded, transcribed, or stored by SnugTalk. Google Meet sessions run on Google's infrastructure and are subject to Google's terms for the duration of the call; we generate the link and the calendar invitation, and nothing else about the call reaches our systems.",
      "Your listener may write a short summary note afterwards if you have that setting enabled. You can read, edit, or delete any note at any time.",
    ],
  },
  {
    heading: "Who can see your conversations",
    paragraphs: [
      "Only you and the listener you are speaking with. Our staff cannot read your message threads in the ordinary course of business.",
      "The narrow exception is a safeguarding review: if a listener escalates a concern that someone is at risk of serious harm, a named member of our safeguarding team may review the relevant messages. Every such access is logged, and we will tell you it happened unless doing so would itself create a risk.",
    ],
  },
  {
    heading: "How long we keep things",
    paragraphs: [
      "Conversation history retention follows your plan — 90 days on Starter, 12 months on Professional, indefinitely on Premium — and you can shorten this or turn history off entirely in your settings.",
      "When you delete your account we remove your personal data within 30 days, excluding anonymised billing records we are legally required to retain.",
    ],
  },
  {
    heading: "Your rights",
    paragraphs: [
      "Wherever you live, you can export everything we hold about you, correct anything inaccurate, and delete your account and its contents. Export and delete are both one-click actions in your settings — you never need to email us to exercise them.",
    ],
  },
  {
    heading: "Security",
    paragraphs: [
      "Message content is encrypted in transit with TLS 1.3 and at rest with AES-256. Access to production systems requires hardware-key multi-factor authentication and is logged. We run annual third-party penetration tests and operate to SOC 2 aligned controls.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "Privacy questions go to privacy@snugtalk.tech and are answered by a person, usually within two working days.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Your conversations are"
      highlight="yours"
      updated="2 August 2026"
      intro="This policy is written to be read, not to be survived. If anything here is unclear, that's our failure — tell us and we'll rewrite it."
      sections={sections}
    />
  );
}
