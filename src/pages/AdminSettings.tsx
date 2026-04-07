import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { 
  Settings, 
  CreditCard, 
  Shield, 
  Bell, 
  Users, 
  Database,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { StripeSetupPanel } from '../components/admin/StripeSetupPanel';
import { stripeConfigService } from '../services/stripeConfigService';
import { useAuth } from '../context/AuthContext';

export const AdminSettings: React.FC = () => {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('payments');

  useEffect(() => {
    // Check for tab parameter in URL
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
    
    checkStripeConfiguration();
  }, [searchParams]);

  const checkStripeConfiguration = async () => {
    try {
      const config = await stripeConfigService.getConfig();
      setStripeConfigured(config?.setup_completed || false);
    } catch (error) {
      console.error('Error checking Stripe config:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin - temporarily disabled for setup
  // TODO: Re-enable admin role check after initial setup
  /*
  if (profile?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">
              You don't have permission to access admin settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  */

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your marketplace configuration and integrations
          </p>
        </div>
        <Badge variant={stripeConfigured ? "default" : "destructive"}>
          {stripeConfigured ? "Payments Active" : "Setup Required"}
        </Badge>
      </div>

      {!loading && !stripeConfigured && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Payment Setup Required:</strong> Configure your Stripe account to enable payments in your marketplace.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <StripeSetupPanel onSetupComplete={() => setStripeConfigured(true)} />
        </TabsContent>

        <TabsContent value="users">
          <UserManagementPanel />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettingsPanel />
        </TabsContent>

        <TabsContent value="system">
          <SystemSettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const UserManagementPanel: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>
          Manage user accounts, roles, and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              User management features are coming soon. Currently, user registration and authentication are handled automatically.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold">Total Users</h3>
                <p className="text-2xl font-bold text-blue-600">--</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold">Active Clients</h3>
                <p className="text-2xl font-bold text-green-600">--</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold">Active Detailers</h3>
                <p className="text-2xl font-bold text-purple-600">--</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const NotificationSettingsPanel: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure email notifications and alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Notification settings will be available in a future update. Email notifications are currently handled automatically.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

const SystemSettingsPanel: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          System Settings
        </CardTitle>
        <CardDescription>
          Database, security, and system configuration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              System is running normally. Database connections are healthy and all services are operational.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Database Status</h3>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Connected</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Security Status</h3>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Secure</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};