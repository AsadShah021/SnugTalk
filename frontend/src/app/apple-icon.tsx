import { ImageResponse } from "next/og";

/*
 * iOS home-screen icon.
 *
 * A PNG, because Safari does not reliably accept SVG here — `icons.apple` used
 * to point at /icon.svg, which meant anyone adding the site to their home
 * screen got a blank tile. Generated at build time rather than committed as a
 * binary, so it cannot drift from the mark in components/brand/logo.tsx.
 *
 * iOS has no transparency on home-screen icons and applies its own rounding,
 * so this fills the square with brand violet and centres the mark on it.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6d4aff 0%, #9b7bff 55%, #f0a24a 100%)",
        }}
      >
        {/* The bubble is drawn in white here rather than in the gradient: the
            gradient is already carrying the background, and a white mark on it
            reads far better at 180px than gradient-on-gradient. */}
        <svg width="112" height="112" viewBox="0 0 32 32" fill="none">
          <path
            d="M16 3.5c7.18 0 12.5 4.6 12.5 10.7 0 6.1-5.32 10.7-12.5 10.7-1.16 0-2.29-.1-3.36-.3l-5.3 3.16a.9.9 0 0 1-1.36-.86l.36-4.6C3.6 20.3 3.5 17.3 3.5 14.2 3.5 8.1 8.82 3.5 16 3.5Z"
            fill="white"
          />
          <path
            d="M13.6 10.6l6.5 3.2a.6.6 0 0 1 0 1.08l-6.5 3.2a.6.6 0 0 1-.87-.54v-6.4a.6.6 0 0 1 .87-.54Z"
            fill="#6d4aff"
          />
        </svg>
      </div>
    ),
    size,
  );
}
