import { Router } from "express";
import { z } from "zod";

import { ApiError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { setSessionCookie, signToken } from "../lib/auth.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const adminRoutes = Router();

// Everything here is admin-only, including read access — user records and
// message volumes are not listener business.
adminRoutes.use(requireAuth, requireRole("ADMIN"));

const publicUser = {
  id: true,
  name: true,
  email: true,
  role: true,
  isVerified: true,
  isBlocked: true,
  blockedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

/* --------------------------------- Stats --------------------------------- */

/**
 * Everything the overview needs, and the counts the sidebar badges use.
 * One round trip rather than six.
 */
adminRoutes.get("/stats", async (_req, res) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    members,
    listeners,
    admins,
    newThisWeek,
    openRequests,
    scheduledRequests,
    declinedRequests,
    waitingChats,
    activeChats,
    totalMessages,
  ] = await prisma.$transaction([
    prisma.user.count({ where: { role: "MEMBER" } }),
    prisma.user.count({ where: { role: "LISTENER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.meetingRequest.count({ where: { status: { in: ["NEW", "REVIEWING"] } } }),
    prisma.meetingRequest.count({ where: { status: "SCHEDULED" } }),
    prisma.meetingRequest.count({ where: { status: "DECLINED" } }),
    prisma.conversation.count({ where: { status: "WAITING" } }),
    prisma.conversation.count({ where: { status: "ACTIVE" } }),
    prisma.message.count(),
  ]);

  res.json({
    stats: {
      users: { members, listeners, admins, total: members + listeners + admins, newThisWeek },
      requests: { open: openRequests, scheduled: scheduledRequests, declined: declinedRequests },
      chats: { waiting: waitingChats, active: activeChats, messages: totalMessages },
    },
  });
});

/**
 * The "needs attention" feed — open tickets and unanswered chats, newest first.
 * This is what makes the panel feel like an inbox rather than a report.
 */
adminRoutes.get("/attention", async (_req, res) => {
  const [requests, chats] = await prisma.$transaction([
    prisma.meetingRequest.findMany({
      where: { status: { in: ["NEW", "REVIEWING"] } },
      orderBy: { createdAt: "asc" },
      take: 10,
      select: {
        id: true,
        reference: true,
        name: true,
        topic: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.conversation.findMany({
      where: { status: "WAITING" },
      orderBy: { lastMessageAt: "asc" },
      take: 10,
      select: {
        id: true,
        lastMessageAt: true,
        member: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { body: true },
        },
      },
    }),
  ]);

  res.json({ requests, chats });
});

/* --------------------------------- Users --------------------------------- */

const listQuery = z.object({
  q: z.string().trim().max(191).optional(),
  role: z.enum(["MEMBER", "LISTENER", "ADMIN"]).optional(),
  blocked: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

adminRoutes.get("/users", async (req, res) => {
  const { q, role, blocked, page, perPage } = listQuery.parse(req.query);

  const where = {
    ...(role ? { role } : {}),
    ...(blocked ? { isBlocked: blocked === "true" } : {}),
    ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] } : {}),
  };

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        ...publicUser,
        _count: { select: { requests: true, conversations: true, messages: true } },
      },
    }),
  ]);

  res.json({
    users,
    pagination: { page, perPage, total, pages: Math.max(1, Math.ceil(total / perPage)) },
  });
});

const idParam = z.object({ id: z.string().min(1) });

adminRoutes.get("/users/:id", async (req, res) => {
  const { id } = idParam.parse(req.params);

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      ...publicUser,
      listenerProfile: {
        select: { slug: true, headline: true, bio: true, timezone: true, isOnShift: true },
      },
      requests: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          reference: true,
          topic: true,
          status: true,
          scheduledFor: true,
          createdAt: true,
        },
      },
      conversations: {
        orderBy: { lastMessageAt: "desc" },
        take: 10,
        select: {
          id: true,
          status: true,
          lastMessageAt: true,
          assignedListener: { select: { id: true, name: true } },
          _count: { select: { messages: true } },
        },
      },
      _count: { select: { requests: true, conversations: true, messages: true } },
    },
  });

  if (!user) throw ApiError.notFound("No such user");
  res.json({ user });
});

const updateUser = z
  .object({
    name: z.string().trim().min(1, "Name can't be empty").max(120).optional(),
    email: z.string().trim().toLowerCase().email("Enter a valid email").max(191).optional(),
    role: z.enum(["MEMBER", "LISTENER", "ADMIN"]).optional(),
    isBlocked: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Nothing to update" });

adminRoutes.patch("/users/:id", async (req, res) => {
  const { id } = idParam.parse(req.params);
  const { name, email, role, isBlocked } = updateUser.parse(req.body);

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw ApiError.notFound("No such user");

  if (role) {
    // Guard against locking yourself — and possibly everyone — out of the panel.
    if (target.id === req.user!.id && role !== "ADMIN") {
      throw ApiError.badRequest("You can't remove your own admin access");
    }
    if (target.role === "ADMIN" && role !== "ADMIN") {
      const admins = await prisma.user.count({ where: { role: "ADMIN" } });
      if (admins <= 1) throw ApiError.badRequest("There must always be at least one admin");
    }
  }

  if (isBlocked !== undefined) {
    // Blocking yourself would end your own session on the very next request,
    // and there would be no way back in through the panel you just lost.
    if (target.id === req.user!.id) {
      throw ApiError.badRequest("You can't block your own account");
    }
    // The same reasoning as demoting the last admin: leave at least one person
    // who can still get in and undo it.
    if (isBlocked && target.role === "ADMIN") {
      const activeAdmins = await prisma.user.count({
        where: { role: "ADMIN", isBlocked: false },
      });
      if (activeAdmins <= 1) {
        throw ApiError.badRequest("There must always be at least one admin who isn't blocked");
      }
    }
  }

  if (email && email !== target.email) {
    const clash = await prisma.user.findUnique({ where: { email } });
    if (clash) throw ApiError.conflict("Another account already uses that email");
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
      ...(role ? { role } : {}),
      // blockedAt tracks the flag so support can see how recent a block is.
      ...(isBlocked === undefined
        ? {}
        : { isBlocked, blockedAt: isBlocked ? new Date() : null }),
    },
    select: publicUser,
  });

  res.json({ user });
});

