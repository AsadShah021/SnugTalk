import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { disclaimer, footerNav, site } from "@/lib/data/site";

export function SiteFooter() {
  return (
    <footer className="border-border/70 relative border-t">
      <div className="container-page py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_2fr]">
          <div className="flex flex-col gap-6">
            <Logo />
            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
              A premium human connection platform. Real listeners, real
              conversations, over text, voice, or face to face.
            </p>

            {/*
             * A newsletter form stood here with no submit handler and no `name`
             * on its input, so pressing Subscribe discarded the address and
             * said nothing. Collecting an email address and silently dropping
             * it is worse than not asking: the person believes they subscribed.
             *
             * Bring it back when there is a list to add them to — Resend
             * audiences plus an endpoint — along with real success and error
             * states. The footer already carries a "Get started" below, so
             * nothing replaces it here.
             */}
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerNav.map((group) => (
              <div key={group.title}>
                <h3 className="mb-4 text-sm font-semibold">{group.title}</h3>
                <ul className="flex flex-col gap-3">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        // `inline-block` + padding so the tap target clears the
                        // 24px WCAG 2.2 minimum. As bare inline text these were
                        // 17px tall, which is a small thing to hit on a phone.
                        className="text-muted-foreground hover:text-foreground inline-block py-1 text-sm transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-10" />

        {/* The line that has to be unmissable on every page */}
        <div className="bg-muted/45 border-border/60 flex flex-col gap-3 rounded-2xl border p-5 sm:flex-row sm:items-start sm:gap-4">
          <ShieldCheck className="text-primary mt-0.5 size-5 shrink-0" />
          <p className="text-muted-foreground text-xs leading-relaxed">
            <span className="text-foreground font-medium">
              Important:{" "}
            </span>
            {disclaimer}
          </p>
        </div>

        <div className="mt-10 flex flex-col-reverse items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          {/* Privacy, Terms and Safety all live in the Resources column above.
              Repeating them here meant four duplicate links in one footer. */}
          <Button asChild variant="ghost" size="sm">
            <Link href="/sign-in">
              Get started <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}
