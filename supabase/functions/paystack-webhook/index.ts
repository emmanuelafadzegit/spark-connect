import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

serve(async (req) => {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-paystack-signature')
    
    // Verify webhook signature
    const hash = createHmac('sha512', Deno.env.get('PAYSTACK_SECRET_KEY') || '')
      .update(body)
      .digest('hex')

    if (hash !== signature) {
      console.error('Invalid signature')
      return new Response('Invalid signature', { status: 401 })
    }

    const event = JSON.parse(body)
    console.log('Webhook event:', event.event)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (event.event === 'charge.success') {
      const data = event.data
      const reference = data.reference

      // Update transaction
      const { data: txData, error: txError } = await supabaseClient
        .from('paystack_transactions')
        .update({
          status: 'success',
          paystack_response: data,
        })
        .eq('reference', reference)
        .select()
        .single()

      if (!txError && txData) {
        const tier = txData.plan as 'premium' | 'premium_plus'
        const now = new Date()
        const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

        await supabaseClient
          .from('subscriptions')
          .update({
            tier,
            is_active: true,
            current_period_start: now.toISOString(),
            current_period_end: endDate.toISOString(),
            daily_swipes_remaining: -1,
            daily_messages_remaining: -1,
          })
          .eq('user_id', txData.user_id)
      }
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Error', { status: 500 })
  }
})