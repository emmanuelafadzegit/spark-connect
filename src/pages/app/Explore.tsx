import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Send, Plus, Camera, X, Image, Video, Compass, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface FeedPost {
  id: string;
  user_id: string;
  content: string | null;
  media_url: string;
  media_type: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profile?: {
    display_name: string;
    profile_photos: { photo_url: string; is_primary: boolean }[];
  };
  is_liked?: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile?: {
    display_name: string;
    profile_photos: { photo_url: string; is_primary: boolean }[];
  };
}

const Explore = () => {
  const { user } = useAuth();
  const [feeds, setFeeds] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    loadFeeds();
  }, []);

  const loadFeeds = async () => {
    setLoading(true);
    try {
      const { data: feedsData, error } = await supabase
        .from("feeds")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const userIds = [...new Set(feedsData?.map((f) => f.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, profile_photos(photo_url, is_primary)")
        .in("user_id", userIds);

      const { data: likes } = await supabase
        .from("feed_likes")
        .select("feed_id")
        .eq("user_id", user?.id);

      const likedIds = new Set(likes?.map((l) => l.feed_id) || []);

      const enrichedFeeds =
        feedsData?.map((feed) => ({
          ...feed,
          profile: profiles?.find((p) => p.user_id === feed.user_id),
          is_liked: likedIds.has(feed.id),
        })) || [];

      setFeeds(enrichedFeeds);
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/") && !file.type.startsWith("image/")) {
      toast.error("Please select an image or video file");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handlePost = async () => {
    if (!selectedFile || !user) return;
    setUploading(true);
    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const mediaType = selectedFile.type.startsWith("video/") ? "video" : "image";

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(fileName, selectedFile);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-photos").getPublicUrl(fileName);

      const { error: insertError } = await supabase.from("feeds").insert({
        user_id: user.id,
        content: newContent || null,
        media_url: publicUrl,
        media_type: mediaType,
      });
      if (insertError) throw insertError;

      toast.success("Posted successfully!");
      setShowNewPost(false);
      setNewContent("");
      setSelectedFile(null);
      setPreviewUrl(null);
      loadFeeds();
    } catch (error: any) {
      toast.error(error.message || "Failed to post");
    } finally {
      setUploading(false);
    }
  };

  const getProfilePhoto = (profileData: any) => {
    const primary = profileData?.profile_photos?.find((p: any) => p.is_primary);
    return primary?.photo_url || profileData?.profile_photos?.[0]?.photo_url;
  };

  if (loading) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      {/* FAB (no shake) */}
      <motion.div whileTap={{ scale: 0.92 }} style={{ willChange: "transform" }}>
        <Button
          onClick={() => setShowNewPost(true)}
          className="fixed bottom-24 right-4 z-[80] w-14 h-14 rounded-full shadow-lg bg-gradient-primary transform-gpu"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Bottom Sheet (not hidden) */}
      <AnimatePresence>
        {showNewPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/50 flex items-end justify-center"
            onClick={() => setShowNewPost(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background w-full max-w-lg rounded-t-3xl p-6 max-h-[calc(100dvh-5rem)] overflow-y-auto pb-28"
            >
              <div className="w-12 h-1 rounded-full bg-muted mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-4">Create Post</h3>

              {previewUrl ? (
                <img src={previewUrl} className="w-full rounded-xl mb-4" />
              ) : (
                <label className="block w-full aspect-video rounded-xl border-2 border-dashed border-muted flex items-center justify-center cursor-pointer mb-4">
                  <Image className="w-8 h-8 text-muted-foreground" />
                  <input type="file" className="hidden" onChange={handleFileSelect} />
                </label>
              )}

              <Textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} className="mb-4" />
              <Button onClick={handlePost} disabled={!selectedFile || uploading} className="w-full">
                {uploading ? "Posting..." : "Share Post"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Explore;
