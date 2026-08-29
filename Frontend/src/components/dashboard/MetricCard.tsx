import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function MetricCard({
  icon: Icon,
  label,
  value,
  helper
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="relative flex items-start justify-between gap-4 overflow-hidden p-6">
        <div className="relative z-[1]">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <p className="font-display mt-3 text-4xl font-semibold text-primary">{value}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{helper}</p>
        </div>
        <div className="relative z-[1] flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-secondary/70"
        />
      </CardContent>
    </Card>
  );
}
