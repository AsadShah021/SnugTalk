import { Quote } from "lucide-react";

import { ListenerAvatar } from "@/components/brand/listener-avatar";
import { ModeBadge } from "@/components/shared/mode-badge";
import { Section, SectionHeading } from "@/components/shared/section";
import { testimonials } from "@/lib/data/marketing";
import type { Testimonial } from "@/types";

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <figure className="border-border/70 bg-card flex w-[21rem] shrink-0 flex-col gap-5 rounded-3xl border p-6 sm:w-[24rem]">
      <Quote className="text-primary/25 size-7" aria-hidden />
      <blockquote className="text-[0.95rem] leading-relaxed">
        {item.quote}
      </blockquote>
      <figcaption className="border-border/60 mt-auto flex items-center gap-3 border-t pt-5">
        <ListenerAvatar name={item.name} src={item.avatar} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{item.name}</p>
          <p className="text-muted-foreground truncate text-xs">{item.role}</p>
        </div>
        <ModeBadge mode={item.mode} showLabel={false} />
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  // Nothing to show until real members have said something and agreed to it
  // being published. Renders nothing rather than an empty section.
  if (testimonials.length === 0) return null;

  const rowOne = testimonials.slice(0, 3);
  const rowTwo = testimonials.slice(3);

  return (
    <Section id="stories" className="overflow-hidden">
      <div className="container-page">
        <SectionHeading
          eyebrow="In their words"
          title="What changes when someone actually listens"
          description="Members describe the same thing in different ways: the relief of not having to perform."
        />
      </div>

      <div className="mask-fade-x mt-14 flex flex-col gap-4">
        {[rowOne, rowTwo].map((row, rowIndex) => (
          <div key={rowIndex} className="flex overflow-hidden">
            <div
              className="animate-marquee flex shrink-0 gap-4 pr-4 hover:[animation-play-state:paused]"
              style={{
                animationDirection: rowIndex === 1 ? "reverse" : "normal",
                animationDuration: rowIndex === 1 ? "52s" : "44s",
              }}
            >
              {/* Duplicated once so the loop is seamless at -50% */}
              {[...row, ...row, ...row, ...row].map((item, index) => (
                <TestimonialCard key={`${item.id}-${index}`} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
