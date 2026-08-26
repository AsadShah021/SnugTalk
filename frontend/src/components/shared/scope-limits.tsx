import { Check, LifeBuoy, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Service } from "@/types";

/**
 * Shown on topics flagged `escalation` — currently harassment.
 *
 * These are conversations where listening genuinely helps but is not on its own
 * sufficient, and where someone may still be in danger. Saying plainly what we
 * will and will not do, *before* anyone books, is the point: it prevents the
 * service being mistaken for advocacy, legal advice, or a reporting channel, and
 * it puts specialist organisations in front of people who need them now rather
 * than after a session that could not have helped.
 */
export function ScopeLimits({
  service,
  className,
}: {
  service: Service;
  className?: string;
}) {
  const can = [
    "Listen to the whole thing, at whatever pace you need",
    "Believe you without asking you to prove anything",
    "Stay with it over several conversations if you want",
    "Help you find the organisation that handles the rest",
  ];

  const cannot = [
    "Give legal advice, or tell you whether it meets a legal definition",
    "Report it, contact anyone, or intervene on your behalf",
    "Act as evidence, a witness statement, or a formal record",
    "Provide therapy, trauma treatment, or emergency support",
  ];

  return (
    <aside
      className={cn(
        "border-border/70 bg-card overflow-hidden rounded-2xl border",
        className,
      )}
    >
      <div className="border-border/60 border-b px-5 py-4">
        <h3 className="text-sm font-semibold">
          What we can and can&rsquo;t do here
        </h3>
        <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
          We&rsquo;d rather be exact about this before you decide, than have you
          find out mid-conversation.
        </p>
      </div>

      <div className="divide-border/60 grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <p className="text-success mb-3 text-xs font-semibold tracking-wide uppercase">
            We can
          </p>
          <ul className="flex flex-col gap-2.5">
            {can.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm">
                <Check className="text-success mt-0.5 size-3.5 shrink-0" strokeWidth={3} />
                <span className="text-muted-foreground leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5">
          <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
            We can&rsquo;t
          </p>
          <ul className="flex flex-col gap-2.5">
            {cannot.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm">
                <X className="text-destructive mt-0.5 size-3.5 shrink-0" strokeWidth={3} />
                <span className="text-muted-foreground leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {service.supportLines && service.supportLines.length > 0 && (
        <div className="border-border/60 bg-muted/30 border-t px-5 py-4">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold">
            <LifeBuoy className="size-3.5" />
            Organisations that handle what we can&rsquo;t
          </p>
          <dl className="grid gap-2.5 sm:grid-cols-2">
            {service.supportLines.map((resource) => (
              <div key={resource.region}>
                <dt className="text-xs font-medium">{resource.region}</dt>
                <dd className="text-muted-foreground text-xs">{resource.line}</dd>
              </div>
            ))}
          </dl>
          <p className="text-muted-foreground mt-4 text-xs leading-relaxed">
            If you are in immediate danger, contact your local emergency services
            — we are not monitored for emergencies.
          </p>
        </div>
      )}
    </aside>
  );
}
