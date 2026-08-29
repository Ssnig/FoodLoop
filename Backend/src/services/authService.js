/**
 * Demo auth for restaurant owners (in-memory, no real hashing).
 */

import { getState, updateState } from '../data/store.js';

/**
 * @typedef {Object} AuthUser
 * @property {string} id
 * @property {string} email
 * @property {string} password
 * @property {string} name
 * @property {string} businessId
 * @property {'owner'|string} role
 */

/**
 * @typedef {Object} PublicUser
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} businessId
 * @property {string} role
 */

/**
 * @typedef {Object} Business
 * @property {string} id
 * @property {string} name
 * @property {string} location
 * @property {number} [lat]
 * @property {number} [lng]
 */

/**
 * @param {AuthUser} user
 * @returns {PublicUser}
 */
function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    businessId: user.businessId,
    role: user.role,
  };
}

/**
 * @param {string} email
 * @param {string} password
 * @returns {{ user: PublicUser, business: Business }}
 */
export function login(email, password) {
  const normalized = String(email || '')
    .trim()
    .toLowerCase();
  if (!normalized || !password) {
    throw new Error('Email and password are required.');
  }

  const state = getState();
  const user = state.users.find(
    (entry) => entry.email.toLowerCase() === normalized && entry.password === password,
  );
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const business = getBusinessById(user.businessId);
  return { user: toPublicUser(user), business };
}

/**
 * Create a new restaurant + owner account.
 * @param {{ email: string, password: string, name: string, restaurantName: string }} input
 * @returns {{ user: PublicUser, business: Business }}
 */
export function signup(input) {
  const email = String(input?.email || '')
    .trim()
    .toLowerCase();
  const password = String(input?.password || '');
  const name = String(input?.name || '').trim();
  const restaurantName = String(input?.restaurantName || '').trim();

  if (!email || !password || !name || !restaurantName) {
    throw new Error('Name, restaurant name, email, and password are required.');
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const existing = getState().users.find((u) => u.email.toLowerCase() === email);
  if (existing) {
    throw new Error('An account with that email already exists.');
  }

  let createdUserId = '';
  let createdBusinessId = '';

  updateState((draft) => {
    createdBusinessId = `biz-${String(draft.nextBusinessId).padStart(3, '0')}`;
    draft.nextBusinessId += 1;

    const newBusiness = {
      id: createdBusinessId,
      name: restaurantName,
      location: restaurantName,
      lat: 40.7128,
      lng: -74.006,
    };
    draft.businesses.push(newBusiness);

    createdUserId = `user-${String(draft.nextUserId).padStart(3, '0')}`;
    draft.nextUserId += 1;
    draft.users.push({
      id: createdUserId,
      email,
      password,
      name,
      businessId: createdBusinessId,
      role: 'owner',
    });
  });

  const user = getUserById(createdUserId);
  const business = getBusinessById(createdBusinessId);
  return { user, business };
}

/**
 * @param {string} id
 * @returns {PublicUser}
 */
export function getUserById(id) {
  const user = getState().users.find((entry) => entry.id === id);
  if (!user) throw new Error(`User not found: ${id}`);
  return toPublicUser(user);
}

/**
 * @param {string} businessId
 * @returns {Business}
 */
export function getBusinessById(businessId) {
  const state = getState();
  const found =
    state.businesses?.find((b) => b.id === businessId) ||
    (state.business?.id === businessId ? state.business : null);
  if (!found) throw new Error(`Business not found: ${businessId}`);
  return { ...found };
}

/** Demo credentials for the seeded ABC Bakery owner. */
export const DEMO_CREDENTIALS = {
  email: 'owner@abcbakery.com',
  password: 'demo1234',
  restaurantName: 'ABC Bakery',
};
