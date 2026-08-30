import crypto from "node:crypto";

import { Router } from "express";
import { z } from "zod";

import { hashPassword, setSessionCookie, signToken } from "../lib/auth.js";
import { env } from "../lib/env.js";
import { ApiError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";

/**
 * Google sign-in, implemented directly against Google's OAuth 2.0 endpoints.
 *
 * No passport or google-auth-library: the authorization-code flow is three HTTP
 * calls, and a dependency here would be more code to audit than the flow itself.
 */
export const googleRoutes = Router();

const STATE_COOKIE = "g_oauth_state";
const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";

/**
 * Must match a redirect URI registered in the Google Cloud console exactly.
 *
 * Built from `apiUrl`, not `appUrl`: Google returns the browser to *this
 * server*, which in local development is a different port from the app.
 */
function redirectUri() {
  return `${env.apiUrl}/api/auth/google/callback`;
}

/** Send the browser back to the app with a message the sign-in page can show. */
function backToSignIn(reason: string) {
  return `${env.appUrl}/sign-in?error=${encodeURIComponent(reason)}`;
}

googleRoutes.get("/google", (_req, res) => {
  if (!env.googleConfigured) {
    throw new ApiError(503, "Google sign-in isn't configured on this server");
  }

  // Random state, echoed back by Google and compared on return. Without it an
  // attacker can complete the flow in someone else's browser (CSRF).
  const state = crypto.randomBytes(16).toString("hex");
  res.cookie(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax", // must survive Google's cross-site redirect back to us
    secure: env.isProduction,
    maxAge: 10 * 60 * 1000,
    path: "/",
  });

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  res.redirect(`${AUTH_ENDPOINT}?${params}`);
});

const callbackQuery = z.object({
  code: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  error: z.string().optional(),
});

const googleProfile = z.object({
  sub: z.string(),
  email: z.string().email(),
  email_verified: z.boolean().optional(),
  name: z.string().optional(),
});

googleRoutes.get("/google/callback", async (req, res) => {
  if (!env.googleConfigured) {
    return res.redirect(backToSignIn("Google sign-in isn't configured"));
  }

  const { code, state, error } = callbackQuery.parse(req.query);

  // The person pressed Cancel, or Google refused.
  if (error || !code) return res.redirect(backToSignIn("Google sign-in was cancelled"));

  const expectedState = req.cookies?.[STATE_COOKIE];
  res.clearCookie(STATE_COOKIE, { path: "/" });
  if (!state || !expectedState || state !== expectedState) {
    return res.redirect(backToSignIn("Sign-in expired — please try again"));
  }

  // 1. Exchange the one-time code for tokens.
  const tokenResponse = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID!,
      client_secret: env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri(),
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    console.error("[google] token exchange failed:", await tokenResponse.text());
    return res.redirect(backToSignIn("Couldn't complete Google sign-in"));
  }

  const { access_token: accessToken } = (await tokenResponse.json()) as {
    access_token?: string;
  };
  if (!accessToken) return res.redirect(backToSignIn("Couldn't complete Google sign-in"));

  // 2. Read the profile.
  const profileResponse = await fetch(USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!profileResponse.ok) {
    return res.redirect(backToSignIn("Couldn't read your Google profile"));
  }

  const parsedProfile = googleProfile.safeParse(await profileResponse.json());
  if (!parsedProfile.success) {
    return res.redirect(backToSignIn("Couldn't read your Google profile"));
  }
  const profile = parsedProfile.data;

  // An unverified address could belong to somebody else — refusing it is what
  // stops Google sign-in becoming a way to take over an existing account.
  //
  // Requiring `true` rather than merely rejecting `false`: an absent claim is
  // not evidence of anything, and this assertion is the only reason a Google
  // sign-up is allowed to skip the emailed code below.
  if (profile.email_verified !== true) {
    return res.redirect(backToSignIn("Your Google email isn't verified"));
  }

  const email = profile.email.toLowerCase();

  // 3. Find or create. Matching on the verified email links a Google login to
  // an account that already signed up with a password, which is what people
  // expect — they think of it as "my account", not "my login method".
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: profile.name?.trim() || email.split("@")[0]!,
        // No usable password: this account signs in through Google. A random
        // hash keeps the column non-null without matching anything typeable.
        passwordHash: await hashPassword(crypto.randomBytes(32).toString("hex")),
        // Google has already proven they control this address. Mailing them a
        // code to confirm what Google just confirmed is friction, not security.
        isVerified: true,
      },
    });
  } else if (!user.isVerified) {
    // Signed up with a password, never entered the code, now arriving through
    // Google on the same address — that's the proof the code was waiting for.
    user = await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });
  }

  // Google proving who they are does not un-block them. Without this, the
  // "Continue with Google" button would be a way straight past the block.
  if (user.isBlocked) {
    return res.redirect(
      `${env.appUrl}/sign-in?error=${encodeURIComponent(
        "Your account has been blocked by the service provider. Please contact the administrator to resolve this.",
      )}`,
    );
  }

  setSessionCookie(res, signToken({ sub: user.id, role: user.role }));
  res.redirect(`${env.appUrl}/dashboard`);
});
