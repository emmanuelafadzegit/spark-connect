import { Capacitor } from '@capacitor/core';

export type Platform = 'web' | 'android' | 'ios';
export type PurchaseType = 'subscription' | 'consumable' | 'physical';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  type: PurchaseType;
  // IAP identifiers
  googleProductId?: string;
  appleProductId?: string;
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
    googleProductId: 'matchly_premium_monthly',
    appleProductId: 'matchly_premium_monthly',
  },
  premium_plus: {
    id: 'premium_plus',
    title: 'Premium Plus',
    description: 'All Premium features + message before matching',
    price: 45,
    currency: 'USD',
    type: 'subscription',
    googleProductId: 'matchly_premium_plus_monthly',
    appleProductId: 'matchly_premium_plus_monthly',
  },
  // Consumables
  boost_1: {
    id: 'boost_1',
    title: '1 Boost',
    description: 'Get more visibility for 30 minutes',
    price: 5,
    currency: 'USD',
    type: 'consumable',
    googleProductId: 'matchly_boost_1',
    appleProductId: 'matchly_boost_1',
  },
  boost_5: {
    id: 'boost_5',
    title: '5 Boosts',
    description: 'Get more visibility for 30 minutes each',
    price: 20,
    currency: 'USD',
    type: 'consumable',
    googleProductId: 'matchly_boost_5',
    appleProductId: 'matchly_boost_5',
  },
  super_like_5: {
    id: 'super_like_5',
    title: '5 Super Likes',
    description: 'Stand out with Super Likes',
    price: 10,
    currency: 'USD',
    type: 'consumable',
    googleProductId: 'matchly_super_like_5',
    appleProductId: 'matchly_super_like_5',
  },
  rewind_5: {
    id: 'rewind_5',
    title: '5 Rewinds',
    description: 'Undo your last swipe',
    price: 8,
    currency: 'USD',
    type: 'consumable',
    googleProductId: 'matchly_rewind_5',
    appleProductId: 'matchly_rewind_5',
  },
};

/**
 * Get the current platform
 */
export function getPlatform(): Platform {
  const platform = Capacitor.getPlatform();
  if (platform === 'android') return 'android';
  if (platform === 'ios') return 'ios';
  return 'web';
}

/**
 * Check if running in a native app
 */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Determine if we should use IAP for a given purchase type
 * - Web: Always use Paystack
 * - Native + Digital (subscription/consumable): Use IAP
 * - Native + Physical: Use Paystack
 */
export function shouldUseIAP(purchaseType: PurchaseType): boolean {
  if (!isNativeApp()) return false;
  return purchaseType === 'subscription' || purchaseType === 'consumable';
}

/**
 * Get the native product ID for the current platform
 */
export function getNativeProductId(productId: string): string | null {
  const product = PRODUCTS[productId];
  if (!product) return null;
  
  const platform = getPlatform();
  if (platform === 'android') return product.googleProductId || null;
  if (platform === 'ios') return product.appleProductId || null;
  return null;
}
