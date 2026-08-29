import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/foodloop";
import type { Recommendation } from "@/types";

export default function RecommendationCard({
  recommendation
}: {
  recommendation: Recommendation;
}) {
  const hasPrices =
    typeof recommendation.unitPrice === "number" &&
    typeof recommendation.discountPrice === "number";
  const discountRevenue =
    hasPrices && recommendation.discountQuantity > 0
      ? recommendation.discountQuantity * (recommendation.discountPrice as number)
      : null;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Recommended allocation</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">{recommendation.reason}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recommended action:{" "}
            {recommendation.action === "donate"
              ? "prioritize donation"
              : recommendation.action === "discount"
                ? "prioritize same-day discount"
                : recommendation.action === "recycle"
                  ? "recycle remaining inventory"
                  : recommendation.action}
          </p>
        </div>
        <Badge variant="urgent">{recommendation.urgency} urgency</Badge>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-secondary p-5">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-background text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="text-sm font-bold text-muted-foreground">Donation allocation</p>
          <p className="font-display mt-2 text-4xl font-semibold tracking-tight text-primary">
            {recommendation.donationQuantity}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">portions for community partners</p>
          {hasPrices ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Unit value {formatMoney(recommendation.unitPrice as number)}
            </p>
          ) : null}
        </div>
        <div className="rounded-3xl bg-amber-100 p-5 text-amber-950">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-background text-amber-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="text-sm font-bold text-amber-800">Same-day discount</p>
          <p className="font-display mt-2 text-4xl font-semibold tracking-tight">
            {recommendation.discountQuantity}
          </p>
          <p className="mt-1 text-sm text-amber-800">portions for discounted sale</p>
          {hasPrices ? (
            <div className="mt-2 space-y-1 text-sm text-amber-900">
              <p>
                {recommendation.discountQuantity} ×{" "}
                {formatMoney(recommendation.discountPrice as number)} ={" "}
                <span className="font-semibold">
                  {formatMoney(discountRevenue ?? 0)} recovered
                </span>
              </p>
              <p>
                Original{" "}
                <span className="line-through">
                  {formatMoney(recommendation.unitPrice as number)}
                </span>{" "}
                per portion
              </p>
            </div>
          ) : (
            <p className="mt-1 text-sm text-amber-800">allocated for local discount sale</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
