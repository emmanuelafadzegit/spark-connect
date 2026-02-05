import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WelcomeEmailRequest {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: WelcomeEmailRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    const displayName = name || "there";

    const emailResponse = await resend.emails.send({
      from: "BexMatch <noreply@bexmatch.com>",
      to: [email],
      subject: "Welcome to BexMatch! 💕",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to BexMatch</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <tr>
              <td>
                <div style="background: linear-gradient(135deg, #ec4899, #f43f5e); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 32px;">💕 BexMatch</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Find Your Perfect Match</p>
                </div>
                
                <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <h2 style="color: #18181b; margin: 0 0 20px; font-size: 24px;">Welcome, ${displayName}! 🎉</h2>
                  
                  <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                    We're thrilled to have you join the BexMatch community! You've just taken the first step towards finding meaningful connections.
                  </p>
                  
                  <div style="background: #fdf2f8; padding: 20px; border-radius: 12px; margin: 20px 0;">
                    <h3 style="color: #ec4899; margin: 0 0 12px; font-size: 18px;">🚀 Get Started:</h3>
                    <ul style="color: #52525b; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li><strong>Complete your profile</strong> - Add photos and answer prompts</li>
                      <li><strong>Set your preferences</strong> - Tell us who you're looking for</li>
                      <li><strong>Start swiping</strong> - Discover amazing people nearby</li>
                      <li><strong>Get verified</strong> - Build trust with a verified badge</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://matchlychat.lovable.app/app" 
                       style="display: inline-block; background: linear-gradient(135deg, #ec4899, #f43f5e); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Start Matching →
                    </a>
                  </div>
                  
                  <p style="color: #a1a1aa; font-size: 14px; text-align: center; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #e4e4e7;">
                    Questions? Reply to this email or visit our help center.<br>
                    Happy matching! 💕
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
