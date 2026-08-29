import { FormEvent, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFoodLoop } from "@/context/FoodLoopContext";

export default function SurplusForm() {
  const navigate = useNavigate();
  const { submitSurplus, business } = useFoodLoop();
  const [name, setName] = useState("Chicken Sandwiches");
  const [category, setCategory] = useState("Prepared food");
  const [quantity, setQuantity] = useState(20);
  const [unitPrice, setUnitPrice] = useState(6);
  const [discountPrice, setDiscountPrice] = useState(2.5);
  const [availableUntil, setAvailableUntil] = useState("20:00");
  const [location, setLocation] = useState(business?.location || business?.name || "ABC Bakery");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (business?.location || business?.name) {
      setLocation(business.location || business.name);
    }
  }, [business?.id, business?.location, business?.name]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const original = Number(unitPrice);
    const sale = Number(discountPrice);
    if (!(original > 0)) {
      setFormError("Original price must be greater than zero.");
      return;
    }
    if (!(sale >= 0) || sale >= original) {
      setFormError("Sale price must be lower than the original price.");
      return;
    }
    setFormError(null);
    submitSurplus({
      name,
      category,
      quantity: Number(quantity),
      unitPrice: original,
      discountPrice: sale,
      availableUntil,
      location
    });
    navigate("/matching");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New surplus entry</CardTitle>
        <p className="text-sm text-muted-foreground">
          Provide item details, original unit price, and same-day sale price. The system will
          recommend donation and discount quantities.
        </p>
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
                onChange={(e) => setQuantity(Number(e.target.value))}
                type="number"
                min={1}
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
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                type="number"
                min={0.01}
                step="0.01"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Sale price (per portion)
              <input
                className="h-11 rounded-2xl border bg-background px-4 outline-none focus:ring-2 focus:ring-ring"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(Number(e.target.value))}
                type="number"
                min={0}
                step="0.01"
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
