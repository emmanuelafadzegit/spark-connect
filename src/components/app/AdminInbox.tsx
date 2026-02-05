import { useState, useEffect } from "react";
import { Bell, Mail, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface AdminMessage {
  id: string;
  subject: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export const AdminInbox = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null);

  useEffect(() => {
    if (user) {
      loadMessages();
      loadAnnouncements();
    }
  }, [user]);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from("admin_messages")
      .select("*")
      .eq("recipient_id", user?.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMessages(data);
      setUnreadCount(data.filter(m => !m.is_read).length);
    }
  };

  const loadAnnouncements = async () => {
    // Get user's subscription tier
    const { data: subData } = await supabase
      .from("subscriptions")
      .select("tier")
      .eq("user_id", user?.id)
      .single();

    const tier = subData?.tier || "free";

    // Get dismissed announcements
    const { data: dismissed } = await supabase
      .from("dismissed_announcements")
      .select("announcement_id")
      .eq("user_id", user?.id);

    const dismissedIds = dismissed?.map(d => d.announcement_id) || [];

    // Get active announcements
    const { data, error } = await supabase
      .from("admin_announcements")
      .select("*")
      .eq("is_active", true)
      .or(`target_tier.eq.all,target_tier.eq.${tier}`)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Filter out dismissed
      const activeAnnouncements = data.filter(a => !dismissedIds.includes(a.id));
      setAnnouncements(activeAnnouncements);
    }
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from("admin_messages")
      .update({ is_read: true })
      .eq("id", messageId);

    loadMessages();
  };

  const dismissAnnouncement = async (announcementId: string) => {
    await supabase
      .from("dismissed_announcements")
      .insert({
        user_id: user?.id,
        announcement_id: announcementId,
      });

    loadAnnouncements();
  };

  const openMessage = (message: AdminMessage) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      markAsRead(message.id);
    }
  };

  const totalNotifications = unreadCount + announcements.length;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setDialogOpen(true)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {totalNotifications > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            variant="destructive"
          >
            {totalNotifications > 9 ? "9+" : totalNotifications}
          </Badge>
        )}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Inbox
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            {/* Announcements */}
            {announcements.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Announcements</h4>
                <div className="space-y-2">
                  {announcements.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 rounded-lg bg-primary/10 border border-primary/20"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{a.title}</h5>
                          <p className="text-sm text-muted-foreground mt-1">{a.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(a.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => dismissAnnouncement(a.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.length > 0 ? (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Messages</h4>
                <div className="space-y-2">
                  {messages.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => openMessage(m)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        m.is_read ? "bg-muted/50" : "bg-accent/20 border border-accent/30"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!m.is_read && (
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm truncate">
                            {m.subject || "Message from BexMatch"}
                          </h5>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {m.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(m.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
              </div>
            ) : null}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject || "Message from BexMatch"}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm whitespace-pre-wrap">{selectedMessage?.content}</p>
            <p className="text-xs text-muted-foreground mt-4">
              Received {selectedMessage && format(new Date(selectedMessage.created_at), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminInbox;
