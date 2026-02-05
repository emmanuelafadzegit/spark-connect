import { useState, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { signIn } from "@/lib/api";
import { toast } from "sonner";
import BexMatchLogo from "@/components/BexMatchLogo";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";

const Login = forwardRef<HTMLDivElement>((_, ref) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, hasProfile, loading: authLoading } = useAuth();

  // If the user is already signed in, never keep them on /login.
  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    const redirectTo = searchParams.get("redirect");
    // Route rules:
    // - Authenticated + profile complete => app (or redirect)
    // - Authenticated + profile incomplete => onboarding
    navigate(hasProfile ? (redirectTo || "/app") : "/onboarding", { replace: true });
    setRedirecting(false);
  }, [authLoading, user, hasProfile, navigate, searchParams]);

  // If sign-in succeeded but auth state never materializes, stop the spinner and show feedback.
  useEffect(() => {
    if (!redirecting) return;
    const t = window.setTimeout(() => {
      setRedirecting(false);
      toast.error("Sign-in succeeded but the session didn't load. Please refresh and try again.");
    }, 10000);
    return () => window.clearTimeout(t);
  }, [redirecting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast.error(error.message || "Failed to sign in");
        return;
      }

      toast.success("Welcome back! Redirecting…");
      // Let AuthContext update first; useEffect will route deterministically.
      setRedirecting(true);
    } finally {
      // Never let the UI get stuck in an infinite "Signing in..." state.
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast.error(error.message || "Failed to sign in with Google");
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast.error(error.message || "Failed to sign in with Apple");
      setAppleLoading(false);
    }
  };

  return (
    <div ref={ref} className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary/50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-3xl shadow-card p-8">
          {/* Back link */}
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to home</span>
          </Link>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <BexMatchLogo size="lg" showText={false} />
            </div>
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground mt-2">Sign in to continue finding love</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading || redirecting}>
              {loading || redirecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {redirecting ? "Redirecting..." : "Signing in..."}
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

           {/* Divider */}
           <div className="relative my-6">
             <div className="absolute inset-0 flex items-center">
               <span className="w-full border-t border-border" />
             </div>
             <div className="relative flex justify-center text-xs uppercase">
               <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
             </div>
           </div>

          {/* Social Sign-In Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || appleLoading || loading}
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Continue with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleAppleSignIn}
              disabled={googleLoading || appleLoading || loading}
            >
              {appleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              )}
              Continue with Apple
            </Button>
          </div>

          {/* Signup link */}
          <p className="text-center mt-6 text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
});

Login.displayName = "Login";

export default Login;
