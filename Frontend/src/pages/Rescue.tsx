import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import RescueSummary from "@/components/rescue/RescueSummary";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useFoodLoop } from "@/context/FoodLoopContext";
import { pickupTeamLabel } from "@/lib/foodloop";

export default function Rescue() {
  const { pushToast } = useToast();
  const {
    activePlan,
    items,
    recipients,
    completeActiveRescue,
    n8n,
    error
  } = useFoodLoop();
  const [confirmComplete, setConfirmComplete] = useState(false);
  const teamNote = pickupTeamLabel(n8n);

  if (!activePlan) {
    return (
      <div className="grid gap-8">
        <PageHeader
          eyebrow="Rescue coordination"
          title="No pickup scheduled"
          description="Select a recipient in Partner matching to confirm a pickup for the current surplus batch."
          action={
            <Button asChild>
              <Link to="/matching">Open partner matching</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const item = items.find((surplusItem) => surplusItem.id === activePlan.surplusItemId);
  const recipient =
    recipients.find((partner) => partner.id === activePlan.recipientId) || {
      id: activePlan.recipientId,
      name: activePlan.recipientName || "Recipient",
      distanceKm: 0,
      capacity: activePlan.donationQuantity || 0,
      matchScore: 0,
      address: activePlan.pickupLocation || "",
      pickupWindow: `Until ${activePlan.availableUntil || "cutoff"}`
    };

  if (!item) {
    return null;
  }

  function handleComplete() {
    const ok = completeActiveRescue();
    setConfirmComplete(false);
    if (!ok) return;
    pushToast({
      title: "Pickup completed",
      description: "Impact totals have been updated for this rescue."
    });
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Rescue coordination"
        title="Confirm pickup details before cutoff"
        description={
          teamNote ||
          "Review allocation and logistics with your selected partner before the availability window closes."
        }
        action={
          <div className="flex flex-wrap gap-2">
            {activePlan.status === "planned" ? (
              <Button type="button" onClick={() => setConfirmComplete(true)}>
                Mark pickup complete
              </Button>
            ) : null}
            <Button asChild variant="secondary">
              <Link to="/impact">
                View impact
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        }
      />

      {error ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <RescueSummary plan={activePlan} item={item} recipient={recipient} />

      <ConfirmDialog
        open={confirmComplete}
        title="Mark pickup complete?"
        description="This records the rescue as finished and adds meals, diverted food, and recovered value to your impact totals."
        confirmLabel="Mark complete"
        onConfirm={handleComplete}
        onCancel={() => setConfirmComplete(false)}
      />
    </div>
  );
}
