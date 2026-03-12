// Platform Fee Calculation Service
import { 
  PaymentAmountBreakdown, 
  PlatformFeeCalculation,
  MARKETPLACE_CONSTANTS 
} from '../types/marketplacePayments';

export class FeeCalculationService {
  /**
   * Calculate platform fee (2.9% + $0.30)
   * This matches Stripe's standard fee structure plus platform margin
   */
  static calculatePlatformFee(amountCents: number): number {
    if (amountCents <= 0) {
      return 0;
    }

    // 2.9% of the amount plus fixed $0.30 fee
    const percentageFee = Math.floor(amountCents * MARKETPLACE_CONSTANTS.PLATFORM_FEE_PERCENTAGE);
    const fixedFee = MARKETPLACE_CONSTANTS.PLATFORM_FEE_FIXED;
    
    return percentageFee + fixedFee;
  }

  /**
   * Calculate upfront payout amount (15% of total)
   */
  static calculateUpfrontAmount(amountCents: number): number {
    if (amountCents <= 0) {
      return 0;
    }

    return Math.floor(amountCents * MARKETPLACE_CONSTANTS.UPFRONT_PERCENTAGE);
  }

  /**
   * Calculate remaining payout amount (85% of total)
   */
  static calculateRemainingAmount(amountCents: number): number {
    if (amountCents <= 0) {
      return 0;
    }

    return amountCents - this.calculateUpfrontAmount(amountCents);
  }

  /**
   * Calculate complete payment breakdown
   */
  static calculatePaymentBreakdown(totalAmountCents: number): PaymentAmountBreakdown {
    if (totalAmountCents <= 0) {
      return {
        total_amount: 0,
        upfront_amount: 0,
        remaining_amount: 0,
        platform_fee: 0,
        detailer_net_upfront: 0,
        detailer_net_remaining: 0,
        detailer_total_net: 0
      };
    }

    const platformFee = this.calculatePlatformFee(totalAmountCents);
    const upfrontAmount = this.calculateUpfrontAmount(totalAmountCents);
    const remainingAmount = this.calculateRemainingAmount(totalAmountCents);
    
    // Detailer receives the full amount minus platform fees
    // Platform fees are deducted from the total, not from individual payouts
    const detailerNetUpfront = upfrontAmount;
    const detailerNetRemaining = remainingAmount;
    const detailerTotalNet = detailerNetUpfront + detailerNetRemaining;

    return {
      total_amount: totalAmountCents,
      upfront_amount: upfrontAmount,
      remaining_amount: remainingAmount,
      platform_fee: platformFee,
      detailer_net_upfront: detailerNetUpfront,
      detailer_net_remaining: detailerNetRemaining,
      detailer_total_net: detailerTotalNet
    };
  }

  /**
   * Calculate detailed platform fee breakdown
   */
  static calculatePlatformFeeBreakdown(amountCents: number): PlatformFeeCalculation {
    if (amountCents <= 0) {
      return {
        amount_total: 0,
        platform_fee: 0,
        stripe_fee: 0,
        platform_margin: 0,
        net_amount: 0
      };
    }

    const stripeFee = Math.floor(amountCents * 0.029) + 30; // Stripe's actual fee
    const platformMargin = 0; // We're using Stripe's fee as our platform fee
    const platformFee = stripeFee + platformMargin;
    const netAmount = amountCents - platformFee;

    return {
      amount_total: amountCents,
      platform_fee: platformFee,
      stripe_fee: stripeFee,
      platform_margin: platformMargin,
      net_amount: netAmount
    };
  }

