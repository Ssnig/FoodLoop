import { ArrowRight, Clock3, Scale, Utensils, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import MetricCard from "@/components/dashboard/MetricCard";
import PageHeader from "@/components/dashboard/PageHeader";
import RecommendationCard from "@/components/matching/RecommendationCard";
import SurplusCard from "@/components/surplus/SurplusCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFoodLoop } from "@/context/FoodLoopContext";

const metricIcons = [Utensils, Scale, WalletCards];

export default function Dashboard() {
  const {
    items,
    impact,
    recommendation,
    selectedItem,
    error,
    n8n,
    business,
    hasPendingSurplus
  } = useFoodLoop();
  const activeItem = selectedItem || items.find((item) => item.status === "pending") || null;

  return (
    <div className="grid gap-8">
      <section className="food-hero overflow-hidden rounded-[1.75rem] px-6 py-7 text-white shadow-xl shadow-primary/20 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="food-chip bg-white/15 text-white">
              <Clock3 className="h-3.5 w-3.5" />
              {hasPendingSurplus ? "Rescue window open" : "Start with surplus"}
            </p>
            <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              {business?.name ? `${business.name}'s kitchen` : "Kitchen hub"}
            </h1>
            <p className="mt-3 text-base leading-7 text-white/85">
              {hasPendingSurplus
                ? "Pending surplus is ready — open Find partners to match a recipient."
                : "Create surplus on the board first. Matching stays locked until excess food is logged."}
            </p>
          </div>
          <Button asChild className="bg-white text-primary hover:bg-white/90" size="lg">
            <Link to={hasPendingSurplus ? "/matching" : "/surplus"}>
              {hasPendingSurplus ? "Find partners" : "Log surplus"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="food-chip">🥪 Prepared</span>
          <span className="food-chip">🥖 Bakery</span>
          <span className="food-chip">🥗 Produce</span>
          <span className="food-chip">♻️ Divert from landfill</span>
        </div>
      </section>

      <PageHeader
        eyebrow={business?.name ? `${business.name} · owner workspace` : "FoodLoop command center"}
        title="Today's surplus rescue board"
        description={
          hasPendingSurplus
            ? "Live metrics and the next batch ready for matching."
            : "Log surplus food to unlock partner matching and start a rescue."
        }
      />

      {error ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <p className="text-sm text-muted-foreground">
        Coordinator:{" "}
        <span className="font-bold text-foreground">
          {n8n.lastStatus === "ok"
            ? "notified"
            : n8n.lastStatus === "pending"
              ? "notifying…"
              : n8n.lastStatus === "error"
                ? n8n.lastMessage
                : n8n.lastStatus}
        </span>
      </p>

      <section className="grid gap-4 md:grid-cols-3">
        {impact.map((metric, index) => (
          <MetricCard key={metric.label} icon={metricIcons[index]} {...metric} />
        ))}
      </section>

      {hasPendingSurplus && activeItem ? (
        <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <SurplusCard item={activeItem} />
          {recommendation ? <RecommendationCard recommendation={recommendation} /> : null}
        </section>
      ) : (
        <Card className="border-dashed bg-secondary/35">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-display text-xl font-semibold">No pending surplus yet</p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Use the Surplus board to create your first excess batch. The Find partners tab
                appears only after that.
              </p>
            </div>
            <Button asChild>
              <Link to="/surplus">
                Go to Surplus board
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
