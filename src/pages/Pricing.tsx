import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Star, Zap, Shield, Eye, Undo2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SEOHelmet from "@/components/SEOHelmet";

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

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubscribe = (planId: string) => {
    if (planId === "free") return;

    // If user is logged in, redirect to subscription page in app
    // If not logged in, redirect to login with return URL
    if (user) {
      navigate("/app/subscription");
    } else {
      // Store intended plan in sessionStorage for after login
      sessionStorage.setItem("intended_plan", planId);
      navigate("/login?redirect=/app/subscription");
    }
  };

  return (
    <>
      <SEOHelmet
        title="Pricing - BexMatch"
        description="Choose the perfect BexMatch plan for you. Free, Premium, or Premium Plus - find love at your pace."
      />
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-8 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Find Your <span className="text-primary">Perfect Plan</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground"
            >
              Unlock premium features to supercharge your dating experience
            </motion.p>
          </div>
        </section>

        {/* Plans Grid */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
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
                    }`}
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
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        {plan.price === 0 ? "Get Started Free" : "Subscribe Now"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Comparison */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-3xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-12"
            >
              Premium Features
            </motion.h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: <Eye className="w-5 h-5" />, title: "See Who Likes You", desc: "View everyone who's interested in you" },
                { icon: <Undo2 className="w-5 h-5" />, title: "Rewind", desc: "Undo your last swipe if you made a mistake" },
                { icon: <MessageCircle className="w-5 h-5" />, title: "Unlimited Messages", desc: "Chat without daily limits" },
                { icon: <Shield className="w-5 h-5" />, title: "Incognito Mode", desc: "Browse profiles privately without being seen" },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-12"
            >
              Frequently Asked Questions
            </motion.h2>
            <div className="space-y-6">
              {[
                {
                  q: "Can I cancel my subscription anytime?",
                  a: "Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit/debit cards and mobile money through our secure payment partner Paystack.",
                },
                {
                  q: "Is there a free trial?",
                  a: "We offer a free tier with limited features so you can try BexMatch before upgrading to a premium plan.",
                },
                {
                  q: "How does the matching algorithm work?",
                  a: "Our algorithm considers your preferences, interests, location, and compatibility factors to suggest the best matches for you.",
                },
              ].map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-xl bg-card border border-border"
                >
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Pricing;
