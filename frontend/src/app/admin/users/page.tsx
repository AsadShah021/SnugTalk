"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { ListenerAvatar } from "@/components/brand/listener-avatar";
import { PageHeader } from "@/components/dashboard/app-shell";
import { UserRowActions } from "@/components/dashboard/user-row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  api,
  ApiError,
  type AdminUserRow,
  type Pagination,
  type Role,
} from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";

const roleTone: Record<Role, "muted" | "brand" | "success"> = {
  MEMBER: "muted",
  LISTENER: "brand",
  ADMIN: "success",
};

const filters: { label: string; value: Role | "ALL" }[] = [
  { label: "Everyone", value: "ALL" },
  { label: "Members", value: "MEMBER" },
  { label: "Listeners", value: "LISTENER" },
  { label: "Admins", value: "ADMIN" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<AdminUserRow[]>([]);
  const [pagination, setPagination] = React.useState<Pagination | null>(null);
  const [query, setQuery] = React.useState("");
  const [role, setRole] = React.useState<Role | "ALL">("ALL");
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);

  // Debounced so typing doesn't fire a request per keystroke.
  React.useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), perPage: "20" });
        if (query.trim()) params.set("q", query.trim());
        if (role !== "ALL") params.set("role", role);

        const data = await api.get<{ users: AdminUserRow[]; pagination: Pagination }>(
          `/api/admin/users?${params}`,
        );
        if (cancelled) return;
        setUsers(data.users);
        setPagination(data.pagination);
      } catch (error) {
        if (!cancelled && !(error instanceof ApiError && error.isUnauthorized)) {
          toast.error("Couldn't load users.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, role, page]);

  return (
    <>
      <PageHeader
        title="Users"
        description="Everyone with an account, and what they've done."
        badge={pagination ? `${pagination.total} total` : undefined}
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => {
              setPage(1);
              setQuery(event.target.value);
            }}
            placeholder="Search by name or email…"
            aria-label="Search users"
            className="pl-10"
          />
        </div>

        <div className="bg-muted/70 inline-flex rounded-full p-1">
          {filters.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setPage(1);
                setRole(option.value);
              }}
              className={cn(
                "focus-visible:ring-ring/50 h-8 rounded-full px-3.5 text-xs font-medium transition-colors outline-none focus-visible:ring-[3px]",
                role === option.value
                  ? "bg-card text-foreground shadow-[0_1px_2px_rgba(16,16,32,0.06)]"
                  : "text-muted-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-border/70 bg-card overflow-hidden rounded-2xl border">
        {loading ? (
          <div className="text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm">
            <Loader2 className="size-4 animate-spin" /> Loading…
          </div>
        ) : users.length === 0 ? (
          <div className="text-muted-foreground py-16 text-center text-sm">
            No users match that search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-sm">
              <thead className="border-border/70 text-muted-foreground border-b text-left text-xs">
                <tr>
                  <th className="px-5 py-3 font-medium">Person</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Tickets</th>
                  <th className="px-5 py-3 font-medium">Messages</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="w-12 px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={cn(
                      "border-border/50 hover:bg-muted/40 border-b transition-colors last:border-0",
                      user.isBlocked && "opacity-60",
                    )}
                  >
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3">
                        <ListenerAvatar name={user.name} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate font-medium hover:underline">
                            {user.name}
                          </span>
                          <span className="text-muted-foreground block truncate text-xs">
                            {user.email}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <Badge variant={roleTone[user.role]}>{user.role}</Badge>
                        {/* These people are locked out until they enter a code —
                            worth spotting from the list, not the detail page. */}
                        {!user.isVerified && (
                          <Badge variant="warning">Unverified</Badge>
                        )}
                        {/* Blocked outranks unverified: it is the reason they
                            cannot get in, and it is the one an admin acted on. */}
                        {user.isBlocked && <Badge variant="destructive">Blocked</Badge>}
                      </span>
                    </td>
                    <td className="text-muted-foreground px-5 py-3.5">
                      {user._count.requests}
                    </td>
                    <td className="text-muted-foreground px-5 py-3.5">
                      {user._count.messages}
                    </td>
                    <td className="text-muted-foreground px-5 py-3.5 text-xs">
                      {formatDate(user.createdAt, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <UserRowActions
                        user={user}
                        onDeleted={(id) =>
                          setUsers((current) => current.filter((u) => u.id !== id))
                        }
                        onUpdated={(updated) =>
                          setUsers((current) =>
                            current.map((u) => (u.id === updated.id ? updated : u)),
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-muted-foreground text-xs">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-3.5" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
