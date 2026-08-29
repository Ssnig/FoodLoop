import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import SurplusCard from "@/components/surplus/SurplusCard";
import SurplusForm from "@/components/surplus/SurplusForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFoodLoop } from "@/context/FoodLoopContext";
import { cn } from "@/lib/utils";

export default function Surplus() {
  const { items, selectedItemId, selectItem, resetDemo, error, hasPendingSurplus } =
    useFoodLoop();

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Surplus board"
        title="What's leaving the kitchen today?"
        description="Log prepared food, bakery, or produce before cutoff. Partner matching unlocks after you create your first pending batch."
        action={
          <Button type="button" variant="outline" onClick={resetDemo}>
            Reset demo data
          </Button>
        }
      />

      {error ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SurplusForm />
        <div className="grid gap-4">
          {items.length === 0 ? (
            <Card className="border-dashed bg-secondary/40">
              <CardContent className="grid gap-3 p-6">
                <p className="font-display text-xl font-semibold">No surplus logged yet</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Log your first surplus batch to unlock <strong>Find partners</strong> in the
                  sidebar. Matching stays hidden until excess food is on the board.
                </p>
              </CardContent>
            </Card>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "rounded-3xl text-left transition",
                  selectedItemId === item.id && "ring-4 ring-primary/15"
                )}
                onClick={() => selectItem(item.id)}
              >
                <SurplusCard item={item} />
              </button>
            ))
          )}

          {hasPendingSurplus ? (
            <Button asChild className="w-fit">
              <Link to="/matching">
                Continue to partner matching
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
