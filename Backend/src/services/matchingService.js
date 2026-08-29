import { getState } from '../data/store.js';
import { resolveFoodItem } from './surplusService.js';

/** Soft max distance (km) for nearby matching. */
const DISTANCE_CAP_KM = 15;

/** Match score weights — must sum to 1. */
const WEIGHTS = {
  proximity: 0.6,
  capacity: 0.4,
};

/**
 * @typedef {Object} Recipient
 * @property {string} id
 * @property {string} name
 * @property {number} distanceKm
 * @property {number} capacity
 * @property {number} availableCapacity
 * @property {string[]} acceptedCategories
 * @property {string} [address]
 */

/**
 * @typedef {Object} RankedRecipient
 * @property {string} id
 * @property {string} name
 * @property {number} distanceKm
 * @property {number} capacity
 * @property {number} availableCapacity
 * @property {number} matchScore
 * @property {number} suggestedQuantity
 * @property {string} address
 */

/**
 * Deterministic proximity score in [0, 1] (closer is better).
 * @param {number} distanceKm
 */
function proximityScore(distanceKm) {
  if (distanceKm <= 0) return 1;
  return 1 - Math.min(distanceKm, DISTANCE_CAP_KM) / DISTANCE_CAP_KM;
}

/**
 * Capacity fit score in [0, 1].
 * @param {number} availableCapacity
 * @param {number} neededQuantity
 */
function capacityScore(availableCapacity, neededQuantity) {
  if (neededQuantity <= 0) return 1;
  if (availableCapacity <= 0) return 0;
  return Math.min(1, availableCapacity / neededQuantity);
}

/**
 * Weighted match percentage 0–100.
 * @param {number} distanceKm
 * @param {number} availableCapacity
 * @param {number} neededQuantity
 */
export function computeMatchScore(distanceKm, availableCapacity, neededQuantity) {
  const score =
    WEIGHTS.proximity * proximityScore(distanceKm) +
    WEIGHTS.capacity * capacityScore(availableCapacity, neededQuantity);
  return Math.round(score * 100);
}

/**
 * Rank nearby recipients for a surplus food item.
 * Prefer closest orgs that can accept the category and have capacity.
 *
 * @param {string|import('./surplusService.js').SurplusItem} foodItem
 * @returns {RankedRecipient[]}
 */
export function findNearbyRecipients(foodItem) {
  const item = resolveFoodItem(foodItem);
  const { recipients } = getState();
  const needed = item.quantity;

  /** @type {RankedRecipient[]} */
  const ranked = [];

  for (const recipient of recipients) {
    if (recipient.distanceKm > DISTANCE_CAP_KM) continue;
    if (recipient.availableCapacity <= 0) continue;
    if (
      recipient.acceptedCategories?.length &&
      !recipient.acceptedCategories.includes(item.category)
    ) {
      continue;
    }

    const matchScore = computeMatchScore(
      recipient.distanceKm,
      recipient.availableCapacity,
      needed,
    );

    ranked.push({
      id: recipient.id,
      name: recipient.name,
      distanceKm: recipient.distanceKm,
      capacity: recipient.capacity,
      availableCapacity: recipient.availableCapacity,
      matchScore,
      suggestedQuantity: Math.min(needed, recipient.availableCapacity),
      address: recipient.address || '',
    });
  }

  ranked.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    return a.name.localeCompare(b.name);
  });

  return ranked;
}

/**
 * @param {string|import('./surplusService.js').SurplusItem} foodItem
 * @returns {RankedRecipient|null}
 */
export function getBestRecipient(foodItem) {
  return findNearbyRecipients(foodItem)[0] ?? null;
}
