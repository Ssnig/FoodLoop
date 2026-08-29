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
          "Log surplus on the Surplus page",
          "Review recommendation and pick a recipient",
          "Create rescue — item locks to confirmed rescue",
          "Mark complete to update impact metrics"
        ]
      : plans.flatMap((plan) => {
          const item = items.find((entry) => entry.id === plan.surplusItemId);
          const name = item?.name || plan.foodName || "Surplus batch";
          return [
            `${name} linked to ${plan.recipientName || "recipient"} (${plan.status})`,
            plan.status === "completed"
              ? `Rescue ${plan.id} completed — impact counted`
              : `Rescue ${plan.id} planned — awaiting completion`
          ];
        });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Impact trail</CardTitle>
        <p className="text-sm text-muted-foreground">
          Live trail from Backend rescue plans.
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
