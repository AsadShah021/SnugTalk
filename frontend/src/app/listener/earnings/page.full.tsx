import { Banknote, Download, TrendingUp, Wallet } from "lucide-react";

import { PageHeader } from "@/components/dashboard/app-shell";
import { EarningsChart } from "@/components/dashboard/earnings-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { ModeBadge } from "@/components/shared/mode-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { earningsSeries } from "@/lib/data/demo";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { SessionMode } from "@/types";

const payouts = [
  { id: "PO-4821", date: "2026-07-28", amount: 962, sessions: 21, status: "Paid" },
  { id: "PO-4790", date: "2026-07-21", amount: 1043, sessions: 23, status: "Paid" },
  { id: "PO-4764", date: "2026-07-14", amount: 908, sessions: 20, status: "Paid" },
  { id: "PO-4731", date: "2026-07-07", amount: 997, sessions: 22, status: "Paid" },
];

const byMode: { mode: SessionMode; sessions: number; amount: number }[] = [
  { mode: "meet-video", sessions: 38, amount: 1824 },
  { mode: "voice", sessions: 29, amount: 1218 },
  { mode: "meet-audio", sessions: 17, amount: 731 },
  { mode: "text", sessions: 9, amount: 137 },
];

export default function EarningsPage() {
  const total = earningsSeries.reduce((sum, point) => sum + point.amount, 0);
  const current = earningsSeries[earningsSeries.length - 1].amount;
  const previous = earningsSeries[earningsSeries.length - 2].amount;
  const growth = Math.round(((current - previous) / previous) * 100);

  return (
    <>
      <PageHeader
        title="Earnings"
        description="Paid weekly, every Tuesday, for the previous week's completed sessions."
        actions={
          <Button variant="outline">
            <Download className="size-4" /> Export statements
          </Button>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="This month"
          value={formatCurrency(current)}
          icon={Wallet}
          tone="brand"
          trend={{ value: `+${growth}%`, direction: "up" }}
        />
        <StatCard
          label="Last 6 months"
          value={formatCurrency(total)}
          icon={TrendingUp}
        />
        <StatCard
          label="Next payout"
          value={formatCurrency(962)}
          hint="Tuesday, via Stripe"
          icon={Banknote}
        />
        <StatCard
          label="Effective rate"
          value="$52/hr"
          hint="Rises with tenure and ratings"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Monthly earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <EarningsChart data={earningsSeries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By conversation format</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {byMode.map((row) => (
              <div key={row.mode} className="flex items-center gap-3">
                <ModeBadge mode={row.mode} />
                <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                  {row.sessions} sessions
                </span>
                <span className="w-20 text-right text-sm font-medium tabular-nums">
                  {formatCurrency(row.amount)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Recent payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-lg text-left text-sm">
              <thead>
                <tr className="text-muted-foreground border-border/60 border-b text-xs">
                  <th scope="col" className="pb-3 font-medium">Payout</th>
                  <th scope="col" className="pb-3 font-medium">Date</th>
                  <th scope="col" className="pb-3 font-medium">Sessions</th>
                  <th scope="col" className="pb-3 font-medium">Amount</th>
                  <th scope="col" className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.id} className="border-border/40 border-b last:border-b-0">
                    <td className="py-3.5 font-medium">{payout.id}</td>
                    <td className="text-muted-foreground py-3.5">
                      {formatDate(payout.date)}
                    </td>
                    <td className="py-3.5 tabular-nums">{payout.sessions}</td>
                    <td className="py-3.5 tabular-nums">
                      {formatCurrency(payout.amount)}
                    </td>
                    <td className="py-3.5">
                      <Badge variant="success">{payout.status}</Badge>
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
