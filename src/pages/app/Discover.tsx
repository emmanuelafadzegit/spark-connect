import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Heart, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileWithPhotos, getDiscoverProfiles, createSwipe, getSubscription } from "@/lib/api";
import { toast } from "sonner";
import MatchModal from "@/components/app/MatchModal";
import SwipeCard from "@/components/app/SwipeCard";
import SwipeActions from "@/components/app/SwipeActions";
import { useNavigate } from "react-router-dom";

const Discover = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ProfileWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchedProfile, setMatchedProfile] = useState<ProfileWithPhotos | null>(null);
  const [subscription, setSubscription] = useState<{ tier: string } | null>(null);

  useEffect(() => {
    loadProfiles();
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    const { data } = await getSubscription();
    setSubscription(data);
  };

  const loadProfiles = async () => {
    setLoading(true);
    const { data, error } = await getDiscoverProfiles(20);
    if (error) {
      toast.error("Failed to load profiles");
    } else {
      setProfiles(data);
    }
    setLoading(false);
  };

  const handleSwipe = async (direction: 'left' | 'right' | 'up') => {
    if (profiles.length === 0) return;

    const profile = profiles[0];
    const swipeType = direction === 'left' ? 'pass' : direction === 'up' ? 'super_like' : 'like';

    // Remove card immediately for smooth UX
    setProfiles((prev) => prev.slice(1));

    const { isMatch, error } = await createSwipe(profile.user_id, swipeType);

    if (error) {
      toast.error("Failed to record swipe");
      // Re-add the profile if there was an error
      setProfiles((prev) => [profile, ...prev]);
      return;
    }

    if (isMatch) {
      setMatchedProfile(profile);
    }

    // Load more profiles when running low
    if (profiles.length <= 4) {
      loadProfiles();
    }
  };

  const handleMessage = () => {
    // Premium Plus feature: Message before matching
    if (subscription?.tier !== 'premium_plus') {
      toast.error("Upgrade to Premium Plus to message before matching!");
      navigate("/app/subscription");
      return;
    }
    toast.info("This feature is coming soon!");
  };

  if (loading && profiles.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Finding matches...</p>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No more profiles</h2>
          <p className="text-muted-foreground mb-6">
            You've seen everyone nearby. Check back later!
          </p>
          <Button onClick={loadProfiles} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      {/* Card Stack - Only show top card fully, others are hidden behind */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {profiles.slice(0, 3).map((profile, index) => (
            <SwipeCard
              key={profile.id}
              profile={profile}
              onSwipe={handleSwipe}
              isTop={index === 0}
              stackIndex={index}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Action Buttons - Always visible at bottom */}
      <SwipeActions
        onSwipe={handleSwipe}
        onMessage={handleMessage}
        isPremiumPlus={subscription?.tier === 'premium_plus'}
        disabled={profiles.length === 0}
      />

      {/* Match Modal */}
      <MatchModal
        profile={matchedProfile}
        onClose={() => setMatchedProfile(null)}
      />
    </div>
  );
};

export default Discover;
