import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Loader2, CreditCard, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { StripeConnectService } from '../../services/stripeConnect';
import { StripeConnectDirectService } from '../../services/stripeConnectDirect';
import { StripeConnectedAccount } from '../../types/marketplacePayments';

interface DetailerConnectSetupProps {
  detailerId: string;
  onSuccess: (account: StripeConnectedAccount) => void;
  onError: (error: string) => void;
}

export const DetailerConnectSetup: React.FC<DetailerConnectSetupProps> = ({
  detailerId,
  onSuccess,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [existingAccount, setExistingAccount] = useState<StripeConnectedAccount | null>(null);
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    business_type: 'individual' as 'individual' | 'company',
    country: 'US',
    email: '',
    business_name: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState<string | null>(null);

  // Check for existing Connect account on component mount
  useEffect(() => {
    checkExistingAccount();
  }, [detailerId]);

  const checkExistingAccount = async () => {
    try {
      console.log('Checking for existing Connect account...');
      const result = await StripeConnectDirectService.getAccountStatus(detailerId);
      if (result.success && result.data) {
        setExistingAccount(result.data);
      }
    } catch (err) {
      console.error('Error checking existing account:', err);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateAccount = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.email) {
        throw new Error('Email is required');
      }

      if (formData.business_type === 'individual') {
        if (!formData.first_name || !formData.last_name) {
          throw new Error('First name and last name are required for individual accounts');
        }
      } else {
        if (!formData.business_name) {
          throw new Error('Business name is required for company accounts');
        }
      }

      // Use direct service for development (bypasses Supabase Edge Functions)
      console.log('Creating Connect account using direct service...');
      const result = await StripeConnectDirectService.createConnectAccount(detailerId, formData);

      if (!result.success || !result.data) {
        throw new Error(result.error?.message || 'Failed to create Connect account');
      }

      setExistingAccount(result.data);

      // Create onboarding flow
      const onboardingResult = await StripeConnectDirectService.createOnboardingFlow(
        detailerId,
        `${window.location.origin}/detailer/connect/return`,
        `${window.location.origin}/detailer/connect/refresh`
      );

      if (onboardingResult.success && onboardingResult.data) {
        setOnboardingUrl(onboardingResult.data.onboarding_url);
      }

      onSuccess(result.data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create Connect account';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getAccountStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'restricted':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Restricted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // If account exists, show status
  if (existingAccount) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Stripe Connect Account
          </CardTitle>
          <CardDescription>
            Your payment account status
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Account Status:</span>
            {getAccountStatusBadge(existingAccount.account_status)}
          </div>

          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Payouts Enabled:</span>
              <span className={existingAccount.payouts_enabled ? 'text-green-600' : 'text-red-600'}>
                {existingAccount.payouts_enabled ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Onboarding Complete:</span>
              <span className={existingAccount.onboarding_completed ? 'text-green-600' : 'text-red-600'}>
                {existingAccount.onboarding_completed ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          {onboardingUrl && !existingAccount.onboarding_completed && (
            <>
              <Button 
                onClick={() => window.open(onboardingUrl, '_blank')}
                className="w-full mb-2"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Complete Stripe Onboarding (Dev Simulation)
              </Button>
              
              {/* Development helper button */}
              <Button 
                variant="outline"
                onClick={async () => {
                  const result = await StripeConnectDirectService.simulateOnboardingComplete(detailerId);
                  if (result.success) {
                    setExistingAccount(result.data);
                    onSuccess(result.data);
                  }
                }}
                className="w-full text-sm"
              >
                🧪 Skip Onboarding (Quick Dev Setup)
              </Button>
            </>
          )}

          {existingAccount.account_status === 'active' && existingAccount.payouts_enabled && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your account is ready to receive payments!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Set Up Payments
        </CardTitle>
        <CardDescription>
          Create your Stripe Connect account to receive payments
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); handleCreateAccount(); }} className="space-y-4">
          {/* Business Type */}
          <div className="space-y-2">
            <Label htmlFor="business_type">Account Type</Label>
            <Select 
              value={formData.business_type} 
              onValueChange={(value) => handleInputChange('business_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          {/* Individual Fields */}
          {formData.business_type === 'individual' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Company Fields */}
          {formData.business_type === 'company' && (
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => handleInputChange('business_name', e.target.value)}
                placeholder="Your Business Name"
                required
              />
            </div>
          )}

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select 
              value={formData.country} 
              onValueChange={(value) => handleInputChange('country', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
                {/* Add more countries as needed */}
              </SelectContent>
            </Select>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Info Alert */}
          <Alert>
            <AlertDescription className="text-sm">
              You'll be redirected to Stripe to complete your account setup with banking details and identity verification.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Stripe Account'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};