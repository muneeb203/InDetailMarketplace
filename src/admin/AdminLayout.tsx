import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  MessageSquare,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const nav = [
  { to: '/admin/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/dealers', label: 'Detailers', icon: Store },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/conversations', label: 'Conversations', icon: MessageSquare },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-3 pb-20">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 mb-1 text-sm font-medium rounded-md transition-colors min-h-[44px] touch-manipulation ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 bg-white">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-3 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors min-h-[44px] touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          <div className="w-11" /> {/* Spacer for centering */}
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-8 pb-20 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile FAB for quick access */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-6 left-4 z-30 lg:hidden w-14 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center touch-manipulation"
        style={{ WebkitTapHighlightColor: 'transparent' }}
        aria-label="Open admin menu"
      >
        <Menu className="w-6 h-6" />
      </button>
    </div>
  );
}
