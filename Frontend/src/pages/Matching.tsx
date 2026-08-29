import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/dashboard/PageHeader";
import RecommendationCard from "@/components/matching/RecommendationCard";
import RecipientCard from "@/components/matching/RecipientCard";
import { Button } from "@/components/ui/button";
import { useFoodLoop } from "@/context/FoodLoopContext";

export default function Matching() {
  const navigate = useNavigate();
  const {
    selectedItem,
    recommendation,
    recipients,
    selectRecipient,
    refreshRecipients,
    error
  } = useFoodLoop();

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

      {error ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {recommendation ? <RecommendationCard recommendation={recommendation} /> : null}

      <section className="grid gap-4">
        {recipients.map((recipient, index) => (
          <RecipientCard
            key={recipient.id}
            recipient={recipient}
            featured={index === 0}
            onSelect={() => {
              selectRecipient(recipient.id);
              navigate("/rescue");
            }}
          />
        ))}
        {recipients.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No compatible recipients found. Register surplus inventory or refresh matches.
          </p>
        ) : null}
      </section>
    </div>
  );
}
