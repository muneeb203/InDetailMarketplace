import React, { useState } from 'react';
import { StripeTestPanel } from '../components/payments/StripeTestPanel';
import { ClientConfirmationModal } from '../components/payments/ClientConfirmationModal';
import { PaymentStatusCard } from '../components/payments/PaymentStatusCard';
import { ClientPaymentForm } from '../components/payments/ClientPaymentForm';
import { DetailerConnectSetup } from '../components/payments/DetailerConnectSetup';
import { PaymentMethodManager } from '../components/payments/PaymentMethodManager';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { MarketplaceOrder } from '../types/marketplacePayments';

export const StripeTestPage: React.FC = () => {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showConnectSetup, setShowConnectSetup] = useState(false);

  // Mock order data for testing
  const mockOrder: MarketplaceOrder = {
    id: 'test-order-123',
    gig_id: 'test-gig-456',
    client_id: 'test-client-789',
    dealer_id: 'test-dealer-101',
    proposed_price: 39216.60,
    agreed_price: 39216.60,
    notes: 'Full car detailing service',
    scheduled_date: new Date().toISOString(),
    status: 'accepted',
    marketplace_status: 'detailer_marked_done',
    amount_total: 3921660, // $39,216.60 in cents
    amount_upfront: 588249, // 15% in cents
    amount_remaining: 3333411, // 85% in cents
    platform_fee: 11395, // Platform fee in cents
    confirmation_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours from now
    auto_release_scheduled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    confirmed_at: null,
    opened_at: new Date().toISOString(),
    dealer: {
      id: 'test-dealer-101',
      business_name: 'Premium Auto Detailing',
      base_location: 'Los Angeles, CA'
    },
    client: {
      id: 'test-client-789',
      name: 'John Smith'
    }
  };

  const handleConfirmComplete = () => {
    alert('Job confirmed as complete! Final payment will be released to detailer.');
    setShowConfirmationModal(false);
  };

  const handleReportIssue = () => {
    alert('Issue reported. Payment will be held pending resolution.');
    setShowConfirmationModal(false);
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    alert(`Payment successful! Payment Intent ID: ${paymentIntentId}`);
    setShowPaymentForm(false);
  };

  const handlePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`);
  };

  const handleConnectSuccess = (account: any) => {
    alert(`Connect account created successfully! Account ID: ${account.stripe_account_id}`);
    setShowConnectSetup(false);
  };

  const handleConnectError = (error: string) => {
    alert(`Connect setup failed: ${error}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Stripe Marketplace Test Page</h1>
        <p className="text-gray-600">Test your Stripe integration and payment components</p>
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="integration" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="integration">Integration Tests</TabsTrigger>
          <TabsTrigger value="client">Client Payments</TabsTrigger>
          <TabsTrigger value="detailer">Detailer Setup</TabsTrigger>
          <TabsTrigger value="components">Components Demo</TabsTrigger>
        </TabsList>

        {/* Integration Tests Tab */}
        <TabsContent value="integration" className="space-y-6">
          <StripeTestPanel />
        </TabsContent>

        {/* Client Payments Tab */}
        <TabsContent value="client" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Form Demo */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Client Payment Form</h2>
              {!showPaymentForm ? (
                <Card>
                  <CardContent className="pt-6">
                    <Button onClick={() => setShowPaymentForm(true)} className="w-full">
                      Test Payment Form
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <ClientPaymentForm
                  orderId={mockOrder.id}
                  amount={mockOrder.amount_total || 100000} // $1000 default
                  detailerStripeAccountId="acct_test123"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={() => setShowPaymentForm(false)}
                />
              )}
            </div>

            {/* Payment Methods Manager */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
              <PaymentMethodManager
                customerId="test-customer-123"
                onPaymentMethodAdded={(pm) => console.log('Payment method added:', pm)}
                onPaymentMethodRemoved={(id) => console.log('Payment method removed:', id)}
                onError={(error) => console.error('Payment method error:', error)}
              />
            </div>
          </div>
        </TabsContent>

        {/* Detailer Setup Tab */}
        <TabsContent value="detailer" className="space-y-6">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-center">Detailer Connect Setup</h2>
            {!showConnectSetup ? (
              <Card>
                <CardContent className="pt-6">
                  <Button onClick={() => setShowConnectSetup(true)} className="w-full">
                    Test Connect Setup
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <DetailerConnectSetup
                detailerId="test-detailer-123"
                onSuccess={handleConnectSuccess}
                onError={handleConnectError}
              />
            )}
          </div>
        </TabsContent>

        {/* Components Demo Tab */}
        <TabsContent value="components" className="space-y-6">
          {/* Payment Status Cards Demo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Payment Status Card (Client View)</h2>
              <PaymentStatusCard
                order={mockOrder}
                userRole="client"
                onConfirmComplete={() => setShowConfirmationModal(true)}
                onReportIssue={() => setShowConfirmationModal(true)}
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Payment Status Card (Detailer View)</h2>
              <PaymentStatusCard
                order={{...mockOrder, marketplace_status: 'in_progress'}}
                userRole="detailer"
              />
            </div>
          </div>

          {/* Manual Test Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Component Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                <Button onClick={() => setShowConfirmationModal(true)}>
                  Test Client Confirmation Modal
                </Button>
                <Button onClick={() => setShowPaymentForm(true)} variant="outline">
                  Test Payment Form
                </Button>
                <Button onClick={() => setShowConnectSetup(true)} variant="outline">
                  Test Connect Setup
                </Button>
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Test Scenarios:</strong></p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Client payment workflow with Stripe Elements</li>
                  <li>Detailer Connect account setup and onboarding</li>
                  <li>Payment method management (add/remove cards)</li>
                  <li>Client confirmation workflow (modal above)</li>
                  <li>Payment status tracking for different order states</li>
                  <li>Auto-release countdown timer</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Environment Check */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Stripe Publishable Key:</strong>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 
                  `${import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY.substring(0, 20)}...` : 
                  'Not configured'
                }
              </p>
            </div>
            <div>
              <strong>Supabase URL:</strong>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showConfirmationModal && (
        <ClientConfirmationModal
          order={mockOrder}
          onConfirm={handleConfirmComplete}
          onDispute={handleReportIssue}
          onClose={() => setShowConfirmationModal(false)}
        />
      )}
    </div>
  );
};