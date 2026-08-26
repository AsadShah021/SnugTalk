import Link from "next/link";
import { Download, NotebookPen, Plus } from "lucide-react";

import { PageHeader } from "@/components/dashboard/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notes } from "@/lib/data/demo";
import { formatDate } from "@/lib/utils";
import type { NoteEntry } from "@/types";

function NoteCard({ note }: { note: NoteEntry }) {
  return (
    <Card className="hover:border-primary/25 flex flex-col gap-3 p-5 transition-colors">
      <div className="flex items-center gap-2">
        <Badge variant={note.author === "listener" ? "brand" : "muted"}>
          {note.author === "listener" ? "From your listener" : "My note"}
        </Badge>
        <span className="text-muted-foreground ml-auto text-xs">
          {formatDate(note.createdAt, { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>

      <h3 className="text-[0.975rem] font-semibold">{note.title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{note.excerpt}</p>

      <div className="border-border/60 mt-auto flex flex-wrap items-center gap-1.5 border-t pt-4">
        {note.tags.map((tag) => (
          <span
            key={tag}
            className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs"
          >
            #{tag}
          </span>
        ))}
        {note.sessionId && (
          <Button asChild variant="ghost" size="sm" className="ml-auto h-7">
            <Link href="/dashboard/sessions">View session</Link>
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function NotesPage() {
  const fromListeners = notes.filter((note) => note.author === "listener");
  const mine = notes.filter((note) => note.author === "me");

  return (
    <>
      <PageHeader
        title="Conversation notes"
        description="What was said, written down. Yours to keep, edit or delete."
        actions={
          <>
            <Button variant="outline">
              <Download className="size-4" /> Export
            </Button>
            <Button variant="gradient">
              <Plus className="size-4" /> New note
            </Button>
          </>
        }
      />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({notes.length})</TabsTrigger>
          <TabsTrigger value="listener">From listeners ({fromListeners.length})</TabsTrigger>
          <TabsTrigger value="mine">Mine ({mine.length})</TabsTrigger>
        </TabsList>

        {[
          { value: "all", items: notes },
          { value: "listener", items: fromListeners },
          { value: "mine", items: mine },
        ].map((group) => (
          <TabsContent key={group.value} value={group.value}>
            {group.items.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {group.items.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            ) : (
              <div className="border-border/70 flex flex-col items-center gap-3 rounded-2xl border border-dashed p-14 text-center">
                <NotebookPen className="text-muted-foreground size-6" />
                <p className="text-sm font-medium">Nothing here yet</p>
                <p className="text-muted-foreground max-w-xs text-sm">
                  Notes appear after your sessions, or you can write your own
                  before one.
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
