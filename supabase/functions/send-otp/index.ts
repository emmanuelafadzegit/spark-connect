import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Matchly <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
  
  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Failed to send email: ${errorData}`);
  }
  
  return res.json();
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if user exists
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = users?.users?.some((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!userExists) {
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ success: true, message: "If this email exists, an OTP has been sent" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Invalidate any existing unused tokens for this email
    await supabaseAdmin
      .from("password_reset_tokens")
      .update({ used: true })
      .eq("email", email.toLowerCase())
      .eq("used", false);

    // Generate OTP and expiry (10 minutes)
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Store OTP in database
    const { error: insertError } = await supabaseAdmin
      .from("password_reset_tokens")
      .insert({
        email: email.toLowerCase(),
        otp_code: otpCode,
        otp_expires_at: otpExpiresAt,
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to create reset token");
    }

    // Send OTP email
    await sendEmail(
      email,
      "Your Password Reset Code",
      `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Password Reset</h2>
          <p style="color: #666; text-align: center;">Use this code to reset your password:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${otpCode}</span>
          </div>
          <p style="color: #999; text-align: center; font-size: 14px;">This code expires in 10 minutes.</p>
          <p style="color: #999; text-align: center; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    );

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-otp:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
