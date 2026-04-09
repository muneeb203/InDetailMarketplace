import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';

// HARDCODED SECURE PASSWORD - Share with client
const SETTINGS_ACCESS_PASSWORD = 'InDetail@2024#SecureSettings!';

interface SecureSettingsGateProps {
  children: React.ReactNode;
}

export const SecureSettingsGate: React.FC<SecureSettingsGateProps> = ({ children }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === SETTINGS_ACCESS_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
      setAttempts(0);
    } else {
      setError('Invalid password. Access denied.');
      setAttempts(prev => prev + 1);
      setPassword('');
      
      // Lock out after 3 failed attempts for 30 seconds
      if (attempts >= 2) {
        setError('Too many failed attempts. Please wait 30 seconds before trying again.');
        setTimeout(() => {
          setError('');
          setAttempts(0);
        }, 30000);
      }
    }
  };

  // If authenticated, show the protected content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Show the password gate
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card className="border-2 border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-700">
              Secure Settings Access
            </CardTitle>
            <CardDescription>
              This section requires additional authentication for security purposes.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="settings-password" className="text-sm font-medium">
                  Settings Password
                </label>
                <div className="relative">
                  <Input
                    id="settings-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter settings access password"
                    className="pr-10"
                    disabled={attempts >= 3}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={attempts >= 3}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <Lock className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={attempts >= 3 || !password.trim()}
              >
                <Shield className="h-4 w-4 mr-2" />
                Access Settings
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Security Notice:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• This password is separate from your admin login</li>
                <li>• Maximum 3 attempts before temporary lockout</li>
                <li>• Contact system administrator if you need access</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};