import { getPlatform, isNativeApp } from './payment';
import { supabase } from '@/integrations/supabase/client';

// Note: In a real native app, you would use:
// import { Purchases } from '@revenuecat/purchases-capacitor';
// For now, we define the interface for when the native plugin is available

interface IAPProduct {
  identifier: string;
  title: string;
  description: string;
  price: number;
  priceString: string;
  currencyCode: string;
}

interface PurchaseResult {
  success: boolean;
  transactionId?: string;
  receipt?: string;
  error?: string;
}

/**
 * IAP Service for handling in-app purchases on iOS and Android
 * Uses native plugins when running in Capacitor
 */
class IAPService {
  private initialized = false;

  /**
   * Initialize IAP - must be called before any purchases
   */
  async initialize(): Promise<void> {
    if (!isNativeApp()) {
      console.log('IAP: Running on web, skipping initialization');
      return;
    }

    if (this.initialized) return;

    try {
      // In a real implementation with RevenueCat:
      // const platform = getPlatform();
      // await Purchases.configure({
      //   apiKey: platform === 'ios' 
      //     ? 'YOUR_REVENUECAT_IOS_KEY' 
      //     : 'YOUR_REVENUECAT_ANDROID_KEY'
      // });
      
      console.log('IAP: Initialized for platform:', getPlatform());
      this.initialized = true;
    } catch (error) {
      console.error('IAP: Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Get available products from the store
   */
  async getProducts(productIds: string[]): Promise<IAPProduct[]> {
    if (!isNativeApp()) {
      console.log('IAP: Not available on web');
      return [];
    }

    try {
      // In a real implementation:
      // const { products } = await Purchases.getProducts({ productIdentifiers: productIds });
      // return products.map(p => ({
      //   identifier: p.identifier,
      //   title: p.title,
      //   description: p.description,
      //   price: p.price,
      //   priceString: p.priceString,
      //   currencyCode: p.currencyCode,
      // }));
      
      console.log('IAP: getProducts called with:', productIds);
      return [];
    } catch (error) {
      console.error('IAP: Failed to get products:', error);
      return [];
    }
  }

  /**
   * Purchase a subscription
   */
  async purchaseSubscription(productId: string): Promise<PurchaseResult> {
    if (!isNativeApp()) {
      return { success: false, error: 'IAP not available on web' };
    }

    try {
      // In a real implementation:
      // const { customerInfo } = await Purchases.purchaseProduct({ 
      //   productIdentifier: productId 
      // });
      // 
      // // Verify on backend
      // await this.verifyPurchase(productId, customerInfo);
      // 
      // return { 
      //   success: true, 
      //   transactionId: customerInfo.originalAppUserId 
      // };

      console.log('IAP: purchaseSubscription called for:', productId);
      
      // For demo, simulate a successful purchase flow
      return { 
        success: false, 
        error: 'Native IAP plugin not installed. Build the app with Capacitor to enable purchases.' 
      };
    } catch (error: any) {
      console.error('IAP: Purchase failed:', error);
      return { 
        success: false, 
        error: error.message || 'Purchase failed' 
      };
    }
  }

  /**
   * Purchase a consumable (boost, super like, etc.)
   */
  async purchaseConsumable(productId: string): Promise<PurchaseResult> {
    if (!isNativeApp()) {
      return { success: false, error: 'IAP not available on web' };
    }

    try {
      // Similar to subscription but for consumables
      console.log('IAP: purchaseConsumable called for:', productId);
      
      return { 
        success: false, 
        error: 'Native IAP plugin not installed. Build the app with Capacitor to enable purchases.' 
      };
    } catch (error: any) {
      console.error('IAP: Consumable purchase failed:', error);
      return { 
        success: false, 
        error: error.message || 'Purchase failed' 
      };
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<PurchaseResult> {
    if (!isNativeApp()) {
      return { success: false, error: 'IAP not available on web' };
    }

    try {
      // In a real implementation:
      // const { customerInfo } = await Purchases.restorePurchases();
      // await this.syncPurchasesWithBackend(customerInfo);
      
      console.log('IAP: restorePurchases called');
      return { success: true };
    } catch (error: any) {
      console.error('IAP: Restore failed:', error);
      return { 
        success: false, 
        error: error.message || 'Restore failed' 
      };
    }
  }

  /**
   * Verify purchase with our backend
   */
  private async verifyPurchase(productId: string, receipt: string): Promise<boolean> {
    const platform = getPlatform();
    const endpoint = platform === 'ios' ? 'verify-apple-receipt' : 'verify-google-purchase';

    try {
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: { productId, receipt },
      });

      if (error) throw error;
      return data?.valid === true;
    } catch (error) {
      console.error('IAP: Backend verification failed:', error);
      return false;
    }
  }

  /**
   * Check if user has an active subscription
   */
  async hasActiveSubscription(): Promise<boolean> {
    if (!isNativeApp()) return false;

    try {
      // In a real implementation:
      // const { customerInfo } = await Purchases.getCustomerInfo();
      // return Object.keys(customerInfo.entitlements.active).length > 0;
      
      return false;
    } catch (error) {
      console.error('IAP: Failed to check subscription:', error);
      return false;
    }
  }
}

export const iapService = new IAPService();
