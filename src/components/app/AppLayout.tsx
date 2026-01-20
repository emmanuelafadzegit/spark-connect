import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, User, Flame, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/api";
import { toast } from "sonner";
import { useEffect } from "react";

const AppLayout = () => {
  const { user, hasProfile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
      } else if (!hasProfile) {
        navigate("/onboarding");
      }
    }
  }, [user, hasProfile, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center animate-pulse">
          <Heart className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
        </div>
      </div>
    );
  }

  if (!user || !hasProfile) {
    return null;
  }

  const navItems = [
    { to: "/app", icon: Flame, label: "Discover", end: true },
    { to: "/app/matches", icon: Heart, label: "Matches" },
    { to: "/app/messages", icon: MessageCircle, label: "Messages" },
    { to: "/app/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="text-xl font-bold">MatchLy</span>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around h-16">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `
                  flex flex-col items-center gap-1 p-2 rounded-xl transition-all
                  ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
                `}
              >
                {({ isActive }) => (
                  <>
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className={`p-2 rounded-xl ${isActive ? 'bg-primary/10' : ''}`}
                    >
                      <item.icon className={`w-6 h-6 ${isActive ? 'fill-primary/20' : ''}`} />
                    </motion.div>
                    <span className="text-xs font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
