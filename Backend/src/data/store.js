import { createInitialState } from './demoData.js';

let state = createInitialState();
const listeners = new Set();

function notify() {
  const snapshot = getState();
  for (const listener of listeners) listener(snapshot);
}

/** Immutable snapshot for UI / WebMCP consumers. */
export function getState() {
  return structuredClone(state);
}

/** @param {(snapshot: ReturnType<typeof getState>) => void} listener */
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** @param {(draft: ReturnType<typeof createInitialState>) => void} updater */
export function updateState(updater) {
  updater(state);
  notify();
  return getState();
}

export function resetStore() {
  state = createInitialState();
  notify();
  return getState();
}

export function nextRescueId() {
  const id = `rescue-${String(state.nextRescueId).padStart(3, '0')}`;
  state.nextRescueId += 1;
  return id;
}
