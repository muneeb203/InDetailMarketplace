// Stripe Marketplace Payment System - TypeScript Types and Interfaces

// Enhanced Order Status for Marketplace Payments
export type MarketplaceOrderStatus = 
  | 'pending_payment'      // Client initiated booking, payment pending
  | 'paid'                 // Payment captured, funds in escrow
  | 'detailer_notified'    // Detailer notified of job
  | 'detailer_accepted'    // Detailer accepted, 15% paid out
  | 'detailer_rejected'    // Detailer rejected, full refund
  | 'in_progress'          // Job in progress
  | 'detailer_marked_done' // Detailer marked complete, awaiting client confirmation
  | 'client_confirmed'     // Client confirmed, 85% paid out
  | 'auto_confirmed'       // Auto-confirmed after timeout, 85% paid out
  | 'completed'            // Job fully completed
  | 'disputed';            // Payment disputed

// Stripe Connect Account
export interface StripeConnectedAccount {
  id: string;
  detailer_id: string;
  stripe_account_id: string;
  account_status: 'pending' | 'active' | 'restricted' | 'rejected';
  capabilities_enabled: boolean;
  payouts_enabled: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Payment Intent with Marketplace Data
export interface MarketplacePaymentIntent {
  id: string;
  order_id: string;
  stripe_payment_intent_id: string;
  amount_total: number;        // Total amount in cents
  amount_upfront: number;      // 15% upfront in cents
  amount_remaining: number;    // 85% remaining in cents
  platform_fee: number;       // Platform fee in cents
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Payout Record
export interface PayoutRecord {
  id: string;
  order_id: string;
  detailer_id: string;
  stripe_transfer_id: string;
  amount: number;              // Amount in cents
  payout_type: 'upfront' | 'completion';
  status: 'pending' | 'succeeded' | 'failed';
  metadata: Record<string, any>;
  created_at: string;
  processed_at?: string;
}

// Enhanced Order with Payment Data
export interface MarketplaceOrder {
  id: string;
  gig_id: string;
  client_id: string;
  dealer_id: string;
  proposed_price: number;
  agreed_price: number | null;
  notes: string | null;
  scheduled_date: string | null;
  status: string; // Original order status
  marketplace_status: MarketplaceOrderStatus;
  amount_total: number | null;
  amount_upfront: number | null;
  amount_remaining: number | null;
  platform_fee: number | null;
  confirmation_deadline: string | null;
  auto_release_scheduled: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  confirmed_at: string | null;
  opened_at: string | null;
  // Relations
  payment_intent?: MarketplacePaymentIntent;
  payouts?: PayoutRecord[];
  dealer?: { id: string; business_name?: string; base_location?: string };
  client?: { id: string; name?: string };
}

// Stripe Connect Onboarding Flow
export interface ConnectOnboardingFlow {
  account_id: string;
  onboarding_url: string;
  return_url: string;
  refresh_url: string;
}

// Payment Processing Request
export interface CreatePaymentRequest {
  order_id: string;
  amount: number; // in cents
  detailer_stripe_account_id: string;
  metadata?: Record<string, any>;
}

// Payment Processing Response
export interface CreatePaymentResponse {
  payment_intent: MarketplacePaymentIntent;
  client_secret: string;
  requires_action: boolean;
}

// Payout Processing Request
export interface ProcessPayoutRequest {
  order_id: string;
  payout_type: 'upfront' | 'completion';
  amount: number; // in cents
  detailer_stripe_account_id: string;
  metadata?: Record<string, any>;
}

// Payout Processing Response
export interface ProcessPayoutResponse {
  payout_record: PayoutRecord;
  transfer_id: string;
  success: boolean;
  error?: string;
}

// Job Completion Request
export interface JobCompletionRequest {
  order_id: string;
  detailer_id: string;
  completion_notes?: string;
}

// Client Confirmation Request
export interface ClientConfirmationRequest {
  order_id: string;
  client_id: string;
  confirmed: boolean;
  feedback?: string;
}

// Auto-Release Job Data
export interface AutoReleaseJob {
  order_id: string;
  scheduled_for: string;
  attempts: number;
  last_attempt?: string;
  status: 'scheduled' | 'processing' | 'completed' | 'failed';
}

// Webhook Event Data
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
  livemode: boolean;
}

// Webhook Processing Result
export interface WebhookProcessingResult {
  event_id: string;
  event_type: string;
  processed: boolean;
  error?: string;
  actions_taken: string[];
}

// Platform Fee Calculation
export interface PlatformFeeCalculation {
  amount_total: number;
  platform_fee: number;
  stripe_fee: number;
  platform_margin: number;
  net_amount: number;
}

// Payment Amount Breakdown
export interface PaymentAmountBreakdown {
  total_amount: number;        // Total amount in cents
  upfront_amount: number;      // 15% upfront in cents
  remaining_amount: number;    // 85% remaining in cents
  platform_fee: number;       // Platform fee in cents
  detailer_net_upfront: number;    // Upfront minus fees
  detailer_net_remaining: number;  // Remaining minus fees
  detailer_total_net: number;      // Total detailer receives
}

// Error Types
export interface PaymentError {
  code: string;
  message: string;
  type: 'validation' | 'stripe' | 'database' | 'network' | 'authorization';
  details?: Record<string, any>;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: PaymentError;
  message?: string;
}

// Notification Types
export interface PaymentNotification {
  id: string;
  user_id: string;
  order_id: string;
  type: 'job_accepted' | 'job_completed' | 'payment_received' | 'confirmation_request' | 'auto_released' | 'dispute_created';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

// Form Data Types for UI Components
export interface PaymentFormData {
  order_id: string;
  payment_method_id?: string;
  save_payment_method?: boolean;
}

export interface ConnectAccountFormData {
  business_type: 'individual' | 'company';
  country: string;
  email: string;
  business_name?: string;
  first_name?: string;
  last_name?: string;
}

// Dashboard Data Types
export interface PaymentDashboardData {
  total_earnings: number;
  pending_payouts: number;
  completed_orders: number;
  dispute_count: number;
  recent_payouts: PayoutRecord[];
  recent_orders: MarketplaceOrder[];
}

export interface ClientPaymentDashboardData {
  total_spent: number;
  active_orders: number;
  completed_orders: number;
  pending_confirmations: number;
  recent_orders: MarketplaceOrder[];
}

// Utility Types
export type PaymentStatus = MarketplacePaymentIntent['status'];
export type PayoutStatus = PayoutRecord['status'];
export type AccountStatus = StripeConnectedAccount['account_status'];

// Type Guards
export const isMarketplaceOrder = (order: any): order is MarketplaceOrder => {
  return order && typeof order.marketplace_status === 'string';
};

export const isValidMarketplaceStatus = (status: string): status is MarketplaceOrderStatus => {
  const validStatuses: MarketplaceOrderStatus[] = [
    'pending_payment', 'paid', 'detailer_notified', 'detailer_accepted',
    'detailer_rejected', 'in_progress', 'detailer_marked_done',
    'client_confirmed', 'auto_confirmed', 'completed', 'disputed'
  ];
  return validStatuses.includes(status as MarketplaceOrderStatus);
};

export const isPayoutType = (type: string): type is PayoutRecord['payout_type'] => {
  return type === 'upfront' || type === 'completion';
};

// Constants
export const MARKETPLACE_CONSTANTS = {
  UPFRONT_PERCENTAGE: 0.15,
  REMAINING_PERCENTAGE: 0.85,
  PLATFORM_FEE_PERCENTAGE: 0.029,
  PLATFORM_FEE_FIXED: 30, // 30 cents in cents
  AUTO_RELEASE_HOURS: 48,
  MAX_RETRY_ATTEMPTS: 3,
  WEBHOOK_TOLERANCE: 300, // 5 minutes in seconds
} as const;

// Status Transition Maps
export const VALID_STATUS_TRANSITIONS: Record<MarketplaceOrderStatus, MarketplaceOrderStatus[]> = {
  'pending_payment': ['paid', 'detailer_rejected'],
  'paid': ['detailer_notified'],
  'detailer_notified': ['detailer_accepted', 'detailer_rejected'],
  'detailer_accepted': ['in_progress'],
  'detailer_rejected': [], // Terminal state
  'in_progress': ['detailer_marked_done'],
  'detailer_marked_done': ['client_confirmed', 'auto_confirmed', 'disputed'],
  'client_confirmed': ['completed'],
  'auto_confirmed': ['completed'],
  'completed': [], // Terminal state
  'disputed': ['completed'], // Can be resolved to completed
};

export const isValidStatusTransition = (
  currentStatus: MarketplaceOrderStatus,
  newStatus: MarketplaceOrderStatus
): boolean => {
  return VALID_STATUS_TRANSITIONS[currentStatus].includes(newStatus);
};