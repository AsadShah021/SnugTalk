import { Download } from "lucide-react";

import { ListenerAvatar } from "@/components/brand/listener-avatar";
import { PageHeader } from "@/components/dashboard/app-shell";
import { ModeBadge } from "@/components/shared/mode-badge";
import { Rating } from "@/components/shared/rating";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CalendarCheck, Clock3, Repeat } from "lucide-react";
import type { SessionMode } from "@/types";

const history: {
  id: string;
  client: string;
  mode: SessionMode;
  date: string;
  minutes: number;
  rating: number;
  fee: number;
}[] = [
  { id: "h-1", client: "Jordan M.", mode: "meet-video", date: "2026-07-30", minutes: 45, rating: 5, fee: 48 },
  { id: "h-2", client: "Lucia F.", mode: "meet-video", date: "2026-07-29", minutes: 60, rating: 5, fee: 62 },
  { id: "h-3", client: "Priyanka S.", mode: "voice", date: "2026-07-29", minutes: 30, rating: 4, fee: 34 },
  { id: "h-4", client: "Aaron D.", mode: "meet-audio", date: "2026-07-28", minutes: 45, rating: 5, fee: 46 },
  { id: "h-5", client: "Jordan M.", mode: "voice", date: "2026-07-25", minutes: 45, rating: 5, fee: 46 },
  { id: "h-6", client: "Elif K.", mode: "text", date: "2026-07-24", minutes: 25, rating: 5, fee: 22 },
  { id: "h-7", client: "Lucia F.", mode: "meet-video", date: "2026-07-22", minutes: 60, rating: 5, fee: 62 },
  { id: "h-8", client: "Sam O.", mode: "meet-audio", date: "2026-07-21", minutes: 45, rating: 4, fee: 46 },
];

export default function SessionHistoryPage() {
  const totalMinutes = history.reduce((sum, row) => sum + row.minutes, 0);
  const totalFees = history.reduce((sum, row) => sum + row.fee, 0);
  const repeatClients = new Set(
    history.filter((row, _, all) => all.filter((r) => r.client === row.client).length > 1)
      .map((row) => row.client),
  ).size;

  return (
    <>
      <PageHeader
        title="Session history"
        description="Every completed session, with what you earned and how it was rated."
        actions={
          <Button variant="outline">
            <Download className="size-4" /> Export CSV
          </Button>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Sessions listed"
          value={`${history.length}`}
          hint="Last two weeks"
          icon={CalendarCheck}
          tone="brand"
        />
        <StatCard label="Minutes listened" value={`${totalMinutes}`} icon={Clock3} />
        <StatCard label="Fees earned" value={formatCurrency(totalFees)} icon={CalendarCheck} />
        <StatCard
          label="Returning clients"
          value={`${repeatClients}`}
          hint="Booked you more than once"
          icon={Repeat}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-3xl text-left text-sm">
              <thead>
                <tr className="text-muted-foreground border-border/60 border-b text-xs">
                  <th scope="col" className="px-5 py-4 font-medium">Client</th>
                  <th scope="col" className="px-5 py-4 font-medium">Format</th>
                  <th scope="col" className="px-5 py-4 font-medium">Date</th>
                  <th scope="col" className="px-5 py-4 font-medium">Length</th>
                  <th scope="col" className="px-5 py-4 font-medium">Rating</th>
                  <th scope="col" className="px-5 py-4 text-right font-medium">Fee</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr
                    key={row.id}
                    className="border-border/40 hover:bg-muted/40 border-b transition-colors last:border-b-0"
                  >
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-2.5">
                        <ListenerAvatar name={row.client} size="xs" />
                        <span className="font-medium">{row.client}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <ModeBadge mode={row.mode} />
                    </td>
                    <td className="text-muted-foreground px-5 py-3.5">
                      {formatDate(row.date)}
                    </td>
                    <td className="px-5 py-3.5 tabular-nums">{row.minutes} min</td>
                    <td className="px-5 py-3.5">
                      <Rating value={row.rating} />
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium tabular-nums">
                      {formatCurrency(row.fee)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
