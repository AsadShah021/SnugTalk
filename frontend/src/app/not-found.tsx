import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { AuroraBackdrop } from "@/components/motion/aurora-backdrop";
import { Button } from "@/components/ui/button";
import { mainNav } from "@/lib/data/site";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <AuroraBackdrop intensity="subtle" className="mask-fade-b" />

      <header className="container-page relative py-6">
        <Logo />
      </header>

      <main
        id="main"
        className="container-page relative flex flex-1 flex-col items-center justify-center py-16 text-center"
      >
        <span className="bg-primary/8 text-primary ring-primary/12 mb-8 grid size-14 place-items-center rounded-2xl ring-1 ring-inset">
          <Compass className="size-6" />
        </span>

        <p className="text-muted-foreground text-sm font-medium">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          We couldn&rsquo;t find that page
        </h1>
        <p className="text-muted-foreground mt-4 max-w-md leading-relaxed">
          The link may be out of date. Everything worth reaching is a click away
          below — or start a conversation instead.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" variant="gradient">
            <Link href="/">
              <ArrowLeft className="size-4" /> Back home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/chat">Start a chat</Link>
          </Button>
        </div>

        {mainNav.length > 0 && (
          <nav className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-3" aria-label="Site">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </main>
    </div>
  );
}
