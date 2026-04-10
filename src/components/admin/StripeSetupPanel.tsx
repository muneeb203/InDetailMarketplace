import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Copy, 
  RefreshCw,
  CreditCard,
  Settings,
  Shield,
  Globe
} from 'lucide-react';
import { stripeConfigService, StripeConfig, StripeConfigInput } from '../../services/stripeConfigService';

interface StripeSetupPanelProps {
  onSetupComplete?: () => void;
}

export const StripeSetupPanel: React.FC<StripeSetupPanelProps> = ({ onSetupComplete }) => {
  const [config, setConfig] = useState<StripeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [activeTab, setActiveTab] = useState('setup');
  
  const [formData, setFormData] = useState<StripeConfigInput>({
    publishable_key: '',
    secret_key: '',
    webhook_secret: '',
    is_live_mode: false,
    account_name: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const configData = await stripeConfigService.getConfig();
      if (configData) {
        setConfig(configData);
        setFormData({
          publishable_key: configData.publishable_key || '',
          secret_key: configData.secret_key_encrypted ? stripeConfigService.getDecryptedSecretKey(configData.secret_key_encrypted) : '',
          webhook_secret: configData.webhook_secret_encrypted ? stripeConfigService.getDecryptedSecretKey(configData.webhook_secret_encrypted) : '',
          is_live_mode: configData.is_live_mode,
          account_name: configData.account_name || ''
        });
        
        if (configData.setup_completed) {
          setActiveTab('status');
        }
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof StripeConfigInput, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.publishable_key) {
      newErrors.publishable_key = 'Publishable key is required';
    } else if (!formData.publishable_key.startsWith('pk_')) {
      newErrors.publishable_key = 'Invalid publishable key format';
    }

    if (!formData.secret_key) {
      newErrors.secret_key = 'Secret key is required';
    } else if (!formData.secret_key.startsWith('sk_')) {
      newErrors.secret_key = 'Invalid secret key format';
    }

    if (!formData.account_name) {
      newErrors.account_name = 'Account name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const testConnection = async () => {
    if (!validateForm()) return;

    setTesting(true);
    setTestResult(null);

    try {
      const result = await stripeConfigService.testConnection(
        formData.publishable_key,
        formData.secret_key
      );

      if (result.success) {
        setTestResult({ success: true, message: 'Connection successful! Keys are valid.' });
      } else {
        setTestResult({ success: false, message: result.error || 'Connection failed' });
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Error testing connection' });
    } finally {
      setTesting(false);
    }
  };

  const saveConfiguration = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const success = await stripeConfigService.updateConfig(formData);
      
      if (success) {
        await loadConfig();
        setActiveTab('status');
        onSetupComplete?.();
      } else {
        setTestResult({ success: false, message: 'Failed to save configuration' });
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Error saving configuration' });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Loading Stripe configuration...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Stripe Payment Setup
        </CardTitle>
        <CardDescription>
          Configure your Stripe account to enable payments in your marketplace
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="guide">Setup Guide</TabsTrigger>
            <TabsTrigger value="setup">API Configuration</TabsTrigger>
            <TabsTrigger value="status">Status & Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="guide" className="space-y-6">
            <StripeAccountGuide />
          </TabsContent>

          <TabsContent value="setup" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">API Keys Configuration</h3>
                <Badge variant={formData.is_live_mode ? "destructive" : "secondary"}>
                  {formData.is_live_mode ? "Live Mode" : "Test Mode"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_name">Account Name</Label>
                  <Input
                    id="account_name"
                    placeholder="My Marketplace Account"
                    value={formData.account_name}
                    onChange={(e) => handleInputChange('account_name', e.target.value)}
                  />
                  {errors.account_name && (
                    <p className="text-sm text-red-500">{errors.account_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_live_mode}
                      onChange={(e) => handleInputChange('is_live_mode', e.target.checked)}
                    />
                    Live Mode (Production)
                  </Label>
                  <p className="text-sm text-gray-500">
                    {formData.is_live_mode ? 
                      "⚠️ Live mode will process real payments" : 
                      "Test mode for development and testing"
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="publishable_key">Publishable Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="publishable_key"
                    placeholder={formData.is_live_mode ? "pk_live_..." : "pk_test_..."}
                    value={formData.publishable_key}
                    onChange={(e) => handleInputChange('publishable_key', e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(formData.publishable_key)}
                    disabled={!formData.publishable_key}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {errors.publishable_key && (
                  <p className="text-sm text-red-500">{errors.publishable_key}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="secret_key">Secret Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="secret_key"
                    type={showSecrets ? "text" : "password"}
                    placeholder={formData.is_live_mode ? "sk_live_..." : "sk_test_..."}
                    value={formData.secret_key}
                    onChange={(e) => handleInputChange('secret_key', e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSecrets(!showSecrets)}
                  >
                    {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.secret_key && (
                  <p className="text-sm text-red-500">{errors.secret_key}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook_secret">Webhook Secret (Optional)</Label>
                <Input
                  id="webhook_secret"
                  type={showSecrets ? "text" : "password"}
                  placeholder="whsec_..."
                  value={formData.webhook_secret}
                  onChange={(e) => handleInputChange('webhook_secret', e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Used to verify webhook signatures for enhanced security
                </p>
              </div>

              {testResult && (
                <Alert variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{testResult.message}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={testConnection}
                  disabled={testing || !formData.publishable_key || !formData.secret_key}
                  variant="outline"
                >
                  {testing ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Shield className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </Button>
                
                <Button
                  onClick={saveConfiguration}
                  disabled={saving || !formData.publishable_key || !formData.secret_key}
                >
                  {saving ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Settings className="h-4 w-4 mr-2" />
                  )}
                  Save Configuration
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            <StripeStatusPanel config={config} onRefresh={loadConfig} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const StripeAccountGuide: React.FC = () => {
  const steps = [
    {
      title: "Create Your Stripe Account",
      description: "Sign up for a new Stripe account",
      action: "Visit stripe.com and click 'Start now'",
      link: "https://stripe.com",
      details: [
        "Choose 'Individual / Sole Proprietor' (no company registration required)",
        "Provide your full legal name and email address",
        "Select your country of residence"
      ]
    },
    {
      title: "Complete Identity Verification",
      description: "Stripe requires KYC verification to activate your account",
      action: "Prepare required documents",
      details: [
        "Valid government-issued ID (passport or national ID)",
        "Your residential address",
        "Phone number for verification"
      ]
    },
    {
      title: "Add Bank Account Details",
      description: "Connect your bank account to receive payments",
      action: "Link your business bank account",
      details: [
        "Bank account in your country",
        "Ensure it supports international payments (if applicable)",
        "Account must be in the same name as your Stripe account"
      ]
    },
    {
      title: "Activate Your Account",
      description: "Complete all required fields in Stripe dashboard",
      action: "Fill out business information",
      details: [
        "Business description and website",
        "Expected transaction volume",
        "Product or service details"
      ]
    },
    {
      title: "Get Your API Keys",
      description: "Retrieve your API keys from the Stripe dashboard",
      action: "Go to Developers → API Keys",
      link: "https://dashboard.stripe.com/apikeys",
      details: [
        "Copy your Publishable Key (starts with pk_)",
        "Copy your Secret Key (starts with sk_)",
        "Use test keys first, then switch to live keys when ready"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Stripe Account Setup Guide</h3>
        <p className="text-gray-600">
          Follow these steps to create and configure your Stripe account
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{step.title}</h4>
                    {step.link && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(step.link, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Open
                      </Button>
                    )}
                  </div>
                  <p className="text-gray-600">{step.description}</p>
                  <p className="font-medium text-blue-600">{step.action}</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-500">
                    {step.details.map((detail, i) => (
                      <li key={i}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> All payments will go directly to your Stripe account. 
          You maintain full control over transactions, refunds, and payouts. 
          This setup ensures compliance with payment regulations and keeps your funds secure.
        </AlertDescription>
      </Alert>
    </div>
  );
};

const StripeStatusPanel: React.FC<{ config: StripeConfig | null; onRefresh: () => void }> = ({ 
  config, 
  onRefresh 
}) => {
  if (!config || !config.setup_completed) {
    return (
      <div className="text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto" />
        <h3 className="text-lg font-semibold">Stripe Not Configured</h3>
        <p className="text-gray-600">
          Please complete the API configuration to enable payments
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Stripe Configuration Status</h3>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <h4 className="font-semibold">Configuration Complete</h4>
                <p className="text-sm text-gray-600">
                  {config.account_name || 'Stripe Account'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {config.is_live_mode ? (
                <Globe className="h-8 w-8 text-red-500" />
              ) : (
                <Settings className="h-8 w-8 text-blue-500" />
              )}
              <div>
                <h4 className="font-semibold">
                  {config.is_live_mode ? 'Live Mode' : 'Test Mode'}
                </h4>
                <p className="text-sm text-gray-600">
                  {config.is_live_mode ? 
                    'Processing real payments' : 
                    'Safe for testing'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">API Keys Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Publishable Key</span>
            <Badge variant="outline">
              {config.publishable_key ? '✓ Configured' : '✗ Missing'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Secret Key</span>
            <Badge variant="outline">
              {config.secret_key_encrypted ? '✓ Configured' : '✗ Missing'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Webhook Secret</span>
            <Badge variant="outline">
              {config.webhook_secret_encrypted ? '✓ Configured' : 'Optional'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Your Stripe integration is ready! Payments will be processed through your Stripe account.
        </AlertDescription>
      </Alert>
    </div>
  );
};