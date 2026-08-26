import { Check, X } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHeading } from "@/components/shared/section";
import { cn } from "@/lib/utils";

const isThis = [
  "A trained human giving you their full attention",
  "Space to think out loud without being judged",
  "Encouragement, curiosity and honest reflection",
  "Somewhere to bring an idea before it's ready",
  "A consistent person who remembers last time",
];

const isNotThis = [
  "Therapy, counseling or clinical treatment",
  "Diagnosis, prescriptions or medical advice",
  "Crisis or emergency support",
  "An AI companion or a chatbot",
  "A coach telling you what to do next",
];

export function NotTherapy() {
  return (
    <Section id="what-this-is" className="bg-muted/25">
      <div className="container-page">
        <SectionHeading
          eyebrow="Let's be precise"
          title="What this is — and what it isn't"
          description="We'd rather be clear now than have you find out later. Both columns matter."
        />

        <div className="mx-auto mt-14 grid max-w-4xl gap-4 md:grid-cols-2">
          {[
            { title: "What SnugTalk is", items: isThis, positive: true },
            { title: "What SnugTalk is not", items: isNotThis, positive: false },
          ].map((column, index) => (
            <Reveal
              key={column.title}
              delay={index * 0.1}
              preset={index === 0 ? "left" : "right"}
            >
              <div
                className={cn(
                  "h-full rounded-3xl border p-7",
                  column.positive
                    ? "border-success/25 bg-success/[0.04]"
                    : "border-border/70 bg-card",
                )}
              >
                <h3 className="mb-6 text-base font-semibold">{column.title}</h3>
                <ul className="flex flex-col gap-4">
                  {column.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                          column.positive
                            ? "bg-success/15 text-success"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {column.positive ? (
                          <Check className="size-3" />
                        ) : (
                          <X className="size-3" />
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-sm leading-relaxed",
                          column.positive ? "" : "text-muted-foreground",
                        )}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15} className="mt-8 text-center">
          <p className="text-muted-foreground mx-auto max-w-2xl text-sm leading-relaxed">
            If you are in crisis or need clinical care, please contact a licensed
            provider or your local emergency services.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
