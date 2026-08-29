import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';

import { resetStore, getState, updateState } from '../src/data/store.js';
import { addSurplusItem, getSurplusItems } from '../src/services/surplusService.js';
import { findNearbyRecipients } from '../src/services/matchingService.js';
import {
  recommendAction,
  minutesUntilCutoff,
  urgencyFromMinutes,
} from '../src/services/recommendationService.js';
import {
  createRescue,
  completeRescue,
  getImpactMetrics,
} from '../src/services/rescueService.js';
import {
  notifyRescueCreated,
  getN8nNotificationStatus,
  buildRescueCreatedPayload,
  resetN8nNotificationStatus,
} from '../src/services/n8nService.js';
import {
  getModelContext,
  registerFoodLoopTools,
} from '../src/webmcp/registerTools.js';
import {
  login,
  signup,
  DEMO_CREDENTIALS,
} from '../src/services/authService.js';

/** Seed the classic demo lot (food-001) for flow tests. */
function seedDemoSurplus() {
  return addSurplusItem({
    name: 'Chicken Sandwiches',
    category: 'prepared-food',
    quantity: 20,
    availableUntil: '20:00',
    location: 'ABC Bakery',
    businessId: 'biz-001',
  });
}

/** @type {typeof fetch | undefined} */
let originalFetch;

beforeEach(() => {
  resetStore();
  resetN8nNotificationStatus();
  originalFetch = globalThis.fetch;
  globalThis.fetch = mock.fn(async () => ({
    ok: true,
    status: 200,
    async text() {
      return JSON.stringify({
        ok: true,
        notified: true,
        rescueId: 'rescue-001',
        message: 'Coordinator notified',
      });
    },
  }));
});

afterEach(() => {
  if (originalFetch) globalThis.fetch = originalFetch;
  else delete globalThis.fetch;
});

describe('getSurplusItems', () => {
  it('starts with an empty surplus board', () => {
    assert.equal(getSurplusItems().length, 0);
  });

  it('returns chicken sandwiches after intake', () => {
    const item = seedDemoSurplus();
    assert.equal(item.id, 'food-001');
    const items = getSurplusItems();
    assert.equal(items.length, 1);
    assert.equal(items[0].name, 'Chicken Sandwiches');
    assert.equal(items[0].quantity, 20);
    assert.equal(items[0].availableUntil, '20:00');
    assert.equal(items[0].location, 'ABC Bakery');
    assert.equal(items[0].status, 'pending');
  });

  it('filters surplus by businessId', () => {
    seedDemoSurplus();
    const abc = getSurplusItems({ businessId: 'biz-001' });
    assert.equal(abc.length, 1);
    assert.equal(getSurplusItems({ businessId: 'biz-999' }).length, 0);
  });
});

describe('authService', () => {
  it('logs in the seeded ABC Bakery owner', () => {
    const { user, business } = login(
      DEMO_CREDENTIALS.email,
      DEMO_CREDENTIALS.password,
    );
    assert.equal(user.email, 'owner@abcbakery.com');
    assert.equal(user.businessId, 'biz-001');
    assert.equal(business.name, 'ABC Bakery');
    assert.equal(user.password, undefined);
  });

  it('rejects bad credentials', () => {
    assert.throws(() => login('owner@abcbakery.com', 'wrong'), /Invalid email/);
  });

  it('signs up a new restaurant owner and scopes surplus', () => {
    const { user, business } = signup({
      name: 'Sam Chef',
      restaurantName: 'Sam Kitchen',
      email: 'sam@kitchen.test',
      password: 'secret12',
    });
    assert.equal(user.email, 'sam@kitchen.test');
    assert.equal(business.name, 'Sam Kitchen');
    assert.match(business.id, /^biz-/);

    addSurplusItem({
      name: 'Bagels',
      quantity: 8,
      availableUntil: '19:00',
      location: business.location,
      businessId: business.id,
    });

    assert.equal(getSurplusItems({ businessId: business.id }).length, 1);
    // Demo ABC Bakery starts with an empty board — scoped lists stay isolated.
    assert.equal(getSurplusItems({ businessId: 'biz-001' }).length, 0);
  });
});

