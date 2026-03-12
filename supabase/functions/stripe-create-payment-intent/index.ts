// Supabase Edge Function: Create Stripe Payment Intent for Marketplace
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
      amount, 
      detailer_stripe_account_id, 
      platform_fee,
      metadata = {} 
    } = await req.json()

    // Validate required fields
    if (!order_id || !amount || !detailer_stripe_account_id || platform_fee === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate amount
    if (amount <= 0 || amount > 100000000) {
      return new Response(
        JSON.stringify({ error: 'Invalid payment amount' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verify the order exists and user is the client
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('id, client_id, dealer_id')
      .eq('id', order_id)
      .eq('client_id', user.id)
      .single()

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found or unauthorized' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verify the detailer's Stripe account exists and is active
    const { data: stripeAccount, error: accountError } = await supabaseClient
      .from('stripe_connected_accounts')
      .select('*')
      .eq('stripe_account_id', detailer_stripe_account_id)
      .eq('detailer_id', order.dealer_id)
      .single()

    if (accountError || !stripeAccount) {
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive Stripe Connect account' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (stripeAccount.account_status !== 'active' || !stripeAccount.payouts_enabled) {
      return new Response(
        JSON.stringify({ error: 'Detailer account is not ready to receive payments' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create payment intent with application fee
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      application_fee_amount: platform_fee,
      transfer_data: {
        destination: detailer_stripe_account_id,
      },
      metadata: {
        order_id: order_id,
        client_id: user.id,
        detailer_id: order.dealer_id,
        platform: 'InDetailMarketplace',
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return new Response(
      JSON.stringify({
        payment_intent_id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        requires_action: paymentIntent.status === 'requires_action',
        status: paymentIntent.status,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error creating payment intent:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create payment intent',
        details: error
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})