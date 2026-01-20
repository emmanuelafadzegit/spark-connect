import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const SubscriptionCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [plan, setPlan] = useState<string>("");

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    const reference = searchParams.get("reference");
    const trxref = searchParams.get("trxref");

    const ref = reference || trxref;

    if (!ref) {
      setStatus("failed");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("paystack-verify", {
        body: { reference: ref },
      });

      if (error || !data.verified) {
        setStatus("failed");
        return;
      }

      setPlan(data.plan === "premium" ? "Premium" : "Premium Plus");
      setStatus("success");
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-6 animate-spin text-primary" />
            <h1 className="text-2xl font-bold mb-2">Verifying Payment</h1>
            <p className="text-muted-foreground">
              Please wait while we confirm your subscription...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <CheckCircle className="w-20 h-20 mx-auto mb-6 text-success" />
            </motion.div>
            <h1 className="text-2xl font-bold mb-2">Welcome to {plan}! 🎉</h1>
            <p className="text-muted-foreground mb-8">
              Your subscription is now active. Enjoy unlimited access to all premium features!
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate("/app")} className="w-full">
                Start Swiping
              </Button>
              <Button
                onClick={() => navigate("/app/profile")}
                variant="outline"
                className="w-full"
              >
                View Profile
              </Button>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="w-20 h-20 mx-auto mb-6 text-destructive" />
            <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
            <p className="text-muted-foreground mb-8">
              We couldn't verify your payment. If you were charged, please contact support.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/app/subscription")}
                className="w-full"
              >
                Try Again
              </Button>
              <Button
                onClick={() => navigate("/app")}
                variant="outline"
                className="w-full"
              >
                Go Home
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default SubscriptionCallback;