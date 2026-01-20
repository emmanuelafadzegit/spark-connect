import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileWithPhotos } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface MatchModalProps {
  profile: ProfileWithPhotos | null;
  onClose: () => void;
}

const MatchModal = ({ profile, onClose }: MatchModalProps) => {
  const navigate = useNavigate();
  const { profile: myProfile } = useAuth();

  if (!profile) return null;

  const primaryPhoto = profile.profile_photos?.find(p => p.is_primary) || profile.profile_photos?.[0];
  const myPrimaryPhoto = myProfile?.profile_photos?.find(p => p.is_primary) || myProfile?.profile_photos?.[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-gradient-hero rounded-3xl p-8 max-w-sm w-full text-center text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-2">It's a Match!</h2>
            <p className="text-white/80">You and {profile.display_name} liked each other</p>
          </motion.div>

          {/* Photos */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="flex justify-center items-center gap-4 my-8"
          >
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
                {myPrimaryPhoto ? (
                  <img
                    src={myPrimaryPhoto.photo_url}
                    alt="You"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/20 flex items-center justify-center">
                    <span className="text-4xl">👤</span>
                  </div>
                )}
              </div>
            </div>

            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center"
            >
              <Heart className="w-6 h-6 text-primary fill-primary" />
            </motion.div>

            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
                {primaryPhoto ? (
                  <img
                    src={primaryPhoto.photo_url}
                    alt={profile.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/20 flex items-center justify-center">
                    <span className="text-4xl">👤</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <Button
              size="lg"
              className="w-full bg-white text-primary hover:bg-white/90"
              onClick={() => {
                onClose();
                navigate("/app/messages");
              }}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Send a Message
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full text-white hover:bg-white/20"
              onClick={onClose}
            >
              Keep Swiping
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MatchModal;
