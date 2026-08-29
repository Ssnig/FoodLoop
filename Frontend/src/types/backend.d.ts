/** Ambient types for Backend JS modules imported via @backend alias. */

declare module "@backend/services/index.js" {
  export function getSurplusItems(filter?: {
    status?: string;
    businessId?: string;
  }): SurplusItem[];
  export function getSurplusItemById(id: string): SurplusItem;
  export function addSurplusItem(input: {
    name: string;
    category?: string;
    quantity: number;
    unitPrice?: number;
    discountPrice?: number;
    availableUntil: string;
    location: string;
    status?: string;
    businessId?: string;
  }): SurplusItem;
  export function findNearbyRecipients(foodItem: string | SurplusItem): RankedRecipient[];
  export function getBestRecipient(foodItem: string | SurplusItem): RankedRecipient | null;
  export function recommendAction(
    foodItem: string | SurplusItem,
    options?: { now?: Date; nearbyCapacity?: number }
  ): Recommendation;
  export function createRescue(
    foodItem: string | SurplusItem,
    recipient: string | { id: string },
    quantity: number,
    options?: Record<string, unknown>
  ): RescuePlan;
  export function completeRescue(rescueId: string): {
    plan: RescuePlan;
    impactMetrics: ImpactMetrics;
  };
  export function listRescuePlans(): RescuePlan[];
  export function getImpactMetrics(): ImpactMetrics;
  export function getN8nNotificationStatus(): N8nStatus;
  export function resetN8nNotificationStatus(): void;
  export function getState(): FoodLoopState;
  export function subscribe(listener: (snapshot: FoodLoopState) => void): () => void;
  export function resetStore(): FoodLoopState;

  export function login(
    email: string,
    password: string
  ): { user: PublicUser; business: Business };
  export function signup(input: {
    email: string;
    password: string;
    name: string;
    restaurantName: string;
  }): { user: PublicUser; business: Business };
  export function getUserById(id: string): PublicUser;
  export function getBusinessById(businessId: string): Business;
  export const DEMO_CREDENTIALS: {
    email: string;
    password: string;
    restaurantName: string;
  };

  export interface PublicUser {
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

  export interface SurplusItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unitPrice?: number;
    discountPrice?: number;
    availableUntil: string;
    location: string;
    status: string;
    businessId?: string;
  }

  export interface RankedRecipient {
    id: string;
    name: string;
    distanceKm: number;
    capacity: number;
    availableCapacity: number;
    matchScore: number;
    suggestedQuantity: number;
    address: string;
  }

  export interface Recommendation {
    action: "donate" | "discount" | "recycle";
    donateQuantity: number;
    discountQuantity: number;
    reasoning: string;
    urgency: "critical" | "high" | "medium" | "low";
  }

  export interface RescuePlan {
    id: string;
    surplusItemId: string;
    recipientId: string;
    recipientName: string;
    foodName: string;
    quantity: number;
    donationQuantity: number;
    discountQuantity: number;
    availableUntil: string;
    pickupLocation: string;
    status: string;
    createdAt: string;
    completedAt?: string;
  }

  export interface ImpactMetrics {
    mealsRescued: number;
    foodDivertedKg: number;
    valueRecovered: number;
  }

  export interface N8nStatus {
    lastStatus: "idle" | "pending" | "ok" | "error" | "skipped";
    lastMessage: string | null;
    lastAt?: string | null;
    lastRescueId?: string | null;
    lastPayload?: unknown;
  }

  export interface FoodLoopState {
    business: Business;
    businesses: Business[];
    users: Array<{
      id: string;
      email: string;
      password: string;
      name: string;
      businessId: string;
      role: string;
    }>;
    surplusItems: SurplusItem[];
    recipients: Array<{
      id: string;
      name: string;
      distanceKm: number;
      capacity: number;
      availableCapacity: number;
      acceptedCategories: string[];
      address?: string;
    }>;
    rescuePlans: RescuePlan[];
    impactMetrics: ImpactMetrics;
  }
}

declare module "@backend/webmcp/index.js" {
  export function registerFoodLoopTools(options?: {
    signal?: AbortSignal;
  }): Promise<{ registered: boolean; tools: string[]; reason?: string }>;
  export function getModelContext(): unknown;
  export function isWebMCPSupported(): boolean;
}
