import { CheckCircle2, Clock, MapPin, PackageCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Recipient, RescuePlan, SurplusItem } from "@/types";
import { rescueStatusLabel } from "@/lib/foodloop";

interface RescueSummaryProps {
  plan: RescuePlan;
  item: SurplusItem;
  recipient: Recipient;
}

export default function RescueSummary({ plan, item, recipient }: RescueSummaryProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Confirmed rescue plan</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            {plan.donationQuantity != null
              ? `Allocate ${plan.donationQuantity} portions to donation and ${plan.discountQuantity ?? 0} portions to same-day discount.`
              : "Pickup confirmed with the selected partner."}
          </p>
        </div>
        <Badge variant="secondary">{rescueStatusLabel(plan.status)}</Badge>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-4 rounded-3xl bg-secondary/70 p-5 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <PackageCheck className="mt-1 h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                {plan.donationQuantity ?? item.quantity} portions for donation pickup
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">{recipient.name}</p>
              <p className="text-sm text-muted-foreground">
                {recipient.address || plan.pickupLocation}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-1 h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Pickup at {plan.pickupTime || "TBD"}</p>
              <p className="text-sm text-muted-foreground">
                Available until {plan.availableUntil || item.availableUntil}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Driver note</p>
              <p className="text-sm text-muted-foreground">
                {plan.driverNote || "Use side entrance near loading bay."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
