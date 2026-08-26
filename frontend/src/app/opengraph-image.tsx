import { ImageResponse } from "next/og";

import { site } from "@/lib/data/site";

/*
 * The card that appears when a SnugTalk link is shared.
 *
 * `twitter.card` was already set to "summary_large_image" while no image
 * existed, so every link pasted into WhatsApp, Slack, LinkedIn or X rendered
 * as a blank rectangle. Next serves this file for both Open Graph and Twitter
 * automatically.
 *
 * Deliberately quiet: the mark, the promise, and the boundary. No invented
 * numbers, no faces.
 */
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "76px 84px",
          background: "#fbfbfd",
          // A soft brand wash rather than a full-bleed gradient, so the type
          // stays the loudest thing on the card.
          backgroundImage:
            "radial-gradient(900px 500px at 85% -10%, rgba(155,123,255,0.30), transparent 65%), radial-gradient(700px 420px at -5% 110%, rgba(240,162,74,0.22), transparent 60%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="og" x1="4" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6d4aff" />
                <stop offset="0.55" stopColor="#9b7bff" />
                <stop offset="1" stopColor="#f0a24a" />
              </linearGradient>
            </defs>
            <path
              d="M16 3.5c7.18 0 12.5 4.6 12.5 10.7 0 6.1-5.32 10.7-12.5 10.7-1.16 0-2.29-.1-3.36-.3l-5.3 3.16a.9.9 0 0 1-1.36-.86l.36-4.6C3.6 20.3 3.5 17.3 3.5 14.2 3.5 8.1 8.82 3.5 16 3.5Z"
              fill="url(#og)"
            />
            <path
              d="M13.6 10.6l6.5 3.2a.6.6 0 0 1 0 1.08l-6.5 3.2a.6.6 0 0 1-.87-.54v-6.4a.6.6 0 0 1 .87-.54Z"
              fill="white"
            />
          </svg>
          <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-0.02em", color: "#171923" }}>
            {site.name}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 74,
            lineHeight: 1.08,
            fontWeight: 600,
            letterSpacing: "-0.035em",
            color: "#171923",
            maxWidth: 920,
          }}
        >
          Everyone deserves someone who truly listens.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 26,
            color: "#57534e",
          }}
        >
          <div style={{ display: "flex" }}>Real people. Never AI, never scripted.</div>
          <div style={{ display: "flex", color: "#78716c" }}>Not therapy</div>
        </div>
      </div>
    ),
    size,
  );
}
