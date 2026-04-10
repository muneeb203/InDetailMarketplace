// Utility to create required tables if they don't exist
import { supabase } from '../lib/supabaseClient';

export async function ensureTablesExist() {
  try {
    console.log('Checking if stripe_connected_accounts table exists...');
    
    // Try to query the table - if it fails, the table doesn't exist
    const { data, error } = await supabase
      .from('stripe_connected_accounts')
      .select('id')
      .limit(1);
    
    if (error && error.message.includes('relation "stripe_connected_accounts" does not exist')) {
      console.log('Table does not exist. Please create it manually in Supabase.');
      return false;
    }
    
    console.log('✅ stripe_connected_accounts table exists');
    return true;
  } catch (error) {
    console.error('Error checking table existence:', error);
    return false;
  }
}

export async function createMockConnectAccount(detailerId: string, accountData: any) {
  // For development, create a simple record without database access
  try {
    // Create a mock account record directly in localStorage
    const mockAccount = {
      id: crypto?.randomUUID ? crypto.randomUUID() : 
        'mock-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      detailer_id: detailerId,
      stripe_account_id: `acct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      account_status: 'pending',
      capabilities_enabled: false,
      payouts_enabled: false,
      onboarding_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Store in localStorage for development
    const existingAccounts = JSON.parse(localStorage.getItem('mock_stripe_accounts') || '[]');
    existingAccounts.push(mockAccount);
    localStorage.setItem('mock_stripe_accounts', JSON.stringify(existingAccounts));
    
    console.log('Created mock Connect account:', mockAccount);
    return mockAccount;
  } catch (error) {
    console.error('Error creating mock account:', error);
    return null;
  }
}

export function getMockConnectAccount(detailerId: string) {
  try {
    const existingAccounts = JSON.parse(localStorage.getItem('mock_stripe_accounts') || '[]');
    return existingAccounts.find((acc: any) => acc.detailer_id === detailerId) || null;
  } catch (error) {
    console.error('Error getting mock account:', error);
    return null;
  }
}

export function updateMockConnectAccount(detailerId: string, updates: any) {
  try {
    const existingAccounts = JSON.parse(localStorage.getItem('mock_stripe_accounts') || '[]');
    const accountIndex = existingAccounts.findIndex((acc: any) => acc.detailer_id === detailerId);
    
    if (accountIndex >= 0) {
      existingAccounts[accountIndex] = { ...existingAccounts[accountIndex], ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem('mock_stripe_accounts', JSON.stringify(existingAccounts));
      return existingAccounts[accountIndex];
    }
    
    return null;
  } catch (error) {
    console.error('Error updating mock account:', error);
    return null;
  }
}