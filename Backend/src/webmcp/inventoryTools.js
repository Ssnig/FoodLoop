/**
 * Inventory WebMCP tools — thin adapters over surplus + recommendation services.
 * No business logic here.
 */

import { getSurplusItems } from '../services/surplusService.js';
import { recommendAction } from '../services/recommendationService.js';
import { registerOneTool, withToolLogging } from './toolHelpers.js';

/**
 * @param {object} modelContext - document.modelContext | navigator.modelContext
 * @param {{ signal?: AbortSignal }} [registerOptions]
 */
export async function registerInventoryTools(modelContext, registerOptions) {
  await registerOneTool(
    modelContext,
    {
      name: 'getSurplusItems',
      description:
        'Return surplus food items requiring attention (e.g. ABC Bakery chicken sandwiches nearing cutoff).',
      inputSchema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'Optional status filter such as pending or confirmed rescue',
          },
        },
      },
      annotations: { readOnlyHint: true },
      execute: withToolLogging('getSurplusItems', (args) =>
        getSurplusItems(args.status ? { status: args.status } : {}),
      ),
    },
    registerOptions,
  );

  await registerOneTool(
    modelContext,
    {
      name: 'recommendAction',
      description:
        'Analyze a surplus item and recommend donate, discount, or recycle using the deterministic FoodLoop decision engine (not ML).',
      inputSchema: {
        type: 'object',
        properties: {
          foodItemId: {
            type: 'string',
            description: 'Surplus item id, e.g. food-001',
          },
        },
        required: ['foodItemId'],
      },
      annotations: { readOnlyHint: true },
      execute: withToolLogging('recommendAction', (args) =>
        recommendAction(args.foodItemId),
      ),
    },
    registerOptions,
  );
}
