import { getState, updateState } from '../data/store.js';

/**
 * @typedef {Object} SurplusItem
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {number} quantity
 * @property {number} [unitPrice]
 * @property {number} [discountPrice]
 * @property {string} availableUntil
 * @property {string} location
 * @property {string} status
 * @property {string} [businessId]
 */

/**
 * Return surplus items (optional status / businessId filters).
 * @param {{ status?: string, businessId?: string }} [filter]
 * @returns {SurplusItem[]}
 */
export function getSurplusItems(filter = {}) {
  const { surplusItems } = getState();
  return surplusItems.filter((item) => {
    if (filter.status && item.status !== filter.status) return false;
    if (filter.businessId && item.businessId !== filter.businessId) return false;
    return true;
  });
}

/**
 * @param {string} id
 * @returns {SurplusItem}
 */
export function getSurplusItemById(id) {
  const item = getState().surplusItems.find((entry) => entry.id === id);
  if (!item) throw new Error(`Surplus item not found: ${id}`);
  return item;
}

/**
 * Resolve a food item from an id string or object.
 * @param {string|SurplusItem} foodItem
 * @returns {SurplusItem}
 */
export function resolveFoodItem(foodItem) {
  if (typeof foodItem === 'string') return getSurplusItemById(foodItem);
  if (foodItem?.id) {
    const live = getState().surplusItems.find((entry) => entry.id === foodItem.id);
    if (live) return live;
    return foodItem;
  }
  throw new Error('foodItem must be an id string or surplus item object.');
}

/**
 * Intake a new surplus item (demo helper for the dashboard form).
 * Prices are optional so older seed/test items without them still work.
 * @param {Omit<SurplusItem, 'id'|'status'> & { status?: string }} input
 * @returns {SurplusItem}
 */
export function addSurplusItem(input) {
  if (!input?.name || !input?.quantity || !input?.availableUntil || !input?.location) {
    throw new Error('name, quantity, availableUntil, and location are required.');
  }
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new Error('quantity must be a positive integer.');
  }

  const hasUnitPrice = input.unitPrice !== undefined && input.unitPrice !== null;
  const hasDiscountPrice = input.discountPrice !== undefined && input.discountPrice !== null;

  let unitPrice;
  let discountPrice;
  if (hasUnitPrice || hasDiscountPrice) {
    unitPrice = Number(input.unitPrice);
    discountPrice = Number(input.discountPrice);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new Error('unitPrice must be a number greater than zero.');
    }
    if (!Number.isFinite(discountPrice) || discountPrice < 0 || discountPrice >= unitPrice) {
      throw new Error('discountPrice must be >= 0 and lower than unitPrice.');
    }
  }

  let createdId = '';
  updateState((draft) => {
    const nextNum = draft.surplusItems.length + 1;
    createdId = `food-${String(nextNum).padStart(3, '0')}`;
    /** @type {SurplusItem} */
    const item = {
      id: createdId,
      name: input.name.trim(),
      category: input.category || 'prepared-food',
      quantity: input.quantity,
      availableUntil: input.availableUntil,
      location: input.location.trim(),
      status: input.status || 'pending',
      businessId: input.businessId || draft.business.id,
    };
    if (unitPrice !== undefined) {
      item.unitPrice = unitPrice;
      item.discountPrice = discountPrice;
    }
    draft.surplusItems.push(item);
  });

  return getSurplusItemById(createdId);
}
