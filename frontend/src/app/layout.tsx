import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter } from "next/font/google";

import { MotionProvider } from "@/components/brand/motion-provider";
import { VerificationGuard } from "@/components/auth/verification-guard";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/components/brand/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { site } from "@/lib/data/site";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Everyone deserves someone who truly listens`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [...site.keywords],
  authors: [{ name: site.name }],
  creator: site.name,
  applicationName: site.name,
  category: "lifestyle",
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — Everyone deserves someone who truly listens`,
    description: site.description,
    locale: site.locale,
  },
  twitter: {
    card: "summary_large_image",
    site: site.twitter,
    title: `${site.name} — Everyone deserves someone who truly listens`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  /*
   * Icons are deliberately not listed here.
   *
   * Setting `icons` explicitly stops Next merging the file conventions, which
   * is how the apple-touch-icon link went missing: /apple-icon rendered fine
   * but nothing in <head> pointed at it. `icon.svg`, `apple-icon.tsx` and
   * `opengraph-image.tsx` all sit in this directory and are picked up on their
   * own — moving icon.svg out of /public is what makes that work.
   */
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfd" },
    { media: "(prefers-color-scheme: dark)", color: "#14131c" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${instrumentSerif.variable} font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MotionProvider>
            <AuthProvider>
            <TooltipProvider>
              <a
                href="#main"
                className="bg-primary text-primary-foreground focus:ring-ring sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-full focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:ring-2"
              >
                Skip to content
              </a>
              <VerificationGuard />
              {children}
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
