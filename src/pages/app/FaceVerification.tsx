import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Camera, Upload, Check, ArrowLeft, ShieldCheck, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FaceVerification = () => {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const [step, setStep] = useState<"intro" | "capture" | "review" | "submitted">("intro");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const primaryPhoto = profile?.profile_photos?.find(p => p.is_primary) || profile?.profile_photos?.[0];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCapturing(true);
      setStep("capture");
    } catch (error) {
      console.error("Camera error:", error);
      toast.error("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Mirror the image for selfie
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
    }

    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(imageData);
    stopCamera();
    setStep("review");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
      setStep("review");
    };
    reader.readAsDataURL(file);
  };

  const submitVerification = async () => {
    if (!capturedImage || !profile) return;

    setUploading(true);

    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], `verification_${Date.now()}.jpg`, { type: "image/jpeg" });

      // Upload to storage
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileName = `${user.id}/verification_${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          verification_photo_url: urlData.publicUrl,
          verification_status: "submitted",
          verification_submitted_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setStep("submitted");
      toast.success("Verification photo submitted!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to submit verification");
    } finally {
      setUploading(false);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Cleanup on unmount
  const handleBack = () => {
    stopCamera();
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Face Verification</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Already verified */}
        {profile?.verification_status === "approved" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">You're Verified! ✓</h2>
            <p className="text-muted-foreground mb-8">
              Your profile shows a verification badge, building trust with potential matches.
            </p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </motion.div>
        )}

        {/* Pending review */}
        {profile?.verification_status === "submitted" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Under Review</h2>
            <p className="text-muted-foreground mb-8">
              We're reviewing your verification photo. This usually takes 24-48 hours.
            </p>
            <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
          </motion.div>
        )}

        {/* Intro Step */}
        {step === "intro" && profile?.verification_status !== "approved" && profile?.verification_status !== "submitted" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Verify Your Profile</h2>
            <p className="text-muted-foreground mb-8">
              Take a quick selfie to prove you're real. Verified profiles get more matches!
            </p>

            {/* Profile photo reference */}
            {primaryPhoto && (
              <div className="mb-8">
                <p className="text-sm text-muted-foreground mb-3">Your profile photo</p>
                <div className="w-32 h-32 rounded-2xl overflow-hidden mx-auto ring-4 ring-primary/20">
                  <img
                    src={primaryPhoto.photo_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Button onClick={startCamera} className="w-full gap-2">
                <Camera className="w-5 h-5" />
                Take a Selfie
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="w-full gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Photo
                </Button>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-muted/50 text-left">
              <h3 className="font-semibold mb-2">Tips for verification:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Make sure your face is clearly visible</li>
                <li>• Good lighting helps</li>
                <li>• No filters or heavy editing</li>
                <li>• Match your profile photo</li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* Capture Step */}
        {step === "capture" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="relative mb-6 rounded-2xl overflow-hidden bg-black aspect-[3/4]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
              {/* Face guide overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-64 border-4 border-dashed border-white/50 rounded-[100px]" />
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            
            <Button onClick={capturePhoto} size="lg" className="gap-2">
              <Camera className="w-5 h-5" />
              Capture
            </Button>
          </motion.div>
        )}

        {/* Review Step */}
        {step === "review" && capturedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <h2 className="text-xl font-bold mb-4">Looking good?</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {primaryPhoto && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Profile Photo</p>
                  <div className="aspect-square rounded-xl overflow-hidden">
                    <img
                      src={primaryPhoto.photo_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Verification Photo</p>
                <div className="aspect-square rounded-xl overflow-hidden">
                  <img
                    src={capturedImage}
                    alt="Verification"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={submitVerification}
                disabled={uploading}
                className="w-full gap-2"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
                Submit for Verification
              </Button>
              <Button onClick={retake} variant="outline" className="w-full gap-2">
                <RefreshCw className="w-5 h-5" />
                Retake Photo
              </Button>
            </div>
          </motion.div>
        )}

        {/* Submitted Step */}
        {step === "submitted" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-10 h-10 text-success" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Submitted!</h2>
            <p className="text-muted-foreground mb-8">
              We'll review your photo and let you know within 24-48 hours. You can keep using the app in the meantime!
            </p>
            <Button onClick={() => navigate("/app")}>Continue Swiping</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FaceVerification;