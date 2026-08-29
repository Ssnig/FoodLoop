/**
 * Matching WebMCP tools — thin adapters over matchingService.
 * No business logic here.
 */

import { findNearbyRecipients } from '../services/matchingService.js';
import { registerOneTool, withToolLogging } from './toolHelpers.js';

/**
 * @param {object} modelContext - document.modelContext | navigator.modelContext
 * @param {{ signal?: AbortSignal }} [registerOptions]
 */
export async function registerMatchingTools(modelContext, registerOptions) {
  await registerOneTool(
    modelContext,
    {
      name: 'findNearbyRecipients',
      description:
        'Find suitable nearby recipient organizations for a surplus food item, ranked by proximity and capacity.',
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
      execute: withToolLogging('findNearbyRecipients', (args) =>
        findNearbyRecipients(args.foodItemId),
      ),
    },
    registerOptions,
  );
}
