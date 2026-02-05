import { ReactNode, useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const FullscreenLoader = ({ label = "Loading…" }: { label?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center animate-pulse">
        <Heart className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  </div>
);

const useRedirectParam = () => {
  const location = useLocation();
  return useMemo(() => {
    const dest = `${location.pathname}${location.search}${location.hash}`;
    return encodeURIComponent(dest);
  }, [location.pathname, location.search, location.hash]);
};

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const redirect = useRedirectParam();

  if (loading) return <FullscreenLoader label="Checking your account…" />;
  if (!user) return <Navigate to={`/signin?redirect=${redirect}`} replace />;
  return <>{children}</>;
};

export const RequireOnboardingIncomplete = ({ children }: { children: ReactNode }) => {
  const { hasProfile, loading } = useAuth();

  if (loading) return <FullscreenLoader label="Loading your profile…" />;
  if (hasProfile) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export const RequireProfileComplete = ({ children }: { children: ReactNode }) => {
  const { hasProfile, loading } = useAuth();

  if (loading) return <FullscreenLoader label="Loading your profile…" />;
  if (!hasProfile) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};
