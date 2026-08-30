import type { NextFunction, Request, Response } from "express";

import { ApiError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import {
  clearSessionCookie,
  SESSION_COOKIE,
  verifyToken,
  type Role,
} from "../lib/auth.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; role: Role; impersonatedBy?: string };
    }
  }
}

/**
 * Reads the session cookie and attaches the caller to the request.
 *
 * The identity always comes from the signed token — never from a header, query
 * param or request body, any of which the client controls.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) throw ApiError.unauthorized();

  const payload = verifyToken(token);
  if (!payload) throw ApiError.unauthorized("Session expired — please sign in again");

  /*
   * Blocking has to bite immediately, so it is read from the database rather
   * than the token. Someone being blocked is usually someone actively causing
   * harm; leaving their existing session working until it expired would make
   * the button close to useless at the moment it matters most.
   *
   * One primary-key lookup per authenticated request. Worth it here.
   */
  const account = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { isBlocked: true },
  });

  // The row is gone if they deleted their account while holding a session.
  if (!account) {
    clearSessionCookie(res);
    throw ApiError.unauthorized("Session expired — please sign in again");
  }

  if (account.isBlocked) {
    clearSessionCookie(res);
    throw ApiError.forbidden(
      "Your account has been blocked by the service provider. Please contact the administrator to resolve this.",
    );
  }

  req.user = { id: payload.sub, role: payload.role, impersonatedBy: payload.imp };
  next();
}

/**
 * Use after `requireAuth`. Blocks anyone who hasn't proven their email address.
 *
 * Checked against the database rather than the token: verifying must take
 * effect immediately, and a token issued at signup would otherwise keep saying
 * "unverified" until it expired.
 *
 * The `EMAIL_UNVERIFIED` code is what the frontend keys on to send them to the
 * verify screen instead of showing a bare error.
 */
export async function requireVerified(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) throw ApiError.unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { isVerified: true },
  });

  if (!user) throw ApiError.unauthorized();
  if (!user.isVerified) {
    throw new ApiError(403, "Verify your email address to continue", "EMAIL_UNVERIFIED");
  }

  next();
}

/** Use after `requireAuth`. Staff-only endpoints must not be reachable by members. */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw ApiError.unauthorized();
    if (!roles.includes(req.user.role)) throw ApiError.forbidden();
    next();
  };
}
