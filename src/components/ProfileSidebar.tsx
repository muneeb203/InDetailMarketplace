import React from 'react';
import { User, Mail, Phone, Bell, Car, Edit } from 'lucide-react';

interface ProfileSidebarProps {
  userName: string;
  userEmail?: string;
  userPhone?: string;
  userRole: 'client' | 'detailer';
}

export function ProfileSidebar({ userName, userEmail, userPhone, userRole }: ProfileSidebarProps) {
  return (
    <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto flex-shrink-0 scrollbar-thin">
      <div className="p-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white mb-6 relative">
          <button className="absolute top-3 right-3 bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Edit className="w-3 h-3" />
            Edit
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold">{userName}</h3>
              <p className="text-blue-100 text-sm">Client Account</p>
            </div>
          </div>
        </div>

        {/* My Info Section */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            My Info
          </h4>
          
          <div className="space-y-3">
            {userEmail && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{userEmail}</span>
              </div>
            )}
            
            {userPhone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{userPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cleaning Preferences */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Cleaning Preferences
          </h4>
          
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
              Eco-friendly products
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-blue-600">
              Interior fragrance off
            </button>
          </div>
        </div>

        {/* Individual Vehicles */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Individual Vehicles</h4>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-3">
            <div className="flex items-start gap-3">
              <div className="w-16 h-12 bg-white rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=200&q=80"
                  alt="Vehicle"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-semibold text-sm">2022 Tesla Model 3</h5>
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    Default
                  </span>
                </div>
                <p className="text-xs text-gray-500">Sedan</p>
                <p className="text-xs text-gray-500">Passenger Car</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-16 h-12 bg-white rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-sm mb-1">Vision Redefined</h5>
                <p className="text-xs text-gray-500">Electric Sedan</p>
                <p className="text-xs text-gray-500">Futuristic AI-powered automobile</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
