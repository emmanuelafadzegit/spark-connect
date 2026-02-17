import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Send, ArrowLeft, Info, Crown, Lock, Search } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { getMatches, getMessages, sendMessage, markMessagesAsRead, MatchWithProfile, getSubscription } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Message = Database['public']['Tables']['messages']['Row'];

const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<MatchWithProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [subscription, setSubscription] = useState<{ tier: string; daily_messages_remaining: number | null } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Subscribe to messages for selected match
  useEffect(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    if (!selectedMatch) return;

    const channel = supabase
      .channel(`messages:${selectedMatch.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${selectedMatch.id}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [selectedMatch?.id]);

  const loadData = async () => {
    setLoading(true);
    const [matchRes, subRes] = await Promise.all([getMatches(), getSubscription()]);
    setMatches(matchRes.data);
    setSubscription(subRes.data);
    setLoading(false);
  };

  const selectMatch = async (match: MatchWithProfile) => {
    setSelectedMatch(match);
    setChatLoading(true);
    const { data } = await getMessages(match.id);
    setMessages(data);
    await markMessagesAsRead(match.id);
    setChatLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMatch) return;

    if (subscription?.tier === 'free' && subscription.daily_messages_remaining !== null && subscription.daily_messages_remaining <= 0) {
      toast.error("Daily message limit reached. Upgrade for unlimited messages!");
      return;
    }

    setSending(true);
    const { error } = await sendMessage(selectedMatch.id, newMessage.trim());
    if (!error) {
      setNewMessage("");
      if (subscription?.tier === 'free' && subscription.daily_messages_remaining !== null) {
        setSubscription({ ...subscription, daily_messages_remaining: Math.max(0, subscription.daily_messages_remaining - 1) });
      }
    } else {
      toast.error("Failed to send message");
    }
    setSending(false);
  };

  const calculateAge = (dob: string) => {
    const d = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
  };

  const canSendMessage = () => {
    if (!subscription) return false;
    if (subscription.tier === 'premium' || subscription.tier === 'premium_plus') return true;
    return subscription.daily_messages_remaining === null || subscription.daily_messages_remaining > 0;
  };

  const newMatches = matches.filter(m => !m.last_message);
  const conversations = matches.filter(m => m.last_message);
  const filteredConversations = conversations.filter(m =>
    !searchQuery || m.other_user.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPhoto = (match: MatchWithProfile) =>
    match.other_user.profile_photos?.find(p => p.is_primary)?.photo_url ||
    match.other_user.profile_photos?.[0]?.photo_url;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MessageCircle className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading messages...</p>
        </motion.div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No matches yet</h2>
          <p className="text-muted-foreground mb-6">Keep swiping to find your perfect match!</p>
          <Link to="/app" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
            Start Discovering
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Left Panel - Conversation List */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`${selectedMatch ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[380px] md:min-w-[340px] border-r border-border bg-background`}
      >
        {/* Search */}
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-full bg-muted border-0"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* New Matches Row */}
          {newMatches.length > 0 && (
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">New Matches</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {newMatches.map((match, i) => (
                  <motion.button
                    key={match.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => selectMatch(match)}
                    className="flex flex-col items-center gap-1.5 min-w-[64px]"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary ring-offset-2 ring-offset-background">
                      {getPhoto(match) ? (
                        <img src={getPhoto(match)!} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-primary flex items-center justify-center text-xl">👤</div>
                      )}
                    </div>
                    <span className="text-[11px] font-medium truncate max-w-[64px]">
                      {match.other_user.display_name.split(' ')[0]}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation List */}
          <div className="px-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-3">Conversations</h3>
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No conversations yet</p>
              </div>
            ) : (
              filteredConversations.map((match, i) => {
                const isFromMe = match.last_message?.sender_id === user?.id;
                const isSelected = selectedMatch?.id === match.id;
                return (
                  <motion.button
                    key={match.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => selectMatch(match)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 mb-0.5 text-left ${
                      isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/60'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      {getPhoto(match) ? (
                        <img src={getPhoto(match)!} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-primary flex items-center justify-center text-lg">👤</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="font-semibold text-sm truncate">
                          {match.other_user.display_name}
                        </h3>
                        {match.last_message && (
                          <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">
                            {formatDistanceToNow(new Date(match.last_message.created_at), { addSuffix: false })}
                          </span>
                        )}
                      </div>
                      {match.last_message && (
                        <p className="text-xs text-muted-foreground truncate">
                          {isFromMe ? 'You: ' : ''}{match.last_message.content}
                        </p>
                      )}
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </div>
      </motion.div>

      {/* Right Panel - Chat */}
      <div className={`${selectedMatch ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-background`}>
        {!selectedMatch ? (
          <div className="flex-1 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-12 h-12 text-muted-foreground/40" />
              </div>
              <h3 className="font-bold text-lg mb-1">Select a conversation</h3>
              <p className="text-sm text-muted-foreground">Choose a match to start chatting</p>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur-lg px-4 py-3 flex items-center gap-3">
              <button onClick={() => setSelectedMatch(null)} className="md:hidden p-2 -ml-2 rounded-lg hover:bg-muted">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full overflow-hidden">
                {getPhoto(selectedMatch) ? (
                  <img src={getPhoto(selectedMatch)!} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-primary flex items-center justify-center text-lg">👤</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-sm">{selectedMatch.other_user.display_name}</h2>
                <p className="text-xs text-muted-foreground">
                  {calculateAge(selectedMatch.other_user.date_of_birth)} • {selectedMatch.other_user.city || "Nearby"}
                </p>
              </div>
              <button className="p-2 rounded-lg hover:bg-muted">
                <Info className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Free user banner */}
            {subscription?.tier === 'free' && (
              <div className="flex-shrink-0 px-4 py-2 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs">
                    {(subscription.daily_messages_remaining ?? 5) > 0
                      ? `${subscription.daily_messages_remaining} messages left today`
                      : "Limit reached"}
                  </span>
                </div>
                <Button size="sm" variant="ghost" className="h-6 text-xs text-primary gap-1" onClick={() => navigate("/app/subscription")}>
                  <Crown className="w-3 h-3" /> Upgrade
                </Button>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
                </div>
              ) : (
                <>
                  {/* Match banner */}
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 ring-4 ring-primary/10">
                      {getPhoto(selectedMatch) ? (
                        <img src={getPhoto(selectedMatch)!} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-primary flex items-center justify-center text-3xl">👤</div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Matched {formatDistanceToNow(new Date(selectedMatch.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  {messages.map((msg, i) => {
                    const isMe = msg.sender_id === user?.id;
                    const showTime = i === 0 || new Date(msg.created_at).getTime() - new Date(messages[i - 1].created_at).getTime() > 300000;
                    return (
                      <div key={msg.id}>
                        {showTime && (
                          <div className="text-center text-[10px] text-muted-foreground my-3">
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                          </div>
                        )}
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                            isMe
                              ? 'bg-gradient-primary text-primary-foreground rounded-br-md'
                              : 'bg-muted rounded-bl-md'
                          }`}>
                            {msg.content}
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-border bg-background p-3">
              <form onSubmit={handleSend} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder={canSendMessage() ? "Type a message..." : "Upgrade to send more"}
                  className="flex-1 rounded-full h-10 bg-muted border-0"
                  disabled={sending || !canSendMessage()}
                />
                <Button type="submit" size="icon" className="rounded-full h-10 w-10" disabled={!newMessage.trim() || sending || !canSendMessage()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;
