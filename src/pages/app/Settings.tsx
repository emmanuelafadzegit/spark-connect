import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Moon, Globe, Lock, Trash2, Shield, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile, signOut } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

const Settings = () => {
  const { profile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [showOnline, setShowOnline] = useState(profile?.show_online_status ?? true);
  const [showDistance, setShowDistance] = useState(profile?.show_distance ?? true);
  const [isVisible, setIsVisible] = useState(profile?.is_visible ?? true);
  const [deleting, setDeleting] = useState(false);

  const handleToggle = async (field: string, value: boolean) => {
    try {
      await updateProfile({ [field]: value });
      await refreshProfile();
    } catch (error) {
      toast.error("Failed to update setting");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Mark profile as deleted (soft delete)
      await updateProfile({ is_visible: false });
      
      // Sign out
      await signOut();
      toast.success("Account deleted. We're sorry to see you go.");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg space-y-6">
        {/* Account */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Account</h2>
          <div className="bg-card rounded-2xl divide-y divide-border">
            <div className="p-4">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <Link to="/app/settings/password" className="flex items-center justify-between p-4 hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <span>Change Password</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          </div>
        </section>

        {/* Privacy */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Privacy</h2>
          <div className="bg-card rounded-2xl divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">Show Online Status</p>
                <p className="text-sm text-muted-foreground">Let others see when you're online</p>
              </div>
              <Switch
                checked={showOnline}
                onCheckedChange={(v) => {
                  setShowOnline(v);
                  handleToggle("show_online_status", v);
                }}
              />
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">Show Distance</p>
                <p className="text-sm text-muted-foreground">Show how far you are from others</p>
              </div>
              <Switch
                checked={showDistance}
                onCheckedChange={(v) => {
                  setShowDistance(v);
                  handleToggle("show_distance", v);
                }}
              />
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">Profile Visible</p>
                <p className="text-sm text-muted-foreground">Pause your profile from appearing</p>
              </div>
              <Switch
                checked={isVisible}
                onCheckedChange={(v) => {
                  setIsVisible(v);
                  handleToggle("is_visible", v);
                }}
              />
            </div>
          </div>
        </section>

        {/* Support */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Support</h2>
          <div className="bg-card rounded-2xl divide-y divide-border">
            <Link to="/report" className="flex items-center justify-between p-4 hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span>Report an Issue</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
            <Link to="/contact" className="flex items-center justify-between p-4 hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <span>Contact Support</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          </div>
        </section>

        {/* Legal */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Legal</h2>
          <div className="bg-card rounded-2xl divide-y divide-border">
            <Link to="/terms" className="flex items-center justify-between p-4 hover:bg-muted/50">
              <span>Terms of Service</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
            <Link to="/privacy" className="flex items-center justify-between p-4 hover:bg-muted/50">
              <span>Privacy Policy</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 className="text-sm font-semibold text-destructive uppercase tracking-wide mb-3">Danger Zone</h2>
          <div className="bg-card rounded-2xl divide-y divide-border">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 text-left"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center gap-3 p-4 hover:bg-destructive/10 text-destructive text-left">
                  <Trash2 className="w-5 h-5" />
                  <span>Delete Account</span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Your profile, matches, and messages will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete Account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground">
          BexMatch v1.0.0
        </p>
      </div>
    </div>
  );
};

export default Settings;
