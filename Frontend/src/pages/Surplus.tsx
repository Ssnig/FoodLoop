import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import SurplusCard from "@/components/surplus/SurplusCard";
import SurplusForm from "@/components/surplus/SurplusForm";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useFoodLoop } from "@/context/FoodLoopContext";
import { cn } from "@/lib/utils";

export default function Surplus() {
  const { pushToast } = useToast();
  const { items, selectedItemId, selectItem, resetDemo, error, hasPendingSurplus } =
    useFoodLoop();
  const [confirmReset, setConfirmReset] = useState(false);

  function handleReset() {
    resetDemo();
    setConfirmReset(false);
    pushToast({
      title: "Inventory reset",
      description: "Surplus batches, rescues, and impact totals were cleared.",
      tone: "info"
    });
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Surplus inventory"
        title="Register excess inventory before cutoff"
        description="Record prepared food, bakery, or produce with pricing. Partner matching becomes available after the first pending batch is submitted."
        action={
          <Button type="button" variant="outline" onClick={() => setConfirmReset(true)}>
            Reset inventory
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
                <p className="font-display text-xl font-semibold">No surplus recorded</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Submit your first surplus batch to unlock <strong>Partner matching</strong> in
                  the navigation. Matching remains unavailable until inventory is on file.
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

      <ConfirmDialog
        open={confirmReset}
        title="Reset inventory?"
        description="This clears all surplus batches, rescue plans, and impact totals for the demo. Your login session stays active."
        confirmLabel="Reset inventory"
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
