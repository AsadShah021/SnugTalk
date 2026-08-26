import { Plus } from "lucide-react";

import { PageHeader } from "@/components/dashboard/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ideas } from "@/lib/data/demo";
import { cn, formatDate } from "@/lib/utils";
import type { Idea } from "@/types";

const stages = [
  { id: "spark", label: "Spark", hint: "Half-formed, worth keeping" },
  { id: "shaping", label: "Shaping", hint: "Taking a form you can describe" },
  { id: "validating", label: "Validating", hint: "Being tested against reality" },
  { id: "committed", label: "Committed", hint: "Decided — now it's execution" },
] as const;

const stageTone: Record<Idea["stage"], string> = {
  spark: "bg-muted text-muted-foreground",
  shaping: "bg-brand-teal/12 text-brand-teal",
  validating: "bg-brand-amber/14 text-brand-amber",
  committed: "bg-success/12 text-success",
};

export default function IdeasPage() {
  return (
    <>
      <PageHeader
        title="Saved ideas"
        description="The things you said out loud that turned out to be worth keeping."
        actions={
          <Button variant="gradient">
            <Plus className="size-4" /> Capture an idea
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-4">
        {stages.map((stage) => {
          const items = ideas.filter((idea) => idea.stage === stage.id);
          return (
            <div key={stage.id} className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <div>
                  <p className="text-sm font-semibold">{stage.label}</p>
                  <p className="text-muted-foreground text-xs">{stage.hint}</p>
                </div>
                <Badge variant="muted">{items.length}</Badge>
              </div>

              <div className="flex flex-col gap-3">
                {items.map((idea) => (
                  <Card
                    key={idea.id}
                    className="hover:border-primary/25 flex flex-col gap-3 p-4 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium">{idea.title}</h3>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-medium",
                          stageTone[idea.stage],
                        )}
                      >
                        {idea.confidence}%
                      </span>
                    </div>

                    <p className="text-muted-foreground line-clamp-4 text-xs leading-relaxed">
                      {idea.summary}
                    </p>

                    <Progress value={idea.confidence} className="h-1" />

                    <div className="flex flex-wrap items-center gap-1.5">
                      {idea.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[0.625rem]"
                        >
                          #{tag}
                        </span>
                      ))}
                      <span className="text-muted-foreground ml-auto text-[0.625rem]">
                        {formatDate(idea.createdAt, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </Card>
                ))}

                {items.length === 0 && (
                  <div className="border-border/70 text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-xs">
                    Nothing at this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
