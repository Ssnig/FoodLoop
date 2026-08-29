import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RescuePlan, SurplusItem } from "@/types";

export default function ImpactTimeline({
  plans,
  items
}: {
  plans: RescuePlan[];
  items: SurplusItem[];
}) {
  const milestones =
    plans.length === 0
      ? [
          "Register surplus inventory before cutoff",
          "Review the recommended allocation and select a partner",
          "Confirm pickup — the batch is then reserved",
          "Complete the pickup to record impact metrics"
        ]
      : plans.flatMap((plan) => {
          const item = items.find((entry) => entry.id === plan.surplusItemId);
          const name = item?.name || plan.foodName || "Surplus batch";
          return [
            `${name} assigned to ${plan.recipientName || "a community partner"}`,
            plan.status === "completed"
              ? "Pickup completed — this rescue is included in impact totals"
              : "Pickup scheduled — awaiting partner collection"
          ];
        });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity history</CardTitle>
        <p className="text-sm text-muted-foreground">
          Progress of surplus batches from registration through partner delivery.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4">
        {milestones.map((milestone) => (
          <div key={milestone} className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <p className="pt-1 text-sm font-medium">{milestone}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
