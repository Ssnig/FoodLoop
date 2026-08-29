/**
 * FoodLoop demo fixtures — in-memory only, no external backend.
 */

export const business = {
  id: 'biz-001',
  name: 'ABC Bakery',
  location: 'ABC Bakery',
  lat: 40.7128,
  lng: -74.006,
};

/**
 * Default restaurant owner for hackathon demos.
 * Login: owner@abcbakery.com / demo1234
 * @type {import('../services/authService.js').AuthUser[]}
 */
export const users = [
  {
    id: 'user-001',
    email: 'owner@abcbakery.com',
    password: 'demo1234',
    name: 'Alex Owner',
    businessId: business.id,
    role: 'owner',
  },
];

/** @type {import('../services/surplusService.js').SurplusItem[]} */
export const surplusItems = [];

/** @type {import('../services/matchingService.js').Recipient[]} */
export const recipients = [
  {
    id: 'rec-001',
    name: 'Community Food Center',
    distanceKm: 2.1,
    capacity: 30,
    availableCapacity: 30,
    acceptedCategories: ['prepared-food', 'bakery', 'produce', 'dairy', 'packaged'],
    address: '12 Hope Street',
  },
  {
    id: 'rec-002',
    name: 'Hope Shelter',
    distanceKm: 3.4,
    capacity: 50,
    availableCapacity: 50,
    acceptedCategories: ['prepared-food', 'bakery', 'packaged'],
    address: '88 Market Avenue',
  },
  {
    id: 'rec-003',
    name: 'University Community Kitchen',
    distanceKm: 4.7,
    capacity: 20,
    availableCapacity: 20,
    acceptedCategories: ['prepared-food', 'produce', 'dairy', 'bakery'],
    address: '210 Campus Road',
  },
];

/** @type {import('../services/rescueService.js').RescuePlan[]} */
export const rescuePlans = [];

export const impactMetrics = {
  mealsRescued: 0,
  foodDivertedKg: 0,
  valueRecovered: 0,
};

/** Metric constants used when a rescue is completed. */
export const METRICS = {
  KG_PER_MEAL: 0.45,
  DONATION_VALUE_PER_MEAL: 4.5,
  DISCOUNT_VALUE_PER_MEAL: 2.0,
};

/**
 * Fresh mutable state clone for the in-memory store.
 */
export function createInitialState() {
  return {
    business: { ...business },
    businesses: [{ ...business }],
    users: users.map((u) => ({ ...u })),
    surplusItems: surplusItems.map((item) => ({ ...item })),
    recipients: recipients.map((r) => ({
      ...r,
      acceptedCategories: [...r.acceptedCategories],
    })),
    rescuePlans: [],
    impactMetrics: { ...impactMetrics },
    nextRescueId: 1,
    nextUserId: 2,
    nextBusinessId: 2,
  };
}
