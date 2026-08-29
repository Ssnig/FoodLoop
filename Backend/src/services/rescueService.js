import { METRICS } from '../data/demoData.js';
import { getState, nextRescueId, updateState } from '../data/store.js';
import { resolveFoodItem } from './surplusService.js';
import { recommendAction } from './recommendationService.js';
import { notifyRescueCreated } from './n8nService.js';

/**
 * @typedef {Object} RescuePlan
 * @property {string} id
 * @property {string} surplusItemId
 * @property {string} recipientId
 * @property {string} recipientName
 * @property {string} foodName
 * @property {number} quantity
 * @property {number} donationQuantity
 * @property {number} discountQuantity
 * @property {string} availableUntil
 * @property {string} pickupLocation
 * @property {string} status
 * @property {string} createdAt
 * @property {string} [completedAt]
 */

/**
 * Resolve recipient from id string or object.
 * @param {string|{ id: string }} recipient
 */
function resolveRecipient(recipient) {
  const id = typeof recipient === 'string' ? recipient : recipient?.id;
  if (!id) throw new Error('recipient must be an id string or recipient object.');
  const found = getState().recipients.find((entry) => entry.id === id);
  if (!found) throw new Error(`Recipient not found: ${id}`);
  return found;
}

/**
 * Create a rescue plan and lock the surplus allocation.
 * Status moves from `pending` → `confirmed rescue`.
 *
 * @param {string|import('./surplusService.js').SurplusItem} foodItem
 * @param {string|{ id: string }} recipient
 * @param {number} quantity - donation quantity to allocate to the recipient
 * @param {{ now?: Date }} [options] - optional clock override (demo / tests)
 * @returns {RescuePlan}
 */
export function createRescue(foodItem, recipient, quantity, options = {}) {
  const item = resolveFoodItem(foodItem);
  const org = resolveRecipient(recipient);

  if (item.status !== 'pending') {
    throw new Error(`Surplus item ${item.id} is "${item.status}" and cannot be rescued.`);
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('quantity must be a positive integer.');
  }

  if (quantity > item.quantity) {
    throw new Error(
      `quantity ${quantity} exceeds available surplus ${item.quantity}.`,
    );
  }

  if (quantity > org.availableCapacity) {
    throw new Error(
      `quantity ${quantity} exceeds recipient capacity ${org.availableCapacity}.`,
    );
  }

  if (
    org.acceptedCategories?.length &&
    !org.acceptedCategories.includes(item.category)
  ) {
    throw new Error(
      `Recipient ${org.name} does not accept category ${item.category}.`,
    );
  }

  const recommendation = recommendAction(item, {
    now: options.now instanceof Date ? options.now : undefined,
  });
  const donationQuantity = quantity;
  const discountQuantity = item.quantity - donationQuantity;
  const planId = nextRescueId();
  const createdAt = new Date().toISOString();

  /** @type {RescuePlan} */
  const plan = {
    id: planId,
    surplusItemId: item.id,
    recipientId: org.id,
    recipientName: org.name,
    foodName: item.name,
    quantity: donationQuantity,
    donationQuantity,
    discountQuantity,
    availableUntil: item.availableUntil,
    pickupLocation: item.location,
    status: 'planned',
    createdAt,
  };

  updateState((draft) => {
    const draftItem = draft.surplusItems.find((entry) => entry.id === item.id);
    const draftRecipient = draft.recipients.find((entry) => entry.id === org.id);
    if (!draftItem || !draftRecipient) {
      throw new Error('State changed during rescue creation.');
    }
    if (draftItem.status !== 'pending') {
      throw new Error(`Surplus item ${draftItem.id} is no longer pending.`);
    }
    if (donationQuantity > draftRecipient.availableCapacity) {
      throw new Error('Recipient capacity changed; retry with a lower quantity.');
    }

    draftItem.status = 'confirmed rescue';
    draftRecipient.availableCapacity -= donationQuantity;
    draft.rescuePlans.push(plan);
  });

  // Attach recommendation context for UI / agents (non-persisted convenience).
  const result = {
    ...getState().rescuePlans.find((entry) => entry.id === planId),
    recommendationSummary: {
      action: recommendation.action,
      urgency: recommendation.urgency,
      reasoning: recommendation.reasoning,
      donateQuantity: recommendation.donateQuantity,
      discountQuantity: recommendation.discountQuantity,
    },
  };

  // Fire-and-forget coordinator notify — never rolls back the rescue.
  // UI can poll getN8nNotificationStatus() for a "Coordinator notified" badge.
  void notifyRescueCreated(result, {
    surplusItem: {
      ...item,
      status: 'confirmed rescue',
    },
    recipient: {
      id: org.id,
      name: org.name,
      distanceKm: org.distanceKm,
      address: org.address,
      availableCapacityAfter: getState().recipients.find((r) => r.id === org.id)
        ?.availableCapacity,
    },
  });

  return result;
}

/**
 * Mark a rescue complete and update impact metrics.
 * @param {string} rescueId
 */
export function completeRescue(rescueId) {
  updateState((draft) => {
    const plan = draft.rescuePlans.find((entry) => entry.id === rescueId);
    if (!plan) throw new Error(`Rescue plan not found: ${rescueId}`);
    if (plan.status !== 'planned') {
      throw new Error(`Rescue plan ${rescueId} is already ${plan.status}.`);
    }

    plan.status = 'completed';
    plan.completedAt = new Date().toISOString();

    const item = draft.surplusItems.find((entry) => entry.id === plan.surplusItemId);
    if (item) item.status = 'rescued';

    const meals = plan.donationQuantity;
    const discounted = plan.discountQuantity;

    const donationValuePerMeal =
      item && Number.isFinite(item.unitPrice) && item.unitPrice > 0
        ? item.unitPrice
        : METRICS.DONATION_VALUE_PER_MEAL;
    const discountValuePerMeal =
      item &&
      Number.isFinite(item.discountPrice) &&
      item.discountPrice >= 0 &&
      (item.unitPrice == null || item.discountPrice < item.unitPrice)
        ? item.discountPrice
        : METRICS.DISCOUNT_VALUE_PER_MEAL;

    draft.impactMetrics.mealsRescued += meals;
    draft.impactMetrics.foodDivertedKg = round2(
      draft.impactMetrics.foodDivertedKg +
        (meals + discounted) * METRICS.KG_PER_MEAL,
    );
    draft.impactMetrics.valueRecovered = round2(
      draft.impactMetrics.valueRecovered +
        meals * donationValuePerMeal +
        discounted * discountValuePerMeal,
    );
  });

  const snapshot = getState();
  return {
    plan: snapshot.rescuePlans.find((entry) => entry.id === rescueId),
    impactMetrics: snapshot.impactMetrics,
  };
}

/** @returns {RescuePlan[]} */
export function listRescuePlans() {
  return getState().rescuePlans;
}

/** @returns {{ mealsRescued: number, foodDivertedKg: number, valueRecovered: number }} */
export function getImpactMetrics() {
  return getState().impactMetrics;
}

function round2(value) {
  return Math.round(value * 100) / 100;
}
