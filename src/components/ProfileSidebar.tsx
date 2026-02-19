import React from 'react';
import { User, Mail, Phone, Bell, Car, Edit } from 'lucide-react';
import type { Vehicle } from '../types';
import { useClientProfile } from '../hooks/useClientProfile';

interface ProfileSidebarProps {
  userName: string;
  userEmail?: string;
  userPhone?: string;
  userRole: 'client' | 'detailer';
  clientId?: string;
  vehicles?: Vehicle[];
  onNavigate?: (view: string) => void;
}

export function ProfileSidebar({ userName, userEmail, userPhone, userRole, clientId, vehicles: vehiclesProp = [], onNavigate }: ProfileSidebarProps) {
  const { vehicles: vehiclesFromDb } = useClientProfile(userRole === 'client' ? clientId : undefined);
  const vehicles = vehiclesFromDb.length > 0 ? vehiclesFromDb : vehiclesProp;
  return (
    <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto flex-shrink-0 scrollbar-thin">
      <div className="p-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white mb-6 relative">
          {userRole === 'client' && onNavigate && (
            <button
              onClick={() => onNavigate('settings')}
              className="absolute top-3 right-3 bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 hover:bg-blue-50 transition-colors"
            >
              <Edit className="w-3 h-3" />
              Edit
            </button>
          )}
          
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
        {userRole === 'client' && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Individual Vehicles</h4>
            {vehicles.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Car className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No vehicles added yet</p>
                <p className="text-xs text-gray-400 mt-1">Add your vehicle in Profile settings</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicles.map((v) => (
                  <div key={v.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-12 bg-white rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                        {v.photo ? (
                          <img src={v.photo} alt={`${v.make} ${v.model}`} className="w-full h-full object-cover" />
                        ) : (
                          <Car className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <h5 className="font-semibold text-sm truncate">
                            {v.year} {v.make} {v.model}
                          </h5>
                          {v.isDefault && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{v.type ?? 'Vehicle'}</p>
                        {v.nickname && (
                          <p className="text-xs text-gray-500 truncate">{v.nickname}</p>
                        )}
                        {v.color && (
                          <p className="text-xs text-gray-500">{v.color}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
