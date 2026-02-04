/**
 * FaceVerification.tsx
 * 
 * Face verification flow for BexMatch dating app.
 * 
 * Flow:
 * 1. User sees intro screen with their profile photo
 * 2. User clicks "Take Selfie" to open camera or "Upload Photo" to select file
 * 3. Camera opens using navigator.mediaDevices.getUserMedia (front-facing)
 * 4. User captures a selfie
 * 5. User reviews the captured image
 * 6. Image is sent to backend edge function for AI-powered verification
 * 7. Backend analyzes the image and updates verification status
 * 8. UI reflects the verification result from backend
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Upload, Check, ArrowLeft, ShieldCheck, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Verification states
type VerificationStep = "intro" | "capture" | "review" | "verifying" | "submitted";
type VerificationStatus = "verified" | "rejected" | "pending";

interface VerificationResponse {
  status: VerificationStatus;
  message: string;
  confidence?: number;
  details?: {
    face_detected: boolean;
    face_count: number;
    face_match: boolean | null;
    liveness_check: boolean | null;
  };
}

const FaceVerification = () => {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  
  // UI State
  const [step, setStep] = useState<VerificationStep>("intro");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Refs for camera
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get primary profile photo for comparison
  const primaryPhoto = profile?.profile_photos?.find(p => p.is_primary) || profile?.profile_photos?.[0];

  /**
   * Start the camera stream
   * Uses front-facing camera with mobile browser compatibility
   */
  const startCamera = async () => {
    setCameraError(null);
    
    // Check if we're on a secure context (HTTPS or localhost)
    if (!window.isSecureContext) {
      setCameraError("Camera access requires a secure connection (HTTPS). Please access the app via HTTPS.");
      toast.error("Camera requires HTTPS connection");
      return;
    }

    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Your browser doesn't support camera access. Please use a modern browser like Chrome, Safari, or Firefox.");
      toast.error("Camera not supported on this browser");
      return;
    }

    try {
      console.log("Requesting camera access...");
      
      // Request camera with front-facing preference
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user", // Front-facing camera
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      console.log("Camera stream obtained:", stream.getVideoTracks()[0]?.label);
      
      // Store stream reference for cleanup
      streamRef.current = stream;
      
      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Ensure video plays (important for mobile browsers)
        try {
          await videoRef.current.play();
          console.log("Video playing successfully");
        } catch (playError) {
          console.error("Video play error:", playError);
          // On some mobile browsers, play() might fail but video still works
        }
      }
      
      setIsCapturing(true);
      setStep("capture");
      
    } catch (error) {
      console.error("Camera access error:", error);
      
      // Provide specific error messages based on error type
      if (error instanceof DOMException) {
        switch (error.name) {
          case "NotAllowedError":
            setCameraError("Camera access was denied. Please allow camera access in your browser settings and try again.");
            toast.error("Camera access denied. Please check your browser permissions.");
            break;
          case "NotFoundError":
            setCameraError("No camera found on your device. Please connect a camera and try again.");
            toast.error("No camera found on your device");
            break;
          case "NotReadableError":
            setCameraError("Camera is being used by another application. Please close other apps using the camera.");
            toast.error("Camera is in use by another application");
            break;
          case "OverconstrainedError":
            setCameraError("Camera doesn't support the required settings. Trying with default settings...");
            // Try again with basic constraints
            try {
              const basicStream = await navigator.mediaDevices.getUserMedia({ video: true });
              streamRef.current = basicStream;
              if (videoRef.current) {
                videoRef.current.srcObject = basicStream;
                await videoRef.current.play();
              }
              setIsCapturing(true);
              setStep("capture");
              setCameraError(null);
              return;
            } catch {
              setCameraError("Could not access camera with any settings.");
            }
            break;
          default:
            setCameraError(`Camera error: ${error.message}`);
            toast.error(`Camera error: ${error.message}`);
        }
      } else {
        setCameraError("An unexpected error occurred while accessing the camera.");
        toast.error("Failed to access camera");
      }
    }
  };

  /**
   * Stop the camera stream and clean up resources
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log("Camera track stopped:", track.label);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  }, []);

  /**
   * Capture a photo from the video stream
   */
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error("Camera not ready");
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Mirror the image horizontally (for selfie effect)
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    // Convert canvas to base64 JPEG
    const imageData = canvas.toDataURL("image/jpeg", 0.85);
    console.log("Photo captured, size:", Math.round(imageData.length / 1024), "KB");
    
    setCapturedImage(imageData);
    stopCamera();
    setStep("review");
  };

  /**
   * Handle file upload for verification photo
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Maximum size is 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
      setStep("review");
    };
    reader.onerror = () => {
      toast.error("Failed to read the image file");
    };
    reader.readAsDataURL(file);
  };

  /**
   * Submit the captured selfie to backend for AI verification
   */
  const submitVerification = async () => {
    if (!capturedImage || !profile) {
      toast.error("No image to verify");
      return;
    }

    setUploading(true);
    setStep("verifying");

    try {
      // Get current session for auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to verify your face");
        navigate("/login");
        return;
      }

      console.log("Submitting verification to backend...");

      // First, upload the verification photo to storage
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], `verification_${Date.now()}.jpg`, { type: "image/jpeg" });
      
      const fileName = `${session.user.id}/verification_${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error("Failed to upload verification photo");
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(fileName);

      // Update profile with verification photo URL
      await supabase
        .from("profiles")
        .update({
          verification_photo_url: urlData.publicUrl,
          verification_submitted_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      // Call the backend edge function for AI-powered verification
      const verifyResponse = await supabase.functions.invoke<VerificationResponse>("verify-face", {
        body: {
          selfie_base64: capturedImage,
          profile_photo_url: primaryPhoto?.photo_url || null,
        },
      });

      if (verifyResponse.error) {
        console.error("Verification API error:", verifyResponse.error);
        throw new Error(verifyResponse.error.message || "Verification failed");
      }

      const result = verifyResponse.data;
      console.log("Verification result:", result);

      // Refresh profile to get updated status
      await refreshProfile();
      
      // Show appropriate message based on result
      if (result?.status === "verified") {
        toast.success("Your face has been verified! 🎉");
      } else if (result?.status === "rejected") {
        toast.error(result.message || "Verification failed. Please try again.");
      } else {
        toast.info("Your verification is under review.");
      }

      setStep("submitted");

    } catch (error) {
      console.error("Verification submission error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to submit verification";
      toast.error(errorMessage);
      setStep("review"); // Allow retry
    } finally {
      setUploading(false);
    }
  };

  /**
   * Retake the photo - go back to camera
   */
  const retake = () => {
    setCapturedImage(null);
    setCameraError(null);
    startCamera();
  };

  /**
   * Handle navigation back - clean up camera
   */
  const handleBack = () => {
    stopCamera();
    navigate(-1);
  };

  // Cleanup camera on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Face Verification</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Already Verified State */}
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

        {/* Pending Review State */}
        {profile?.verification_status === "submitted" && step !== "submitted" && (
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

        {/* Intro Step - Show when not verified and not submitted */}
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
                    alt="Your profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Camera error display */}
            {cameraError && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive text-left">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{cameraError}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Button onClick={startCamera} className="w-full gap-2" size="lg">
                <Camera className="w-5 h-5" />
                Take a Selfie
              </Button>
              
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  aria-label="Upload a photo"
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

        {/* Capture Step - Camera View */}
        {step === "capture" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <p className="text-sm text-muted-foreground mb-4">Position your face within the frame</p>
            
            <div className="relative mb-6 rounded-2xl overflow-hidden bg-black aspect-[3/4]">
              {/* Video element for camera feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
                style={{ transform: "scaleX(-1)" }} // Mirror for selfie view
              />
              
              {/* Face guide overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-64 border-4 border-dashed border-white/50 rounded-[100px]" />
              </div>
              
              {/* Loading indicator while camera initializes */}
              {!isCapturing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
            
            {/* Hidden canvas for capturing photo */}
            <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
            
            <div className="space-y-3">
              <Button 
                onClick={capturePhoto} 
                size="lg" 
                className="w-full gap-2"
                disabled={!isCapturing}
              >
                <Camera className="w-5 h-5" />
                Capture Photo
              </Button>
              
              <Button 
                onClick={() => { stopCamera(); setStep("intro"); }} 
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {/* Review Step - Preview captured image */}
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
                  <div className="aspect-square rounded-xl overflow-hidden border border-border">
                    <img
                      src={primaryPhoto.photo_url}
                      alt="Your profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              <div className={primaryPhoto ? "" : "col-span-2"}>
                <p className="text-sm text-muted-foreground mb-2">Verification Photo</p>
                <div className={`aspect-square rounded-xl overflow-hidden border border-border ${!primaryPhoto ? "max-w-xs mx-auto" : ""}`}>
                  <img
                    src={capturedImage}
                    alt="Your verification selfie"
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
                size="lg"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Submit for Verification
                  </>
                )}
              </Button>
              <Button 
                onClick={retake} 
                variant="outline" 
                className="w-full gap-2"
                disabled={uploading}
              >
                <RefreshCw className="w-5 h-5" />
                Retake Photo
              </Button>
            </div>
          </motion.div>
        )}

        {/* Verifying Step - AI processing */}
        {step === "verifying" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Analyzing Your Photo</h2>
            <p className="text-muted-foreground">
              Our AI is verifying your face. This may take a few seconds...
            </p>
          </motion.div>
        )}

        {/* Submitted Step - Show result */}
        {step === "submitted" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            {profile?.verification_status === "approved" || profile?.is_verified ? (
              // Verified successfully
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6"
                >
                  <ShieldCheck className="w-10 h-10 text-success" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Verified! 🎉</h2>
                <p className="text-muted-foreground mb-8">
                  Your face has been verified. Your profile now shows a verification badge!
                </p>
              </>
            ) : profile?.verification_status === "rejected" ? (
              // Rejected
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6"
                >
                  <AlertCircle className="w-10 h-10 text-destructive" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
                <p className="text-muted-foreground mb-8">
                  We couldn't verify your face. Please try again with a clearer photo.
                </p>
                <Button onClick={retake} variant="outline" className="mb-4 w-full gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </Button>
              </>
            ) : (
              // Pending review
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="w-10 h-10 text-primary" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Submitted!</h2>
                <p className="text-muted-foreground mb-8">
                  We'll review your photo and let you know within 24-48 hours. You can keep using the app in the meantime!
                </p>
              </>
            )}
            <Button onClick={() => navigate("/app")} className="w-full">
              Continue Swiping
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FaceVerification;
