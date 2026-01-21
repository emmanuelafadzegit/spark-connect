import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateResetToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return new Response(
        JSON.stringify({ error: "Email and OTP are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find valid OTP token
    const { data: tokens, error: fetchError } = await supabaseAdmin
      .from("password_reset_tokens")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("otp_code", otp)
      .eq("used", false)
      .eq("otp_verified", false)
      .gt("otp_expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      throw new Error("Database error");
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired OTP" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const tokenRecord = tokens[0];

    // Generate reset token with 10 minute expiry
    const resetToken = generateResetToken();
    const tokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Update record with reset token
    const { error: updateError } = await supabaseAdmin
      .from("password_reset_tokens")
      .update({
        otp_verified: true,
        reset_token: resetToken,
        token_expires_at: tokenExpiresAt,
      })
      .eq("id", tokenRecord.id);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error("Failed to generate reset token");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reset_token: resetToken,
        message: "OTP verified successfully" 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in verify-otp:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
