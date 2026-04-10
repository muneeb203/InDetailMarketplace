/**
 * Developer Script: Retrieve Stripe Keys from Database
 * 
 * This script helps developers retrieve the Stripe API keys that the client
 * has entered through the admin panel, so they can be added to the .env file.
 * 
 * Usage: node scripts/get-stripe-keys.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need this key

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  console.log('Make sure you have VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getStripeKeys() {
  try {
    console.log('🔍 Retrieving Stripe configuration from database...\n');

    const { data, error } = await supabase
      .from('stripe_config')
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️  No Stripe configuration found in database');
        console.log('The client needs to set up their Stripe keys in the admin panel first.\n');
        console.log('Instructions for client:');
        console.log('1. Login to marketplace admin panel');
        console.log('2. Go to Settings → Payments');
        console.log('3. Follow the Stripe setup guide');
        console.log('4. Enter their API keys and save');
        return;
      }
      throw error;
    }

    if (!data.setup_completed) {
      console.log('⚠️  Stripe setup not completed');
      console.log('The client has started setup but hasn\'t finished yet.\n');
      return;
    }

    // Decrypt the keys (simple base64 decoding)
    const publishableKey = data.publishable_key;
    const secretKey = data.secret_key_encrypted ? atob(data.secret_key_encrypted) : null;
    const webhookSecret = data.webhook_secret_encrypted ? atob(data.webhook_secret_encrypted) : null;

    console.log('✅ Stripe configuration found!\n');
    console.log('📋 Configuration Details:');
    console.log(`   Account Name: ${data.account_name || 'Not specified'}`);
    console.log(`   Mode: ${data.is_live_mode ? '🔴 LIVE MODE' : '🟡 TEST MODE'}`);
    console.log(`   Setup Date: ${new Date(data.created_at).toLocaleDateString()}\n`);

    console.log('🔑 API Keys to add to your .env file:\n');
    console.log('# Stripe Configuration (from client)');
    console.log(`VITE_STRIPE_PUBLISHABLE_KEY=${publishableKey}`);
    console.log(`STRIPE_SECRET_KEY=${secretKey}`);
    
    if (webhookSecret) {
      console.log(`STRIPE_WEBHOOK_SECRET=${webhookSecret}`);
    }

    console.log('\n📝 Next Steps:');
    console.log('1. Copy the keys above to your .env file');
    console.log('2. Update your Supabase Edge Functions with the STRIPE_SECRET_KEY');
    console.log('3. Test the payment flow');
    
    if (data.is_live_mode) {
      console.log('\n⚠️  WARNING: These are LIVE keys - real money will be processed!');
    } else {
      console.log('\n✅ These are test keys - safe for development');
    }

  } catch (error) {
    console.error('❌ Error retrieving Stripe keys:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your Supabase connection');
    console.log('2. Verify SUPABASE_SERVICE_ROLE_KEY is correct');
    console.log('3. Ensure the stripe_config table exists');
  }
}

// Simple base64 decode function (matches the encoding in the service)
function atob(str) {
  return Buffer.from(str, 'base64').toString('utf-8');
}

// Run the script
getStripeKeys();