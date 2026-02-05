import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendMessageRequest {
  recipient_id: string;
  subject?: string;
  content: string;
}

interface BroadcastRequest {
  title: string;
  content: string;
  target_tier?: string; // 'all', 'free', 'premium', 'premium_plus'
  expires_at?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create client with user's token to verify identity
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Verify admin status
    const { data: isAdmin, error: adminError } = await supabaseUser.rpc("is_admin");
    if (adminError || !isAdmin) {
      throw new Error("Admin access required");
    }

    // Use service role for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "message";

    if (action === "broadcast") {
      const { title, content, target_tier, expires_at }: BroadcastRequest = await req.json();

      if (!title || !content) {
        throw new Error("Title and content are required");
      }

      const { data, error } = await supabaseAdmin
        .from("admin_announcements")
        .insert({
          admin_id: user.id,
          title,
          content,
          target_tier: target_tier || "all",
          expires_at: expires_at || null,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, announcement: data }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } else {
      // Direct message to a specific user
      const { recipient_id, subject, content }: SendMessageRequest = await req.json();

      if (!recipient_id || !content) {
        throw new Error("Recipient ID and content are required");
      }

      const { data, error } = await supabaseAdmin
        .from("admin_messages")
        .insert({
          admin_id: user.id,
          recipient_id,
          subject: subject || "Message from BexMatch Team",
          content,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, message: data }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  } catch (error: any) {
    console.error("Error in admin-send-message:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message === "Unauthorized" || error.message === "Admin access required" ? 403 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
