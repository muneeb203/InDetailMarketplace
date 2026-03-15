// Stripe Connect Onboarding Simulation for Development
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { StripeConnectDirectService } from '../services/stripeConnectDirect';

export const StripeConnectSimulation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isCompleting, setIsCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const accountId = searchParams.get('account_id');
  const returnUrl = searchParams.get('return_url');

  useEffect(() => {
    if (!accountId) {
      navigate('/');
    }
  }, [accountId, navigate]);

  const handleCompleteOnboarding = async () => {
    if (!accountId) return;

    setIsCompleting(true);
    try {
      // Extract detailer ID from account ID (assuming format: acct_<timestamp>_<detailerId>)
      const detailerId = accountId.split('_').pop() || '';
      
      const result = await StripeConnectDirectService.simulateOnboardingComplete(detailerId);
      
      if (result.success) {
        setCompleted(true);
        
        // Redirect back to the return URL after a short delay
        setTimeout(() => {
          if (returnUrl) {
            window.location.href = decodeURIComponent(returnUrl);
          } else {
            navigate('/');
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-800">Onboarding Complete!</CardTitle>
            <CardDescription>
              Your Stripe Connect account has been successfully set up for development.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Redirecting you back to the application...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Stripe Connect Onboarding</CardTitle>
          <CardDescription>
            Development Simulation
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Development Mode</h3>
            <p className="text-sm text-blue-700">
              This is a simulated Stripe Connect onboarding flow for development purposes. 
              In production, this would be the actual Stripe onboarding experience.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Account ID:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                {accountId?.substring(0, 20)}...
              </code>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleCompleteOnboarding}
              disabled={isCompleting}
              className="w-full"
            >
              {isCompleting ? 'Completing...' : 'Complete Onboarding (Simulate)'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>In production, you would:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Provide business information</li>
              <li>Verify identity documents</li>
              <li>Set up bank account details</li>
              <li>Accept Stripe's terms of service</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};