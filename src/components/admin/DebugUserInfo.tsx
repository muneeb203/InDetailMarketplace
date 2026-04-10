import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const DebugUserInfo: React.FC = () => {
  const { user, profile } = useAuth();

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4 text-sm">
      <h3 className="font-semibold mb-2">Debug: User Info</h3>
      <div className="space-y-1">
        <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
        <p><strong>Email:</strong> {user?.email || 'No email'}</p>
        <p><strong>Profile Role:</strong> {profile?.role || 'No role set'}</p>
        <p><strong>Profile ID:</strong> {profile?.id || 'No profile'}</p>
        <p><strong>Auth Status:</strong> {user ? 'Authenticated' : 'Not authenticated'}</p>
      </div>
    </div>
  );
};