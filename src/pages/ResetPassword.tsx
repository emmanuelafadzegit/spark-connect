import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  // 🔑 CRITICAL: Exchange recovery token for session
  useEffect(() => {
    const recoverSession = async () => {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

        if (error) {
          toast.error("Recovery link expired. Please request a new one.");
          navigate("/forgot-password");
          return;
        }

        setReady(true);
      } catch {
        toast.error("Invalid recovery link.");
        navigate("/forgot-password");
      }
    };

    recoverSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success("Password updated successfully");
    }

    setLoading(false);
  };

  if (!ready) return null;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center space-y-6"
        >
          <CheckCircle className="w-16 h-16 mx-auto text-primary" />
          <h1 className="text-3xl font-bold">Password Reset</h1>
          <p className="text-muted-foreground">
            Your password has been updated successfully.
          </p>
          <Button
            className="w-full"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <Link
            to="/forgot-password"
            className="inline-flex items-center text-sm text-muted-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Start over
          </Link>
          <h1 className="text-3xl font-bold">Create New Password</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;

