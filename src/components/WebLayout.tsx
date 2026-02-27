import React, { ReactNode, useState, useEffect } from 'react';
import { Bell, MessageSquare, Calendar, Activity, FileText, AlertCircle, Home, Settings, LogOut, Package } from 'lucide-react';
import { Badge } from './ui/badge';
import { ProfileSidebar } from './ProfileSidebar';
import { AvatarWithFallback } from './ui/avatar-with-fallback';
import type { Vehicle } from '../types';

interface WebLayoutProps {
  children: ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
  userName?: string;
  businessName?: string;
  userEmail?: string;
  userPhone?: string;
  userRole?: 'client' | 'detailer';
  clientId?: string;
  dealerLogoUrl?: string | null;
  vehicles?: Vehicle[];
  showProfileSidebar?: boolean;
  onLogout?: () => void;
  unreadMessages?: number;
}

export function WebLayout({ 
  children, 
  currentView, 
  onNavigate, 
  userName = "John Doe",
  businessName,
  userEmail,
  userPhone,
  userRole = "client",
  clientId,
  dealerLogoUrl,
  vehicles = [],
  showProfileSidebar = true,
  onLogout,
  unreadMessages = 0,
}: WebLayoutProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Use business name for detailers, personal name for clients
  const displayName = userRole === 'detailer' && businessName ? businessName : userName;
  const accountType = userRole === 'client' ? 'Client Account' : 'Detailer Account';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <AvatarWithFallback
              src={userRole === 'detailer' ? dealerLogoUrl : undefined}
              name={displayName}
              size="sm"
            />
            <div>
              <p className="font-semibold text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">{accountType}</p>
            </div>
          </div>
        </div>

        {/* Right Side Navigation */}
        <div className="flex items-center gap-6">
          {userRole === 'client' && (
            <button
              onClick={() => onNavigate('my-orders')}
              className={`text-sm font-medium transition-colors ${currentView === 'my-orders' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              My Orders
            </button>
          )}
          <button
            onClick={() => onNavigate('bookings')}
            className={`text-sm font-medium transition-colors ${currentView === 'bookings' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Bookings
          </button>
          <button
            onClick={() => onNavigate('status')}
            className={`text-sm font-medium transition-colors ${currentView === 'status' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Status
          </button>
          {userRole === 'detailer' && (
            <button
              onClick={() => onNavigate('pro-public-profile')}
              className={`text-sm font-medium transition-colors ${currentView === 'pro-public-profile' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              View Gig
            </button>
          )}
          <button className="relative hover:opacity-80 transition-opacity">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Collapsible */}
        <aside 
          className={`bg-white border-r border-gray-200 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out relative z-10 ${
            isSidebarExpanded ? 'w-64' : 'w-20'
          }`}
          onMouseEnter={() => {
            console.log('Mouse entered sidebar');
            setIsSidebarExpanded(true);
          }}
          onMouseLeave={() => {
            console.log('Mouse left sidebar');
            setIsSidebarExpanded(false);
          }}
        >
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Home clicked');
                onNavigate('home');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${
                currentView === 'home' || currentView === 'marketplace' || currentView === 'dashboard' || currentView === 'pro-dashboard'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title="Home"
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              {isSidebarExpanded && (
                <span className="font-medium whitespace-nowrap">
                  Home
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Messages clicked');
                onNavigate('messages');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${
                currentView === 'messages'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title="Messages"
            >
              <div className="relative flex-shrink-0">
                <MessageSquare className="w-5 h-5" />
                {unreadMessages > 0 && (
                  <Badge className="absolute -top-1.5 -right-1.5 min-w-[1.25rem] h-5 px-1 flex items-center justify-center bg-red-500 text-white text-xs border-0">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </Badge>
                )}
              </div>
              {isSidebarExpanded && (
                <span className="font-medium whitespace-nowrap">
                  Messages
                </span>
              )}
            </button>

            {userRole === 'client' && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onNavigate('my-orders');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${
                  currentView === 'my-orders'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title="My Orders"
              >
                <Package className="w-5 h-5 flex-shrink-0" />
                {isSidebarExpanded && (
                  <span className="font-medium whitespace-nowrap">My Orders</span>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Bookings clicked');
                onNavigate('bookings');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${
                currentView === 'bookings'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title="Bookings"
            >
              <Calendar className="w-5 h-5 flex-shrink-0" />
              {isSidebarExpanded && (
                <span className="font-medium whitespace-nowrap">
                  Bookings
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Status clicked');
                onNavigate('status');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${
                currentView === 'status'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title="Status"
            >
              <Activity className="w-5 h-5 flex-shrink-0" />
              {isSidebarExpanded && (
                <span className="font-medium whitespace-nowrap">
                  Status
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Quotes clicked');
                onNavigate('quotes');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${
                currentView === 'quotes'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title="Quotes"
            >
              <FileText className="w-5 h-5 flex-shrink-0" />
              {isSidebarExpanded && (
                <span className="font-medium whitespace-nowrap">
                  Quotes
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Alerts clicked');
                onNavigate('alerts');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${
                currentView === 'alerts'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title="Elev Alerts"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {isSidebarExpanded && (
                <span className="font-medium whitespace-nowrap">
                  Elev Alerts
                </span>
              )}
            </button>

            <div className="pt-2 mt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onNavigate('settings');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${
                  currentView === 'settings'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title="Settings"
              >
                <Settings className="w-5 h-5 flex-shrink-0" />
                {isSidebarExpanded && (
                  <span className="font-medium whitespace-nowrap">
                    Settings
                  </span>
                )}
              </button>

              {onLogout && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer text-gray-700 hover:bg-red-50 hover:text-red-600"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  {isSidebarExpanded && (
                    <span className="font-medium whitespace-nowrap">
                      Logout
                    </span>
                  )}
                </button>
              )}
            </div>
          </nav>
        </aside>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Right Sidebar - Profile */}
        {showProfileSidebar && (
          <ProfileSidebar
            userName={userName}
            userEmail={userEmail}
            userPhone={userPhone}
            userRole={userRole}
            clientId={clientId}
            vehicles={vehicles}
            onNavigate={onNavigate}
          />
        )}
      </div>
    </div>
  );
}
