// Basic test to verify testing setup
import { describe, it, expect } from 'vitest'

describe('Basic Test Suite', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('should validate test environment', () => {
    expect(process.env.VITE_STRIPE_PUBLISHABLE_KEY).toBeDefined()
  })
})