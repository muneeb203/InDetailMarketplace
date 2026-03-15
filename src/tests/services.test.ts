// Test service imports and basic functionality
import { describe, it, expect } from 'vitest'

describe('Service Imports', () => {
  it('should import MarketplacePaymentService', async () => {
    const { MarketplacePaymentService } = await import('../services/marketplacePayments')
    expect(MarketplacePaymentService).toBeDefined()
    expect(typeof MarketplacePaymentService.calculatePlatformFee).toBe('function')
  })

  it('should calculate platform fee correctly', async () => {
    const { MarketplacePaymentService } = await import('../services/marketplacePayments')
    const amount = 10000 // $100.00
    const fee = MarketplacePaymentService.calculatePlatformFee(amount)
    
    // Platform fee should be 2.9% + $0.30
    const expectedFee = Math.round(amount * 0.029) + 30
    expect(fee).toBe(expectedFee)
  })

  it('should calculate payment breakdown correctly', async () => {
    const { MarketplacePaymentService } = await import('../services/marketplacePayments')
    const totalAmount = 39216 // $392.16
    const breakdown = MarketplacePaymentService.calculatePaymentBreakdown(totalAmount)
    
    expect(breakdown.total_amount).toBe(totalAmount)
    expect(breakdown.upfront_amount).toBe(Math.floor(totalAmount * 0.15)) // 15%
    expect(breakdown.remaining_amount).toBe(totalAmount - breakdown.upfront_amount) // 85%
    expect(breakdown.platform_fee).toBeGreaterThan(0)
  })

  it('should import other core services', async () => {
    const { PayoutProcessingService } = await import('../services/payoutProcessing')
    const { JobCompletionService } = await import('../services/jobCompletion')
    const { AutoReleaseSchedulerService } = await import('../services/autoReleaseScheduler')
    
    expect(PayoutProcessingService).toBeDefined()
    expect(JobCompletionService).toBeDefined()
    expect(AutoReleaseSchedulerService).toBeDefined()
  })
})