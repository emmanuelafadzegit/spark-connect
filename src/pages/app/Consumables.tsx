import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Star, Undo2, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ConsumableItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ReactNode;
  color: string;
}

const consumables: ConsumableItem[] = [
  {
    id: "boost_1",
    name: "1 Boost",
    description: "Get more visibility for 30 minutes",
    price: 5,
    icon: <Zap className="w-6 h-6" />,
    color: "from-orange-500 to-red-500",
  },
  {
    id: "boost_5",
    name: "5 Boosts",
    description: "Best value! Save 20%",
    price: 20,
    icon: <Zap className="w-6 h-6" />,
    color: "from-orange-500 to-red-500",
  },
  {
    id: "super_like_5",
    name: "5 Super Likes",
    description: "Stand out from the crowd",
    price: 10,
    icon: <Star className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "rewind_5",
    name: "5 Rewinds",
    description: "Undo accidental swipes",
    price: 8,
    icon: <Undo2 className="w-6 h-6" />,
    color: "from-purple-500 to-pink-500",
  },
];

const Consumables = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [processing, setProcessing] = useState<string | null>(null);

  const handlePurchase = async (itemId: string) => {
    setProcessing(itemId);

    try {
      // Web Paystack flow for consumables
      const { data, error } = await supabase.functions.invoke("paystack-initialize", {
        body: { 
          plan: itemId, 
          email: user?.email,
          type: 'consumable'
        },
      });

      if (error) throw error;

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error(error.message || "Failed to process purchase");
    } finally {
      setProcessing(null);
    }
  };

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
          <h1 className="text-xl font-bold">Boosts & Extras</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Consumables Grid */}
        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
          {consumables.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:border-primary/50 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white`}>
                      {item.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription>${item.price}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled={processing !== null}
                    onClick={() => handlePurchase(item.id)}
                  >
                    {processing === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Consumables;
