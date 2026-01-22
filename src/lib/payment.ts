export type Platform = 'web';
export type PurchaseType = 'subscription' | 'consumable' | 'physical';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  type: PurchaseType;
}

// Product catalog
export const PRODUCTS: Record<string, Product> = {
  // Subscriptions
  premium: {
    id: 'premium',
    title: 'Premium',
    description: 'Unlimited swipes, see who likes you, rewind',
    price: 20,
    currency: 'USD',
    type: 'subscription',
  },
  premium_plus: {
    id: 'premium_plus',
    title: 'Premium Plus',
    description: 'All Premium features + message before matching',
    price: 45,
    currency: 'USD',
    type: 'subscription',
  },
  // Consumables
  boost_1: {
    id: 'boost_1',
    title: '1 Boost',
    description: 'Get more visibility for 30 minutes',
    price: 5,
    currency: 'USD',
    type: 'consumable',
  },
  boost_5: {
    id: 'boost_5',
    title: '5 Boosts',
    description: 'Get more visibility for 30 minutes each',
    price: 20,
    currency: 'USD',
    type: 'consumable',
  },
  super_like_5: {
    id: 'super_like_5',
    title: '5 Super Likes',
    description: 'Stand out with Super Likes',
    price: 10,
    currency: 'USD',
    type: 'consumable',
  },
  rewind_5: {
    id: 'rewind_5',
    title: '5 Rewinds',
    description: 'Undo your last swipe',
    price: 8,
    currency: 'USD',
    type: 'consumable',
  },
};

/**
 * Get the current platform - always web since no native apps
 */
export function getPlatform(): Platform {
  return 'web';
}

/**
 * Check if running in a native app - always false
 */
export function isNativeApp(): boolean {
  return false;
}

/**
 * Always use Paystack for web
 */
export function shouldUsePaystack(): boolean {
  return true;
}