/**
 * Mark somebody's email verified by hand.
 *
 * The way out when email fails: a bounced code, a corporate mail filter, a
 * typo'd address they've already told you about. Without this, an unverified
 * account is a person locked out of the site with no route back in — and the
 * only fix would be editing the database directly.
 *
 * It is a real bypass of the check, so it is admin-only and logged.
 */
adminRoutes.post("/users/:id/verify-email", async (req, res) => {
  const { id } = idParam.parse(req.params);

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, isVerified: true },
  });
  if (!target) throw ApiError.notFound("No such user");
  if (target.isVerified) throw ApiError.badRequest("That email is already verified");

  const user = await prisma.user.update({
    where: { id },
    data: { isVerified: true },
    select: publicUser,
  });

  console.warn(
    `[admin] ${req.user!.id} manually verified ${target.id} (${target.email}) at ${new Date().toISOString()}`,
  );

  res.json({ user });
});

/* ------------------------------ Assignment ------------------------------- */

/** Everyone who can take a conversation, for the assignment dropdown. */
adminRoutes.get("/listeners", async (_req, res) => {
  const listeners = await prisma.user.findMany({
    where: { role: { in: ["LISTENER", "ADMIN"] } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true },
  });
  res.json({ listeners });
});

const assignBody = z.object({
  /** null unassigns, returning the thread to the shared queue. */
  listenerId: z.string().min(1).nullable(),
});

/**
 * Give a member a named listener.
 *
 * The member's conversation is created here if they've never opened chat, so an
 * admin can set up continuity before the person writes their first message —
 * which is the point: they should meet the same person every time, not whoever
 * happens to be free.
 */
adminRoutes.patch("/users/:id/listener", async (req, res) => {
  const { id } = idParam.parse(req.params);
  const { listenerId } = assignBody.parse(req.body);

  const member = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!member) throw ApiError.notFound("No such user");

  if (listenerId) {
    const listener = await prisma.user.findUnique({
      where: { id: listenerId },
      select: { id: true, role: true },
    });
    if (!listener || listener.role === "MEMBER") {
      throw ApiError.badRequest("That person isn't a listener");
    }
  }

  let conversation = await prisma.conversation.findFirst({
    where: { memberId: id },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { memberId: id },
      select: { id: true },
    });
  }

  const updated = await prisma.conversation.update({
    where: { id: conversation.id },
    data: { assignedListenerId: listenerId },
    select: {
      id: true,
      status: true,
      assignedListener: { select: { id: true, name: true, email: true } },
    },
  });

  res.json({ conversation: updated });
});

/**
 * Permanently delete an account.
 *
 * This cascades: the person's conversations and every message in them go with
 * it, irreversibly. Meeting requests survive with a null user, so the team's
 * queue history stays intact.
 */
adminRoutes.delete("/users/:id", async (req, res) => {
  const { id } = idParam.parse(req.params);

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true },
  });
  if (!target) throw ApiError.notFound("No such user");

  if (target.id === req.user!.id) {
    throw ApiError.badRequest("You can't delete your own account from here");
  }
  if (target.role === "ADMIN") {
    const admins = await prisma.user.count({ where: { role: "ADMIN" } });
    if (admins <= 1) throw ApiError.badRequest("There must always be at least one admin");
  }

  await prisma.user.delete({ where: { id } });

  // Until there's a proper audit table, the process log is the record.
  console.warn(
    `[admin] ${req.user!.id} deleted user ${target.id} (${target.email}) at ${new Date().toISOString()}`,
  );

  res.status(204).end();
});

/**
 * Sign in as another user, to see exactly what they see.
 *
 * Deliberately constrained: admins only, never another admin, and the issued
 * token records who is behind it so the UI can show a banner and hand the
 * session back afterwards.
 *
 * Worth being clear-eyed about: this grants read access to somebody's private
 * conversations. It exists for support, and it should be used sparingly.
 */
adminRoutes.post("/users/:id/impersonate", async (req, res) => {
  const { id } = idParam.parse(req.params);

  if (req.user!.impersonatedBy) {
    throw ApiError.badRequest("Stop the current impersonation first");
  }
  if (id === req.user!.id) throw ApiError.badRequest("You're already yourself");

  const target = await prisma.user.findUnique({ where: { id }, select: publicUser });
  if (!target) throw ApiError.notFound("No such user");
  if (target.role === "ADMIN") {
    throw ApiError.forbidden("Admins can't impersonate other admins");
  }
  // requireAuth would reject the very next request anyway, which would look
  // like a broken panel rather than a deliberate refusal.
  if (target.isBlocked) {
    throw ApiError.badRequest("That account is blocked — unblock it first");
  }

  console.warn(
    `[admin] ${req.user!.id} started impersonating ${target.id} (${target.email}) at ${new Date().toISOString()}`,
  );

  setSessionCookie(
    res,
    signToken({ sub: target.id, role: target.role, imp: req.user!.id }),
  );
  res.json({ user: target });
});
