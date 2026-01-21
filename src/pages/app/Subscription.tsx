import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Star, Zap, Shield, Eye, Undo2, MessageCircle, ArrowLeft, Loader2, Smartphone, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { getSubscription } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getPlatform, isNativeApp, shouldUseIAP, PRODUCTS } from "@/lib/payment";
import { iapService } from "@/lib/iap";

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "USD",
    features: [
      "5 messages per day",
      "20 swipes per day",
      "Basic discovery",
      "Standard profile",
    ],
    icon: <Star className="w-6 h-6" />,
  },
  {
    id: "premium",
    name: "Premium",
    price: 20,
    currency: "USD",
    features: [
      "Unlimited messages",
      "Unlimited swipes",
      "See who likes you",
      "1 Boost per month",
      "Rewind last swipe",
      "Advanced filters",
    ],
    popular: true,
    icon: <Crown className="w-6 h-6" />,
  },
  {
    id: "premium_plus",
    name: "Premium Plus",
    price: 45,
    currency: "USD",
    features: [
      "Everything in Premium",
      "Priority likes",
      "5 Boosts per month",
      "Message before matching",
      "Read receipts",
      "Incognito mode",
      "Travel mode",
    ],
    icon: <Zap className="w-6 h-6" />,
  },
];

const Subscription = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTier, setCurrentTier] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const platform = getPlatform();
  const isNative = isNativeApp();

  useEffect(() => {
    loadSubscription();
    if (isNative) {
      iapService.initialize().catch(console.error);
    }
  }, [isNative]);

  const loadSubscription = async () => {
    const { data } = await getSubscription();
    if (data) {
      setCurrentTier(data.tier);
    }
    setLoading(false);
  };

  const handleSubscribe = async (planId: string) => {
    if (planId === "free" || planId === currentTier) return;

    setProcessing(planId);

    try {
      const product = PRODUCTS[planId];
      const useIAP = shouldUseIAP(product?.type || 'subscription');

      if (useIAP) {
        // Native IAP flow
        const result = await iapService.purchaseSubscription(
          platform === 'ios' ? product.appleProductId! : product.googleProductId!
        );

        if (result.success) {
          toast.success("Subscription activated!");
          await loadSubscription();
        } else {
          toast.error(result.error || "Purchase failed");
        }
      } else {
        // Web Paystack flow
        const { data, error } = await supabase.functions.invoke("paystack-initialize", {
          body: { plan: planId, email: user?.email },
        });

        if (error) throw error;

        if (data.authorization_url) {
          window.location.href = data.authorization_url;
        }
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to process payment");
    } finally {
      setProcessing(null);
    }
  };

  const handleRestorePurchases = async () => {
    setProcessing("restore");
    try {
      const result = await iapService.restorePurchases();
      if (result.success) {
        toast.success("Purchases restored!");
        await loadSubscription();
      } else {
        toast.error(result.error || "Restore failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Restore failed");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Choose Your Plan</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Platform indicator for native */}
        {isNative && (
          <Alert className="mb-6">
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              {platform === 'ios' ? 'Apple App Store' : 'Google Play'} billing will be used for subscriptions.
            </AlertDescription>
          </Alert>
        )}

        {/* Current Plan Badge */}
        {currentTier !== "free" && (
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
              <Crown className="w-5 h-5" />
              <span className="font-medium">
                You're on {currentTier === "premium" ? "Premium" : "Premium Plus"}
              </span>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`relative h-full transition-all ${
                  plan.popular
                    ? "border-primary shadow-lg ring-2 ring-primary/20"
                    : "hover:border-primary/50"
                } ${currentTier === plan.id ? "bg-primary/5" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pt-8">
                  <div
                    className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                      plan.popular
                        ? "bg-gradient-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {plan.icon}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-3xl font-bold mt-2">
                    {plan.price === 0 ? (
                      "Free"
                    ) : (
                      <>
                        ${plan.price}
                        <span className="text-sm font-normal text-muted-foreground">
                          /month
                        </span>
                      </>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-success flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    disabled={currentTier === plan.id || processing !== null}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {processing === plan.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {currentTier === plan.id
                      ? "Current Plan"
                      : plan.price === 0
                      ? "Free Forever"
                      : "Subscribe Now"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Restore Purchases - iOS/Android only */}
        {isNative && (
          <div className="mt-8 text-center">
            <Button
              variant="ghost"
              onClick={handleRestorePurchases}
              disabled={processing === "restore"}
            >
              {processing === "restore" ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Restore Purchases
            </Button>
          </div>
        )}

        {/* Features Comparison */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Premium Features
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: <Eye className="w-5 h-5" />, title: "See Who Likes You", desc: "View everyone who's interested" },
              { icon: <Undo2 className="w-5 h-5" />, title: "Rewind", desc: "Undo your last swipe" },
              { icon: <MessageCircle className="w-5 h-5" />, title: "Unlimited Messages", desc: "Chat without limits" },
              { icon: <Shield className="w-5 h-5" />, title: "Incognito Mode", desc: "Browse profiles privately" },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-xl bg-muted/50"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
