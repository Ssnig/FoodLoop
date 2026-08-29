import { FormEvent, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useFoodLoop } from "@/context/FoodLoopContext";

const SAMPLE = {
  name: "Chicken Sandwiches",
  category: "Prepared food",
  quantity: "20",
  unitPrice: "6",
  discountPrice: "2.50",
  availableUntil: "20:00"
};

export default function SurplusForm() {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const { submitSurplus, business } = useFoodLoop();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Prepared food");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");
  const [location, setLocation] = useState(business?.location || business?.name || "");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (business?.location || business?.name) {
      setLocation(business.location || business.name);
    }
  }, [business?.id, business?.location, business?.name]);

  function loadSample() {
    setName(SAMPLE.name);
    setCategory(SAMPLE.category);
    setQuantity(SAMPLE.quantity);
    setUnitPrice(SAMPLE.unitPrice);
    setDiscountPrice(SAMPLE.discountPrice);
    setAvailableUntil(SAMPLE.availableUntil);
    setFormError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const original = Number(unitPrice);
    const sale = Number(discountPrice);
    const portions = Number(quantity);
    if (!(portions > 0) || !Number.isInteger(portions)) {
      setFormError("Portions must be a positive whole number.");
      return;
    }
    if (!(original > 0)) {
      setFormError("Original price must be greater than zero.");
      return;
    }
    if (!(sale >= 0) || sale >= original) {
      setFormError("Sale price must be lower than the original price.");
      return;
    }
    setFormError(null);
    const ok = submitSurplus({
      name,
      category,
      quantity: portions,
      unitPrice: original,
      discountPrice: sale,
      availableUntil,
      location
    });
    if (!ok) return;
    pushToast({
      title: "Surplus saved",
      description: `${name} is ready for partner matching.`
    });
    navigate("/matching");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>New surplus entry</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Provide item details, original unit price, and same-day sale price. The system will
              recommend donation and discount quantities.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 whitespace-nowrap"
            onClick={loadSample}
          >
            Load sample batch
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">
              Item name
              <input
                className="h-11 rounded-2xl border bg-background px-4 outline-none focus:ring-2 focus:ring-ring"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chicken Sandwiches"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Category
              <select
                className="h-11 rounded-2xl border bg-background px-4 outline-none focus:ring-2 focus:ring-ring"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Prepared food</option>
                <option>Bakery</option>
                <option>Produce</option>
                <option>Pantry</option>
                <option>Dairy</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Portions / people
              <input
                className="h-11 rounded-2xl border bg-background px-4 outline-none focus:ring-2 focus:ring-ring"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                type="number"
                min={1}
                placeholder="e.g. 20"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Available until
              <input
                className="h-11 rounded-2xl border bg-background px-4 outline-none focus:ring-2 focus:ring-ring"
                value={availableUntil}
                onChange={(e) => setAvailableUntil(e.target.value)}
                type="time"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Original price (per portion)
              <input
                className="h-11 rounded-2xl border bg-background px-4 outline-none focus:ring-2 focus:ring-ring"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                type="number"
                min={0.01}
                step="0.01"
                placeholder="e.g. 6.00"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Sale price (per portion)
              <input
                className="h-11 rounded-2xl border bg-background px-4 outline-none focus:ring-2 focus:ring-ring"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                type="number"
                min={0}
                step="0.01"
                placeholder="e.g. 2.50"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold md:col-span-2">
              Location
              <input
                className="h-11 rounded-2xl border bg-background px-4 outline-none focus:ring-2 focus:ring-ring"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </label>
          </div>
          {formError ? (
            <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {formError}
            </p>
          ) : null}
          <Button className="w-fit" type="submit">
            Generate recommendation
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
