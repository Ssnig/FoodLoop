import { Clock, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Recipient } from "@/types";

interface RecipientCardProps {
  recipient: Recipient;
  featured?: boolean;
  onSelect?: () => void;
}

export default function RecipientCard({
  recipient,
  featured = false,
  onSelect
}: RecipientCardProps) {
  return (
    <Card className={featured ? "border-primary ring-4 ring-primary/10" : ""}>
      <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-bold">{recipient.name}</h3>
            {featured ? (
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                Recommended
              </span>
            ) : null}
          </div>
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {recipient.distanceKm} km away at {recipient.address}
            </span>
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Capacity for {recipient.capacity} portions
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Pickup window {recipient.pickupWindow || "Before cutoff"}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
          <div className="text-right">
            <p className="text-3xl font-black tracking-tight text-primary">
              {recipient.matchScore}%
            </p>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Match score
            </p>
          </div>
          <Button
            type="button"
            variant={featured ? "default" : "secondary"}
            onClick={onSelect}
          >
            Select partner
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
