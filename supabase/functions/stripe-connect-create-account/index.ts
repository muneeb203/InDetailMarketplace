// Supabase Edge Function: Create Stripe Connect Account
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
    const { detailer_id, business_type, country, email, business_name, first_name, last_name } = await req.json()

    // Validate required fields
    if (!detailer_id || !business_type || !country || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verify the user owns this detailer profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('id', detailer_id)
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Cannot create account for this detailer' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if account already exists
    const { data: existingAccount } = await supabaseClient
      .from('stripe_connected_accounts')
      .select('stripe_account_id')
      .eq('detailer_id', detailer_id)
      .single()

    if (existingAccount) {
      return new Response(
        JSON.stringify({ error: 'Connect account already exists for this detailer' }),
        {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create Stripe Connect account
    const accountData: any = {
      type: 'express',
      country: country,
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: business_type,
      metadata: {
        detailer_id: detailer_id,
        platform: 'InDetailMarketplace'
      }
    }

    // Add business profile data
    if (business_type === 'company' && business_name) {
      accountData.company = {
        name: business_name
      }
    } else if (business_type === 'individual') {
      accountData.individual = {}
      if (first_name) accountData.individual.first_name = first_name
      if (last_name) accountData.individual.last_name = last_name
    }

    const account = await stripe.accounts.create(accountData)

    return new Response(
      JSON.stringify({
        account_id: account.id,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error creating Stripe Connect account:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create Connect account',
        details: error
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})