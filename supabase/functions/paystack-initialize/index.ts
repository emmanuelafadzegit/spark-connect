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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { plan, email, type } = await req.json()

    // Pricing in GHS (pesewas) - Paystack Ghana only supports GHS
    // Exchange rate: ~1 USD = 15 GHS
    const subscriptions: Record<string, { amount: number; name: string }> = {
      premium: { amount: 30000, name: 'Premium' }, // 300 GHS = ~$20
      premium_plus: { amount: 67500, name: 'Premium Plus' }, // 675 GHS = ~$45
    }

    const consumables: Record<string, { amount: number; name: string }> = {
      boost_1: { amount: 7500, name: '1 Boost' }, // 75 GHS = ~$5
      boost_5: { amount: 30000, name: '5 Boosts' }, // 300 GHS = ~$20
      super_like_5: { amount: 15000, name: '5 Super Likes' }, // 150 GHS = ~$10
      rewind_5: { amount: 12000, name: '5 Rewinds' }, // 120 GHS = ~$8
    }

    const isConsumable = type === 'consumable'
    const products = isConsumable ? consumables : subscriptions
    const selectedProduct = products[plan]
    
    if (!selectedProduct) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan or product' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const reference = `pay_${user.id.substring(0, 8)}_${Date.now()}`

    // Create transaction record
    const { error: txError } = await supabaseClient
      .from('paystack_transactions')
      .insert({
        user_id: user.id,
        reference,
        amount: selectedProduct.amount,
        currency: 'GHS',
        plan,
        status: 'pending',
      })

    if (txError) {
      console.error('Transaction insert error:', txError)
      return new Response(
        JSON.stringify({ error: 'Failed to create transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Paystack transaction with GHS currency
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email || user.email,
        amount: selectedProduct.amount,
        currency: 'GHS',
        reference,
        callback_url: `${req.headers.get('origin')}/app/subscription/callback`,
        metadata: {
          user_id: user.id,
          plan,
          plan_name: selectedProduct.name,
          type: isConsumable ? 'consumable' : 'subscription',
        },
      }),
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      return new Response(
        JSON.stringify({ error: paystackData.message || 'Paystack initialization failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        authorization_url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        access_code: paystackData.data.access_code,
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