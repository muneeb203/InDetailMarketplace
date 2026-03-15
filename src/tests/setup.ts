// Test setup file for Vitest
import { beforeAll, afterAll } from 'vitest'

// Mock environment variables for testing
beforeAll(() => {
  // Set up test environment variables
  process.env.VITE_STRIPE_PUBLISHABLE_KEY = 'pk_test_mock_key_for_testing'
  process.env.VITE_SUPABASE_URL = 'https://test.supabase.co'
  process.env.VITE_SUPABASE_ANON_KEY = 'test_anon_key'
})

afterAll(() => {
  // Clean up after tests
})