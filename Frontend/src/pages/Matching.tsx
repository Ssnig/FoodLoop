import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "@/components/dashboard/PageHeader";
import RecommendationCard from "@/components/matching/RecommendationCard";
import RecipientCard from "@/components/matching/RecipientCard";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useFoodLoop } from "@/context/FoodLoopContext";

export default function Matching() {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const {
    items,
    selectedItem,
    selectedItemId,
    selectItem,
    recommendation,
    recipients,
    selectRecipient,
    refreshRecipients,
    error
  } = useFoodLoop();
  const [pendingPartnerId, setPendingPartnerId] = useState<string | null>(null);

  const pendingItems = items.filter((item) => item.status === "pending");
  const pendingPartner = recipients.find((r) => r.id === pendingPartnerId);

  function confirmSelectPartner() {
    if (!pendingPartnerId) return;
    const ok = selectRecipient(pendingPartnerId);
    setPendingPartnerId(null);
    if (!ok) return;
    pushToast({
      title: "Partner selected",
      description: pendingPartner
        ? `${pendingPartner.name} is locked for this batch.`
        : "Rescue pickup is ready to confirm."
    });
    navigate("/rescue");
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Partner matching"
        title="Evaluate recipients by distance, capacity, and compatibility"
        description={
          selectedItem
            ? `Candidate partners for ${selectedItem.name} (${selectedItem.quantity} portions) before cutoff.`
            : "Select a surplus item to begin matching."
        }
        action={
          <Button type="button" variant="secondary" onClick={refreshRecipients}>
            Refresh matches
          </Button>
        }
      />

      {pendingItems.length > 1 ? (
        <label className="grid max-w-md gap-2 text-sm font-semibold">
          Pending batch
          <select
            className="h-11 rounded-2xl border bg-background px-4 outline-none focus:ring-2 focus:ring-ring"
            value={
              pendingItems.some((item) => item.id === selectedItemId)
                ? selectedItemId!
                : pendingItems[0]?.id ?? ""
            }
            onChange={(e) => selectItem(e.target.value)}
          >
            {pendingItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.quantity} portions · until {item.availableUntil}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {!selectedItem ? (
        <Card className="border-dashed bg-secondary/40">
          <CardContent className="grid gap-4 p-6">
            <p className="font-display text-xl font-semibold">No surplus selected</p>
            <p className="text-sm leading-6 text-muted-foreground">
              Register a pending surplus batch first, then return here to compare nearby partners.
            </p>
            <Button asChild className="w-fit">
              <Link to="/surplus">Go to surplus inventory</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {recommendation ? <RecommendationCard recommendation={recommendation} /> : null}

          <section className="grid gap-4">
            {recipients.map((recipient, index) => (
              <RecipientCard
                key={recipient.id}
                recipient={recipient}
                featured={index === 0}
                onSelect={() => setPendingPartnerId(recipient.id)}
              />
            ))}
            {recipients.length === 0 ? (
              <Card className="border-dashed bg-secondary/40">
                <CardContent className="grid gap-4 p-6">
                  <p className="font-display text-xl font-semibold">No compatible partners</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    No recipients match this batch&apos;s category or capacity right now. Adjust the
                    surplus entry or register another batch, then refresh matches.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild className="w-fit">
                      <Link to="/surplus">Back to surplus inventory</Link>
                    </Button>
                    <Button type="button" variant="outline" onClick={refreshRecipients}>
                      Refresh matches
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </section>
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingPartnerId)}
        title="Confirm this partner?"
        description={
          pendingPartner
            ? `Selecting ${pendingPartner.name} locks this surplus batch into a pickup plan. You will not be able to switch partners for this item afterward.`
            : "Selecting a partner locks this surplus batch into a pickup plan."
        }
        confirmLabel="Select partner"
        onConfirm={confirmSelectPartner}
        onCancel={() => setPendingPartnerId(null)}
      />
    </div>
  );
}
