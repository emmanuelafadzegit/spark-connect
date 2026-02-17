import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { MessageCircle, User, Flame, LogOut, Compass, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { signOut } from "@/lib/api";
import { toast } from "sonner";
import BexMatchLogo from "@/components/BexMatchLogo";
import AdminInbox from "@/components/app/AdminInbox";

const navItems = [
  { to: "/app", icon: Flame, label: "Discover", end: true },
  { to: "/app/explore", icon: Compass, label: "Explore" },
  { to: "/app/messages", icon: MessageCircle, label: "Messages" },
  { to: "/app/profile", icon: User, label: "Profile" },
];

const AppLayout = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <BexMatchLogo size="sm" />
          <div className="flex items-center gap-1">
            <AdminInbox />
            <button
              onClick={handleSignOut}
              className="p-2.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-14 pb-[4.5rem]">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50">
        <div className="container mx-auto px-2">
          <div className="flex items-center justify-around h-[4.25rem]">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `
                  flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all duration-200
                  ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
                `}
              >
                {({ isActive }) => (
                  <>
                    <motion.div
                      whileTap={{ scale: 0.88 }}
                      className={`p-1.5 rounded-xl transition-colors duration-200 ${isActive ? 'bg-primary/10' : ''}`}
                    >
                      <item.icon className={`w-[22px] h-[22px] ${isActive ? 'fill-primary/20' : ''}`} />
                    </motion.div>
                    <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
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
