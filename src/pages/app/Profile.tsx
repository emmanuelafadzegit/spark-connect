import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, MapPin, Edit2, Settings, Shield, Crown, LogOut, ChevronRight, Heart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { signOut, updateProfile, uploadProfilePhoto, addProfilePhoto } from "@/lib/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.rpc("is_admin");
      setIsAdmin(!!data);
    };
    checkAdmin();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { url, error } = await uploadProfilePhoto(file);
      if (error) throw error;
      if (url) {
        await addProfilePhoto(url, !profile?.profile_photos?.length);
        await refreshProfile();
        toast.success("Photo uploaded!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (!profile) return null;

  const primaryPhoto = profile.profile_photos?.find(p => p.is_primary) || profile.profile_photos?.[0];

  const menuItems = [
    { icon: Edit2, label: "Edit Profile", to: "/app/profile/edit" },
    { icon: Shield, label: "Verify Your Face", to: "/app/verify" },
    { icon: Settings, label: "Settings", to: "/app/settings" },
    { icon: Crown, label: "Get Premium", to: "/app/subscription", highlight: true },
    ...(isAdmin ? [{ icon: ShieldCheck, label: "Admin Dashboard", to: "/admin" }] : []),
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-3xl shadow-card overflow-hidden mb-6"
      >
        {/* Photo */}
        <div className="relative aspect-square">
          {primaryPhoto ? (
            <img
              src={primaryPhoto.photo_url}
              alt={profile.display_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-8xl">👤</span>
            </div>
          )}
          
          {/* Photo upload button */}
          <label className="absolute bottom-4 right-4 cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Info */}
          <div className="absolute bottom-4 left-4 text-white">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                {profile.display_name}, {calculateAge(profile.date_of_birth)}
              </h1>
              {profile.is_verified && (
                <div className="w-6 h-6 rounded-full bg-superlike flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            {profile.city && (
              <p className="flex items-center gap-1 text-white/80 text-sm mt-1">
                <MapPin className="w-4 h-4" />
                {profile.city}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="p-6">
          {profile.bio ? (
            <p className="text-muted-foreground">{profile.bio}</p>
          ) : (
            <p className="text-muted-foreground italic">Add a bio to tell others about yourself</p>
          )}

          {/* Interests */}
          {profile.profile_interests && profile.profile_interests.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {profile.profile_interests.map((pi) => (
                <span
                  key={pi.interest_id}
                  className="px-3 py-1.5 rounded-full bg-secondary text-sm"
                >
                  {pi.interests?.emoji} {pi.interests?.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Menu */}
      <div className="space-y-2">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              to={item.to}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-colors ${
                item.highlight 
                  ? 'bg-gradient-primary text-primary-foreground' 
                  : 'bg-card hover:bg-muted/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1 font-medium">{item.label}</span>
              <ChevronRight className="w-5 h-5 opacity-50" />
            </Link>
          </motion.div>
        ))}

        {/* Sign Out */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={handleSignOut}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card hover:bg-destructive/10 text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="flex-1 font-medium text-left">Sign Out</span>
        </motion.button>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground mt-8 flex items-center justify-center gap-1">
        Made with <Heart className="w-3 h-3 text-primary fill-primary" /> by BexMatch
      </p>
    </div>
  );
};

export default Profile;
