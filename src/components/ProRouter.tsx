import React, { useState } from 'react';
import { ProDashboard } from './detailer/ProDashboard';
import { ProProfileEditor } from './detailer/ProProfileEditor';
import { ProPublicProfile } from './detailer/ProPublicProfile';
import { ProLeadInbox } from './detailer/ProLeadInbox';

// Mock routing wrapper to simulate react-router behavior
type ProView = 'dashboard' | 'profile-editor' | 'public-profile' | 'lead-inbox' | 'quote-composer' | 'messages';

interface RouteState {
  lead?: any;
}

export function ProRouter() {
  const [currentView, setCurrentView] = useState<ProView>('dashboard');
  const [routeState, setRouteState] = useState<RouteState>({});
  const [searchParams, setSearchParams] = useState<URLSearchParams>(new URLSearchParams());

  // Mock navigate function
  const navigate = (path: string, options?: { state?: any }) => {
    if (path.startsWith('/pro/')) {
      const route = path.replace('/pro/', '').split('?')[0] as ProView;
      setCurrentView(route);
      
      if (options?.state) {
        setRouteState(options.state);
      }
      
      // Parse query params
      if (path.includes('?')) {
        const params = new URLSearchParams(path.split('?')[1]);
        setSearchParams(params);
      } else {
        setSearchParams(new URLSearchParams());
      }
    } else if (path === -1 || path === '/') {
      setCurrentView('dashboard');
    }
  };

  // Mock location object
  const location = {
    search: searchParams.toString() ? `?${searchParams.toString()}` : '',
    state: routeState,
  };

  // Create context with navigation
  const routerContext = {
    navigate,
    location,
    useNavigate: () => navigate,
    useLocation: () => location,
  };

  // Provide router context to children
  return (
    <RouterContext.Provider value={routerContext}>
      <div className="h-screen max-w-md mx-auto bg-white">
        {currentView === 'dashboard' && <ProDashboard />}
        {currentView === 'profile-editor' && <ProProfileEditor />}
        {currentView === 'public-profile' && <ProPublicProfile />}
        {currentView === 'lead-inbox' && <ProLeadInbox />}
        {currentView === 'quote-composer' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Quote Composer</h2>
              <p className="text-gray-600">This screen would show the quote composer form</p>
              <button
                onClick={() => navigate('/pro/lead-inbox')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Back to Leads
              </button>
            </div>
          </div>
        )}
        {currentView === 'messages' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Messages</h2>
              <p className="text-gray-600">This would integrate with your existing messages component</p>
              <button
                onClick={() => navigate('/pro/dashboard')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </RouterContext.Provider>
  );
}

// Create router context
const RouterContext = React.createContext<any>(null);

// Override react-router hooks globally for this context
const originalUseNavigate = require('react-router-dom').useNavigate;
const originalUseLocation = require('react-router-dom').useLocation;

// Export hooks that use our context
export function useNavigate() {
  const context = React.useContext(RouterContext);
  if (context) {
    return context.navigate;
  }
  return originalUseNavigate?.() || (() => {});
}

export function useLocation() {
  const context = React.useContext(RouterContext);
  if (context) {
    return context.location;
  }
  return originalUseLocation?.() || { search: '', state: {} };
}
