import Link from "next/link";
import { Check, CreditCard, Download, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/dashboard/app-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { usage } from "@/lib/data/demo";
import { planMap, plans } from "@/lib/data/plans";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { CalendarCheck, MessagesSquare, Timer } from "lucide-react";

const invoices = [
  { id: "INV-2026-07", date: "2026-07-04", amount: 89, status: "Paid" },
  { id: "INV-2026-06", date: "2026-06-04", amount: 89, status: "Paid" },
  { id: "INV-2026-05", date: "2026-05-04", amount: 89, status: "Paid" },
  { id: "INV-2026-04", date: "2026-04-04", amount: 39, status: "Paid" },
];

export default function SubscriptionPage() {
  const plan = planMap[usage.planId];
  const usagePercent =
    usage.sessionsIncluded === "unlimited"
      ? 100
      : Math.round((usage.sessionsUsed / usage.sessionsIncluded) * 100);

  return (
    <>
      <PageHeader
        title="Subscription"
        description="Your plan, your usage, and one-click cancellation whenever you want it."
        badge={plan.name}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle className="text-lg">{plan.name} plan</CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">{plan.tagline}</p>
            </div>
            <Badge variant="success">
              <Check className="size-3" /> Active
            </Badge>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-[-0.03em] tabular-nums">
                {formatCurrency(plan.priceMonthly)}
              </span>
              <span className="text-muted-foreground text-sm">/ month</span>
              <span className="text-muted-foreground ml-auto text-xs">
                Next charge {formatDate(usage.cycleRenewsAt)}
              </span>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Live sessions used</span>
                <span className="font-semibold tabular-nums">
                  {usage.sessionsUsed} of {usage.sessionsIncluded}
                </span>
              </div>
              <Progress value={usagePercent} />
              <p className="text-muted-foreground mt-2 text-xs">
                Unused sessions roll over for one month.
              </p>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-2.5">
              <Button variant="gradient">
                <Sparkles className="size-4" /> Upgrade to Premium
              </Button>
              <Button variant="outline">
                <CreditCard className="size-4" /> Update payment method
              </Button>
              <Button variant="ghost" className="text-muted-foreground">
                Cancel subscription
              </Button>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Cancelling takes one click and no phone call. You keep access until{" "}
              {formatDate(usage.cycleRenewsAt)} and can export everything first.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <StatCard
            label="Sessions this cycle"
            value={`${usage.sessionsUsed}`}
            hint={`${(usage.sessionsIncluded as number) - usage.sessionsUsed} remaining`}
            icon={CalendarCheck}
            tone="brand"
          />
          <StatCard
            label="Minutes talked"
            value={`${usage.minutesTalked}`}
            icon={Timer}
            trend={{ value: "+18%", direction: "up" }}
          />
          <StatCard
            label="Messages sent"
            value={`${usage.messagesUsed}`}
            hint="Unlimited on your plan"
            icon={MessagesSquare}
          />
        </div>
      </div>

      <h2 className="mt-10 mb-4 text-sm font-semibold">Change plan</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((item) => {
          const current = item.id === usage.planId;
          return (
            <Card
              key={item.id}
              className={cn(
                "flex flex-col p-6",
                current && "border-primary/35 bg-primary/[0.03]",
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{item.name}</h3>
                {current && <Badge variant="brand">Current</Badge>}
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] tabular-nums">
                {formatCurrency(item.priceMonthly)}
                <span className="text-muted-foreground text-sm font-normal">/mo</span>
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                {item.sessionsPerMonth === "unlimited"
                  ? "Unlimited sessions"
                  : `${item.sessionsPerMonth} sessions per month`}
              </p>
              <Button
                variant={current ? "outline" : "subtle"}
                size="sm"
                disabled={current}
                className="mt-5 w-full"
                asChild={!current}
              >
                {current ? (
                  <span>Your plan</span>
                ) : (
                  <Link href="/book">
                    {item.priceMonthly > plan.priceMonthly ? "Upgrade" : "Downgrade"}
                  </Link>
                )}
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className="mt-10">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Billing history</CardTitle>
          <Button variant="ghost" size="sm">
            <Download className="size-3.5" /> Download all
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-md text-left text-sm">
              <thead>
                <tr className="text-muted-foreground border-border/60 border-b text-xs">
                  <th scope="col" className="pb-3 font-medium">Invoice</th>
                  <th scope="col" className="pb-3 font-medium">Date</th>
                  <th scope="col" className="pb-3 font-medium">Amount</th>
                  <th scope="col" className="pb-3 font-medium">Status</th>
                  <th scope="col" className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-border/40 border-b last:border-b-0">
                    <td className="py-3.5 font-medium">{invoice.id}</td>
                    <td className="text-muted-foreground py-3.5">
                      {formatDate(invoice.date)}
                    </td>
                    <td className="py-3.5 tabular-nums">
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="py-3.5">
                      <Badge variant="success">{invoice.status}</Badge>
                    </td>
                    <td className="py-3.5 text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="size-3.5" />
                      </Button>
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
