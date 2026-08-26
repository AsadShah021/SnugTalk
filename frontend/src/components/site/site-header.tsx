"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, Sparkles } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/brand/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { mainNav } from "@/lib/data/site";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const { user, ready } = useAuth();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // A plain passive listener rather than framer's `useScroll`: it reads the real
  // position on mount and again shortly after, so a page opened part-way down
  // (refresh, scroll restoration, an #anchor link) never leaves a transparent
  // header sitting directly on top of content.
  React.useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    const settle = window.setTimeout(update, 300);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("scroll", update);
    };
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4">
      {/* Scrim: fades page content out as it passes beneath the floating pill,
          so nothing is ever left half-visible against the top edge. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 -z-10 h-[180%] transition-opacity duration-300",
          "bg-linear-to-b from-background via-background/85 to-transparent",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />

      <div className="container-page">
        {/* Padding animates in CSS rather than JS — it's a layout property, so
            driving it per-frame from the main thread isn't worth it. */}
        <div
          className={cn(
            "flex items-center justify-between gap-4 rounded-2xl px-4 transition-[background,box-shadow,border-color,padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-5",
            scrolled ? "glass py-2" : "border border-transparent bg-transparent py-3 shadow-none",
          )}
        >
          <Logo />

          {/* Desktop navigation — the Services mega-menu is parked with the
              /services route; restore both together. */}
          {/* Guarded on length: an empty <nav> is still a landmark, and screen
              readers announce a navigation region with nothing in it. */}
          {mainNav.length > 0 && (
            <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center rounded-full px-3.5 text-sm font-medium transition-colors",
                    isActive(item.href) && "text-primary",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-1.5">
            <ThemeToggle className="hidden sm:inline-flex" />
            {/* `ready` gates this so the signed-out buttons don't flash for a
                signed-in visitor while the stored session is being read. */}
            {ready && user ? (
              <Button asChild variant="gradient" size="sm" className="hidden sm:inline-flex">
                <Link href="/dashboard">
                  Go to dashboard <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            ) : (
              // One button: "Log in" pointed at the same page, and the
              // sign-in screen already serves returning and new visitors alike.
              <Button asChild variant="gradient" size="sm" className="hidden sm:inline-flex">
                <Link href="/sign-in">
                  Get started <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            )}

            {/* Mobile */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(23rem,92vw)] overflow-y-auto p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex flex-col gap-6 p-6 pt-7">
                  <Logo />

                  {mainNav.length > 0 && (
                    <nav className="flex flex-col gap-1" aria-label="Mobile">
                      {mainNav.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "hover:bg-accent rounded-xl px-3 py-3 text-[0.95rem] font-medium transition-colors",
                            isActive(item.href) && "text-primary bg-accent/60",
                          )}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </nav>
                  )}

                  <Separator />

                  <div className="flex flex-col gap-2.5">
                    {ready && user ? (
                      <Button asChild variant="gradient" size="lg">
                        <Link href="/dashboard">
                          Go to dashboard <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild variant="gradient" size="lg">
                        <Link href="/sign-in">
                          Get started <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3">
                    <span className="text-muted-foreground flex items-center gap-2 text-sm">
                      <Sparkles className="size-4" /> Appearance
                    </span>
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
