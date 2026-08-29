/**
 * Rescue WebMCP tools — thin adapters over rescueService.
 * No business logic here.
 */

import {
  createRescue,
  completeRescue,
  getImpactMetrics,
} from '../services/rescueService.js';
import { getN8nNotificationStatus } from '../services/n8nService.js';
import { registerOneTool, withToolLogging } from './toolHelpers.js';

/**
 * @param {object} modelContext - document.modelContext | navigator.modelContext
 * @param {{ signal?: AbortSignal }} [registerOptions]
 */
export async function registerRescueTools(modelContext, registerOptions) {
  await registerOneTool(
    modelContext,
    {
      name: 'createRescue',
      description:
        'Create a rescue plan connecting a business surplus item with a recipient organization. Also notifies the n8n rescue coordinator webhook.',
      inputSchema: {
        type: 'object',
        properties: {
          foodItemId: {
            type: 'string',
            description: 'Surplus item id',
          },
          recipientId: {
            type: 'string',
            description: 'Recipient organization id',
          },
          quantity: {
            type: 'number',
            description: 'Donation quantity to allocate to the recipient',
          },
        },
        required: ['foodItemId', 'recipientId', 'quantity'],
      },
      annotations: { readOnlyHint: false },
      execute: withToolLogging('createRescue', (args) =>
        createRescue(args.foodItemId, args.recipientId, args.quantity),
      ),
    },
    registerOptions,
  );

  await registerOneTool(
    modelContext,
    {
      name: 'completeRescue',
      description:
        'Mark a rescue plan complete and update impact metrics (meals rescued, kg diverted, value recovered).',
      inputSchema: {
        type: 'object',
        properties: {
          rescueId: {
            type: 'string',
            description: 'Rescue plan id returned by createRescue',
          },
        },
        required: ['rescueId'],
      },
      annotations: { readOnlyHint: false },
      execute: withToolLogging('completeRescue', (args) =>
        completeRescue(args.rescueId),
      ),
    },
    registerOptions,
  );

  await registerOneTool(
    modelContext,
    {
      name: 'getImpactMetrics',
      description:
        'Return live FoodLoop impact metrics: mealsRescued, foodDivertedKg, valueRecovered. Also includes latest n8n coordinator notification status.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      annotations: { readOnlyHint: true },
      execute: withToolLogging('getImpactMetrics', () => ({
        impactMetrics: getImpactMetrics(),
        n8nNotification: getN8nNotificationStatus(),
      })),
    },
    registerOptions,
  );
}
