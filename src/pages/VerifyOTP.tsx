import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  if (!email) {
    navigate("/forgot-password");
    return null;
  }

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { email, otp },
      });

      if (error) throw error;

      if (data?.reset_token) {
        toast.success("OTP verified successfully");
        navigate("/reset-password", { 
          state: { resetToken: data.reset_token, email } 
        });
      } else {
        throw new Error("No reset token received");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-otp", {
        body: { email },
      });
      if (error) throw error;
      toast.success("New OTP sent to your email");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <Link
            to="/forgot-password"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Verify OTP</h1>
          <p className="text-muted-foreground mt-2">
            Enter the 6-digit code sent to<br />
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <Button 
            onClick={handleVerify} 
            variant="hero" 
            size="lg" 
            className="w-full" 
            disabled={loading || otp.length !== 6}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Continue"
            )}
          </Button>

          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="text-sm text-primary hover:underline"
          >
            Didn't receive code? Resend
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
