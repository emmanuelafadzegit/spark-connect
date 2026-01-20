import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Info } from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { getMessages, sendMessage, markMessagesAsRead, getMatches, MatchWithProfile } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type Message = Database['public']['Tables']['messages']['Row'];

const Chat = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [match, setMatch] = useState<MatchWithProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchId) return;

    loadData();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadData = async () => {
    if (!matchId) return;
    
    setLoading(true);
    
    // Load match info
    const { data: matchesData } = await getMatches();
    const currentMatch = matchesData.find(m => m.id === matchId);
    setMatch(currentMatch || null);

    // Load messages
    const { data } = await getMessages(matchId);
    setMessages(data);
    
    // Mark as read
    await markMessagesAsRead(matchId);
    
    setLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !matchId) return;

    setSending(true);
    const { error } = await sendMessage(matchId, newMessage.trim());
    
    if (!error) {
      setNewMessage("");
    }
    setSending(false);
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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse">Loading chat...</div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Match not found</p>
          <Button onClick={() => navigate("/app/matches")}>Go Back</Button>
        </div>
      </div>
    );
  }

  const photo = match.other_user.profile_photos?.find(p => p.is_primary) || match.other_user.profile_photos?.[0];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate("/app/matches")}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              {photo ? (
                <img
                  src={photo.photo_url}
                  alt={match.other_user.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
              )}
            </div>
            <div>
              <h2 className="font-semibold">{match.other_user.display_name}</h2>
              <p className="text-xs text-muted-foreground">
                {calculateAge(match.other_user.date_of_birth)} • {match.other_user.city || "Nearby"}
              </p>
            </div>
          </div>

          <button className="p-2 rounded-lg hover:bg-muted transition-colors">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Match info */}
        <div className="text-center py-4">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 ring-4 ring-primary/20">
            {photo ? (
              <img
                src={photo.photo_url}
                alt={match.other_user.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                <span className="text-4xl">👤</span>
              </div>
            )}
          </div>
          <h3 className="font-semibold text-lg">{match.other_user.display_name}</h3>
          <p className="text-sm text-muted-foreground">
            You matched {formatDistanceToNow(new Date(match.created_at), { addSuffix: true })}
          </p>
          {match.other_user.bio && (
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              {match.other_user.bio}
            </p>
          )}
        </div>

        {/* Message list */}
        {messages.map((message, index) => {
          const isMe = message.sender_id === user?.id;
          const showTimestamp = index === 0 || 
            new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000;

          return (
            <div key={message.id}>
              {showTimestamp && (
                <div className="text-center text-xs text-muted-foreground my-4">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                    isMe
                      ? 'bg-gradient-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </motion.div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-border bg-background">
        <form onSubmit={handleSend} className="container mx-auto px-4 py-3">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full h-11"
              disabled={sending}
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-full h-11 w-11"
              disabled={!newMessage.trim() || sending}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
