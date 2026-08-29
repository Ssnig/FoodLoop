import {
  addSurplusItem,
  completeRescue,
  createRescue,
  DEMO_CREDENTIALS,
  findNearbyRecipients,
  getBusinessById,
  getImpactMetrics,
  getN8nNotificationStatus,
  getState,
  getSurplusItems,
  getUserById,
  listRescuePlans,
  login as backendLogin,
  recommendAction,
  resetStore,
  signup as backendSignup,
  subscribe
} from "@backend/services/index.js";
import type {
  AuthUser,
  Business,
  ImpactMetric,
  Recommendation,
  Recipient,
  RescuePlan,
  SurplusItem
} from "@/types";

const SESSION_KEY = "foodloop.session";

/** Anchor two hours before cutoff so recommendation urgency remains consistent for demo batches. */
export function demoNowForItem(availableUntil: string): Date {
  const [hours, minutes] = availableUntil.split(":").map(Number);
  const cutoff = new Date();
  cutoff.setHours(hours, minutes, 0, 0);
  return new Date(cutoff.getTime() - 2 * 60 * 60 * 1000);
}

export function toUiRecommendation(
  rec: ReturnType<typeof recommendAction>,
  prices?: { unitPrice?: number; discountPrice?: number }
): Recommendation {
  return {
    action: rec.action,
    donationQuantity: rec.donateQuantity,
    discountQuantity: rec.discountQuantity,
    urgency: rec.urgency,
    reason: rec.reasoning,
    unitPrice: prices?.unitPrice,
    discountPrice: prices?.discountPrice
  };
}

export function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function toUiRecipient(
  recipient: ReturnType<typeof findNearbyRecipients>[number]
): Recipient {
  return {
    id: recipient.id,
    name: recipient.name,
    distanceKm: recipient.distanceKm,
    capacity: recipient.availableCapacity,
    availableCapacity: recipient.availableCapacity,
    matchScore: recipient.matchScore,
    suggestedQuantity: recipient.suggestedQuantity,
    address: recipient.address || "Address on file",
    pickupWindow: `Before ${recipient.distanceKm <= 3 ? "cutoff" : "evening"}`
  };
}

export function toUiRescuePlan(plan: ReturnType<typeof listRescuePlans>[number]): RescuePlan {
  const created = plan.createdAt ? new Date(plan.createdAt) : new Date();
  const pickupTime = created.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });

  return {
    id: plan.id,
    surplusItemId: plan.surplusItemId,
    recipientId: plan.recipientId,
    recipientName: plan.recipientName,
    foodName: plan.foodName,
    quantity: plan.quantity,
    donationQuantity: plan.donationQuantity,
    discountQuantity: plan.discountQuantity,
    availableUntil: plan.availableUntil,
    pickupLocation: plan.pickupLocation,
    pickupTime,
    status: plan.status,
    createdAt: plan.createdAt,
    completedAt: plan.completedAt,
    driverNote:
      plan.status === "completed"
        ? "Pickup completed. This batch is included in impact totals."
        : plan.status === "planned"
          ? "Awaiting pickup. The partner organization has been notified."
          : "Pickup details were updated."
  };
}

export function pickupTeamLabel(status: {
  lastStatus: string;
  lastMessage?: string | null;
}): string | null {
  if (status.lastStatus === "ok") return "Coordination team notified";
  if (status.lastStatus === "pending") return "Notifying coordination team…";
  if (status.lastStatus === "error") {
    return "Pickup remains scheduled. The coordination webhook could not be reached.";
  }
  return null;
}

export function rescueStatusLabel(status: string): string {
  if (status === "planned") return "Pickup scheduled";
  if (status === "completed") return "Completed";
  return status;
}

export function toImpactCards(
  metrics: ReturnType<typeof getImpactMetrics> = getImpactMetrics()
): ImpactMetric[] {
  const donationValue = metrics.donationValueRecovered ?? 0;
  const discountValue = metrics.discountValueRecovered ?? 0;
  return [
    {
      label: "Meals rescued",
      value: String(metrics.mealsRescued),
      helper: "Portions delivered to community partners"
    },
    {
      label: "Food diverted",
      value: `${metrics.foodDivertedKg} kg`,
      helper: "Estimated waste diverted from landfill"
    },
    {
      label: "Donation value",
      value: `$${donationValue.toFixed(0)}`,
      helper: "Retail value of portions donated to partners"
    },
    {
      label: "Discount value",
      value: `$${discountValue.toFixed(0)}`,
      helper: "Value retained through same-day discounted sales"
    },
    {
      label: "Total value recovered",
      value: `$${metrics.valueRecovered.toFixed(0)}`,
      helper: "Donation plus discount value combined"
    }
  ];
}

export function readSnapshot(businessId?: string | null) {
  const state = getState();
  const items = (
    businessId ? getSurplusItems({ businessId }) : getSurplusItems()
  ) as SurplusItem[];
  const itemIds = new Set(items.map((item) => item.id));
  const plans = listRescuePlans()
    .filter((plan) => !businessId || itemIds.has(plan.surplusItemId))
    .map(toUiRescuePlan);
  const impact = toImpactCards(getImpactMetrics());
  const n8n = getN8nNotificationStatus();

  return {
    items,
    recipientsDirectory: state.recipients,
    plans,
    impact,
    n8n,
    business: state.business,
    businesses: state.businesses || [state.business]
  };
}

export function saveSession(userId: string) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
}

export function clearSession() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export function loadSession(): { user: AuthUser; business: Business } | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { userId?: string };
    if (!parsed.userId) return null;
    const user = getUserById(parsed.userId) as AuthUser;
    const business = getBusinessById(user.businessId) as Business;
    return { user, business };
  } catch {
    clearSession();
    return null;
  }
}

export function loginOwner(email: string, password: string) {
  const result = backendLogin(email, password);
  saveSession(result.user.id);
  return {
    user: result.user as AuthUser,
    business: result.business as Business
  };
}

export function signupOwner(input: {
  email: string;
  password: string;
  name: string;
  restaurantName: string;
}) {
  const result = backendSignup(input);
  saveSession(result.user.id);
  return {
    user: result.user as AuthUser,
    business: result.business as Business
  };
}

export function logoutOwner() {
  clearSession();
}

export {
  addSurplusItem,
  completeRescue,
  createRescue,
  DEMO_CREDENTIALS,
  findNearbyRecipients,
  getImpactMetrics,
  getN8nNotificationStatus,
  getSurplusItems,
  listRescuePlans,
  recommendAction,
  resetStore,
  subscribe
};
