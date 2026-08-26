"use client";

import * as React from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { api, API_BASE, ApiError, type ApiUser } from "@/lib/api";
import { useAuth } from "@/lib/auth";

/*
 * Only what there is somewhere to put.
 *
 * This form used to render a fictional person — `defaultValue="Jordan Mercer"`,
 * `jordan@example.com`, a timezone, a preferred format and an intro paragraph,
 * all hardcoded — so every member opened Settings and saw someone else's
 * details as their own. Saving waited 800ms and said "Settings saved" without
 * calling anything, and the Export and Delete buttons had no handler at all,
 * while the privacy policy named them as the one-click way to exercise those
 * rights.
 *
 * Timezone, preferred format, the listener intro and the five notification
 * switches have no columns behind them, so they are gone rather than faked.
 * They come back with the migration that gives them somewhere to live.
 */
export function SettingsForm() {
  const { user, refresh } = useAuth();

  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    if (!name) return;

    setSaving(true);
    try {
      await api.patch<{ user: ApiUser }>("/api/auth/profile", { name });
      await refresh();
      toast.success("Saved");
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Couldn't save that. Try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      await api.del("/api/auth/account");
      toast.success("Your account has been deleted");
      // A full navigation, not a router push: the session cookie is gone and
      // every cached authenticated view with it.
      window.location.href = "/";
    } catch (error) {
      setDeleting(false);
      toast.error(
        error instanceof ApiError ? error.message : "Couldn't delete the account.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Display name</Label>
              {/* `key` so the field picks up the real name once the session
                  loads, instead of keeping an empty uncontrolled default. */}
              <Input
                key={user?.name}
                id="name"
                name="name"
                defaultValue={user?.name ?? ""}
                autoComplete="name"
                required
                maxLength={120}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email ?? ""}
                readOnly
                disabled
                autoComplete="email"
              />
              <p className="text-muted-foreground text-xs">
                Changing your email needs a code sent to the new address, so it
                isn&rsquo;t edited here yet.
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your data</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Export gives you a JSON file containing your account, every meeting
            request you&rsquo;ve made and every message in your conversations.
            Deleting removes all of it.
          </p>

          <Separator />

          <div className="flex flex-wrap gap-2.5">
            {/* A plain link, not fetch: letting the browser handle the download
                means the Content-Disposition filename is honoured and nothing
                has to be buffered in memory first. */}
            <Button asChild variant="outline" size="sm">
              <a href={`${API_BASE}/api/auth/export`} download>
                Export all my data
              </a>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => {
                setConfirmText("");
                setConfirmOpen(true);
              }}
            >
              <Trash2 className="size-3.5" /> Delete account
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This removes your account, your conversations and every message in
              them. It cannot be undone, and we cannot recover any of it for you
              afterwards.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm">
              Type <span className="text-foreground font-medium">DELETE</span> to confirm
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Keep my account
            </Button>
            <Button
              variant="destructive"
              // Deliberately awkward: an irreversible action shouldn't be one
              // stray click away.
              disabled={confirmText !== "DELETE" || deleting}
              onClick={() => void remove()}
            >
              {deleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="size-3.5" /> Delete permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
