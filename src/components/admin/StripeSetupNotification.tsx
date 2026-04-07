import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { 
  AlertTriangle, 
  CreditCard, 
  ExternalLink, 
  Settings,
  CheckCircle,
  X
} from 'lucide-react';
import { stripeConfigService } from '../../services/stripeConfigService';
import { useNavigate } from 'react-router-dom';

interface StripeSetupNotificationProps {
  onDismiss?: () => void;
  showAsCard?: boolean;
}

export const StripeSetupNotification: React.FC<StripeSetupNotificationProps> = ({ 
  onDismiss, 
  showAsCard = false 
}) => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkStripeConfiguration();
  }, []);

  const checkStripeConfiguration = async () => {
    try {
      const config = await stripeConfigService.getConfig();
      setIsConfigured(config?.setup_completed || false);
    } catch (error) {
      console.error('Error checking Stripe config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupClick = () => {
    navigate('/admin/settings?tab=payments');
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (loading || isConfigured || dismissed) {
    return null;
  }

  if (showAsCard) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800">Payment Setup Required</CardTitle>
            </div>
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription className="text-orange-700">
            Configure your Stripe account to start accepting payments
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <p className="text-sm text-orange-700">
              Your marketplace is ready, but you need to set up Stripe to process payments. 
              This will allow clients to pay detailers through your platform.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleSetupClick} size="sm" className="bg-orange-600 hover:bg-orange-700">
                <Settings className="h-4 w-4 mr-2" />
                Setup Stripe
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open('https://stripe.com', '_blank')}
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Learn About Stripe
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Alert variant="destructive" className="border-orange-200 bg-orange-50">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Payment Setup Required:</strong> Configure your Stripe account to enable payments.
            <Button
              variant="link"
              onClick={handleSetupClick}
              className="p-0 h-auto ml-2 text-orange-700 underline"
            >
              Set up now
            </Button>
          </AlertDescription>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  );
};

export const StripeSetupBanner: React.FC = () => {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="mb-6">
      <StripeSetupNotification onDismiss={() => setShow(false)} />
    </div>
  );
};

export const StripeSetupCard: React.FC = () => {
  return <StripeSetupNotification showAsCard={true} />;
};