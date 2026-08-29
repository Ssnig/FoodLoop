/**
 * Fire-and-forget n8n webhook client for rescue coordination events.
 * Failures never roll back FoodLoop business state.
 */

const DEFAULT_WEBHOOK_URL =
  'https://kyawsanhtun.app.n8n.cloud/webhook/foodloop-rescue-created';

/** @type {{ lastStatus: 'idle'|'pending'|'ok'|'error'|'skipped', lastMessage: string|null, lastAt: string|null, lastRescueId: string|null }} */
let notificationState = {
  lastStatus: 'idle',
  lastMessage: null,
  lastAt: null,
  lastRescueId: null,
};

/**
 * Resolve webhook URL from Vite env, Node env, or local default.
 * @returns {string|null}
 */
export function getRescueWebhookUrl() {
  try {
    // Vite / browser
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const viteUrl =
        import.meta.env.VITE_N8N_RESCUE_WEBHOOK_URL ||
        import.meta.env.VITE_N8N_WEBHOOK_URL;
      if (typeof viteUrl === 'string' && viteUrl.trim()) return viteUrl.trim();
    }
  } catch {
    // ignore — import.meta.env may be unavailable in some runtimes
  }

  if (typeof process !== 'undefined' && process.env) {
    const nodeUrl =
      process.env.N8N_RESCUE_WEBHOOK_URL ||
      process.env.VITE_N8N_RESCUE_WEBHOOK_URL;
    if (typeof nodeUrl === 'string' && nodeUrl.trim()) return nodeUrl.trim();
  }

  // Local hackathon default when n8n is running on this machine.
  return DEFAULT_WEBHOOK_URL;
}

/** Snapshot for UI badges / debugging. */
export function getN8nNotificationStatus() {
  return { ...notificationState };
}

/**
 * Build the stable rescue.created payload.
 *
 * @param {object} plan - rescue plan (may include recommendationSummary)
 * @param {{ surplusItem?: object, recipient?: object, business?: object }} [context]
 */
export function buildRescueCreatedPayload(plan, context = {}) {
  const recommendation = plan.recommendationSummary || {};
  const surplusItem = context.surplusItem || {
    id: plan.surplusItemId,
    name: plan.foodName,
    availableUntil: plan.availableUntil,
    location: plan.pickupLocation,
    status: 'confirmed rescue',
  };
  const recipient = context.recipient || {
    id: plan.recipientId,
    name: plan.recipientName,
  };

  return {
    event: 'rescue.created',
    source: 'foodloop-mvp',
    timestamp: new Date().toISOString(),
    business: context.business || {
      id: 'biz-001',
      name: surplusItem.location || plan.pickupLocation || 'ABC Bakery',
    },
    surplusItem,
    rescuePlan: {
      id: plan.id,
      surplusItemId: plan.surplusItemId,
      recipientId: plan.recipientId,
      recipientName: plan.recipientName,
      foodName: plan.foodName,
      donationQuantity: plan.donationQuantity,
      discountQuantity: plan.discountQuantity,
      quantity: plan.quantity,
      pickupLocation: plan.pickupLocation,
      availableUntil: plan.availableUntil,
      status: plan.status,
      createdAt: plan.createdAt,
    },
    recommendation: {
      action: recommendation.action || 'donate',
      urgency: recommendation.urgency || 'medium',
      reasoning: recommendation.reasoning || '',
      donateQuantity:
        recommendation.donateQuantity ?? plan.donationQuantity ?? 0,
      discountQuantity:
        recommendation.discountQuantity ?? plan.discountQuantity ?? 0,
    },
    recipient,
  };
}

/**
 * Notify n8n that a rescue was created.
 * Never throws — logs and updates notification status instead.
 *
 * @param {object} plan
 * @param {{ surplusItem?: object, recipient?: object, business?: object }} [context]
 * @returns {Promise<{ ok: boolean, skipped?: boolean, status: number|null, body: any, error?: string }>}
 */
export async function notifyRescueCreated(plan, context = {}) {
  const url = getRescueWebhookUrl();
  if (!url) {
    notificationState = {
      lastStatus: 'skipped',
      lastMessage: 'No n8n webhook URL configured',
      lastAt: new Date().toISOString(),
      lastRescueId: plan?.id || null,
    };
    return { ok: false, skipped: true, status: null, body: null };
  }

  const payload = buildRescueCreatedPayload(plan, context);
  notificationState = {
    lastStatus: 'pending',
    lastMessage: 'Notifying n8n coordinator…',
    lastAt: new Date().toISOString(),
    lastRescueId: plan?.id || null,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });

    let body = null;
    const text = await response.text();
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    if (!response.ok) {
      const error = `n8n webhook HTTP ${response.status}`;
      console.warn('[FoodLoop n8n] notify failed:', error, body);
      notificationState = {
        lastStatus: 'error',
        lastMessage: error,
        lastAt: new Date().toISOString(),
        lastRescueId: plan?.id || null,
      };
      return { ok: false, status: response.status, body, error };
    }

    const message =
      (body && typeof body === 'object' && body.message) ||
      'Coordinator notified';
    notificationState = {
      lastStatus: 'ok',
      lastMessage: String(message),
      lastAt: new Date().toISOString(),
      lastRescueId: plan?.id || null,
    };
    return { ok: true, status: response.status, body };
  } catch (err) {
    const error = err?.message || String(err);
    console.warn('[FoodLoop n8n] notify failed:', error);
    notificationState = {
      lastStatus: 'error',
      lastMessage: error,
      lastAt: new Date().toISOString(),
      lastRescueId: plan?.id || null,
    };
    return { ok: false, status: null, body: null, error };
  }
}

/** Test helper — resets badge state between cases. */
export function resetN8nNotificationStatus() {
  notificationState = {
    lastStatus: 'idle',
    lastMessage: null,
    lastAt: null,
    lastRescueId: null,
  };
}
