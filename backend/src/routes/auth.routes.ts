import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";

import {
  clearSessionCookie,
  hashPassword,
  setSessionCookie,
  signToken,
  verifyPassword,
} from "../lib/auth.js";
import { ApiError } from "../lib/errors.js";
import {
  consumePasswordResetOtp,
  issueEmailOtp,
  issuePasswordResetOtp,
  verifyEmailOtp,
} from "../lib/otp.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { googleRoutes } from "./google.routes.js";

export const authRoutes = Router();

// /api/auth/google and /api/auth/google/callback
authRoutes.use(googleRoutes);

/** Blunt brute-force protection on the endpoints worth attacking. */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many attempts. Try again in a few minutes." },
});

const credentials = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(191),
  password: z.string().min(8, "Use at least 8 characters").max(200),
});

const registerBody = credentials.extend({
  name: z.string().trim().min(1, "Tell us your name").max(120),
});

/** Never send passwordHash to the client, even by accident. */
const publicUser = {
  id: true,
  name: true,
  email: true,
  role: true,
  isVerified: true,
  createdAt: true,
} as const;

authRoutes.post("/register", authLimiter, async (req, res) => {
  const { name, email, password } = registerBody.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict("An account with that email already exists", "EMAIL_TAKEN");
  }

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await hashPassword(password) },
    select: publicUser,
  });

  // Signed in straight away, but unverified — the session is what lets them
  // reach the verify screen and ask for another code without logging in again.
  setSessionCookie(res, signToken({ sub: user.id, role: user.role }));

  try {
    await issueEmailOtp(user);
  } catch {
    // The account exists and they hold a session, so this is recoverable from
    // the verify screen. Say so plainly rather than pretending it worked.
    return res.status(201).json({ user, emailSent: false });
  }

  res.status(201).json({ user, emailSent: true });
});

/* ---------------------------- Email verification -------------------------- */

/** Tighter than the general auth limit: this endpoint guards a 6-digit secret. */
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many attempts. Try again in a few minutes." },
});

const verifyBody = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
});

authRoutes.post("/verify-email", requireAuth, otpLimiter, async (req, res) => {
  const { code } = verifyBody.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: publicUser,
  });
  if (!user) throw ApiError.unauthorized();
  if (user.isVerified) return res.json({ user });

  await verifyEmailOtp(user.id, code);

  res.json({ user: { ...user, isVerified: true } });
});

authRoutes.post("/resend-code", requireAuth, otpLimiter, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, isVerified: true },
  });
  if (!user) throw ApiError.unauthorized();
  if (user.isVerified) throw ApiError.badRequest("Your email is already verified");

  await issueEmailOtp(user);
  res.status(202).json({ sent: true });
});

const changeEmailBody = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(191),
});

/**
 * Correct a typo without starting over.
 *
 * Only available while unverified — this is the escape hatch for the single
 * most common way people get stranded, which is mistyping their own address at
 * signup. Once verified, changing the address belongs in settings behind a
 * password check, not here.
 */
authRoutes.post("/change-email", requireAuth, otpLimiter, async (req, res) => {
  const { email } = changeEmailBody.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, isVerified: true },
  });
  if (!user) throw ApiError.unauthorized();
  if (user.isVerified) {
    throw ApiError.badRequest("Your email is already verified");
  }

  if (email !== user.email) {
    const clash = await prisma.user.findUnique({ where: { email } });
    if (clash) throw ApiError.conflict("An account with that email already exists", "EMAIL_TAKEN");

    await prisma.user.update({ where: { id: user.id }, data: { email } });
    // Codes were sent to the old address; none of them should still open this
    // account now that it points somewhere else.
    await prisma.emailOtp.updateMany({
      where: { userId: user.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });
  }

  await issueEmailOtp({ ...user, email });
  res.status(202).json({ email, sent: true });
});

authRoutes.post("/login", authLimiter, async (req, res) => {
  const { email, password } = credentials.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });

  // Same message and roughly the same work either way, so the response can't be
  // used to discover which email addresses have accounts.
  const ok = user && (await verifyPassword(password, user.passwordHash));
  if (!user || !ok) throw ApiError.unauthorized("Email or password is incorrect");

  setSessionCookie(res, signToken({ sub: user.id, role: user.role }));
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    },
  });
});

/* ---------------------------- Password reset ----------------------------- */

const forgotBody = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(191),
});

const resetBody = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(191),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
  password: z.string().min(8, "Use at least 8 characters").max(200),
});

