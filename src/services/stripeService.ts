// Simulated Stripe Connect service
// In production, this would call your backend API which handles Stripe

export interface PaymentIntent {
  id: string;
  amount: number;
  status: 'pending' | 'succeeded' | 'failed';
  created: Date;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  savings?: string;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 10,
    price: 75,
  },
  {
    id: 'professional',
    name: 'Professional',
    credits: 25,
    price: 175,
    popular: true,
    savings: 'Save $12.50',
  },
  {
    id: 'business',
    name: 'Business',
    credits: 50,
    price: 325,
    savings: 'Save $50',
  },
];

export const SUBSCRIPTION_TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Basic profile listing',
      'Pay per lead ($7.50)',
      'Standard support',
      'Mobile app access',
    ],
    limitations: [
      'No priority placement',
      'Limited to 5 leads/month',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    popular: true,
    features: [
      'Priority placement',
      'Discounted leads ($5.00)',
      'Unlimited leads',
      'Verified badge',
      'Priority support',
      'Analytics dashboard',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99,
    features: [
      'Top placement guarantee',
      'Free leads (up to 30/month)',
      'Premium verified badge',
      'Dedicated account manager',
      'Advanced analytics',
      'Marketing tools',
    ],
  },
];

// Simulate payment processing
export async function createPaymentIntent(
  amount: number,
  metadata: Record<string, string>
): Promise<PaymentIntent> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    id: `pi_${Date.now()}`,
    amount,
    status: 'succeeded',
    created: new Date(),
  };
}

// Simulate adding credits to wallet
export async function purchaseCredits(
  detailerId: string,
  packageId: string
): Promise<{ success: boolean; credits: number }> {
  const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) throw new Error('Package not found');

  // Simulate payment processing
  await createPaymentIntent(pkg.price * 100, {
    detailerId,
    packageId,
    credits: pkg.credits.toString(),
  });

  return {
    success: true,
    credits: pkg.credits,
  };
}

// Simulate subscription upgrade
export async function upgradeSubscription(
  detailerId: string,
  tierId: string
): Promise<{ success: boolean }> {
  const tier = SUBSCRIPTION_TIERS.find((t) => t.id === tierId);
  if (!tier) throw new Error('Tier not found');

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return { success: true };
}

// Calculate lead cost based on subscription tier
export function getLeadCost(isPro: boolean, isPremium: boolean): number {
  if (isPremium) return 0; // Free leads for premium
  if (isPro) return 5.0; // Discounted for pro
  return 7.5; // Standard rate
}
