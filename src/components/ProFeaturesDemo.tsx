import React, { useState } from 'react';
import { ProDashboard } from './detailer/ProDashboard';
import { ProProfileEditor } from './detailer/ProProfileEditor';
import { ProPublicProfile } from './detailer/ProPublicProfile';
import { ProLeadInbox } from './detailer/ProLeadInbox';
import { Mail } from 'lucide-react';

type ProView = 'dashboard' | 'profile-editor' | 'public-profile' | 'lead-inbox';

export function ProFeaturesDemo() {
  const [currentView, setCurrentView] = useState<ProView>('dashboard');
  const [viewParams, setViewParams] = useState<any>({});

  const handleNavigate = (view: string, params?: any) => {
    // Map navigation paths to views
    const viewMap: Record<string, ProView> = {
      'pro-dashboard': 'dashboard',
      'dashboard': 'dashboard',
      'pro-profile-editor': 'profile-editor',
      'profile-editor': 'profile-editor',
      'pro-public-profile': 'public-profile',
      'public-profile': 'public-profile',
      'pro-lead-inbox': 'lead-inbox',
      'lead-inbox': 'lead-inbox',
    };

    const mappedView = viewMap[view] || 'dashboard';
    setCurrentView(mappedView);
    setViewParams(params || {});
  };

  return (
    <div className="h-screen max-w-md mx-auto bg-white relative">
      {/* Floating navigation hint */}
      {currentView === 'dashboard' && (
        <button
          onClick={() => handleNavigate('lead-inbox')}
          className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center active:scale-95"
          title="View Lead Inbox"
        >
          <Mail className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
            3
          </span>
        </button>
      )}

      {currentView === 'dashboard' && (
        <ProDashboard onNavigate={handleNavigate} />
      )}
      {currentView === 'profile-editor' && (
        <ProProfileEditorWrapped onNavigate={handleNavigate} params={viewParams} />
      )}
      {currentView === 'public-profile' && (
        <ProPublicProfileWrapped onNavigate={handleNavigate} />
      )}
      {currentView === 'lead-inbox' && (
        <ProLeadInboxWrapped onNavigate={handleNavigate} />
      )}
    </div>
  );
}

// Wrapper components that inject navigation
function ProProfileEditorWrapped({ onNavigate, params }: { onNavigate: any; params: any }) {
  // Mock useNavigate and useLocation hooks
  const MockedProfileEditor = () => {
    const navigate = (path: string) => {
      if (path === '/pro/dashboard' || path === -1) {
        onNavigate('dashboard');
      } else if (path === '/pro/public-profile') {
        onNavigate('public-profile');
      }
    };

    const location = {
      search: params.tab ? `?tab=${params.tab}` : '',
    };

    // Replace the hooks temporarily
    const originalUseNavigate = React.useState(() => navigate)[0];
    const originalUseLocation = React.useState(() => location)[0];

    return <ProProfileEditor />;
  };

  return <MockedProfileEditor />;
}

function ProPublicProfileWrapped({ onNavigate }: { onNavigate: any }) {
  // Similar pattern for public profile
  const MockedPublicProfile = () => {
    const navigate = (path: string | number) => {
      if (path === -1 || path === '/') {
        onNavigate('dashboard');
      } else if (typeof path === 'string' && path.includes('request-quote')) {
        alert('Request quote functionality');
      }
    };

    return <ProPublicProfile />;
  };

  return <MockedPublicProfile />;
}

function ProLeadInboxWrapped({ onNavigate }: { onNavigate: any }) {
  const MockedLeadInbox = () => {
    const navigate = (path: string, options?: any) => {
      if (path === '/pro/dashboard') {
        onNavigate('dashboard');
      } else if (path === '/pro/quote-composer') {
        alert(`Accepting lead and opening quote composer for: ${options?.state?.lead?.clientName || 'customer'}`);
      } else if (path === '/pro/messages') {
        alert(`Opening messages for: ${options?.state?.lead?.clientName || 'customer'}`);
      }
    };

    return <ProLeadInbox />;
  };

  return <MockedLeadInbox />;
}