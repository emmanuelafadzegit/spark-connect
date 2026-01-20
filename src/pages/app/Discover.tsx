import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Heart, X, Star, RotateCcw, MapPin, Briefcase, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileWithPhotos, getDiscoverProfiles, createSwipe } from "@/lib/api";
import { toast } from "sonner";
import MatchModal from "@/components/app/MatchModal";

const SwipeCard = ({
  profile,
  onSwipe,
  isTop,
}: {
  profile: ProfileWithPhotos;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  isTop: boolean;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);
  const superlikeOpacity = useTransform(y, [-100, 0], [1, 0]);

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const constraintsRef = useRef(null);

  const primaryPhoto = profile.profile_photos?.find(p => p.is_primary) || profile.profile_photos?.[0];
  const photos = profile.profile_photos || [];

  const handleDragEnd = (event: any, info: any) => {
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

  const nextPhoto = () => {
    if (photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevPhoto = () => {
    if (photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  return (
    <motion.div
      ref={constraintsRef}
      className="absolute inset-0 flex items-center justify-center"
    >
      <motion.div
        style={{ x, y, rotate, opacity: isTop ? 1 : 0.5 }}
        drag={isTop}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: "grabbing" }}
        className="relative w-full max-w-sm aspect-[3/4] cursor-grab"
      >
        {/* Card */}
        <div className="w-full h-full rounded-3xl overflow-hidden shadow-card-hover bg-card">
          {/* Photo */}
          <div 
            className="relative w-full h-full"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              if (clickX < rect.width / 2) {
                prevPhoto();
              } else {
                nextPhoto();
              }
            }}
          >
            {primaryPhoto || photos[currentPhotoIndex] ? (
              <img
                src={photos[currentPhotoIndex]?.photo_url || primaryPhoto?.photo_url}
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
              <div className="absolute top-4 left-4 right-4 flex gap-1">
                {photos.map((_, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 h-1 rounded-full ${
                      idx === currentPhotoIndex ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {/* Like/Nope/Superlike indicators */}
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-8 left-8 px-4 py-2 border-4 border-success rounded-lg rotate-[-20deg]"
            >
              <span className="text-2xl font-bold text-success">LIKE</span>
            </motion.div>
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-8 right-8 px-4 py-2 border-4 border-destructive rounded-lg rotate-[20deg]"
            >
              <span className="text-2xl font-bold text-destructive">NOPE</span>
            </motion.div>
            <motion.div
              style={{ opacity: superlikeOpacity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 border-4 border-superlike rounded-lg"
            >
              <span className="text-2xl font-bold text-superlike">SUPER LIKE</span>
            </motion.div>

            {/* Profile info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-3xl font-bold">
                    {profile.display_name}, {calculateAge(profile.date_of_birth)}
                  </h2>
                  {profile.city && (
                    <p className="flex items-center gap-1 mt-1 text-white/80">
                      <MapPin className="w-4 h-4" />
                      {profile.city}
                    </p>
                  )}
                  {profile.bio && (
                    <p className="mt-2 text-sm text-white/80 line-clamp-2">
                      {profile.bio}
                    </p>
                  )}
                  {/* Interests */}
                  {profile.profile_interests && profile.profile_interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {profile.profile_interests.slice(0, 3).map((pi) => (
                        <span
                          key={pi.interest_id}
                          className="px-2 py-1 rounded-full bg-white/20 text-xs backdrop-blur-sm"
                        >
                          {pi.interests?.emoji} {pi.interests?.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {profile.is_verified && (
                  <div className="w-8 h-8 rounded-full bg-superlike flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Discover = () => {
  const [profiles, setProfiles] = useState<ProfileWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchedProfile, setMatchedProfile] = useState<ProfileWithPhotos | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

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

    // Remove the swiped profile
    setProfiles((prev) => prev.slice(1));

    // Load more if running low
    if (profiles.length <= 3) {
      loadProfiles();
    }
  };

  const handleButtonSwipe = (direction: 'left' | 'right' | 'up') => {
    handleSwipe(direction);
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
    <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-4">
      {/* Card Stack */}
      <div className="relative w-full max-w-sm aspect-[3/4] mb-8">
        <AnimatePresence>
          {profiles.slice(0, 3).map((profile, index) => (
            <SwipeCard
              key={profile.id}
              profile={profile}
              onSwipe={handleSwipe}
              isTop={index === 0}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Button
          variant="pass"
          size="iconLg"
          onClick={() => handleButtonSwipe('left')}
          className="shadow-lg"
        >
          <X className="w-8 h-8" />
        </Button>
        <Button
          variant="superlike"
          size="iconXl"
          onClick={() => handleButtonSwipe('up')}
          className="shadow-lg"
        >
          <Star className="w-8 h-8" />
        </Button>
        <Button
          variant="like"
          size="iconLg"
          onClick={() => handleButtonSwipe('right')}
          className="shadow-lg"
        >
          <Heart className="w-8 h-8" />
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
