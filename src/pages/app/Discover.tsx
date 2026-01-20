import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from "framer-motion";
import { Heart, X, Star, RotateCcw, MapPin, Briefcase, Sparkles, Ruler, MessageCircle, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileWithPhotos, getDiscoverProfiles, createSwipe, lifestyleLabels, cmToFeetInches, getSubscription } from "@/lib/api";
import { toast } from "sonner";
import MatchModal from "@/components/app/MatchModal";
import { useNavigate } from "react-router-dom";

const SwipeCard = ({
  profile,
  onSwipe,
  onMessage,
  isTop,
}: {
  profile: ProfileWithPhotos;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  onMessage: () => void;
  isTop: boolean;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);
  const superlikeOpacity = useTransform(y, [-100, 0], [1, 0]);

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const photos = profile.profile_photos?.sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return a.display_order - b.display_order;
  }) || [];

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 100;
    
    if (info.offset.x > swipeThreshold) {
      onSwipe('right');
    } else if (info.offset.x < -swipeThreshold) {
      onSwipe('left');
    } else if (info.offset.y < -swipeThreshold) {
      onSwipe('up');
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

  const formatHeight = (cm: number | null) => {
    if (!cm) return null;
    const { feet, inches } = cmToFeetInches(cm);
    return `${feet}'${inches}"`;
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  // Build lifestyle badges
  const badges: { label: string; icon: string }[] = [];
  if (profile.height_cm) {
    badges.push({ label: formatHeight(profile.height_cm)!, icon: '📏' });
  }
  if (profile.job_title) {
    badges.push({ label: profile.job_title, icon: '💼' });
  }
  if (profile.smoking && lifestyleLabels.smoking[profile.smoking]) {
    badges.push(lifestyleLabels.smoking[profile.smoking]);
  }
  if (profile.drinking && lifestyleLabels.drinking[profile.drinking]) {
    badges.push(lifestyleLabels.drinking[profile.drinking]);
  }
  if (profile.workout && lifestyleLabels.workout[profile.workout]) {
    badges.push(lifestyleLabels.workout[profile.workout]);
  }
  if (profile.pets && lifestyleLabels.pets[profile.pets]) {
    badges.push(lifestyleLabels.pets[profile.pets]);
  }
  if (profile.children && lifestyleLabels.children[profile.children]) {
    badges.push(lifestyleLabels.children[profile.children]);
  }
  if (profile.zodiac && lifestyleLabels.zodiac[profile.zodiac]) {
    badges.push(lifestyleLabels.zodiac[profile.zodiac]);
  }

  // Relationship intent badges
  const intentBadges = (profile.relationship_intent || []).map(intent => 
    lifestyleLabels.relationship_intent[intent]
  );

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center px-4"
    >
      <motion.div
        style={{ x, y, rotate }}
        drag={isTop}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: "grabbing" }}
        className={`relative w-full max-w-sm cursor-grab ${showDetails ? 'h-[85vh] overflow-y-auto' : 'aspect-[3/4]'}`}
      >
        {/* Card */}
        <div className="w-full h-full rounded-3xl overflow-hidden shadow-card-hover bg-card">
          {/* Photo */}
          <div className="relative w-full aspect-[3/4]">
            <div className="absolute inset-0 flex">
              <div className="w-1/2 h-full z-10" onClick={prevPhoto} />
              <div className="w-1/2 h-full z-10" onClick={nextPhoto} />
            </div>
            
            {photos[currentPhotoIndex] ? (
              <img
                src={photos[currentPhotoIndex]?.photo_url}
                alt={profile.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-6xl">👤</span>
              </div>
            )}

            {/* Photo indicators */}
            {photos.length > 1 && (
              <div className="absolute top-3 left-3 right-3 flex gap-1 z-20">
                {photos.map((_, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 h-1 rounded-full transition-all ${
                      idx === currentPhotoIndex ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Like/Nope/Superlike indicators */}
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-16 left-6 px-4 py-2 border-4 border-success rounded-lg rotate-[-20deg] z-30"
            >
              <span className="text-2xl font-bold text-success">LIKE</span>
            </motion.div>
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-16 right-6 px-4 py-2 border-4 border-destructive rounded-lg rotate-[20deg] z-30"
            >
              <span className="text-2xl font-bold text-destructive">NOPE</span>
            </motion.div>
            <motion.div
              style={{ opacity: superlikeOpacity }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 px-4 py-2 border-4 border-superlike rounded-lg z-30"
            >
              <span className="text-2xl font-bold text-superlike">SUPER LIKE</span>
            </motion.div>

            {/* Profile info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-20">
              <div className="flex items-end justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">
                      {profile.display_name}, {calculateAge(profile.date_of_birth)}
                    </h2>
                    {profile.is_verified && (
                      <div className="w-6 h-6 rounded-full bg-superlike flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-white/80">
                    {profile.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {profile.city}
                      </span>
                    )}
                    {profile.job_title && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {profile.job_title}
                      </span>
                    )}
                    {profile.height_cm && (
                      <span className="flex items-center gap-1">
                        <Ruler className="w-3 h-3" />
                        {formatHeight(profile.height_cm)}
                      </span>
                    )}
                  </div>

                  {/* Relationship intent */}
                  {intentBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {intentBadges.map((badge, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full bg-white/20 text-xs backdrop-blur-sm">
                          {badge.icon} {badge.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"
                >
                  <span className="text-lg">{showDetails ? '↑' : 'ℹ'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Extended Details */}
          {showDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-5 space-y-4"
            >
              {/* Bio */}
              {profile.bio && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">About</h3>
                  <p className="text-sm">{profile.bio}</p>
                </div>
              )}

              {/* Prompts */}
              {profile.profile_prompts && profile.profile_prompts.length > 0 && (
                <div className="space-y-3">
                  {profile.profile_prompts.map((prompt) => (
                    <div key={prompt.id} className="bg-secondary/50 rounded-xl p-3">
                      <p className="text-xs font-medium text-muted-foreground">{prompt.prompt_question}</p>
                      <p className="text-sm mt-1">{prompt.prompt_answer}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Interests */}
              {profile.profile_interests && profile.profile_interests.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.profile_interests.map((pi) => (
                      <span
                        key={pi.interest_id}
                        className="px-3 py-1 rounded-full bg-secondary text-xs"
                      >
                        {pi.interests?.emoji} {pi.interests?.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifestyle badges */}
              {badges.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Lifestyle</h3>
                  <div className="flex flex-wrap gap-2">
                    {badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-muted text-xs"
                      >
                        {badge.icon} {badge.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

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

    const { isMatch, error } = await createSwipe(profile.user_id, swipeType);

    if (error) {
      toast.error("Failed to record swipe");
      return;
    }

    if (isMatch) {
      setMatchedProfile(profile);
    }

    setProfiles((prev) => prev.slice(1));

    if (profiles.length <= 3) {
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
    <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center">
      {/* Card Stack */}
      <div className="relative w-full flex-1 max-h-[65vh]">
        <AnimatePresence>
          {profiles.slice(0, 3).map((profile, index) => (
            <SwipeCard
              key={profile.id}
              profile={profile}
              onSwipe={handleSwipe}
              onMessage={handleMessage}
              isTop={index === 0}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 py-4">
        {/* Dislike */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleSwipe('left')}
          className="w-14 h-14 rounded-full shadow-lg border-destructive/30 hover:bg-destructive/10 hover:border-destructive"
        >
          <X className="w-7 h-7 text-destructive" />
        </Button>

        {/* Super Like */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleSwipe('up')}
          className="w-12 h-12 rounded-full shadow-lg border-superlike/30 hover:bg-superlike/10 hover:border-superlike"
        >
          <Star className="w-6 h-6 text-superlike" />
        </Button>

        {/* Like */}
        <Button
          size="icon"
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 rounded-full shadow-lg bg-gradient-primary hover:opacity-90"
        >
          <Heart className="w-8 h-8 text-primary-foreground" />
        </Button>

        {/* Message (Premium Plus) */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleMessage}
          className="w-12 h-12 rounded-full shadow-lg border-primary/30 hover:bg-primary/10 hover:border-primary relative"
        >
          <MessageCircle className="w-6 h-6 text-primary" />
          {subscription?.tier !== 'premium_plus' && (
            <Crown className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
          )}
        </Button>
      </div>

      {/* Match Modal */}
      <MatchModal
        profile={matchedProfile}
        onClose={() => setMatchedProfile(null)}
      />
    </div>
  );
};

export default Discover;