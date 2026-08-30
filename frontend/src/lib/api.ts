/**
 * Typed client for the backend API.
 *
 * Every call sends `credentials: "include"` so the httpOnly session cookie
 * travels with it. That cookie is set by the API and is unreadable from
 * JavaScript by design — the current user comes from `GET /api/auth/me`, never
 * from anything we store client-side.
 */
/**
 * Where the API lives.
 *
 * - **A URL**: used as-is.
 * - **Empty string**: same-origin — nginx proxies `/api/*` to the API on the
 *   same domain, which keeps the session cookie readable by both the Next
 *   middleware and the API, and removes CORS from the picture entirely.
 * - **Unset**: same-origin in production, `localhost:4000` in development.
 *
 * The environment-dependent default matters. A production build with this var
 * missing used to bake in `http://localhost:4000`, which points at *the
 * visitor's own machine* — every request failed with a connection error, and
 * nothing about the build warned us. Defaulting to same-origin in production
 * makes the correct deployment shape the one you get for free.
 *
 * Compared against `undefined` rather than falsiness, so an intentional empty
 * value still means same-origin.
 */
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
const BASE_URL = (
  configuredApiUrl !== undefined
    ? configuredApiUrl
    : process.env.NODE_ENV === "development"
      ? "http://localhost:4000"
      : ""
).replace(/\/$/, "");

/** Exposed for full-page redirects (OAuth), which can't go through `fetch`. */
export const API_BASE = BASE_URL;

export interface FieldError {
  path: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public fields?: FieldError[],
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** True when the caller simply isn't signed in — usually not worth showing. */
  get isUnauthorized() {
    return this.status === 401;
  }

  /**
   * Signed in, but the email address hasn't been proven yet.
   *
   * Every gated endpoint answers this way, so a stale tab that was left open
   * before verifying gets sent to the code screen rather than showing a
   * meaningless "not allowed".
   */
  get needsEmailVerification() {
    return this.status === 403 && this.code === "EMAIL_UNVERIFIED";
  }

  /**
   * An admin has closed this account. Worth its own check because the sign-in
   * screen shows it as a standing notice rather than a toast — it tells the
   * person what to do next, and they need time to read it.
   */
  get isBlocked() {
    return this.status === 403 && this.code === "ACCOUNT_BLOCKED";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      credentials: "include",
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    // fetch only rejects on network failure — a dead API or no connection.
    throw new ApiError(0, "Can't reach the server. Is the API running?", "NETWORK");
  }

  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error ?? `Request failed (${response.status})`,
      data?.code,
      data?.fields,
    );
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

/* ------------------------------- API shapes ------------------------------- */

export type Role = "MEMBER" | "LISTENER" | "ADMIN";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** 0 until they've entered the emailed code. Google sign-ins arrive as 1. */
  isVerified: boolean;
  /** Set by an admin. A blocked account keeps its data but cannot sign in. */
  isBlocked?: boolean;
  /** When the block was applied, or null if the account isn't blocked. */
  blockedAt?: string | null;
  createdAt: string;
}

export type RequestStatus = "NEW" | "REVIEWING" | "SCHEDULED" | "DECLINED";

export interface ApiMeetingRequest {
  id: string;
  reference: string;
  name: string;
  email: string;
  topic: string;
  status: RequestStatus;
  scheduledFor: string | null;
  meetUrl: string | null;
  internalNote: string | null;
  createdAt: string;
  updatedAt: string;
  assignedListener: { id: string; name: string } | null;
}

export interface ApiMessage {
  id: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  sender: { id: string; name: string; role: Role };
}

export interface ApiConversation {
  id: string;
  status: "WAITING" | "ACTIVE" | "CLOSED";
  lastMessageAt: string;
  createdAt: string;
  member: { id: string; name: string; email: string };
  assignedListener: { id: string; name: string } | null;
  messages?: { body: string; createdAt: string; sender: { role: Role } }[];
}

/* ----------------------------- Admin shapes ------------------------------ */

export interface AdminStats {
  users: { members: number; listeners: number; admins: number; total: number; newThisWeek: number };
  requests: { open: number; scheduled: number; declined: number };
  chats: { waiting: number; active: number; messages: number };
}

export interface AdminAttention {
  requests: {
    id: string;
    reference: string;
    name: string;
    topic: string;
    status: RequestStatus;
    createdAt: string;
  }[];
  chats: {
    id: string;
    lastMessageAt: string;
    member: { id: string; name: string };
    messages: { body: string }[];
  }[];
}

export interface AdminUserRow extends ApiUser {
  updatedAt: string;
  _count: { requests: number; conversations: number; messages: number };
}

export interface AdminUserDetail extends AdminUserRow {
  listenerProfile: {
    slug: string;
    headline: string;
    bio: string;
    timezone: string;
    isOnShift: boolean;
  } | null;
  requests: {
    id: string;
    reference: string;
    topic: string;
    status: RequestStatus;
    scheduledFor: string | null;
    createdAt: string;
  }[];
  conversations: {
    id: string;
    status: "WAITING" | "ACTIVE" | "CLOSED";
    lastMessageAt: string;
    assignedListener: { id: string; name: string } | null;
    _count: { messages: number };
  }[];
}

/** Staff who can be assigned to a member. */
export interface AdminListener {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/** What `/api/auth/me` returns while an admin is impersonating. */
export interface MeResponse {
  user: ApiUser;
  impersonatedBy: string | null;
}

export interface Pagination {
  page: number;
  perPage: number;
  total: number;
  pages: number;
}

/* --------------------------- Connection requests -------------------------- */

export type ConnectionStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface ListenerCard {
  id: string;
  name: string;
  listenerProfile: {
    headline: string;
    bio: string;
    timezone: string;
    languages: string[];
    specialties: string[];
    isOnShift: boolean;
  } | null;
  /** The signed-in member's existing request to this listener, if any. */
  requestStatus: ConnectionStatus | null;
}

export interface ConnectionRequest {
  id: string;
  status: ConnectionStatus;
  message: string | null;
  createdAt: string;
  respondedAt: string | null;
  member: { id: string; name: string; email: string };
  listener: { id: string; name: string };
}
