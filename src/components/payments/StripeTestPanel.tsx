import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, XCircle, CreditCard, Loader2 } from 'lucide-react';
import { MarketplacePaymentService } from '../../services/marketplacePayments';
import { StripeConnectService } from '../../services/stripeConnect';

export const StripeTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    stripeKeys: 'success' | 'error' | 'pending';
    connectAccount: 'success' | 'error' | 'pending';
    paymentIntent: 'success' | 'error' | 'pending';
    webhook: 'success' | 'error' | 'pending';
  }>({
    stripeKeys: 'pending',
    connectAccount: 'pending',
    paymentIntent: 'pending',
    webhook: 'pending'
  });

  const [testAmount, setTestAmount] = useState('100.00');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testStripeKeys = async () => {
    addLog('Testing Stripe keys configuration...');
    
    try {
      // Check if environment variables are set
      const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!publishableKey) {
        throw new Error('VITE_STRIPE_PUBLISHABLE_KEY not found');
      }
      
      if (!supabaseUrl) {
        throw new Error('VITE_SUPABASE_URL not found');
      }

      // Test if publishable key format is correct
      if (!publishableKey.startsWith('pk_')) {
        throw new Error('Invalid publishable key format');
      }

      setTestResults(prev => ({ ...prev, stripeKeys: 'success' }));
      addLog('✅ Stripe keys configured correctly');
      return true;
    } catch (error) {
      setTestResults(prev => ({ ...prev, stripeKeys: 'error' }));
      addLog(`❌ Stripe keys error: ${error.message}`);
      return false;
    }
  };

  const testConnectAccount = async () => {
    addLog('Testing Stripe Connect account creation...');
    
    try {
      // Test creating a Connect account (this will call the edge function)
      const result = await StripeConnectService.createConnectAccount('test-detailer-id', {
        business_type: 'individual',
        country: 'US',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'Detailer'
      });

      if (result.success) {
        setTestResults(prev => ({ ...prev, connectAccount: 'success' }));
        addLog('✅ Connect account creation successful');
        return true;
      } else {
        throw new Error(result.error?.message || 'Connect account creation failed');
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, connectAccount: 'error' }));
      addLog(`❌ Connect account error: ${error.message}`);
      return false;
    }
  };

  const testPaymentIntent = async () => {
    addLog('Testing payment intent creation...');
    
    try {
      const amountCents = Math.round(parseFloat(testAmount) * 100);
      
      const result = await MarketplacePaymentService.createMarketplacePayment({
        order_id: 'test-order-id',
        amount: amountCents,
        detailer_stripe_account_id: 'acct_test123',
        metadata: {
          test: true,
          description: 'Test payment intent'
        }
      });

      if (result.success) {
        setTestResults(prev => ({ ...prev, paymentIntent: 'success' }));
        addLog('✅ Payment intent creation successful');
        return true;
      } else {
        throw new Error(result.error?.message || 'Payment intent creation failed');
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, paymentIntent: 'error' }));
      addLog(`❌ Payment intent error: ${error.message}`);
      return false;
    }
  };

  const testWebhook = async () => {
    addLog('Testing webhook endpoint...');
    
    try {
      // Test webhook endpoint availability
      const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-webhook-handler`;
      
      const response = await fetch(webhookUrl, {
        method: 'OPTIONS', // CORS preflight
      });

      if (response.ok) {
        setTestResults(prev => ({ ...prev, webhook: 'success' }));
        addLog('✅ Webhook endpoint accessible');
        return true;
      } else {
        throw new Error(`Webhook endpoint returned ${response.status}`);
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, webhook: 'error' }));
      addLog(`❌ Webhook error: ${error.message}`);
      return false;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setLogs([]);
    
    // Reset all test results
    setTestResults({
      stripeKeys: 'pending',
      connectAccount: 'pending',
      paymentIntent: 'pending',
      webhook: 'pending'
    });

    addLog('Starting Stripe integration tests...');

    // Run tests sequentially
    await testStripeKeys();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
    
    await testWebhook();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testConnectAccount();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testPaymentIntent();

    addLog('All tests completed!');
    setIsRunning(false);
  };

  const getStatusBadge = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Stripe Integration Test Panel
          </CardTitle>
          <CardDescription>
            Test your Stripe marketplace payment system configuration
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Test Configuration */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Test Amount ($)</label>
              <Input
                type="number"
                step="0.01"
                min="1"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                placeholder="100.00"
              />
            </div>
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="mt-6"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Run All Tests'
              )}
            </Button>
          </div>

          {/* Test Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Stripe Keys</span>
              {getStatusBadge(testResults.stripeKeys)}
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Webhook Endpoint</span>
              {getStatusBadge(testResults.webhook)}
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Connect Account</span>
              {getStatusBadge(testResults.connectAccount)}
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Payment Intent</span>
              {getStatusBadge(testResults.paymentIntent)}
            </div>
          </div>

          {/* Test Cards Info */}
          <Alert>
            <CreditCard className="h-4 w-4" />
            <AlertDescription>
              <strong>Test Cards:</strong> Use 4242 4242 4242 4242 (any future date, any CVC) for successful payments.
              Use 4000 0000 0000 0002 for declined payments.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Test Logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-3 rounded-lg max-h-60 overflow-y-auto">
              <pre className="text-xs space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="font-mono">{log}</div>
                ))}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};