import { Star } from "lucide-react";

import { ListenerAvatar } from "@/components/brand/listener-avatar";
import { PageHeader } from "@/components/dashboard/app-shell";
import { Rating } from "@/components/shared/rating";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { listenerReviewFeed } from "@/lib/data/demo";
import { listenerReviews } from "@/lib/data/listeners";
import { formatDate, formatRelativeDay } from "@/lib/utils";

const distribution = [
  { stars: 5, count: 341 },
  { stars: 4, count: 58 },
  { stars: 3, count: 9 },
  { stars: 2, count: 3 },
  { stars: 1, count: 1 },
];

export default function ReviewsPage() {
  const total = distribution.reduce((sum, row) => sum + row.count, 0);
  const average =
    distribution.reduce((sum, row) => sum + row.stars * row.count, 0) / total;

  return (
    <>
      <PageHeader
        title="Ratings & reviews"
        description="Left by members after real sessions. We never edit or remove them for tone."
        badge={`${total} reviews`}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Overall</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-end gap-3">
              <span className="text-5xl font-semibold tracking-[-0.04em] tabular-nums">
                {average.toFixed(1)}
              </span>
              <div className="pb-1.5">
                <Rating value={average} size="md" />
                <p className="text-muted-foreground mt-1 text-xs">
                  from {total.toLocaleString()} reviews
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {distribution.map((row) => (
                <div key={row.stars} className="flex items-center gap-3">
                  <span className="text-muted-foreground flex w-8 shrink-0 items-center gap-1 text-xs">
                    {row.stars}
                    <Star className="fill-brand-amber text-brand-amber size-3" />
                  </span>
                  <Progress
                    value={Math.round((row.count / total) * 100)}
                    className="h-1.5"
                  />
                  <span className="text-muted-foreground w-10 shrink-0 text-right text-xs tabular-nums">
                    {row.count}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-border/60 grid grid-cols-2 gap-3 border-t pt-5 text-xs">
              <div>
                <p className="text-muted-foreground">Response rate</p>
                <p className="mt-0.5 text-sm font-semibold">98%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Repeat bookings</p>
                <p className="mt-0.5 text-sm font-semibold">71%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          {listenerReviewFeed.map((review) => (
            <Card key={review.id} className="p-5">
              <div className="flex items-start gap-3.5">
                <ListenerAvatar name={review.author} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{review.author}</p>
                    <Rating value={review.rating} />
                    <span className="text-muted-foreground ml-auto text-xs">
                      {formatRelativeDay(review.date)}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    &ldquo;{review.body}&rdquo;
                  </p>
                </div>
              </div>
            </Card>
          ))}

          {listenerReviews.map((review) => (
            <Card key={review.id} className="p-5">
              <div className="flex items-start gap-3.5">
                <ListenerAvatar name={review.author} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{review.author}</p>
                    <Rating value={review.rating} />
                    <span className="text-muted-foreground ml-auto text-xs">
                      {formatDate(review.date)}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    &ldquo;{review.body}&rdquo;
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
