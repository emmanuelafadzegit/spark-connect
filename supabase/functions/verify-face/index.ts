// Face Verification Edge Function
// Uses Lovable AI Gateway to analyze selfie and compare with profile photo
// Returns: verified, rejected, or pending status

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  selfie_base64: string; // Base64 encoded selfie image
  profile_photo_url?: string; // URL of user's profile photo for comparison
}

interface VerificationResponse {
  status: "verified" | "rejected" | "pending";
  message: string;
  confidence?: number;
  details?: {
    face_detected: boolean;
    face_count: number;
    face_match: boolean | null;
    liveness_check: boolean | null;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the user token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { selfie_base64, profile_photo_url }: VerificationRequest = await req.json();

    if (!selfie_base64) {
      return new Response(
        JSON.stringify({ error: "Missing selfie image" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate base64 image
    const base64Regex = /^data:image\/(jpeg|jpg|png|webp);base64,/;
    if (!base64Regex.test(selfie_base64)) {
      return new Response(
        JSON.stringify({ error: "Invalid image format. Must be JPEG, PNG, or WebP." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract base64 data (remove data URL prefix)
    const base64Data = selfie_base64.replace(/^data:image\/\w+;base64,/, "");
    
    // Check image size (max 5MB)
    const imageSizeBytes = (base64Data.length * 3) / 4;
    if (imageSizeBytes > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "Image too large. Maximum size is 5MB." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use Lovable AI Gateway for face analysis
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare the AI prompt for face verification
    const systemPrompt = `You are a face verification AI assistant. Analyze the provided selfie image and determine if it's suitable for identity verification.

Your analysis should check:
1. Face Detection: Is there exactly one clear human face visible?
2. Image Quality: Is the image clear, well-lit, and not blurry?
3. Liveness Indicators: Does the image appear to be a live selfie (not a photo of a photo, screen, or printed image)?
4. Face Visibility: Is the face fully visible without obstructions (sunglasses, masks, etc.)?

${profile_photo_url ? "Also compare the selfie with the provided profile photo to verify they are the same person." : ""}

Respond with a JSON object in this exact format:
{
  "face_detected": true/false,
  "face_count": number (how many faces detected),
  "image_quality": "good"/"poor"/"acceptable",
  "liveness_score": number (0-100, how likely this is a live selfie vs photo of photo),
  "face_match": true/false/null (null if no profile photo provided),
  "match_confidence": number (0-100, only if comparing),
  "verification_decision": "verified"/"rejected"/"pending",
  "rejection_reason": "string or null (explain if rejected)",
  "message": "Brief explanation for the user"
}`;

    // Build messages for the AI
    const messages: any[] = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: profile_photo_url 
              ? "Analyze this selfie for face verification and compare it with the profile photo. Determine if verification should be approved."
              : "Analyze this selfie for face verification. Check if there's a clear, single face suitable for identity verification."
          },
          {
            type: "image_url",
            image_url: { url: selfie_base64 }
          }
        ]
      }
    ];

    // If we have a profile photo, add it for comparison
    if (profile_photo_url) {
      messages[1].content.push({
        type: "image_url",
        image_url: { url: profile_photo_url }
      });
    }

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: messages,
        max_tokens: 1024,
        temperature: 0.1, // Low temperature for consistent analysis
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", errorText);
      return new Response(
        JSON.stringify({ 
          status: "pending",
          message: "Verification requires manual review. Please wait for admin approval.",
          details: { face_detected: true, face_count: 1, face_match: null, liveness_check: null }
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await aiResponse.json();
    const aiContent = aiResult.choices?.[0]?.message?.content || "";

    // Parse AI response
    let analysisResult;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in AI response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      // Fall back to pending status for manual review
      analysisResult = {
        verification_decision: "pending",
        message: "Verification requires manual review.",
        face_detected: true,
        face_count: 1,
        face_match: null,
        liveness_score: 50
      };
    }

    // Determine final verification status
    const status = analysisResult.verification_decision as "verified" | "rejected" | "pending";
    
    // Update user's verification status in database
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        verification_status: status === "verified" ? "approved" : status,
        is_verified: status === "verified",
        verification_reviewed_at: status !== "pending" ? new Date().toISOString() : null,
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to update profile:", updateError);
    }

    // Prepare response
    const response: VerificationResponse = {
      status: status,
      message: analysisResult.message || (
        status === "verified" 
          ? "Your face has been verified successfully!" 
          : status === "rejected"
          ? analysisResult.rejection_reason || "Verification failed. Please try again with a clearer photo."
          : "Your verification is pending review."
      ),
      confidence: analysisResult.match_confidence || analysisResult.liveness_score,
      details: {
        face_detected: analysisResult.face_detected ?? true,
        face_count: analysisResult.face_count ?? 1,
        face_match: analysisResult.face_match ?? null,
        liveness_check: (analysisResult.liveness_score ?? 0) >= 50
      }
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Verification error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        status: "pending",
        message: "An error occurred. Your verification has been queued for manual review.",
        error: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
