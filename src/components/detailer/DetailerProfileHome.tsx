import React, { useState } from 'react';
import { 
  Edit3, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Globe,
  DollarSign,
  TrendingUp,
  Bell,
  ChevronRight,
  CheckCircle,
  Star,
  Calendar,
  X,
  Lightbulb
} from 'lucide-react';
import { cn } from '../ui/utils';
import { ExposureMetrics } from './ExposureMetrics';

interface DetailerProfileHomeProps {
  onNavigate?: (view: string, params?: any) => void;
}

export function DetailerProfileHome({ onNavigate }: DetailerProfileHomeProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showTipsModal, setShowTipsModal] = useState(false);

  // Mock data
  const detailer = {
    shopName: 'Elite Auto Detailing',
    tagline: 'Perfection in every detail',
    bio: 'Premium mobile auto detailing with 10+ years of experience. Specializing in luxury vehicles and paint correction.',
    rating: 4.9,
    jobCount: 247,
    accountBalance: 3456.50,
    pendingEarnings: 875.00,
    thisMonthEarnings: 8234.00,
    specialties: [
      'Paint Correction',
      'Ceramic Coating',
      'Pet Hair Removal',
      'Luxury Vehicles',
      'RV Detailing',
      'Fleet Services'
    ],
    operatingHours: {
      monday: { isOpen: true, open: '09:00', close: '18:00' },
      tuesday: { isOpen: true, open: '09:00', close: '18:00' },
      wednesday: { isOpen: true, open: '09:00', close: '18:00' },
      thursday: { isOpen: true, open: '09:00', close: '18:00' },
      friday: { isOpen: true, open: '09:00', close: '20:00' },
      saturday: { isOpen: true, open: '10:00', close: '18:00' },
      sunday: { isOpen: false, open: '', close: '' },
    },
    contact: {
      phone: '(415) 555-0123',
      email: 'contact@eliteautodetailing.com',
      website: 'www.eliteautodetailing.com',
      serviceRadius: '15 miles',
      city: 'San Francisco, CA'
    }
  };

  const metrics = {
    profileViews: { value: 1247, change: 12, trend: 'up' as const },
    saves: { value: 89, change: 8, trend: 'up' as const },
    leadOpens: { value: 156, change: -5, trend: 'down' as const },
    quoteAcceptRate: { value: 68, change: 3, trend: 'up' as const },
  };

  const tips = [
    {
      title: 'Add 3 new before/after photos',
      description: 'Profiles with fresh photos get 40% more views',
    },
    {
      title: 'Reply under 10 minutes',
      description: 'Quick responses increase quote acceptance by 25%',
    },
    {
      title: 'Pin a short intro video',
      description: 'Video intros build trust and boost bookings',
    },
  ];

  const incomingLeads = [
    {
      id: '1',
      clientName: 'Jessica T.',
      services: ['Interior Deep Clean', 'Pet Hair Removal'],
      vehicle: '2020 Honda CR-V',
      distance: '3.2 mi away',
      timestamp: '15 min ago',
      urgent: true
    },
    {
      id: '2',
      clientName: 'Marcus L.',
      services: ['Full Exterior Detail', 'Ceramic Coating'],
      vehicle: '2023 Tesla Model S',
      distance: '5.8 mi away',
      timestamp: '1 hour ago',
      urgent: false
    },
    {
      id: '3',
      clientName: 'Amy K.',
      services: ['RV Detailing'],
      vehicle: '2018 Thor Motorhome',
      distance: '12.4 mi away',
      timestamp: '3 hours ago',
      urgent: false
    }
  ];

  const daysOfWeek = [
    'monday',
    'tuesday', 
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  ];

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleEditProfile = () => {
    onNavigate?.('pro-profile-editor', { tab: 'brand' });
  };

  const handleViewAllLeads = () => {
    onNavigate?.('pro-lead-inbox');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="font-bold text-2xl mb-1">{detailer.shopName}</h1>
              <p className="text-blue-100 text-sm">{detailer.tagline}</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-white text-white" />
                  <span className="font-semibold">{detailer.rating}</span>
                </div>
                <span className="text-blue-100">•</span>
                <span className="text-blue-100">{detailer.jobCount} jobs</span>
              </div>
            </div>
            <button
              onClick={handleEditProfile}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
              aria-label="Edit profile"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6 space-y-4">
        {/* Account Balance Card */}
        <div className="bg-white rounded-2xl shadow-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg text-gray-900">Account Balance</h2>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>

          <div className="space-y-4">
            {/* Available Balance */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <div className="text-sm text-gray-600 mb-1">Available Now</div>
              <div className="text-3xl font-bold text-green-700 mb-1">
                ${detailer.accountBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <button className="text-sm text-green-700 font-medium hover:underline">
                Transfer to Bank →
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Pending</div>
                <div className="font-semibold text-gray-900">
                  ${detailer.pendingEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                <div className="text-xs text-blue-700 mb-1">This Month</div>
                <div className="font-semibold text-blue-900 flex items-center gap-1">
                  ${detailer.thisMonthEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Incoming Leads */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center relative">
                <Bell className="w-4 h-4 text-white" />
                {incomingLeads.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                    {incomingLeads.length}
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-gray-900">Incoming Leads</h3>
            </div>
            <button
              onClick={handleViewAllLeads}
              className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y">
            {incomingLeads.slice(0, 3).map((lead) => (
              <div
                key={lead.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={handleViewAllLeads}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {lead.clientName}
                      {lead.urgent && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                          URGENT
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{lead.vehicle}</div>
                  </div>
                  <div className="text-xs text-gray-500">{lead.timestamp}</div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {lead.services.map((service) => (
                    <span
                      key={service}
                      className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"
                    >
                      {service}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <MapPin className="w-3.5 h-3.5" />
                  {lead.distance}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-3">About</h3>
          <p className="text-gray-700 leading-relaxed">{detailer.bio}</p>
        </div>

        {/* Specialties */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">Specialties</h3>
          <div className="flex flex-wrap gap-2">
            {detailer.specialties.map((specialty) => (
              <span
                key={specialty}
                className="px-4 py-2 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 font-medium flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                {specialty}
              </span>
            ))}
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-lg text-gray-900">Operating Hours</h3>
          </div>
          
          <div className="space-y-2">
            {daysOfWeek.map((day) => {
              const hours = detailer.operatingHours[day as keyof typeof detailer.operatingHours];
              const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day;
              
              return (
                <div
                  key={day}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg transition-colors",
                    isToday ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-medium capitalize min-w-[100px]",
                      isToday ? "text-blue-900" : "text-gray-900"
                    )}>
                      {day}
                    </span>
                    {isToday && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-semibold">
                        Today
                      </span>
                    )}
                  </div>
                  
                  <div className={cn(
                    "text-sm font-medium",
                    hours.isOpen 
                      ? isToday ? "text-blue-700" : "text-gray-700"
                      : "text-gray-500"
                  )}>
                    {hours.isOpen
                      ? `${formatTime(hours.open)} - ${formatTime(hours.close)}`
                      : 'Closed'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">Contact Information</h3>
          
          <div className="space-y-4">
            {/* Phone */}
            <a
              href={`tel:${detailer.contact.phone}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-600">Phone</div>
                <div className="font-medium text-gray-900">{detailer.contact.phone}</div>
              </div>
            </a>

            {/* Email */}
            <a
              href={`mailto:${detailer.contact.email}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-600">Email</div>
                <div className="font-medium text-gray-900">{detailer.contact.email}</div>
              </div>
            </a>

            {/* Website */}
            <a
              href={`https://${detailer.contact.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-600">Website</div>
                <div className="font-medium text-gray-900">{detailer.contact.website}</div>
              </div>
            </a>

            {/* Service Area */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="text-xs text-gray-600">Service Area</div>
                <div className="font-medium text-gray-900">{detailer.contact.city}</div>
                <div className="text-sm text-gray-600">{detailer.contact.serviceRadius} radius</div>
              </div>
            </div>
          </div>
        </div>

        {/* Exposure Metrics */}
        <ExposureMetrics
          profileViews={metrics.profileViews}
          saves={metrics.saves}
          leadOpens={metrics.leadOpens}
          quoteAcceptRate={metrics.quoteAcceptRate}
          onTipsClick={() => setShowTipsModal(true)}
        />
      </div>

      {/* Tips Modal */}
      {showTipsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowTipsModal(false)}
          />
          
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white">
              <button
                onClick={() => setShowTipsModal(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Growth Tips</h2>
                  <p className="text-amber-100 text-sm">Boost your exposure</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {tips.map((tip, index) => (
                <div key={index} className="flex gap-4 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{tip.title}</h3>
                    <p className="text-gray-600 text-sm">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}