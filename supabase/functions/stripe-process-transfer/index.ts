// Supabase Edge Function: Process Stripe Transfer for Payouts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the request
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const { 
      order_id, 
      payout_type,
      amount, 
      detailer_stripe_account_id, 
      metadata = {} 
    } = await req.json()

    // Validate required fields
    if (!order_id || !payout_type || !amount || !detailer_stripe_account_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate payout type
    if (!['upfront', 'completion'].includes(payout_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid payout type' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate amount
    if (amount <= 0 || amount > 100000000) {
      return new Response(
        JSON.stringify({ error: 'Invalid transfer amount' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verify the order exists and get payment intent
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select(`
        id,
        client_id,
        dealer_id,
        marketplace_status,
        amount_total,
        amount_upfront,
        amount_remaining,
        marketplace_payment_intents (
          id,
          stripe_payment_intent_id,
          status
        )
      `)
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verify payment was successful
    const paymentIntent = order.marketplace_payment_intents?.[0]
    if (!paymentIntent || paymentIntent.status !== 'succeeded') {
      return new Response(
        JSON.stringify({ error: 'Payment must be completed before processing transfer' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verify the detailer's Stripe account
    const { data: stripeAccount, error: accountError } = await supabaseClient
      .from('stripe_connected_accounts')
      .select('*')
      .eq('stripe_account_id', detailer_stripe_account_id)
      .eq('detailer_id', order.dealer_id)
      .single()

    if (accountError || !stripeAccount) {
      return new Response(
        JSON.stringify({ error: 'Invalid Stripe Connect account' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (stripeAccount.account_status !== 'active' || !stripeAccount.payouts_enabled) {
      return new Response(
        JSON.stringify({ error: 'Detailer account is not ready to receive transfers' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate transfer amount matches expected amount
    const expectedAmount = payout_type === 'upfront' ? order.amount_upfront : order.amount_remaining
    if (amount !== expectedAmount) {
      return new Response(
        JSON.stringify({ error: `Transfer amount ${amount} does not match expected ${payout_type} amount ${expectedAmount}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check for existing transfer to prevent duplicates
    const { data: existingPayout } = await supabaseClient
      .from('payout_records')
      .select('id')
      .eq('order_id', order_id)
      .eq('payout_type', payout_type)
      .eq('status', 'succeeded')
      .single()

    if (existingPayout) {
      return new Response(
        JSON.stringify({ error: `${payout_type} payout already processed for this order` }),
        {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create the transfer
    const transfer = await stripe.transfers.create({
      amount: amount,
      currency: 'usd',
      destination: detailer_stripe_account_id,
      metadata: {
        order_id: order_id,
        payout_type: payout_type,
        detailer_id: order.dealer_id,
        platform: 'InDetailMarketplace',
        ...metadata
      },
    })

    return new Response(
      JSON.stringify({
        transfer_id: transfer.id,
        amount: transfer.amount,
        destination: transfer.destination,
        status: transfer.status || 'succeeded',
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error processing transfer:', error)
    
    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid transfer request: ' + error.message,
          code: error.code
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (error.type === 'StripeAPIError') {
      return new Response(
        JSON.stringify({ 
          error: 'Stripe service temporarily unavailable',
          code: error.code
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process transfer',
        details: error
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})