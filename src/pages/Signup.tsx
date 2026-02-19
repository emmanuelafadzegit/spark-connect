import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import BexMatchLogo from "@/components/BexMatchLogo";
import { Button, Input, Label } from "@/components/ui";
import { Loader2, User, Mail, Lock, ArrowLeft } from "lucide-react";
import SEOHelmet from "@/components/SEOHelmet";
import { useAuth } from "@/contexts/AuthContext";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading, hasProfile } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    navigate(hasProfile ? "/app" : "/onboarding", { replace: true });
  }, [authLoading, user, hasProfile, navigate]);

  // EMAIL / PASSWORD SIGNUP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp(
        { email, password },
        { redirectTo: "https://www.bexmatch.com/onboarding" } // YOUR VALID REDIRECT URL
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      localStorage.setItem("onboarding_name", name);

      if (!data?.session) {
        toast.success("Check your email to confirm your account, then sign in.");
        navigate("/signin?redirect=/onboarding", { replace: true });
        return;
      }

      toast.success("Account created! Let's set up your profile.");
      navigate("/onboarding", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE / APPLE SIGNIN (Supabase only)
  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    const loadingSetter = provider === "google" ? setGoogleLoading : setAppleLoading;
    loadingSetter(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: "https://www.bexmatch.com/onboarding" }, // must match authorized URL
      });
      if (error) toast.error(error.message);
    } finally {
      loadingSetter(false);
    }
  };

  const anyLoading = loading || googleLoading || appleLoading;

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary/40 p-4">
      <SEOHelmet title="Sign Up — BexMatch" description="Create your BexMatch account and start your journey to find love." />
      <div className="w-full max-w-[420px] bg-card rounded-3xl shadow-card border p-7">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5"><BexMatchLogo size="lg" showText={false} /></div>
          <h1 className="text-2xl font-extrabold">Create Account</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">Start your journey to find love</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="name" type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required disabled={anyLoading} className="pl-10 h-11" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={anyLoading} className="pl-10 h-11" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required disabled={anyLoading} className="pl-10 h-11" />
            </div>
          </div>

          <Button type="submit" disabled={anyLoading} className="w-full rounded-xl">
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <Button onClick={() => handleOAuthSignIn("google")} disabled={anyLoading}>Google</Button>
          <Button onClick={() => handleOAuthSignIn("apple")} disabled={anyLoading}>Apple</Button>
        </div>

        <p className="text-center mt-7 text-sm text-muted-foreground">
          Already have an account? <Link to="/signin" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
