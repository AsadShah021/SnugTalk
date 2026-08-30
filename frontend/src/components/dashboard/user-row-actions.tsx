"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ban,
  CircleCheck,
  Eye,
  MailCheck,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api, ApiError, type AdminUserRow } from "@/lib/api";
import { useAuth } from "@/lib/auth";

/**
 * Per-user actions for the admin table.
 *
 * Delete and impersonate both go through a confirmation — one destroys data
 * irreversibly, the other opens somebody's private conversations.
 */
export function UserRowActions({
  user,
  onDeleted,
  onUpdated,
}: {
  user: AdminUserRow;
  onDeleted: (id: string) => void;
  onUpdated?: (user: AdminUserRow) => void;
}) {
  const { user: me, refresh } = useAuth();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [confirmImpersonate, setConfirmImpersonate] = React.useState(false);
  const [confirmVerify, setConfirmVerify] = React.useState(false);
  const [confirmBlock, setConfirmBlock] = React.useState(false);

  const isSelf = me?.id === user.id;
  const isAdmin = user.role === "ADMIN";
  const unverified = !user.isVerified;
  const blocked = Boolean(user.isBlocked);

  async function markVerified() {
    try {
      const { user: updated } = await api.post<{ user: AdminUserRow }>(
        `/api/admin/users/${user.id}/verify-email`,
      );
      onUpdated?.({ ...user, ...updated });
      toast.success(`${user.name} can now sign in`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't verify that.");
      throw error;
    }
  }

  async function setBlocked(next: boolean) {
    try {
      const { user: updated } = await api.patch<{ user: AdminUserRow }>(
        `/api/admin/users/${user.id}`,
        { isBlocked: next },
      );
      onUpdated?.({ ...user, ...updated });
      toast.success(
        next
          ? `${user.name} is blocked and has been signed out`
          : `${user.name} can sign in again`,
      );
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Couldn't change that.",
      );
      throw error;
    }
  }

  async function impersonate() {
    try {
      await api.post(`/api/admin/users/${user.id}/impersonate`);
      await refresh();
      toast.success(`Now viewing as ${user.name}`);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Couldn't start impersonating.",
      );
    }
  }

  async function remove() {
    try {
      await api.del(`/api/admin/users/${user.id}`);
      onDeleted(user.id);
      toast.success(`${user.name} deleted`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't delete that user.");
      throw error; // keeps the dialog open so they can see what happened
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${user.name}`}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/admin/users/${user.id}`}>
              <Pencil className="size-3.5" /> Edit
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={isSelf || isAdmin || blocked}
            onSelect={(event) => {
              event.preventDefault();
              setConfirmImpersonate(true);
            }}
          >
            <Eye className="size-3.5" /> View as this user
          </DropdownMenuItem>

          {unverified && (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setConfirmVerify(true);
              }}
            >
              <MailCheck className="size-3.5" /> Mark email verified
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Unblocking is not destructive, so it does not get the red styling
              — only shutting somebody out does. */}
          <DropdownMenuItem
            variant={blocked ? undefined : "destructive"}
            disabled={isSelf}
            onSelect={(event) => {
              event.preventDefault();
              setConfirmBlock(true);
            }}
          >
            {blocked ? (
              <>
                <CircleCheck className="size-3.5" /> Unblock
              </>
            ) : (
              <>
                <Ban className="size-3.5" /> Block
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            disabled={isSelf}
            onSelect={(event) => {
              event.preventDefault();
              setConfirmDelete(true);
            }}
          >
            <Trash2 className="size-3.5" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmBlock}
        onOpenChange={setConfirmBlock}
        title={blocked ? `Unblock ${user.name}?` : `Block ${user.name}?`}
        description={
          blocked
            ? `${user.email} will be able to sign in again straight away.`
            : `${user.email} will be signed out immediately and refused at sign in.`
        }
        detail={
          blocked ? (
            <>Their conversations and meeting requests are untouched — they pick
            up exactly where they left off.</>
          ) : (
            <>
              Nothing is deleted. They keep their account and their history, and
              you can undo this at any time. They will be told they have been
              blocked and to contact an administrator.
            </>
          )
        }
        confirmLabel={blocked ? "Unblock" : "Block this account"}
        onConfirm={() => setBlocked(!blocked)}
      />

      <ConfirmDialog
        open={confirmImpersonate}
        onOpenChange={setConfirmImpersonate}
        title={`View SnugTalk as ${user.name}?`}
        description="You'll see exactly what they see, including their private conversations."
        detail={
          <>
            This is a support tool, not a browsing tool. The action is logged, and
            a banner will stay on screen until you switch back.
          </>
        }
        confirmLabel="Start viewing as them"
        onConfirm={impersonate}
      />

      <ConfirmDialog
        open={confirmVerify}
        onOpenChange={setConfirmVerify}
        title={`Mark ${user.name}'s email as verified?`}
        description={`This skips the emailed code for ${user.email} and lets them straight into the site.`}
        detail={
          <>
            Only do this when you know the address is really theirs — a bounced
            code, a mail filter, or a typo they&rsquo;ve told you about. It is
            logged.
          </>
        }
        confirmLabel="Mark verified"
        onConfirm={markVerified}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete ${user.name}?`}
        description="This cannot be undone."
        destructive
        detail={
          <>
            Their account, every conversation and all{" "}
            <strong>{user._count.messages}</strong> of their messages are deleted
            permanently. Meeting requests stay in your queue history, but without a
            linked account.
          </>
        }
        confirmText={user.email}
        confirmLabel="Delete permanently"
        onConfirm={remove}
      />
    </>
  );
}
