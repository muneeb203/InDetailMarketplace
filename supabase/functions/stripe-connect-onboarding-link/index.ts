// Supabase Edge Function: Create Stripe Connect Onboarding Link
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
    const { account_id, return_url, refresh_url } = await req.json()

    // Validate required fields
    if (!account_id || !return_url || !refresh_url) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: account_id, return_url, refresh_url' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verify the user owns this Connect account
    const { data: account, error: accountError } = await supabaseClient
      .from('stripe_connected_accounts')
      .select('detailer_id, stripe_account_id')
      .eq('stripe_account_id', account_id)
      .single()

    if (accountError || !account) {
      return new Response(
        JSON.stringify({ error: 'Connect account not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verify user owns the detailer profile
    if (account.detailer_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Cannot access this Connect account' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account_id,
      return_url: return_url,
      refresh_url: refresh_url,
      type: 'account_onboarding',
    })

    return new Response(
      JSON.stringify({
        url: accountLink.url,
        expires_at: accountLink.expires_at,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error creating onboarding link:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create onboarding link',
        details: error
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})