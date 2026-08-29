/**
 * End-to-end demo rehearsal (no UI):
 * intake → recommend → rank → rescue → n8n notify → complete → impact
 */
import {
  addSurplusItem,
  getSurplusItems,
  findNearbyRecipients,
  recommendAction,
  createRescue,
  completeRescue,
  getImpactMetrics,
  getN8nNotificationStatus,
  resetStore,
} from '../src/services/index.js';
import { resetN8nNotificationStatus } from '../src/services/n8nService.js';

resetStore();
resetN8nNotificationStatus();

const created = addSurplusItem({
  name: 'Chicken Sandwiches',
  category: 'prepared-food',
  quantity: 20,
  availableUntil: '20:00',
  location: 'ABC Bakery',
  businessId: 'biz-001',
});
console.log('1. Surplus items after intake:', getSurplusItems());

const recommendation = recommendAction(created, {
  now: new Date('2026-08-29T18:00:00'),
});
console.log('2. Recommendation:', recommendation);

const nearby = findNearbyRecipients(created);
console.log(
  '3. Nearby recipients:',
  nearby.map((r) => `${r.name} (${r.distanceKm} km, ${r.matchScore}% match)`),
);

const top = nearby[0];
const plan = createRescue(created, top.id, recommendation.donateQuantity, {
  now: new Date('2026-08-29T18:00:00'),
});
console.log('4. Rescue plan:', {
  id: plan.id,
  recipient: plan.recipientName,
  donation: plan.donationQuantity,
  discount: plan.discountQuantity,
  status: plan.status,
});

await new Promise((r) => setTimeout(r, 50));
console.log('4b. n8n notification:', getN8nNotificationStatus());

const { impactMetrics } = completeRescue(plan.id);
console.log('5. Impact after completion:', impactMetrics);
console.log('6. getImpactMetrics():', getImpactMetrics());
console.log('Demo flow OK');
