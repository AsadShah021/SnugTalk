"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { API_BASE, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { easeOutExpo } from "@/lib/motion";

/** Inline provider marks — no external requests, and they theme correctly. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.86-.08-1.7-.22-2.5H12v4.73h6.45a5.5 5.5 0 0 1-2.39 3.62v3h3.86c2.26-2.08 3.58-5.15 3.58-8.85Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.86-3c-1.08.72-2.45 1.16-4.08 1.16-3.13 0-5.78-2.12-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.62l3.98 3.09C6.22 6.87 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

type Mode = "sign-in" | "sign-up" | "forgot";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp } = useAuth();
  // Where middleware wanted them to land before it bounced them here.
  const next = searchParams.get("next") || "/dashboard";
  const oauthError = searchParams.get("error");

  // The Google callback redirects back with ?error=... when something failed.
  React.useEffect(() => {
    if (oauthError) toast.error(oauthError);
  }, [oauthError]);
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const name = String(form.get("name") ?? "").trim();
    const password = String(form.get("password") ?? "");

    setLoading(true);

    if (mode === "forgot") {
      // Password reset needs an email service; not wired yet.
      await new Promise((resolve) => setTimeout(resolve, 600));
      setLoading(false);
      setSent(true);
      toast.success("Reset link sent", {
        description: "Check your inbox — the link is valid for one hour.",
      });
      return;
    }

    let user;
    let emailSent = true;

    try {
      if (mode === "sign-up") {
        ({ user, emailSent } = await signUp(name, email, password));
      } else {
        user = await signIn(email, password);
      }
    } catch (error) {
      setLoading(false);
      // The API returns a readable message for both "email taken" and
      // "email or password is incorrect".
      toast.error(
        error instanceof ApiError ? error.message : "Something went wrong. Try again.",
      );
      return;
    }

    setLoading(false);

    // An unproven address can't reach anything useful, so send them to the code
    // screen rather than to a dashboard where every action would fail.
    if (!user.isVerified) {
      if (emailSent) {
        toast.success("Check your inbox", {
          description: `We sent a 6-digit code to ${user.email}.`,
        });
      } else {
        toast.error("We couldn't send your code", {
          description: "Your account is ready — try again from the next screen.",
        });
      }
      router.push(`/verify-email?next=${encodeURIComponent(next)}`);
      router.refresh();
      return;
    }

    toast.success(mode === "sign-up" ? "Welcome to SnugTalk" : "Welcome back", {
      description: "You can message us or schedule a meeting from your dashboard.",
    });
    router.push(next);
    router.refresh();
  }

  if (mode === "forgot" && sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeOutExpo }}
        className="flex flex-col gap-5 text-center"
      >
        <h1 className="text-2xl font-semibold tracking-[-0.025em]">Check your inbox</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          If an account exists for that address, we&rsquo;ve sent a reset link.
          It expires in one hour.
        </p>
        <Button asChild variant="outline">
          <Link href="/sign-in">Back to sign in</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOutExpo }}
      className="flex flex-col gap-7"
    >
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
          {/* Neutral, because every "Get started" now lands here. Greeting a
              first-time visitor with "Welcome back" tells them, wrongly, that
              they're in the wrong place. */}
          {mode === "sign-in" && "Welcome to SnugTalk"}
          {mode === "sign-up" && "Start your first conversation"}
          {mode === "forgot" && "Reset your password"}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {mode === "sign-in" &&
            "Sign in to pick up where you left off — or create an account, it only takes a minute."}
          {mode === "sign-up" && "Create an account in under a minute. No card required to start chatting."}
          {mode === "forgot" && "Enter your email and we'll send you a link to set a new password."}
        </p>
      </header>

      {mode !== "forgot" && (
        <>
          {/* A plain link, not a fetch: OAuth is a full-page redirect to
              Google and back, so the browser has to navigate. */}
          <Button asChild type="button" variant="outline" size="lg">
            <a href={`${API_BASE}/api/auth/google`}>
              <GoogleMark /> Continue with Google
            </a>
          </Button>

          <div className="relative">
            <Separator />
            <span className="bg-background text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs">
              or with email
            </span>
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "sign-up" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required autoComplete="name" placeholder="Alex Morgan" />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        {mode !== "forgot" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {mode === "sign-in" && (
                <Link
                  href="/forgot-password"
                  className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                >
                  Forgot?
                </Link>
              )}
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                placeholder={mode === "sign-up" ? "At least 8 characters" : "••••••••"}
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded-lg transition-colors outline-none focus-visible:ring-[3px]"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        )}

        <Button type="submit" variant="gradient" size="lg" disabled={loading} className="mt-2">
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              {mode === "sign-in" && "Sign in"}
              {mode === "sign-up" && "Create account"}
              {mode === "forgot" && "Send reset link"}
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      {mode === "sign-up" && (
        <p className="text-muted-foreground text-xs leading-relaxed">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-foreground underline underline-offset-4">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-foreground underline underline-offset-4">
            Privacy Policy
          </Link>
          . SnugTalk is not therapy or mental health treatment.
        </p>
      )}

      <p className="text-muted-foreground text-center text-sm">
        {mode === "sign-in" ? (
          <>
            New here?{" "}
            <Link href="/sign-up" className="text-foreground font-medium underline underline-offset-4">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/sign-in" className="text-foreground font-medium underline underline-offset-4">
              Sign in
            </Link>
          </>
        )}
      </p>
    </motion.div>
  );
}
