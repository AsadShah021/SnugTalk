import { LegalPage, type LegalSection } from "@/components/marketing/legal-page";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Terms of service",
  description:
    "The agreement between you and SnugTalk, including the important limits of what this service is.",
  path: "/terms",
});

const sections: LegalSection[] = [
  {
    heading: "What SnugTalk is",
    paragraphs: [
      "SnugTalk connects members with trained human listeners for non-clinical conversations by text, voice, or video.",
      "SnugTalk is not therapy, counseling, psychotherapy, or mental health treatment. Listeners do not diagnose conditions, provide clinical advice, prescribe anything, or deliver any form of medical or psychological care. Nothing said in a session should be treated as professional advice of any kind — medical, legal, financial, or otherwise.",
      "If you are experiencing a mental health crisis or a medical emergency, contact your local emergency services or a licensed professional immediately. Our listeners are trained to recognise these situations and will end a session to direct you to appropriate help.",
    ],
  },
  {
    heading: "Eligibility",
    paragraphs: [
      "You must be at least 18 years old to hold an account. Accounts are personal and may not be shared, resold, or used on behalf of another person without their knowledge.",
    ],
  },
  /*
   * This section used to set out billing terms for Starter, Professional and
   * Unlimited plans — renewal, proration, rollover, refunds, per-day fair use.
   * None of it existed: there is no pricing page, no plans and no billing in
   * the product. Terms are a contract, so describing commercial terms we don't
   * operate is worse than saying nothing.
   *
   * When plans do launch, the old wording is in git history at the commit that
   * removed it — restore it alongside a real pricing page, not before.
   */
  {
    heading: "What it costs",
    paragraphs: [
      "SnugTalk is free while we are in testing. There are no plans, no subscriptions and no billing — we do not ask for a card, and there is nothing to cancel.",
      "If we introduce paid plans we will publish the prices and terms here first, and we will email you before anything you use becomes chargeable. Nothing you do today will be billed to you later.",
    ],
  },
  {
    heading: "Meeting requests and cancellations",
    paragraphs: [
      "Voice and Google Meet sessions are arranged by request rather than self-serve booking. Submitting a request does not reserve a time: nothing is confirmed until we email you a confirmed slot. We aim to respond within four hours and will always respond, including when we cannot offer any of the times you gave us.",
      "Once a session is confirmed you may reschedule or cancel at any point before it starts — just tell us. If you miss one without notice we will follow up rather than penalise you.",
      "If we cancel or fail to attend, we will apologise and arrange a replacement.",
    ],
  },
  {
    heading: "Chat",
    paragraphs: [
      "Chat is answered by whoever on the team is on shift, and is not a real-time or guaranteed-response channel. We usually reply within minutes during our hours and by the next morning outside them, but chat must never be relied on for anything urgent.",
      "Chat is not monitored for emergencies. If you are at risk of harm, contact your local emergency services rather than waiting for a reply here.",
    ],
  },
  {
    heading: "Acceptable conduct",
    paragraphs: [
      "Listeners are people doing skilled work. Abuse, harassment, discriminatory language, sexual solicitation, or attempts to move a conversation off-platform will end a session immediately and may end your account.",
      "You may not record sessions. You may not use the service to obtain services we do not provide, including clinical care, legal representation, or financial advice.",
    ],
  },
  {
    heading: "Who your listener is",
    paragraphs: [
      "Every listener is a member of the SnugTalk in-house team. We do not operate a marketplace, we do not engage freelance or contract listeners, and we are not recruiting — a small in-house team is the only group of people who will ever reply to you.",
      "They are trained and supervised, but they are not licensed clinicians acting in a clinical capacity through this service, and nothing they say is clinical advice.",
    ],
  },
  {
    heading: "Limitation of liability",
    paragraphs: [
      "To the fullest extent permitted by law, SnugTalk's total liability arising from your use of the service is limited to the amount you paid us in the twelve months preceding the claim.",
      "We do not accept liability for decisions you make following a conversation. The service exists to help you think; the choices remain entirely yours.",
    ],
  },
  {
    heading: "Changes to these terms",
    paragraphs: [
      "If we make a material change we will email you at least 30 days before it takes effect. Continuing to use the service after that date means you accept the revised terms; if you don't, cancel and we'll part on good terms.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: ["Questions about these terms go to legal@snugtalk.tech."],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="The agreement, in"
      highlight="plain language"
      updated="2 August 2026"
      intro="Section one is the one that matters most: SnugTalk is not therapy. Please read it even if you skip the rest."
      sections={sections}
    />
  );
}
