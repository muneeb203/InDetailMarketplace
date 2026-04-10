import { Home, MessageSquare, Calendar, User, Activity } from 'lucide-react';
import { Badge } from './ui/badge';

interface BottomNavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  unreadMessages?: number;
  userRole?: 'client' | 'detailer';
}

export function BottomNavigation({ currentView, onNavigate, unreadMessages = 0, userRole = 'client' }: BottomNavigationProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessages },
    { id: 'bookings', label: userRole === 'detailer' ? 'Jobs' : 'Bookings', icon: Calendar },
    { id: 'status', label: 'Status', icon: Activity },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-20">
      <div className="max-w-md mx-auto grid grid-cols-5">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-3 relative transition-all duration-200 ${
                isActive ? 'text-[#0078FF]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : ''}`} />
                {item.badge && item.badge > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-[#0078FF] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
