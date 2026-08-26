import { Lock, Plus } from "lucide-react";

import { ListenerAvatar } from "@/components/brand/listener-avatar";
import { PageHeader } from "@/components/dashboard/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { clientNotes } from "@/lib/data/demo";
import { formatRelativeDay } from "@/lib/utils";

export default function ClientNotesPage() {
  return (
    <>
      <PageHeader
        title="Client notes"
        description="Private working notes. Never shown to the member, never used for anything else."
        actions={
          <Button variant="gradient">
            <Plus className="size-4" /> New note
          </Button>
        }
      />

      <div className="border-border/70 bg-muted/40 mb-6 flex items-start gap-3 rounded-2xl border p-4">
        <Lock className="text-muted-foreground mt-0.5 size-4 shrink-0" />
        <p className="text-muted-foreground text-xs leading-relaxed">
          These notes exist so members don&rsquo;t have to repeat themselves.
          Keep them factual and kind — a member can request them at any time
          under our transparency policy, and they&rsquo;re deleted when a client
          relationship ends.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {clientNotes.map((note) => (
          <Card key={note.id} className="hover:border-primary/25 flex flex-col gap-4 p-5 transition-colors">
            <div className="flex items-start gap-3.5">
              <ListenerAvatar name={note.clientName} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{note.clientName}</p>
                <p className="text-muted-foreground text-xs">
                  {note.sessionCount === 0
                    ? "No sessions yet"
                    : `${note.sessionCount} sessions together`}
                </p>
              </div>
              <span className="text-muted-foreground shrink-0 text-xs">
                {formatRelativeDay(note.updatedAt)}
              </span>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed">
              {note.summary}
            </p>

            <div className="border-border/60 mt-auto flex flex-wrap items-center gap-1.5 border-t pt-4">
              {note.tags.map((tag) => (
                <Badge key={tag} variant="muted" className="font-normal">
                  {tag}
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="ml-auto h-7">
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