describe('recommendationService', () => {
  beforeEach(() => {
    seedDemoSurplus();
  });

  it('classifies urgency from cutoff proximity', () => {
    assert.equal(urgencyFromMinutes(30), 'critical');
    assert.equal(urgencyFromMinutes(90), 'high');
    assert.equal(urgencyFromMinutes(180), 'medium');
    assert.equal(urgencyFromMinutes(300), 'low');
  });

  it('computes minutes until cutoff deterministically', () => {
    const now = new Date('2026-08-29T18:00:00');
    assert.equal(minutesUntilCutoff('20:00', now), 120);
  });

  it('demo: 20 sandwiches, 2h left, capacity 30 → donate 15 / discount 5', () => {
    // 18:00 with availableUntil 20:00 → 120 minutes → high urgency
    const now = new Date('2026-08-29T18:00:00');
    const rec = recommendAction('food-001', { now, nearbyCapacity: 30 });

    assert.deepEqual(
      {
        action: rec.action,
        donateQuantity: rec.donateQuantity,
        discountQuantity: rec.discountQuantity,
        urgency: rec.urgency,
      },
      {
        action: 'donate',
        donateQuantity: 15,
        discountQuantity: 5,
        urgency: 'high',
      },
    );
    assert.equal(typeof rec.reasoning, 'string');
    assert.match(rec.reasoning, /not an ML prediction/i);
  });

  it('discounts the remainder when nearby capacity is insufficient', () => {
    const now = new Date('2026-08-29T18:00:00');
    const rec = recommendAction('food-001', { now, nearbyCapacity: 10 });
    assert.equal(rec.action, 'donate');
    assert.equal(rec.donateQuantity, 10);
    assert.equal(rec.discountQuantity, 10);
  });

  it('recommends full discount when there is no nearby capacity', () => {
    const now = new Date('2026-08-29T18:00:00');
    const rec = recommendAction('food-001', { now, nearbyCapacity: 0 });
    assert.equal(rec.action, 'discount');
    assert.equal(rec.donateQuantity, 0);
    assert.equal(rec.discountQuantity, 20);
  });
  it('recommends recycle when past cutoff', () => {
    const now = new Date('2026-08-29T21:00:00'); // after 20:00
    const rec = recommendAction('food-001', { now, nearbyCapacity: 30 });
    assert.equal(rec.action, 'recycle');
    assert.equal(rec.donateQuantity, 0);
    assert.equal(rec.discountQuantity, 0);
  });
});

describe('findNearbyRecipients', () => {
  beforeEach(() => {
    seedDemoSurplus();
  });

  it('ranks Community Food Center first for chicken sandwiches', () => {
    const ranked = findNearbyRecipients('food-001');
    assert.equal(ranked.length, 3);
    assert.equal(ranked[0].name, 'Community Food Center');
    assert.equal(ranked[0].distanceKm, 2.1);
    assert.ok(ranked[0].matchScore >= ranked[1].matchScore);
    assert.deepEqual(
      ranked.map((r) => r.name),
      [
        'Community Food Center',
        'Hope Shelter',
        'University Community Kitchen',
      ],
    );
  });
});

describe('createRescue', () => {
  beforeEach(() => {
    seedDemoSurplus();
  });

  it('locks allocation and updates status to confirmed rescue', async () => {
    const plan = createRescue('food-001', 'rec-001', 15);
    assert.equal(plan.donationQuantity, 15);
    assert.equal(plan.discountQuantity, 5);
    assert.equal(plan.recipientName, 'Community Food Center');
    assert.equal(plan.status, 'planned');

    const item = getSurplusItems()[0];
    assert.equal(item.status, 'confirmed rescue');

    const recipient = getState().recipients.find((r) => r.id === 'rec-001');
    assert.equal(recipient.availableCapacity, 15);

    // Allow fire-and-forget notify to settle.
    await new Promise((r) => setTimeout(r, 20));
    assert.equal(globalThis.fetch.mock.callCount(), 1);
  });

  it('rejects over-allocation beyond recipient capacity', () => {
    updateState((draft) => {
      const uni = draft.recipients.find((r) => r.id === 'rec-003');
      uni.availableCapacity = 5;
    });

    assert.throws(
      () => createRescue('food-001', 'rec-003', 10),
      /exceeds recipient capacity/,
    );
  });

  it('rejects rescue on non-pending items', () => {
    createRescue('food-001', 'rec-001', 10);
    assert.throws(
      () => createRescue('food-001', 'rec-002', 5),
      /cannot be rescued/,
    );
  });
});

