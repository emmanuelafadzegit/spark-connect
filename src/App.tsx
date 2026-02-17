import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { RequireAuth, RequireOnboardingIncomplete, RequireProfileComplete } from "@/components/auth/RouteGuards";
import CookieConsent from "@/components/CookieConsent";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Safety from "./pages/Safety";
import AppLayout from "./components/app/AppLayout";
import Discover from "./pages/app/Discover";
import Explore from "./pages/app/Explore";
import Messages from "./pages/app/Messages";
import Profile from "./pages/app/Profile";
import EditProfile from "./pages/app/EditProfile";
import Settings from "./pages/app/Settings";
import Subscription from "./pages/app/Subscription";
import SubscriptionCallback from "./pages/app/SubscriptionCallback";
import FaceVerification from "./pages/app/FaceVerification";
import Consumables from "./pages/app/Consumables";
import AdminDashboard from "./pages/admin/Dashboard";
import ReportIssue from "./pages/ReportIssue";
import ContactSupport from "./pages/ContactSupport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CookieConsent />
            <Routes>
              <Route path="/" element={<Index />} />

              {/* Auth routes */}
              <Route path="/signin" element={<Login />} />
              <Route path="/login" element={<Navigate to="/signin" replace />} />
              <Route path="/signup" element={<Signup />} />

              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Onboarding */}
              <Route
                path="/onboarding"
                element={
                  <RequireAuth>
                    <RequireOnboardingIncomplete>
                      <Onboarding />
                    </RequireOnboardingIncomplete>
                  </RequireAuth>
                }
              />

              <Route path="/dashboard" element={<Navigate to="/app" replace />} />

              {/* Public pages */}
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/about" element={<About />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/report" element={<ReportIssue />} />
              <Route path="/contact" element={<ContactSupport />} />

              {/* App routes */}
              <Route
                path="/app"
                element={
                  <RequireAuth>
                    <RequireProfileComplete>
                      <AppLayout />
                    </RequireProfileComplete>
                  </RequireAuth>
                }
              >
                <Route index element={<Discover />} />
                <Route path="explore" element={<Explore />} />
                <Route path="messages" element={<Messages />} />
                <Route path="matches" element={<Navigate to="/app/messages" replace />} />
                <Route path="chat/:matchId" element={<Navigate to="/app/messages" replace />} />
                <Route path="profile" element={<Profile />} />
                <Route path="profile/edit" element={<EditProfile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="subscription" element={<Subscription />} />
                <Route path="subscription/callback" element={<SubscriptionCallback />} />
                <Route path="consumables" element={<Consumables />} />
                <Route path="verify" element={<FaceVerification />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
