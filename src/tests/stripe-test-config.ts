// Stripe Test Configuration and Test Card Numbers
// This file contains test configuration for Stripe marketplace payments

export const STRIPE_TEST_CONFIG = {
  // Test API Keys (already configured in .env)
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  
  // Test mode validation
  isTestMode: () => {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    return key && key.startsWith('pk_test_');
  },

  // Webhook endpoint for testing
  webhookEndpoint: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-webhook-handler`,
  
  // Test amounts in cents
  testAmounts: {
    small: 5000,      // $50.00
    medium: 39216,    // $392.16 (example from spec)
    large: 100000,    // $1,000.00
    minimum: 50,      // $0.50 (Stripe minimum)
    maximum: 99999999 // $999,999.99
  }
};

// Stripe Test Card Numbers
export const STRIPE_TEST_CARDS = {
  // Successful payments
  visa: '4242424242424242',
  visaDebit: '4000056655665556',
  mastercard: '5555555555554444',
  amex: '378282246310005',
  
  // Declined payments
  declined: '4000000000000002',
  insufficientFunds: '4000000000009995',
  lostCard: '4000000000009987',
  stolenCard: '4000000000009979',
  
  // Authentication required (3D Secure)
  authRequired: '4000002500003155',
  authRequiredSetup: '4000002760003184',
  
  // Processing errors
  processingError: '4000000000000119',
  
  // International cards
  canadianVisa: '4000000760000002',
  brazilianVisa: '4000000760000002',
  
  // Specific scenarios
  alwaysAuthenticate: '4000002500003155',
  chargeSucceedsButCvcFails: '4000000000000101'
};

// Test Connect Account IDs (for testing purposes)
export const TEST_CONNECT_ACCOUNTS = {
  valid: 'acct_test_valid_account',
  invalid: 'acct_test_invalid_account',
  restricted: 'acct_test_restricted_account',
  pending: 'acct_test_pending_account'
};

// Test webhook events
export const TEST_WEBHOOK_EVENTS = {
  paymentIntentSucceeded: {
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_test_payment_intent',
        amount: 39216,
        currency: 'usd',
        status: 'succeeded',
        metadata: {
          order_id: 'test_order_123',
          upfront_amount: '5882',
          remaining_amount: '33334'
        }
      }
    }
  },
  
  transferCreated: {
    type: 'transfer.created',
    data: {
      object: {
        id: 'tr_test_transfer',
        amount: 5882,
        currency: 'usd',
        destination: 'acct_test_detailer',
        metadata: {
          order_id: 'test_order_123',
          payout_type: 'upfront'
        }
      }
    }
  },
  
  accountUpdated: {
    type: 'account.updated',
    data: {
      object: {
        id: 'acct_test_detailer',
        charges_enabled: true,
        payouts_enabled: true,
        details_submitted: true
      }
    }
  }
};

// Test order data
export const TEST_ORDER_DATA = {
  validOrder: {
    id: 'test_order_123',
    client_id: 'test_client_456',
    dealer_id: 'test_dealer_789',
    gig_id: 'test_gig_101',
    proposed_price: 39216,
    agreed_price: 39216,
    marketplace_status: 'pending_payment' as const,
    notes: 'Test order for payment processing',
    scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  },
  
  paidOrder: {
    id: 'test_order_456',
    client_id: 'test_client_456',
    dealer_id: 'test_dealer_789',
    gig_id: 'test_gig_102',
    proposed_price: 50000,
    agreed_price: 50000,
    marketplace_status: 'paid' as const,
    amount_total: 50000,
    amount_upfront: 7500,
    amount_remaining: 42500,
    platform_fee: 1480
  }
};

// Test user data
export const TEST_USER_DATA = {
  client: {
    id: 'test_client_456',
    email: 'client@test.com',
    name: 'Test Client',
    role: 'client'
  },
  
  detailer: {
    id: 'test_dealer_789',
    email: 'detailer@test.com',
    business_name: 'Test Detailing Co',
    role: 'dealer',
    stripe_account_id: 'acct_test_detailer'
  }
};

// Validation helpers
export const testValidation = {
  /**
   * Validate test environment is properly configured
   */
  validateTestEnvironment: (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!STRIPE_TEST_CONFIG.isTestMode()) {
      errors.push('Stripe is not in test mode - check VITE_STRIPE_PUBLISHABLE_KEY');
    }
    
    if (!import.meta.env.VITE_SUPABASE_URL) {
      errors.push('Missing VITE_SUPABASE_URL environment variable');
    }
    
    if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
      errors.push('Missing VITE_SUPABASE_ANON_KEY environment variable');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },
  
  /**
   * Validate test card number
   */
  isValidTestCard: (cardNumber: string): boolean => {
    return Object.values(STRIPE_TEST_CARDS).includes(cardNumber);
  },
  
  /**
   * Get expected outcome for test card
   */
  getCardOutcome: (cardNumber: string): string => {
    if (cardNumber === STRIPE_TEST_CARDS.visa) return 'success';
    if (cardNumber === STRIPE_TEST_CARDS.declined) return 'declined';
    if (cardNumber === STRIPE_TEST_CARDS.authRequired) return 'requires_action';
    if (cardNumber === STRIPE_TEST_CARDS.processingError) return 'processing_error';
    return 'unknown';
  }
};

// Test scenarios for comprehensive testing
export const TEST_SCENARIOS = {
  // Happy path scenarios
  completePaymentFlow: {
    name: 'Complete Payment Flow',
    description: 'Test full payment flow from creation to completion',
    steps: [
      'Create payment intent',
      'Process payment with test card',
      'Detailer accepts job (15% payout)',
      'Detailer marks job complete',
      'Client confirms completion (85% payout)',
      'Order marked as completed'
    ]
  },
  
  autoReleaseFlow: {
    name: 'Auto-Release Flow',
    description: 'Test automatic payment release after timeout',
    steps: [
      'Create payment intent',
      'Process payment',
      'Detailer accepts job',
      'Detailer marks complete',
      'Wait for auto-release timeout',
      'Verify automatic payout'
    ]
  },
  
  // Error scenarios
  paymentDeclined: {
    name: 'Payment Declined',
    description: 'Test handling of declined payments',
    card: STRIPE_TEST_CARDS.declined,
    expectedOutcome: 'payment_failed'
  },
  
  invalidAccount: {
    name: 'Invalid Connect Account',
    description: 'Test handling of invalid detailer accounts',
    account: TEST_CONNECT_ACCOUNTS.invalid,
    expectedOutcome: 'account_validation_failed'
  },
  
  // Edge cases
  minimumAmount: {
    name: 'Minimum Payment Amount',
    description: 'Test payment with minimum allowed amount',
    amount: STRIPE_TEST_CONFIG.testAmounts.minimum
  },
  
  maximumAmount: {
    name: 'Maximum Payment Amount',
    description: 'Test payment with maximum allowed amount',
    amount: STRIPE_TEST_CONFIG.testAmounts.maximum
  }
};