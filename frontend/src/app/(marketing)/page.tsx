import { CtaSection } from "@/components/marketing/cta-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { NotTherapy } from "@/components/marketing/not-therapy";
import { Testimonials } from "@/components/marketing/testimonials";
import { TrustBar } from "@/components/marketing/trust-bar";
import { faqs } from "@/lib/data/marketing";
import { faqJsonLd, JsonLd, organizationJsonLd } from "@/lib/seo";

/*
 * Testing-phase landing page: hero → how it works → request a meeting.
 *
 * Parked until we're ready for them — the components still exist and are still
 * type-checked, they're just not rendered. Re-adding any of them is one import
 * and one line:
 *
 *   <ConversationModes />   components/marketing/conversation-modes.tsx
 *   <ServicesGrid />        components/marketing/services-grid.tsx
 *   <FeaturedListeners />   components/marketing/featured-listeners.tsx
 *   <FeatureBento />        components/marketing/feature-bento.tsx
 *   <PricingSection />      components/marketing/pricing-section.tsx
 *
 * The matching pages are parked as `_about`, `_pricing`, `_services` and
 * `_listeners` under app/(marketing) — drop the underscore to bring a route
 * back. See TESTING-SCOPE.md.
 */
export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={faqJsonLd(faqs)} />

      <Hero />
      <TrustBar />
      <HowItWorks />
      <Testimonials />
      <NotTherapy />
      <FaqSection />
      <CtaSection />
    </>
  );
}
