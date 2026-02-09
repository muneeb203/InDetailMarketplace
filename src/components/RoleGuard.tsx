import { ReactNode } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  children: ReactNode;
  allowedRole: 'client' | 'detailer';
  currentRole?: 'client' | 'detailer';
  onRedirect: () => void;
}

export function RoleGuard({
  children,
  allowedRole,
  currentRole,
  onRedirect,
}: RoleGuardProps) {
  if (!currentRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md">
          <ShieldAlert className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="mb-2">Authentication Required</h3>
          <p className="text-sm text-gray-600 mb-6">
            Please sign in to access this page
          </p>
          <Button onClick={onRedirect} className="w-full">
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  if (currentRole !== allowedRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md">
          <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h3 className="mb-2">Access Restricted</h3>
          <p className="text-sm text-gray-600 mb-6">
            This page is only available to {allowedRole}s. You are currently signed
            in as a {currentRole}.
          </p>
          <Button onClick={onRedirect} className="w-full">
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
