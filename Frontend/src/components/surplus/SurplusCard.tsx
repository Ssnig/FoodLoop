import { Clock, MapPin, Package, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/foodloop";
import type { SurplusItem } from "@/types";

function statusLabel(status: string): string {
  if (status === "pending") return "Awaiting rescue";
  if (status === "confirmed rescue") return "Pickup confirmed";
  if (status === "rescued") return "Completed";
  if (status === "expired") return "Expired";
  return status;
}

function categoryVisual(category: string): { emoji: string; tint: string; label: string } {
  const key = category.toLowerCase();
  if (key.includes("bakery")) {
    return { emoji: "🥖", tint: "from-amber-200 to-orange-100", label: "Bakery" };
  }
  if (key.includes("produce")) {
    return { emoji: "🥗", tint: "from-lime-200 to-green-100", label: "Produce" };
  }
  if (key.includes("dairy")) {
    return { emoji: "🧀", tint: "from-sky-100 to-blue-50", label: "Dairy" };
  }
  if (key.includes("packaged") || key.includes("pantry")) {
    return { emoji: "📦", tint: "from-stone-200 to-stone-100", label: "Pantry" };
  }
  return { emoji: "🥪", tint: "from-emerald-200 to-teal-100", label: "Prepared" };
}

export default function SurplusCard({ item }: { item: SurplusItem }) {
  const pending = item.status === "pending";
  const visual = categoryVisual(item.category);
  const hasPrices =
    typeof item.unitPrice === "number" && typeof item.discountPrice === "number";

  return (
    <Card className="overflow-hidden">
      <div
        className={`flex items-center justify-between bg-gradient-to-r px-5 py-4 ${visual.tint}`}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-sm">
            {visual.emoji}
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary/80">
              {visual.label}
            </p>
            <p className="text-sm font-semibold text-foreground/80">{item.quantity} portions</p>
          </div>
        </div>
        <Badge variant={pending ? "warning" : "secondary"}>{statusLabel(item.status)}</Badge>
      </div>
      <CardHeader className="flex-row items-start justify-between space-y-0 pt-5">
        <div>
          <CardTitle>{item.name}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{item.category}</p>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          {item.quantity} portions available
        </div>
        {hasPrices ? (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-amber-700" />
            <span>
              <span className="line-through">{formatMoney(item.unitPrice as number)}</span>
              {" → "}
              <span className="font-semibold text-foreground">
                {formatMoney(item.discountPrice as number)}
              </span>{" "}
              sale price
            </span>
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-accent" />
          Available until {item.availableUntil}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {item.location}
        </div>
      </CardContent>
    </Card>
  );
}
