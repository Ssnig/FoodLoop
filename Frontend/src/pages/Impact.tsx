import { Scale, Utensils, WalletCards } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import ImpactTimeline from "@/components/impact/ImpactTimeline";
import { useFoodLoop } from "@/context/FoodLoopContext";
import { pickupTeamLabel } from "@/lib/foodloop";

const metricIcons = [Utensils, Scale, WalletCards];

export default function Impact() {
  const { impact, plans, items, n8n } = useFoodLoop();
  const teamNote = pickupTeamLabel(n8n);

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Impact reporting"
        title="Measurable outcomes from completed rescues"
        description="Meals delivered, waste diverted, and value recovered after each completed pickup."
      />

      {teamNote ? <p className="text-sm text-muted-foreground">{teamNote}</p> : null}

      <section className="grid gap-4 md:grid-cols-3">
        {impact.map((metric, index) => (
          <MetricCard key={metric.label} icon={metricIcons[index]} {...metric} />
        ))}
      </section>

      <ImpactTimeline plans={plans} items={items} />
    </div>
  );
}
