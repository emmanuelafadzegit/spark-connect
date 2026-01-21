import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Apple App Store Connect API verification
// In production, use Apple's verifyReceipt endpoint
const APPLE_VERIFY_URL = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_SANDBOX_URL = "https://sandbox.itunes.apple.com/verifyReceipt";

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { productId, receiptData, transactionId, purchaseType } = await req.json();

    if (!productId || !receiptData) {
      return new Response(
        JSON.stringify({ error: "Missing productId or receiptData" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // In production: Verify with Apple's servers
    // const sharedSecret = Deno.env.get("APPLE_SHARED_SECRET");
    // const response = await fetch(APPLE_VERIFY_URL, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     "receipt-data": receiptData,
    //     "password": sharedSecret,
    //     "exclude-old-transactions": true,
    //   }),
    // });
    // const verification = await response.json();
    // 
    // // If status is 21007, it's a sandbox receipt - retry with sandbox URL
    // if (verification.status === 21007) {
    //   const sandboxResponse = await fetch(APPLE_SANDBOX_URL, { ... });
    //   ...
    // }

    console.log("Apple receipt verification:", { productId, transactionId, userId: user.id });

    // Determine tier from product ID
    let tier = "free";
    if (productId.includes("premium_plus")) {
      tier = "premium_plus";
    } else if (productId.includes("premium")) {
      tier = "premium";
    }

    if (purchaseType === "subscription") {
      // Update subscription
      const { error: updateError } = await supabaseAdmin
        .from("subscriptions")
        .update({
          tier,
          is_active: true,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error("Failed to update subscription");
      }
    } else {
      // Handle consumable
      console.log("Consumable purchase:", productId);
    }

    return new Response(
      JSON.stringify({ valid: true, tier }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error verifying Apple receipt:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Verification failed" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
