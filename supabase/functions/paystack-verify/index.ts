import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { reference } = await req.json()

    if (!reference) {
      return new Response(
        JSON.stringify({ error: 'Reference is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
      },
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      return new Response(
        JSON.stringify({ error: 'Verification failed', verified: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const transaction = paystackData.data

    // Update transaction record
    const { data: txData, error: txError } = await supabaseClient
      .from('paystack_transactions')
      .update({
        status: transaction.status === 'success' ? 'success' : 'failed',
        paystack_response: transaction,
      })
      .eq('reference', reference)
      .select()
      .single()

    if (txError || !txData) {
      console.error('Transaction update error:', txError)
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If payment successful, update subscription
    if (transaction.status === 'success') {
      const tier = txData.plan as 'premium' | 'premium_plus'
      const now = new Date()
      const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

      const { error: subError } = await supabaseClient
        .from('subscriptions')
        .update({
          tier,
          is_active: true,
          current_period_start: now.toISOString(),
          current_period_end: endDate.toISOString(),
          daily_swipes_remaining: -1, // Unlimited
          daily_messages_remaining: -1, // Unlimited
        })
        .eq('user_id', txData.user_id)

      if (subError) {
        console.error('Subscription update error:', subError)
      }
    }

    return new Response(
      JSON.stringify({
        verified: transaction.status === 'success',
        status: transaction.status,
        plan: txData.plan,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})