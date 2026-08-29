/**
 * FoodLoop WebMCP registration entry point.
 *
 * Uses the Chrome WebMCP Imperative API only:
 *   await document.modelContext.registerTool(toolDef, { signal })
 *
 * Feature-detects support; if unavailable, returns safely so the
 * normal website continues without agent tools.
 *
 * @see https://developer.chrome.com/docs/ai/webmcp/imperative-api
 */

import { registerInventoryTools } from './inventoryTools.js';
import { registerMatchingTools } from './matchingTools.js';
import { registerRescueTools } from './rescueTools.js';
import {
  getModelContext,
  isWebMCPSupported,
  logSkip,
} from './toolHelpers.js';

export { getModelContext, isWebMCPSupported } from './toolHelpers.js';

const TOOL_NAMES = [
  'getSurplusItems',
  'recommendAction',
  'findNearbyRecipients',
  'createRescue',
  'completeRescue',
  'getImpactMetrics',
];

/**
 * Register all FoodLoop tools when WebMCP is available.
 *
 * @param {{ signal?: AbortSignal }} [options]
 *   Pass AbortController.signal to unregister on SPA unmount
 *   (documented Imperative API pattern).
 * @returns {Promise<{ registered: boolean, tools: string[], reason?: string }>}
 */
export async function registerFoodLoopTools(options = {}) {
  if (!isWebMCPSupported()) {
    const reason =
      'WebMCP modelContext.registerTool is not available in this browser.';
    logSkip(reason);
    return { registered: false, tools: [], reason };
  }

  const modelContext = getModelContext();
  const registerOptions = options.signal ? { signal: options.signal } : undefined;

  // Tools call existing services only — no duplicated decision logic.
  await registerInventoryTools(modelContext, registerOptions);
  await registerMatchingTools(modelContext, registerOptions);
  await registerRescueTools(modelContext, registerOptions);

  console.log('[FoodLoop WebMCP] all tools registered:', TOOL_NAMES);

  return { registered: true, tools: [...TOOL_NAMES] };
}
