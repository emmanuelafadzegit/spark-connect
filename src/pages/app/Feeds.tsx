import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Send, Plus, Camera, X, Image, Video } from "lucide-react";
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

const Feeds = () => {
  const { user, profile } = useAuth();
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
        .from('feeds')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch profiles for each feed
      const userIds = [...new Set(feedsData?.map(f => f.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, profile_photos(photo_url, is_primary)')
        .in('user_id', userIds);

      // Check which posts the current user has liked
      const { data: likes } = await supabase
        .from('feed_likes')
        .select('feed_id')
        .eq('user_id', user?.id);

      const likedIds = new Set(likes?.map(l => l.feed_id) || []);

      const enrichedFeeds = feedsData?.map(feed => ({
        ...feed,
        profile: profiles?.find(p => p.user_id === feed.user_id),
        is_liked: likedIds.has(feed.id),
      })) || [];

      setFeeds(enrichedFeeds);
    } catch (error: any) {
      toast.error("Failed to load feeds");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
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
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const mediaType = selectedFile.type.startsWith('video/') ? 'video' : 'image';

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Create feed post
      const { error: insertError } = await supabase
        .from('feeds')
        .insert({
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

  const handleLike = async (feedId: string, isLiked: boolean) => {
    if (!user) return;

    try {
      if (isLiked) {
        await supabase
          .from('feed_likes')
          .delete()
          .eq('feed_id', feedId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('feed_likes')
          .insert({ feed_id: feedId, user_id: user.id });
      }

      setFeeds(prev => prev.map(f => 
        f.id === feedId 
          ? { ...f, is_liked: !isLiked, likes_count: isLiked ? f.likes_count - 1 : f.likes_count + 1 }
          : f
      ));
    } catch (error) {
      toast.error("Failed to update like");
    }
  };

  const loadComments = async (feedId: string) => {
    const { data, error } = await supabase
      .from('feed_comments')
      .select('*')
      .eq('feed_id', feedId)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error("Failed to load comments");
      return;
    }

    // Fetch profiles for comments
    const userIds = [...new Set(data?.map(c => c.user_id) || [])];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name, profile_photos(photo_url, is_primary)')
      .in('user_id', userIds);

    const enrichedComments = data?.map(comment => ({
      ...comment,
      profile: profiles?.find(p => p.user_id === comment.user_id),
    })) || [];

    setComments(enrichedComments);
  };

  const handleComment = async (feedId: string) => {
    if (!newComment.trim() || !user) return;

    try {
      await supabase
        .from('feed_comments')
        .insert({
          feed_id: feedId,
          user_id: user.id,
          content: newComment.trim(),
        });

      setNewComment("");
      loadComments(feedId);
      
      setFeeds(prev => prev.map(f => 
        f.id === feedId 
          ? { ...f, comments_count: f.comments_count + 1 }
          : f
      ));
    } catch (error) {
      toast.error("Failed to post comment");
    }
  };

  const getProfilePhoto = (profileData: any) => {
    const primary = profileData?.profile_photos?.find((p: any) => p.is_primary);
    return primary?.photo_url || profileData?.profile_photos?.[0]?.photo_url;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-muted-foreground">Loading feeds...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      {/* New Post Button */}
      <Button
        onClick={() => setShowNewPost(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full shadow-lg bg-gradient-primary"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* New Post Modal */}
      <AnimatePresence>
        {showNewPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
            onClick={() => setShowNewPost(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={e => e.stopPropagation()}
              className="bg-background w-full max-w-lg rounded-t-3xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">New Post</h3>
                <button onClick={() => setShowNewPost(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              {previewUrl ? (
                <div className="relative mb-4">
                  {selectedFile?.type.startsWith('video/') ? (
                    <video src={previewUrl} className="w-full rounded-xl" controls />
                  ) : (
                    <img src={previewUrl} alt="Preview" className="w-full rounded-xl object-cover max-h-64" />
                  )}
                  <button
                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 mb-4">
                  <label className="flex-1 aspect-video rounded-xl border-2 border-dashed border-muted flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <Image className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <label className="flex-1 aspect-video rounded-xl border-2 border-dashed border-muted flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <Video className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              <Textarea
                placeholder="Write a caption..."
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                className="mb-4"
              />

              <Button
                onClick={handlePost}
                disabled={!selectedFile || uploading}
                className="w-full"
              >
                {uploading ? "Posting..." : "Post"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feed List */}
      <div className="space-y-6">
        {feeds.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          feeds.map(feed => (
            <motion.div
              key={feed.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl overflow-hidden shadow-card"
            >
              {/* Header */}
              <div className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                  {getProfilePhoto(feed.profile) ? (
                    <img
                      src={getProfilePhoto(feed.profile)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">👤</div>
                  )}
                </div>
                <div>
                  <p className="font-semibold">{feed.profile?.display_name || "User"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(feed.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {/* Media */}
              {feed.media_type === 'video' ? (
                <video
                  src={feed.media_url}
                  className="w-full"
                  controls
                  playsInline
                />
              ) : (
                <img
                  src={feed.media_url}
                  alt=""
                  className="w-full"
                />
              )}

              {/* Actions */}
              <div className="p-4">
                <div className="flex items-center gap-4 mb-2">
                  <button
                    onClick={() => handleLike(feed.id, feed.is_liked || false)}
                    className="flex items-center gap-1"
                  >
                    <Heart
                      className={`w-6 h-6 ${feed.is_liked ? 'text-primary fill-primary' : 'text-foreground'}`}
                    />
                  </button>
                  <button
                    onClick={() => {
                      if (expandedComments === feed.id) {
                        setExpandedComments(null);
                      } else {
                        setExpandedComments(feed.id);
                        loadComments(feed.id);
                      }
                    }}
                  >
                    <MessageCircle className="w-6 h-6" />
                  </button>
                </div>

                <p className="font-semibold text-sm">{feed.likes_count} likes</p>

                {feed.content && (
                  <p className="text-sm mt-1">
                    <span className="font-semibold">{feed.profile?.display_name}</span>{" "}
                    {feed.content}
                  </p>
                )}

                {feed.comments_count > 0 && expandedComments !== feed.id && (
                  <button
                    onClick={() => {
                      setExpandedComments(feed.id);
                      loadComments(feed.id);
                    }}
                    className="text-sm text-muted-foreground mt-1"
                  >
                    View all {feed.comments_count} comments
                  </button>
                )}

                {/* Comments Section */}
                {expandedComments === feed.id && (
                  <div className="mt-4 space-y-3">
                    {comments.map(comment => (
                      <div key={comment.id} className="flex gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                          {getProfilePhoto(comment.profile) ? (
                            <img
                              src={getProfilePhoto(comment.profile)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm">
                            <span className="font-semibold">{comment.profile?.display_name}</span>{" "}
                            {comment.content}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Add Comment */}
                    <div className="flex gap-2 mt-3">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        className="flex-1 text-sm bg-muted rounded-full px-4 py-2 outline-none"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            handleComment(feed.id);
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleComment(feed.id)}
                        disabled={!newComment.trim()}
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Feeds;
