import { createHash, randomInt, timingSafeEqual } from "node:crypto";

import { ApiError } from "./errors.js";
import { prisma } from "./prisma.js";
import { passwordResetEmail, sendMail, verificationEmail } from "./mailer.js";

/** Long enough to fetch the email, short enough that a leaked code goes stale. */
const TTL_MS = 10 * 60 * 1000;

/** Six digits is a million guesses; the cap is what makes that enough. */
const MAX_ATTEMPTS = 5;

/** Stops the resend button being used as a way to spam somebody's inbox. */
const RESEND_COOLDOWN_MS = 60 * 1000;

/**
 * `randomInt` and not `Math.random()`.
 *
 * `Math.random()` is seeded predictably and is not a CSPRNG — given a few
 * observed outputs its future values can be reconstructed, which for auth codes
 * means guessing somebody else's.
 */
function generateCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

const hashCode = (code: string) => createHash("sha256").update(code).digest("hex");

/**
 * Issue a code and email it.
 *
 * Any earlier unconsumed code for the same purpose is retired first, so a
 * person holding two emails can't be confused about which one still works —
 * the newest is always the live one.
 */
export async function issueEmailOtp(user: { id: string; name: string; email: string }) {
  const recent = await prisma.emailOtp.findFirst({
    where: { userId: user.id, purpose: "EMAIL_VERIFICATION", consumedAt: null },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (recent && Date.now() - recent.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    const wait = Math.ceil(
      (RESEND_COOLDOWN_MS - (Date.now() - recent.createdAt.getTime())) / 1000,
    );
    throw ApiError.tooManyRequests(`Wait ${wait} seconds before asking for another code`);
  }

  const code = generateCode();

  await prisma.emailOtp.updateMany({
    where: { userId: user.id, purpose: "EMAIL_VERIFICATION", consumedAt: null },
    data: { consumedAt: new Date() },
  });

  await prisma.emailOtp.create({
    data: {
      userId: user.id,
      codeHash: hashCode(code),
      purpose: "EMAIL_VERIFICATION",
      expiresAt: new Date(Date.now() + TTL_MS),
    },
  });

  // Not caught: the caller must know, because "check your inbox" in front of an
  // email that was never sent is a dead end the person cannot get out of.
  await sendMail({ to: user.email, ...verificationEmail(user.name, code) });
}

/**
 * Check a submitted code and, if it holds up, mark the address verified.
 *
 * Every failure says the same thing. Distinguishing "expired" from "wrong"
 * tells an attacker whether they have the right shape of guess.
 */
export async function verifyEmailOtp(userId: string, code: string): Promise<void> {
  const otp = await prisma.emailOtp.findFirst({
    where: { userId, purpose: "EMAIL_VERIFICATION", consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  const wrong = () => ApiError.badRequest("That code isn't right, or it has expired");

  if (!otp) throw wrong();

  if (otp.expiresAt < new Date() || otp.attempts >= MAX_ATTEMPTS) {
    await prisma.emailOtp.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    });
    throw wrong();
  }

  const submitted = Buffer.from(hashCode(code), "hex");
  const expected = Buffer.from(otp.codeHash, "hex");
  // Both are fixed-length SHA-256 digests, so the length guard is belt-and-braces.
  const matches =
    submitted.length === expected.length && timingSafeEqual(submitted, expected);

  if (!matches) {
    const { attempts } = await prisma.emailOtp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
      select: { attempts: true },
    });

    if (attempts >= MAX_ATTEMPTS) {
      await prisma.emailOtp.update({
        where: { id: otp.id },
        data: { consumedAt: new Date() },
      });
      throw ApiError.badRequest(
        "Too many wrong codes. Ask for a new one and try again.",
      );
    }

    throw wrong();
  }

  await prisma.$transaction([
    prisma.emailOtp.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    }),
  ]);
}

/* ---------------------------- Password reset ----------------------------- */

/**
 * Issue a reset code and email it.
 *
 * Shares the `EmailOtp` table with verification — same hashing, same TTL, same
 * attempt cap — but a separate `purpose`, so a verification code can never be
 * spent as a reset code or the other way round.
 */
export async function issuePasswordResetOtp(user: {
  id: string;
  name: string;
  email: string;
}) {
  const recent = await prisma.emailOtp.findFirst({
    where: { userId: user.id, purpose: "PASSWORD_RESET", consumedAt: null },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  // Swallowed rather than thrown: the caller must not reveal whether an account
  // exists, so "you asked too recently" cannot surface either.
  if (recent && Date.now() - recent.createdAt.getTime() < RESEND_COOLDOWN_MS) return;

  const code = generateCode();

  await prisma.emailOtp.updateMany({
    where: { userId: user.id, purpose: "PASSWORD_RESET", consumedAt: null },
    data: { consumedAt: new Date() },
  });

  await prisma.emailOtp.create({
    data: {
      userId: user.id,
      codeHash: hashCode(code),
      purpose: "PASSWORD_RESET",
      expiresAt: new Date(Date.now() + TTL_MS),
    },
  });

  await sendMail({ to: user.email, ...passwordResetEmail(user.name, code) });
}

/**
 * Check a reset code and swap the password in the same transaction.
 *
 * Consuming the code and writing the hash together means a crash between the
 * two can't leave a spent code that changed nothing, or a changed password with
 * a code still live for a second go.
 */
export async function consumePasswordResetOtp(
  userId: string,
  code: string,
  passwordHash: string,
): Promise<void> {
  const otp = await prisma.emailOtp.findFirst({
    where: { userId, purpose: "PASSWORD_RESET", consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  const wrong = () => ApiError.badRequest("That code isn't right, or it has expired");

  if (!otp) throw wrong();

  if (otp.expiresAt < new Date() || otp.attempts >= MAX_ATTEMPTS) {
    await prisma.emailOtp.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    });
    throw wrong();
  }

  const submitted = Buffer.from(hashCode(code), "hex");
  const expected = Buffer.from(otp.codeHash, "hex");
  const matches =
    submitted.length === expected.length && timingSafeEqual(submitted, expected);

  if (!matches) {
    const { attempts } = await prisma.emailOtp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
      select: { attempts: true },
    });

    if (attempts >= MAX_ATTEMPTS) {
      await prisma.emailOtp.update({
        where: { id: otp.id },
        data: { consumedAt: new Date() },
      });
      throw ApiError.badRequest(
        "Too many wrong codes. Ask for a new one and try again.",
      );
    }

    throw wrong();
  }

  await prisma.$transaction([
    prisma.emailOtp.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: userId },
      // Proving control of the inbox is at least as strong as the code we send
      // to verify it, so a reset also settles the address.
      data: { passwordHash, isVerified: true },
    }),
  ]);
}
