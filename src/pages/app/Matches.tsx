import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { getMatches, MatchWithProfile } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

const Matches = () => {
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    const { data } = await getMatches();
    setMatches(data);
    setLoading(false);
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

  // Separate new matches (no messages) from conversations
  const newMatches = matches.filter(m => !m.last_message);
  const conversations = matches.filter(m => m.last_message);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading matches...</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No matches yet</h2>
          <p className="text-muted-foreground mb-6">
            Keep swiping to find your perfect match!
          </p>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            Start Discovering
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* New Matches */}
      {newMatches.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">New Matches</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {newMatches.map((match, index) => {
              const photo = match.other_user.profile_photos?.find(p => p.is_primary) || match.other_user.profile_photos?.[0];
              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/app/chat/${match.id}`}
                    className="flex flex-col items-center gap-2 min-w-[80px]"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-primary ring-offset-2 ring-offset-background">
                        {photo ? (
                          <img
                            src={photo.photo_url}
                            alt={match.other_user.display_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                            <span className="text-2xl">👤</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center shadow">
                        <Heart className="w-3 h-3 text-white fill-white" />
                      </div>
                    </div>
                    <span className="text-sm font-medium truncate max-w-[80px]">
                      {match.other_user.display_name.split(' ')[0]}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Conversations */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Messages</h2>
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No conversations yet. Say hi to your matches!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((match, index) => {
              const photo = match.other_user.profile_photos?.find(p => p.is_primary) || match.other_user.profile_photos?.[0];
              const isFromMe = match.last_message?.sender_id === user?.id;
              
              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/app/chat/${match.id}`}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 rounded-full overflow-hidden">
                        {photo ? (
                          <img
                            src={photo.photo_url}
                            alt={match.other_user.display_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                            <span className="text-2xl">👤</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">
                          {match.other_user.display_name}, {calculateAge(match.other_user.date_of_birth)}
                        </h3>
                        {match.last_message && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(match.last_message.created_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      {match.last_message && (
                        <p className="text-sm text-muted-foreground truncate">
                          {isFromMe ? 'You: ' : ''}{match.last_message.content}
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Matches;
