import { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { MapPin, Briefcase, Sparkles, Ruler } from "lucide-react";
import { ProfileWithPhotos, lifestyleLabels, cmToFeetInches } from "@/lib/api";

interface SwipeCardProps {
  profile: ProfileWithPhotos;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  isTop: boolean;
  stackIndex: number;
}

const SwipeCard = ({ profile, onSwipe, isTop, stackIndex }: SwipeCardProps) => {
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

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
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
  ).filter(Boolean);

  // Calculate scale and offset for stacked cards
  const scale = 1 - stackIndex * 0.05;
  const yOffset = stackIndex * 8;

  // Only the top card is visible and interactive
  if (!isTop) {
    return (
      <motion.div
        className="absolute inset-x-4 top-0 flex justify-center"
        style={{ 
          zIndex: 10 - stackIndex,
          transform: `scale(${scale}) translateY(${yOffset}px)`,
          opacity: 0.7 - stackIndex * 0.3
        }}
      >
        <div className="w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden shadow-card bg-card">
          {photos[0] ? (
            <img
              src={photos[0]?.photo_url}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-6xl">👤</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-x-4 top-0 flex justify-center"
      style={{ zIndex: 20 }}
    >
      <motion.div
        style={{ x, y, rotate }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: "grabbing" }}
        className={`w-full max-w-sm cursor-grab ${showDetails ? 'max-h-[75vh] overflow-y-auto' : ''}`}
      >
        {/* Card */}
        <div className="w-full rounded-3xl overflow-hidden shadow-card-hover bg-card">
          {/* Photo */}
          <div className="relative w-full aspect-[3/4]">
            {/* Touch areas for photo navigation */}
            <div className="absolute inset-0 flex z-10">
              <div className="w-1/2 h-full" onClick={prevPhoto} />
              <div className="w-1/2 h-full" onClick={nextPhoto} />
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
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-20">
              <div className="flex items-end justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold truncate">
                      {profile.display_name}
                    </h2>
                    <span className="text-xl font-semibold">
                      {calculateAge(profile.date_of_birth)}
                    </span>
                    {profile.is_verified && (
                      <div className="w-5 h-5 rounded-full bg-superlike flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-white/90">
                    {profile.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {profile.city}
                      </span>
                    )}
                    {profile.job_title && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[120px]">{profile.job_title}</span>
                      </span>
                    )}
                    {profile.height_cm && (
                      <span className="flex items-center gap-1">
                        <Ruler className="w-3.5 h-3.5" />
                        {formatHeight(profile.height_cm)}
                      </span>
                    )}
                  </div>

                  {/* Relationship intent */}
                  {intentBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {intentBadges.slice(0, 2).map((badge, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full bg-white/20 text-xs backdrop-blur-sm">
                          {badge.icon} {badge.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }}
                  className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm flex-shrink-0 hover:bg-white/30 transition-colors"
                >
                  <span className="text-lg">{showDetails ? '↑' : 'ℹ'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Extended Details */}
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 space-y-4 bg-card"
            >
              {/* Bio */}
              {profile.bio && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">About</h3>
                  <p className="text-sm text-foreground">{profile.bio}</p>
                </div>
              )}

              {/* Prompts */}
              {profile.profile_prompts && profile.profile_prompts.length > 0 && (
                <div className="space-y-2">
                  {profile.profile_prompts.map((prompt) => (
                    <div key={prompt.id} className="bg-secondary rounded-xl p-3">
                      <p className="text-xs font-medium text-muted-foreground">{prompt.prompt_question}</p>
                      <p className="text-sm mt-1 text-foreground">{prompt.prompt_answer}</p>
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
                        className="px-3 py-1 rounded-full bg-secondary text-xs text-secondary-foreground"
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
                        className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground"
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

export default SwipeCard;
