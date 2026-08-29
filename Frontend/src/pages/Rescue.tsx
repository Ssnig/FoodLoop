import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import RescueSummary from "@/components/rescue/RescueSummary";
import { Button } from "@/components/ui/button";
import { useFoodLoop } from "@/context/FoodLoopContext";

export default function Rescue() {
  const {
    activePlan,
    items,
    recipients,
    completeActiveRescue,
    n8n,
    error
  } = useFoodLoop();

  if (!activePlan) {
    return (
      <div className="grid gap-8">
        <PageHeader
          eyebrow="Rescue execution"
          title="No rescue plan yet."
          description="Select a recipient on the Matching page to create a Backend rescue plan."
          action={
            <Button asChild>
              <Link to="/matching">Go to matching</Link>
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

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Rescue execution"
        title="Confirm pickup details before the cutoff window closes."
        description={`Plan ${activePlan.id} · n8n: ${n8n.lastStatus}${n8n.lastMessage ? ` — ${n8n.lastMessage}` : ""}`}
        action={
          <div className="flex flex-wrap gap-2">
            {activePlan.status === "planned" ? (
              <Button type="button" onClick={completeActiveRescue}>
                Mark rescue complete
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
    </div>
  );
}