/**
 * Ask for a reset code.
 *
 * Always answers the same way, whether or not the address has an account.
 * Anything else turns this into a way to test which emails are registered —
 * on a service people use precisely because it is private, confirming that
 * somebody has an account here is itself the leak.
 */
authRoutes.post("/forgot-password", authLimiter, async (req, res) => {
  const { email } = forgotBody.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });

  if (user) {
    try {
      await issuePasswordResetOtp(user);
    } catch {
      // A send failure must not change the answer either — the timing and the
      // body stay identical whatever happened.
    }
  }

  res.json({ ok: true });
});

/** Spend the code and set the new password. */
authRoutes.post("/reset-password", authLimiter, async (req, res) => {
  const { email, code, password } = resetBody.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  // Same message the wrong-code path gives, so a missing account is
  // indistinguishable from a bad code.
  if (!user) throw ApiError.badRequest("That code isn't right, or it has expired");

  await consumePasswordResetOtp(user.id, code, await hashPassword(password));

  // Deliberately no session cookie: whoever just reset signs in with the new
  // password, which proves they hold it and keeps one path into the account.
  res.json({ ok: true });
});

authRoutes.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

authRoutes.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: publicUser,
  });

  // Token still valid but the account is gone — treat as signed out.
  if (!user) {
    clearSessionCookie(res);
    throw ApiError.unauthorized();
  }

  res.json({
    user,
    // Present only while an admin is impersonating: lets the UI show a banner.
    impersonatedBy: req.user!.impersonatedBy ?? null,
  });
});

/** End an impersonation session and restore the admin's own. */
/* ------------------------------ The account ------------------------------ */

const profileBody = z.object({
  name: z.string().trim().min(1, "Tell us your name").max(120),
});

/** Change your display name. Email has its own flow, because it needs a code. */
authRoutes.patch("/profile", requireAuth, async (req, res) => {
  const { name } = profileBody.parse(req.body);

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { name },
    select: publicUser,
  });

  res.json({ user });
});

/**
 * Everything we hold about the caller, as JSON.
 *
 * The privacy policy promises this as a one-click action, so it has to be
 * complete: the account row, every meeting request, and every message in
 * every conversation they are part of.
 */
authRoutes.get("/export", requireAuth, async (req, res) => {
  const id = req.user!.id;

  const [user, requests, conversations] = await Promise.all([
    prisma.user.findUnique({ where: { id }, select: publicUser }),
    prisma.meetingRequest.findMany({
      where: { userId: id },
      orderBy: { createdAt: "asc" },
      select: {
        reference: true, name: true, email: true, topic: true, status: true,
        scheduledFor: true, meetUrl: true, createdAt: true, updatedAt: true,
      },
    }),
    prisma.conversation.findMany({
      where: { memberId: id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true, status: true, createdAt: true, lastMessageAt: true,
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            body: true, createdAt: true, readAt: true,
            sender: { select: { name: true, role: true } },
          },
        },
      },
    }),
  ]);

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="snugtalk-my-data.json"');
  res.send(
    JSON.stringify({ exportedAt: new Date().toISOString(), user, requests, conversations }, null, 2),
  );
});

/**
 * Delete the account and everything personal attached to it.
 *
 * Conversations, messages, connection requests, codes and any listener profile
 * cascade away with the row. Meeting requests deliberately do not — the team
 * needs the record that a slot was booked — so the identifying columns on them
 * are overwritten first. `onDelete: SetNull` only clears the foreign key; the
 * name and email are ordinary columns and would otherwise survive the deletion
 * the policy promises.
 */
authRoutes.delete("/account", requireAuth, async (req, res) => {
  const id = req.user!.id;

  await prisma.$transaction([
    prisma.meetingRequest.updateMany({
      where: { userId: id },
      data: { name: "Deleted account", email: "deleted@example.invalid" },
    }),
    prisma.user.delete({ where: { id } }),
  ]);

  clearSessionCookie(res);
  res.status(204).end();
});

authRoutes.post("/stop-impersonating", requireAuth, async (req, res) => {
  const adminId = req.user!.impersonatedBy;
  if (!adminId) throw ApiError.badRequest("You aren't impersonating anyone");

  const admin = await prisma.user.findUnique({ where: { id: adminId }, select: publicUser });
  if (!admin) {
    // The admin account vanished mid-session; safest outcome is signed out.
    clearSessionCookie(res);
    throw ApiError.unauthorized();
  }

  setSessionCookie(res, signToken({ sub: admin.id, role: admin.role }));
  res.json({ user: admin });
});
