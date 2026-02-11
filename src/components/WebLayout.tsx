import React, { ReactNode, useState } from 'react';
import { Search, Bell, User, MessageSquare, Calendar, Activity, FileText, AlertCircle, Home } from 'lucide-react';
import { ProfileSidebar } from './ProfileSidebar';

interface WebLayoutProps {
  children: ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
  userName?: string;
  businessName?: string;
  userEmail?: string;
  userPhone?: string;
  userRole?: 'client' | 'detailer';
  showProfileSidebar?: boolean;
  onSearch?: (query: string) => void;
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
  showProfileSidebar = true,
  onSearch
}: WebLayoutProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search form submitted, query:', searchQuery);
    console.log('onSearch function exists:', !!onSearch);
    if (onSearch && searchQuery.trim()) {
      console.log('Calling onSearch with:', searchQuery);
      onSearch(searchQuery);
      // Optionally clear search after submission
      // setSearchQuery('');
    } else if (searchQuery.trim()) {
      // If no onSearch handler, show a message
      console.log('No onSearch handler, query:', searchQuery);
      alert(`Searching for: ${searchQuery}`);
    } else {
      console.log('Empty search query');
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Search button clicked, query:', searchQuery);
    if (onSearch && searchQuery.trim()) {
      console.log('Calling onSearch from button with:', searchQuery);
      onSearch(searchQuery);
    } else if (searchQuery.trim()) {
      alert(`Searching for: ${searchQuery}`);
    }
  };

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
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">{accountType}</p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Search detailers or services..."
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button 
                type="submit"
                onClick={handleSearchButtonClick}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 transition-colors active:scale-95"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Side Navigation */}
        <div className="flex items-center gap-6">
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
          <button
            onClick={() => onNavigate('profile')}
            className={`text-sm font-medium transition-colors ${currentView === 'profile' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Profile
          </button>
          <button className="relative hover:opacity-80 transition-opacity">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>
          <button 
            onClick={() => onNavigate('profile')}
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <User className="w-5 h-5 text-gray-600" />
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
              <MessageSquare className="w-5 h-5 flex-shrink-0" />
              {isSidebarExpanded && (
                <span className="font-medium whitespace-nowrap">
                  Messages
                </span>
              )}
            </button>

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
          />
        )}
      </div>
    </div>
  );
}
