import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import AppLayout from "./components/app/AppLayout";
import Discover from "./pages/app/Discover";
import Matches from "./pages/app/Matches";
import Chat from "./pages/app/Chat";
import Profile from "./pages/app/Profile";
import EditProfile from "./pages/app/EditProfile";
import Settings from "./pages/app/Settings";
import Subscription from "./pages/app/Subscription";
import SubscriptionCallback from "./pages/app/SubscriptionCallback";
import FaceVerification from "./pages/app/FaceVerification";
import Feeds from "./pages/app/Feeds";
import Consumables from "./pages/app/Consumables";
import AdminDashboard from "./pages/admin/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Discover />} />
              <Route path="feeds" element={<Feeds />} />
              <Route path="matches" element={<Matches />} />
              <Route path="messages" element={<Matches />} />
              <Route path="chat/:matchId" element={<Chat />} />
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
);

export default App;
