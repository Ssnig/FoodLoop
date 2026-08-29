import { Scale, Utensils, WalletCards } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import ImpactTimeline from "@/components/impact/ImpactTimeline";
import { useFoodLoop } from "@/context/FoodLoopContext";

const metricIcons = [Utensils, Scale, WalletCards];

export default function Impact() {
  const { impact, plans, items, n8n } = useFoodLoop();

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Impact tracking"
        title="Show the measurable outcome of every rescued batch."
        description="Metrics come from Backend getImpactMetrics after rescue completion."
      />

      <p className="text-sm text-muted-foreground">
        Coordinator status: <strong>{n8n.lastStatus}</strong>
        {n8n.lastMessage ? ` — ${n8n.lastMessage}` : ""}
      </p>

      <section className="grid gap-4 md:grid-cols-3">
        {impact.map((metric, index) => (
          <MetricCard key={metric.label} icon={metricIcons[index]} {...metric} />
        ))}
      </section>

      <ImpactTimeline plans={plans} items={items} />
    </div>
  );
}
