// Supabase Edge Function: Stripe Webhook Handler
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role for webhooks
    )

    // Get webhook signature and payload
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!signature || !webhookSecret) {
      return new Response(
        JSON.stringify({ error: 'Missing webhook signature or secret' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response(
        JSON.stringify({ error: 'Invalid webhook signature' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`Processing webhook event: ${event.type}`)

    // Check for duplicate events (idempotency)
    const { data: existingEvent } = await supabaseClient
      .from('webhook_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .single()

    if (existingEvent) {
      console.log(`Duplicate webhook event ${event.id}, skipping`)
      return new Response(
        JSON.stringify({ received: true, duplicate: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Store webhook event for idempotency
    await supabaseClient
      .from('webhook_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        processed: false,
        created_at: new Date().toISOString()
      })

    // Process the webhook event
    let processed = false
    let error: string | null = null

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event, supabaseClient)
          processed = true
          break

        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event, supabaseClient)
          processed = true
          break

        case 'transfer.created':
          await handleTransferCreated(event, supabaseClient)
          processed = true
          break

        case 'transfer.updated':
          await handleTransferUpdated(event, supabaseClient)
          processed = true
          break

        case 'account.updated':
          await handleAccountUpdated(event, supabaseClient)
          processed = true
          break

        case 'capability.updated':
          await handleCapabilityUpdated(event, supabaseClient)
          processed = true
          break

        default:
          console.log(`Unhandled webhook event type: ${event.type}`)
          processed = true // Mark as processed to avoid retries
      }
    } catch (err) {
      console.error(`Error processing webhook event ${event.type}:`, err)
      error = err.message
    }

    // Update webhook event record
    await supabaseClient
      .from('webhook_events')
      .update({
        processed: processed,
        error: error,
        processed_at: processed ? new Date().toISOString() : null
      })
      .eq('stripe_event_id', event.id)

    return new Response(
      JSON.stringify({ 
        received: true, 
        processed: processed,
        event_type: event.type,
        error: error
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Webhook handler error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Webhook processing failed',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

// Handle payment_intent.succeeded
async function handlePaymentIntentSucceeded(event: Stripe.Event, supabase: any) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent
  
  console.log(`Payment intent succeeded: ${paymentIntent.id}`)

  // Update payment intent status
  const { error: updateError } = await supabase
    .from('marketplace_payment_intents')
    .update({
      status: 'succeeded',
      metadata: {
        ...paymentIntent.metadata,
        stripe_status: paymentIntent.status,
        amount_received: paymentIntent.amount_received
      }
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)

  if (updateError) {
    throw new Error(`Failed to update payment intent: ${updateError.message}`)
  }

  // Update order status to paid and notify detailer
  const orderId = paymentIntent.metadata?.order_id
  if (orderId) {
    await supabase
      .from('orders')
      .update({ marketplace_status: 'detailer_notified' })
      .eq('id', orderId)

    console.log(`Order ${orderId} status updated to detailer_notified`)
  }
}

// Handle payment_intent.payment_failed
async function handlePaymentIntentFailed(event: Stripe.Event, supabase: any) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent
  
  console.log(`Payment intent failed: ${paymentIntent.id}`)

  // Update payment intent status
  await supabase
    .from('marketplace_payment_intents')
    .update({
      status: 'failed',
      metadata: {
        ...paymentIntent.metadata,
        stripe_status: paymentIntent.status,
        failure_reason: paymentIntent.last_payment_error?.message
      }
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)

  // Update order status back to pending_payment
  const orderId = paymentIntent.metadata?.order_id
  if (orderId) {
    await supabase
      .from('orders')
      .update({ marketplace_status: 'pending_payment' })
      .eq('id', orderId)
  }
}

// Handle transfer.created
async function handleTransferCreated(event: Stripe.Event, supabase: any) {
  const transfer = event.data.object as Stripe.Transfer
  
  console.log(`Transfer created: ${transfer.id}`)

  // Update payout record status
  await supabase
    .from('payout_records')
    .update({
      status: 'succeeded',
      processed_at: new Date().toISOString(),
      metadata: {
        stripe_status: 'created',
        transfer_amount: transfer.amount,
        destination: transfer.destination
      }
    })
    .eq('stripe_transfer_id', transfer.id)
}

// Handle transfer.updated
async function handleTransferUpdated(event: Stripe.Event, supabase: any) {
  const transfer = event.data.object as Stripe.Transfer
  
  console.log(`Transfer updated: ${transfer.id}`)

  // Update payout record with latest status
  const status = transfer.status === 'paid' ? 'succeeded' : 
                 transfer.status === 'failed' ? 'failed' : 'pending'

  await supabase
    .from('payout_records')
    .update({
      status: status,
      metadata: {
        stripe_status: transfer.status,
        transfer_amount: transfer.amount,
        destination: transfer.destination
      }
    })
    .eq('stripe_transfer_id', transfer.id)
}

// Handle account.updated
async function handleAccountUpdated(event: Stripe.Event, supabase: any) {
  const account = event.data.object as Stripe.Account
  
  console.log(`Account updated: ${account.id}`)

  // Update connected account status
  const accountStatus = account.details_submitted && !account.requirements?.currently_due?.length ? 'active' : 'pending'
  const capabilitiesEnabled = account.capabilities?.card_payments === 'active' && 
                              account.capabilities?.transfers === 'active'
  const payoutsEnabled = account.capabilities?.transfers === 'active'

  await supabase
    .from('stripe_connected_accounts')
    .update({
      account_status: accountStatus,
      capabilities_enabled: capabilitiesEnabled,
      payouts_enabled: payoutsEnabled,
      onboarding_completed: account.details_submitted || false
    })
    .eq('stripe_account_id', account.id)
}

// Handle capability.updated
async function handleCapabilityUpdated(event: Stripe.Event, supabase: any) {
  const capability = event.data.object as Stripe.Capability
  
  console.log(`Capability updated: ${capability.id} for account ${capability.account}`)

  // Get the account and update capabilities
  const { data: accountData } = await supabase
    .from('stripe_connected_accounts')
    .select('*')
    .eq('stripe_account_id', capability.account)
    .single()

  if (accountData) {
    // Check if all required capabilities are active
    const capabilitiesEnabled = capability.status === 'active'
    const payoutsEnabled = capability.id === 'transfers' && capability.status === 'active'

    await supabase
      .from('stripe_connected_accounts')
      .update({
        capabilities_enabled: capabilitiesEnabled,
        payouts_enabled: payoutsEnabled || accountData.payouts_enabled
      })
      .eq('stripe_account_id', capability.account)
  }
}