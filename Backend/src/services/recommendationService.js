import { resolveFoodItem } from './surplusService.js';
import { findNearbyRecipients } from './matchingService.js';

/**
 * FoodLoop surplus decision engine (deterministic MVP — not ML).
 *
 * Factors:
 * - Short remaining time → higher urgency → higher donation share
 * - High quantity → prefer donation as the primary action (rescue volume)
 * - Nearby recipient capacity → hard cap on donateQuantity
 * - If capacity < preferred donation, donate up to capacity and discount the rest
 */

/**
 * @typedef {Object} Recommendation
 * @property {'donate'|'discount'|'recycle'} action
 * @property {number} donateQuantity
 * @property {number} discountQuantity
 * @property {string} reasoning
 * @property {'critical'|'high'|'medium'|'low'} urgency
 */

/** Minutes remaining → urgency label. */
const URGENCY_THRESHOLDS = {
  critical: 60,
  high: 120,
  medium: 240,
};

/**
 * Preferred donation fraction of the surplus lot by urgency.
 * Remainder is reserved for marketplace discount / cost recovery.
 *
 * Demo lock-in:
 *   high urgency (≈2 hours) × 20 items → floor(20 * 0.75) = 15 donate, 5 discount
 *   when nearby capacity is 30 (capacity is not the bottleneck).
 */
const DONATION_SHARE_BY_URGENCY = {
  critical: 0.9,
  high: 0.75,
  medium: 0.65,
  low: 0.5,
};

/**
 * @param {string} availableUntil - HH:MM
 * @param {Date} [now]
 * @returns {number}
 */
export function minutesUntilCutoff(availableUntil, now = new Date()) {
  const [hours, minutes] = availableUntil.split(':').map(Number);
  const cutoff = new Date(now);
  cutoff.setHours(hours, minutes, 0, 0);
  return Math.round((cutoff.getTime() - now.getTime()) / 60000);
}

/**
 * @param {number} minutes
 * @returns {'critical'|'high'|'medium'|'low'}
 */
export function urgencyFromMinutes(minutes) {
  if (minutes <= URGENCY_THRESHOLDS.critical) return 'critical';
  if (minutes <= URGENCY_THRESHOLDS.high) return 'high';
  if (minutes <= URGENCY_THRESHOLDS.medium) return 'medium';
  return 'low';
}

/**
 * Nearby donation capacity = top-ranked compatible recipient's available seats.
 * Demo: Community Food Center at 2.1 km with capacity 30.
 *
 * @param {string|import('./surplusService.js').SurplusItem} foodItem
 * @param {number} [overrideCapacity]
 * @returns {number}
 */
export function getNearbyDonationCapacity(foodItem, overrideCapacity) {
  if (Number.isFinite(overrideCapacity)) return Math.max(0, overrideCapacity);

  const nearby = findNearbyRecipients(foodItem);
  if (nearby.length === 0) return 0;
  return nearby[0].availableCapacity;
}

/**
 * Deterministic recommendation for a surplus food item.
 *
 * @param {string|import('./surplusService.js').SurplusItem} foodItem
 * @param {{ now?: Date, nearbyCapacity?: number }} [options]
 * @returns {Recommendation}
 */
export function recommendAction(foodItem, options = {}) {
  const item = resolveFoodItem(foodItem);
  const now = options.now ?? new Date();

  const minutes = minutesUntilCutoff(item.availableUntil, now);
  const urgency = urgencyFromMinutes(minutes);
  const quantity = item.quantity;
  const nearbyCapacity = getNearbyDonationCapacity(item, options.nearbyCapacity);

  // Past cutoff: food is no longer safe/useful to donate or sell — recycle.
  if (minutes < 0) {
    return {
      action: 'recycle',
      donateQuantity: 0,
      discountQuantity: 0,
      urgency,
      reasoning:
        `The cutoff for this batch passed ${Math.abs(minutes)} minutes ago. ` +
        `Recycle leftover food instead of donating or discounting it.`,
    };
  }

  // 1) Time-based preferred donation (before capacity).
  //    Shorter shelf-life → larger share donated.
  const preferredDonate = Math.floor(
    quantity * DONATION_SHARE_BY_URGENCY[urgency],
  );

  // 2) Capacity gate.
  //    High quantity increases donation priority in the sense that we still
  //    push as much as capacity allows when capacity < preferredDonate.
  //    Never donate more than nearby recipients can accept.
  let donateQuantity = Math.min(preferredDonate, nearbyCapacity, quantity);
  donateQuantity = Math.max(0, donateQuantity);

  // 3) Remainder → local marketplace discount.
  const discountQuantity = quantity - donateQuantity;

  // 4) Primary action: donate if any units are allocated to recipients.
  //    High-quantity lots naturally land on "donate" when capacity > 0.
  /** @type {'donate'|'discount'} */
  const action = donateQuantity > 0 ? 'donate' : 'discount';

  const reasoning = buildReasoning({
    quantity,
    minutes,
    urgency,
    nearbyCapacity,
    preferredDonate,
    donateQuantity,
    discountQuantity,
  });

  return {
    action,
    donateQuantity,
    discountQuantity,
    reasoning,
    urgency,
  };
}

function buildReasoning({
  quantity,
  minutes,
  urgency,
  nearbyCapacity,
  preferredDonate,
  donateQuantity,
  discountQuantity,
}) {
  const timePart =
    minutes < 0
      ? `Cutoff passed ${Math.abs(minutes)} minutes ago`
      : `${minutes} minutes until cutoff — ${urgency} urgency`;

  if (nearbyCapacity <= 0) {
    return (
      `${timePart}. No nearby partners have room right now, so mark all ` +
      `${discountQuantity} portions for a same-day discount.`
    );
  }

  if (preferredDonate > nearbyCapacity) {
    return (
      `${timePart}. Nearby partners can take ${nearbyCapacity} of ${quantity} portions. ` +
      `Donate ${donateQuantity} and discount the remaining ${discountQuantity}.`
    );
  }

  return (
    `${timePart}. Nearby partners can take ${nearbyCapacity} portions. ` +
    `Donate ${donateQuantity} and recover value on ${discountQuantity} with a same-day discount.`
  );
}
