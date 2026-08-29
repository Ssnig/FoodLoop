/**
 * Shared WebMCP helpers — real Imperative API only:
 *   document.modelContext.registerTool(tool, { signal? })
 *   (fallback: navigator.modelContext during Chromium transition)
 *
 * @see https://developer.chrome.com/docs/ai/webmcp/imperative-api
 */

const LOG_PREFIX = '[FoodLoop WebMCP]';

/**
 * Feature-detect the WebMCP model context.
 * Prefer document.modelContext; fall back to navigator.modelContext.
 * @returns {ModelContext|null}
 */
export function getModelContext() {
  if (typeof document !== 'undefined' && document.modelContext) {
    return document.modelContext;
  }
  if (typeof navigator !== 'undefined' && navigator.modelContext) {
    return navigator.modelContext;
  }
  return null;
}

/**
 * True when registerTool is available on the detected context.
 * @returns {boolean}
 */
export function isWebMCPSupported() {
  const ctx = getModelContext();
  return Boolean(ctx && typeof ctx.registerTool === 'function');
}

export function logRegistration(toolName, detail = '') {
  console.log(`${LOG_PREFIX} register: ${toolName}`, detail || '');
}

export function logInvocation(toolName, args) {
  console.log(`${LOG_PREFIX} invoke: ${toolName}`, args);
}

export function logResult(toolName, result) {
  console.log(`${LOG_PREFIX} result: ${toolName}`, result);
}

export function logSkip(reason) {
  console.warn(`${LOG_PREFIX} skip registration:`, reason);
}

/**
 * Wrap a service call with invoke/result logging and error normalization.
 * Chrome execute handlers may receive (args, { signal }).
 *
 * @param {string} toolName
 * @param {(args: object) => unknown | Promise<unknown>} serviceFn
 * @returns {(args?: object, extras?: { signal?: AbortSignal }) => Promise<object>}
 */
export function withToolLogging(toolName, serviceFn) {
  return async (args = {}, _extras = {}) => {
    logInvocation(toolName, args);
    try {
      const data = await serviceFn(args);
      const result = { ok: true, data };
      logResult(toolName, result);
      return result;
    } catch (error) {
      const result = {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
      logResult(toolName, result);
      return result;
    }
  };
}

/**
 * Register one tool via the documented Imperative API.
 * @param {object} modelContext
 * @param {object} toolDef - { name, description, inputSchema, execute, annotations? }
 * @param {{ signal?: AbortSignal }} [registerOptions]
 */
export async function registerOneTool(modelContext, toolDef, registerOptions) {
  await modelContext.registerTool(toolDef, registerOptions);
  logRegistration(toolDef.name, toolDef.description);
}