  /**
   * Validate fee calculations
   */
  static validateFeeCalculations(amountCents: number): {
    valid: boolean;
    errors: string[];
    breakdown?: PaymentAmountBreakdown;
  } {
    const errors: string[] = [];

    // Validate input amount
    if (amountCents <= 0) {
      errors.push('Amount must be greater than zero');
    }

    if (amountCents < 50) { // Minimum $0.50
      errors.push('Amount must be at least $0.50');
    }

    if (amountCents > 100000000) { // Maximum $1,000,000
      errors.push('Amount exceeds maximum limit of $1,000,000');
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // Calculate breakdown and validate
    const breakdown = this.calculatePaymentBreakdown(amountCents);

    // Validate calculations
    if (breakdown.upfront_amount + breakdown.remaining_amount !== breakdown.total_amount) {
      errors.push('Upfront and remaining amounts do not sum to total');
    }

    if (breakdown.platform_fee < 30) { // Minimum Stripe fee
      errors.push('Platform fee is below minimum');
    }

    if (breakdown.detailer_total_net <= 0) {
      errors.push('Detailer net amount must be positive');
    }

    return {
      valid: errors.length === 0,
      errors,
      breakdown: errors.length === 0 ? breakdown : undefined
    };
  }

  /**
   * Calculate fee impact on different amounts
   */
  static calculateFeeImpact(amounts: number[]): Array<{
    amount: number;
    platformFee: number;
    feePercentage: number;
    detailerNet: number;
  }> {
    return amounts.map(amount => {
      const platformFee = this.calculatePlatformFee(amount);
      const feePercentage = (platformFee / amount) * 100;
      const detailerNet = amount - platformFee;

      return {
        amount,
        platformFee,
        feePercentage: Math.round(feePercentage * 100) / 100, // Round to 2 decimal places
        detailerNet
      };
    });
  }

  /**
   * Get fee schedule for display
   */
  static getFeeSchedule(): {
    percentageFee: number;
    fixedFee: number;
    upfrontPercentage: number;
    remainingPercentage: number;
    description: string;
  } {
    return {
      percentageFee: MARKETPLACE_CONSTANTS.PLATFORM_FEE_PERCENTAGE * 100, // Convert to percentage
      fixedFee: MARKETPLACE_CONSTANTS.PLATFORM_FEE_FIXED,
      upfrontPercentage: MARKETPLACE_CONSTANTS.UPFRONT_PERCENTAGE * 100,
      remainingPercentage: MARKETPLACE_CONSTANTS.REMAINING_PERCENTAGE * 100,
      description: `${MARKETPLACE_CONSTANTS.PLATFORM_FEE_PERCENTAGE * 100}% + $${MARKETPLACE_CONSTANTS.PLATFORM_FEE_FIXED / 100} per transaction`
    };
  }
}

// Helper functions for fee calculations
export const feeHelpers = {
  /**
   * Format fee amount for display
   */
  formatFee: (feeCents: number): string => {
    return `$${(feeCents / 100).toFixed(2)}`;
  },

  /**
   * Calculate effective fee rate for an amount
   */
  getEffectiveFeeRate: (amountCents: number): number => {
    if (amountCents <= 0) return 0;
    const fee = FeeCalculationService.calculatePlatformFee(amountCents);
    return (fee / amountCents) * 100;
  },

  /**
   * Get fee comparison for different amounts
   */
  getFeeComparison: (amounts: number[]) => {
    return FeeCalculationService.calculateFeeImpact(amounts);
  },

  /**
   * Check if amount meets minimum requirements
   */
  meetsMinimumAmount: (amountCents: number): boolean => {
    return amountCents >= 50; // $0.50 minimum
  },

  /**
   * Get recommended minimum amount message
   */
  getMinimumAmountMessage: (): string => {
    return 'Minimum payment amount is $0.50';
  }
};

// Constants for easy access
export const FEE_CONSTANTS = {
  MINIMUM_AMOUNT_CENTS: 50,
  MAXIMUM_AMOUNT_CENTS: 100000000,
  PLATFORM_FEE_RATE: MARKETPLACE_CONSTANTS.PLATFORM_FEE_PERCENTAGE,
  PLATFORM_FEE_FIXED: MARKETPLACE_CONSTANTS.PLATFORM_FEE_FIXED,
  UPFRONT_RATE: MARKETPLACE_CONSTANTS.UPFRONT_PERCENTAGE,
  REMAINING_RATE: MARKETPLACE_CONSTANTS.REMAINING_PERCENTAGE
} as const;