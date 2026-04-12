import React, { useState, useEffect } from 'react';
import { 
  Home, 
  MessageSquare, 
  Calendar, 
  Activity, 
  Settings, 
  Menu, 
  X, 
  Package,
  FileText,
  AlertCircle,
  Bell,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Badge } from './ui/badge';
import { AvatarWithFallback } from './ui/avatar-with-fallback';

interface MobileNavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  userName?: string;
  businessName?: string;
  userRole?: 'client' | 'detailer';
  dealerLogoUrl?: string | null;
  clientAvatarUrl?: string | null;
  onLogout?: () => void;
  unreadMessages?: number;
  unreadNotifications?: number;
}

export function MobileNavigation({
  currentView,
  onNavigate,
  userName = "User",
  businessName,
  userRole = "client",
  dealerLogoUrl,
  clientAvatarUrl,
  onLogout,
  unreadMessages = 0,
  unreadNotifications = 0,
}: MobileNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const displayName = userRole === 'detailer' && businessName ? businessName : userName;
  const accountType = userRole === 'client' ? 'Client Account' : 'Detailer Account';

  // Auto-hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close menu when view changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [currentView]);

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      view: 'home',
      isActive: ['home', 'marketplace', 'dashboard', 'pro-dashboard'].includes(currentView)
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      view: 'messages',
      badge: unreadMessages,
      isActive: currentView === 'messages'
    },
    ...(userRole === 'client' ? [{
      id: 'my-orders',
      label: 'My Orders',
      icon: Package,
      view: 'my-orders',
      isActive: currentView === 'my-orders'
    }] : []),
    {
      id: 'bookings',
      label: 'Bookings',
      icon: Calendar,
      view: 'bookings',
      isActive: currentView === 'bookings'
    },
    {
      id: 'status',
      label: 'Status',
      icon: Activity,
      view: 'status',
      isActive: currentView === 'status'
    },
    {
      id: 'quotes',
      label: 'Quotes',
      icon: FileText,
      view: 'quotes',
      isActive: currentView === 'quotes'
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: AlertCircle,
      view: 'alerts',
      isActive: currentView === 'alerts'
    }
  ];

  const handleNavigate = (view: string) => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Floating Action Button - Menu Toggle */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className={`fixed left-4 bottom-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center md:hidden ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
        }`}
        aria-label="Open navigation menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Notifications Button */}
      <button
        onClick={() => handleNavigate('notifications')}
        className={`fixed right-4 bottom-6 z-50 w-12 h-12 bg-white hover:bg-gray-50 text-gray-700 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center md:hidden ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
        }`}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadNotifications > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            {unreadNotifications > 9 ? '9+' : unreadNotifications}
          </span>
        )}
      </button>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Slide-out Menu */}
      <div
        className={`fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AvatarWithFallback
                src={userRole === 'detailer' ? dealerLogoUrl : clientAvatarUrl}
                name={displayName}
                size="md"
                className="ring-2 ring-white/20"
              />
              <div>
                <p className="font-semibold text-lg">{displayName}</p>
                <p className="text-blue-100 text-sm">{accountType}</p>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.view)}
              className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${
                item.isActive
                  ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {item.badge && item.badge > 0 && (
                    <Badge className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1 flex items-center justify-center bg-red-500 text-white text-xs border-0">
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          ))}

          {/* Detailer-specific items */}
          {userRole === 'detailer' && (
            <button
              onClick={() => handleNavigate('pro-public-profile')}
              className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${
                currentView === 'pro-public-profile'
                  ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <Activity className="w-5 h-5" />
                <span className="font-medium">View Gig</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          )}

          {/* Divider */}
          <div className="my-4 border-t border-gray-200" />

          {/* Settings */}
          <button
            onClick={() => handleNavigate('settings')}
            className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${
              currentView === 'settings'
                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          {/* Logout */}
          {onLogout && (
            <button
              onClick={() => {
                onLogout();
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors text-red-600 hover:bg-red-50"
            >
              <div className="flex items-center gap-4">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </nav>
      </div>
    </>
  );
}