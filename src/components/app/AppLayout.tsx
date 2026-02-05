import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { MessageCircle, User, Flame, LogOut, Grid3X3, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { signOut } from "@/lib/api";
import { toast } from "sonner";
import BexMatchLogo from "@/components/BexMatchLogo";
import AdminInbox from "@/components/app/AdminInbox";

const AppLayout = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const navItems = [
    { to: "/app", icon: Flame, label: "Discover", end: true },
    { to: "/app/feeds", icon: Grid3X3, label: "Feeds" },
    { to: "/app/matches", icon: Heart, label: "Matches" },
    { to: "/app/messages", icon: MessageCircle, label: "Messages" },
    { to: "/app/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <BexMatchLogo size="sm" />
          <div className="flex items-center gap-2">
            <AdminInbox />
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
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
