/**
 * Frontend view-model types aligned with Backend contracts.
 */

export type SurplusStatus =
  | "pending"
  | "confirmed rescue"
  | "rescued"
  | "expired"
  | string;

export interface SurplusItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  availableUntil: string;
  location: string;
  status: SurplusStatus;
  businessId?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  businessId: string;
  role: string;
}

export interface Business {
  id: string;
  name: string;
  location: string;
  lat?: number;
  lng?: number;
}

export interface Recipient {
  id: string;
  name: string;
  distanceKm: number;
  capacity: number;
  availableCapacity?: number;
  matchScore: number;
  suggestedQuantity?: number;
  address: string;
  pickupWindow?: string;
}

export interface Recommendation {
  action: "donate" | "discount" | "recycle" | string;
  donationQuantity: number;
  discountQuantity: number;
  urgency: "critical" | "high" | "medium" | "low" | string;
  reason: string;
}

export interface RescuePlan {
  id: string;
  surplusItemId: string;
  recipientId: string;
  recipientName?: string;
  foodName?: string;
  quantity?: number;
  donationQuantity?: number;
  discountQuantity?: number;
  availableUntil?: string;
  pickupLocation?: string;
  pickupTime?: string;
  status: string;
  createdAt?: string;
  completedAt?: string;
  driverNote?: string;
}

export interface ImpactMetric {
  label: string;
  value: string;
  helper: string;
}
