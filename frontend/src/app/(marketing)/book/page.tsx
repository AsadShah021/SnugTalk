import { MeetingRequestForm } from "@/components/booking/meeting-request-form";
import { MemberOnly } from "@/components/dashboard/member-only";
import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/shared/section";
import { site } from "@/lib/data/site";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Request a meeting",
  description:
    "Tell us your name, your email and what you'd like to talk about. A real person reads every request and gets in touch to arrange a time.",
  path: "/book",
});

export default function BookPage() {
  return (
    <MemberOnly>
      <PageHero
        eyebrow={`A person replies within ${site.requestResponseTime}`}
        title="Tell us what's on your mind and"
        highlight="we'll set it up"
        description="Three things: who you are, where to reach you, and what you'd like to talk about. We read every request ourselves and come back to arrange a time."
        className="pb-10"
      />

      <Section className="pt-0">
        <div className="container-page">
          <MeetingRequestForm />
        </div>
      </Section>
    </MemberOnly>
  );
}
