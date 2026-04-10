import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  TestTube,
  ArrowRight,
  Zap
} from 'lucide-react';
import { StripeConnectService } from '../services/stripeConnect';
import { useAuth } from '../context/AuthContext';

interface PaymentIntegrationHelperProps {
  onNavigateToSettings?: () => void;
  onNavigateToTest?: () => void;
}

export function PaymentIntegrationHelper({ 
  onNavigateToSettings, 
  onNavigateToTest 
}: PaymentIntegrationHelperProps) {
  const { currentUser } = useAuth();
  const [stripeAccountStatus, setStripeAccountStatus] = useState<{
    hasAccount: boolean;
    isOnboarded: boolean;
    canReceivePayouts: boolean;
    status: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.role === 'detailer') {
      checkStripeAccountStatus();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const checkStripeAccountStatus = async () => {
    if (!currentUser || currentUser.role !== 'detailer') return;
    
    try {
      const result = await StripeConnectService.getAccountStatus(currentUser.id);
      if (result.success && result.data) {
        setStripeAccountStatus({
          hasAccount: true,
          isOnboarded: result.data.onboarding_completed,
          canReceivePayouts: result.data.payouts_enabled && result.data.capabilities_enabled,
          status: result.data.account_status
        });
      } else {
        setStripeAccountStatus({
          hasAccount: false,
          isOnboarded: false,
          canReceivePayouts: false,
          status: 'not_created'
        });
      }
    } catch (error) {
      console.error('Error checking Stripe account status:', error);
      setStripeAccountStatus({
        hasAccount: false,
        isOnboarded: false,
        canReceivePayouts: false,
        status: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!stripeAccountStatus) return null;

    if (stripeAccountStatus.canReceivePayouts) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Ready for Payments</Badge>;
    } else if (stripeAccountStatus.hasAccount && !stripeAccountStatus.isOnboarded) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Setup Required</Badge>;
    } else if (!stripeAccountStatus.hasAccount) {
      return <Badge variant="outline" className="bg-red-100 text-red-800">Not Connected</Badge>;
    } else {
      return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getStatusMessage = () => {
    if (!stripeAccountStatus) return '';

    if (stripeAccountStatus.canReceivePayouts) {
      return 'Your Stripe account is fully set up and ready to receive payments from clients.';
    } else if (stripeAccountStatus.hasAccount && !stripeAccountStatus.isOnboarded) {
      return 'Complete your Stripe onboarding to start receiving payments.';
    } else if (!stripeAccountStatus.hasAccount) {
      return 'Connect your Stripe account to receive payments from clients.';
    } else {
      return 'Your Stripe account is being reviewed. You\'ll be able to receive payments once approved.';
    }
  };

  if (!currentUser) return null;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="w-5 h-5 text-blue-600" />
          Stripe Marketplace Payments
          {stripeAccountStatus && getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentUser.role === 'detailer' && (
          <>
            {loading ? (
              <div className="text-sm text-gray-600">Checking payment setup...</div>
            ) : (
              <div className="text-sm text-gray-700">
                {getStatusMessage()}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                onClick={onNavigateToSettings}
                variant={stripeAccountStatus?.canReceivePayouts ? "outline" : "default"}
              >
                <Settings className="w-4 h-4 mr-1" />
                Payment Settings
              </Button>
              
              <Button size="sm" variant="outline" onClick={onNavigateToTest}>
                <TestTube className="w-4 h-4 mr-1" />
                Test Payments
              </Button>
            </div>
          </>
        )}

        {currentUser.role === 'client' && (
          <>
            <div className="text-sm text-gray-700">
              The new marketplace payment system provides secure escrow payments with automatic payouts to detailers.
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={onNavigateToTest}>
                <TestTube className="w-4 h-4 mr-1" />
                Test Payment Flow
              </Button>
            </div>
          </>
        )}

        <Alert className="bg-white border-blue-200">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm">
            <strong>New Features:</strong> 15% upfront payments, 85% on completion, automatic release after 48 hours, and secure escrow handling.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}