describe('completeRescue / impact', () => {
  beforeEach(() => {
    seedDemoSurplus();
  });

  it('updates meals, kg diverted, and value recovered', () => {
    const plan = createRescue('food-001', 'rec-001', 15);
    const { impactMetrics } = completeRescue(plan.id);

    assert.equal(impactMetrics.mealsRescued, 15);
    assert.equal(impactMetrics.foodDivertedKg, 9);
    assert.ok(impactMetrics.valueRecovered > 0);
    assert.deepEqual(getImpactMetrics(), impactMetrics);
  });
});

describe('n8nService', () => {
  beforeEach(() => {
    seedDemoSurplus();
  });

  it('builds a stable rescue.created payload', () => {
    const plan = createRescue('food-001', 'rec-001', 15, {
      now: new Date('2026-08-29T18:00:00'),
    });
    const payload = buildRescueCreatedPayload(plan);
    assert.equal(payload.event, 'rescue.created');
    assert.equal(payload.source, 'foodloop-mvp');
    assert.equal(payload.rescuePlan.donationQuantity, 15);
    assert.equal(payload.recommendation.urgency, 'high');
  });

  it('marks notification ok on webhook success', async () => {
    const plan = createRescue('food-001', 'rec-001', 15);
    const result = await notifyRescueCreated(plan);
    assert.equal(result.ok, true);
    assert.equal(result.status, 200);
    const status = getN8nNotificationStatus();
    assert.equal(status.lastStatus, 'ok');
    assert.equal(status.lastRescueId, plan.id);
  });

  it('marks notification error without rolling back rescue', async () => {
    globalThis.fetch = mock.fn(async () => {
      throw new Error('network down');
    });

    const plan = createRescue('food-001', 'rec-001', 15);
    assert.equal(plan.status, 'planned');
    assert.equal(getSurplusItems()[0].status, 'confirmed rescue');

    const result = await notifyRescueCreated(plan);
    assert.equal(result.ok, false);
    assert.match(result.error, /network down/);
    assert.equal(getN8nNotificationStatus().lastStatus, 'error');
  });
});

describe('WebMCP registration', () => {
  it('returns unavailable fallback when modelContext is missing', async () => {
    assert.equal(getModelContext(), null);
    const result = await registerFoodLoopTools();
    assert.equal(result.registered, false);
    assert.match(result.reason, /not available/i);
  });

  it('registers six tools via document.modelContext.registerTool when present', async () => {
    const registered = [];
    const fakeContext = {
      async registerTool(toolDef, _opts) {
        registered.push(toolDef.name);
        assert.equal(typeof toolDef.execute, 'function');
        assert.equal(toolDef.inputSchema.type, 'object');
      },
    };

    Object.defineProperty(globalThis, 'document', {
      value: { modelContext: fakeContext },
      configurable: true,
      writable: true,
    });

    try {
      const result = await registerFoodLoopTools();
      assert.equal(result.registered, true);
      assert.deepEqual(result.tools, [
        'getSurplusItems',
        'recommendAction',
        'findNearbyRecipients',
        'createRescue',
        'completeRescue',
        'getImpactMetrics',
      ]);
      assert.deepEqual(registered, result.tools);

      seedDemoSurplus();

      // Invoke recommendAction through the registered execute path.
      const { recommendAction: recommend } = await import(
        '../src/services/recommendationService.js'
      );
      const rec = recommend('food-001', {
        now: new Date('2026-08-29T18:00:00'),
        nearbyCapacity: 30,
      });
      assert.equal(rec.action, 'donate');
      assert.equal(rec.donateQuantity, 15);
    } finally {
      delete globalThis.document;
    }
  });
});
