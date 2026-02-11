import React, { useState } from 'react';
import { Edit3, Folder, Share2, Lightbulb, X } from 'lucide-react';
import { BrandHeader } from './BrandHeader';
import { ExposureMetrics } from './ExposureMetrics';
import { PromoBanner } from './PromoBanner';
import { ShareQRPanel } from './ShareQRPanel';

interface ProDashboardProps {
  onNavigate?: (view: string, params?: any) => void;
}

export function ProDashboard({ onNavigate }: ProDashboardProps) {
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);

  // Mock detailer data
  const detailer = {
    logo: undefined,
    shopName: 'Elite Auto Detailing',
    tagline: 'Perfection in every detail',
    city: 'San Francisco',
    radiusBadge: '15 mi radius',
    badges: {
      verified: true,
      insured: true,
    },
    rating: 4.9,
    jobCount: 247,
  };

  const metrics = {
    profileViews: { value: 1247, change: 12, trend: 'up' as const },
    saves: { value: 89, change: 8, trend: 'up' as const },
    leadOpens: { value: 156, change: -5, trend: 'down' as const },
    quoteAcceptRate: { value: 68, change: 3, trend: 'up' as const },
  };

  const promo = {
    title: '20% Off First Service',
    description: 'New customers get 20% off their first detailing service',
    startDate: 'Dec 1',
    endDate: 'Dec 31',
    active: true,
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

  const handleEditProfile = () => {
    if (onNavigate) {
      onNavigate('pro-profile-editor', { tab: 'brand' });
    }
  };

  const handlePortfolio = () => {
    if (onNavigate) {
      onNavigate('pro-profile-editor', { tab: 'portfolio' });
    }
  };

  const handleShare = () => {
    setShowSharePanel(true);
  };

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full mx-auto px-8 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Brand Header */}
          <div className="lg:col-span-1">
            <BrandHeader {...detailer} />
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={handleEditProfile}
                className="h-28 rounded-xl bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all active:scale-95 flex flex-col items-center justify-center gap-2"
              >
                <Edit3 className="w-6 h-6 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">Edit Profile</span>
              </button>
              
              <button
                onClick={handlePortfolio}
                className="h-28 rounded-xl bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all active:scale-95 flex flex-col items-center justify-center gap-2"
              >
                <Folder className="w-6 h-6 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">Portfolio</span>
              </button>
              
              <button
                onClick={handleShare}
                className="h-28 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all active:scale-95 flex flex-col items-center justify-center gap-2 shadow-sm"
              >
                <Share2 className="w-6 h-6" />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>

            {/* Exposure Metrics */}
            <ExposureMetrics
              {...metrics}
              onTipsClick={() => setShowTipsModal(true)}
            />

            {/* Promo Banner */}
            <PromoBanner
              {...promo}
              onCreatePromo={() => onNavigate?.('pro-profile-editor', { tab: 'brand', section: 'promo' })}
            />

            {/* Recent Activity Section - Added for scrolling */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New lead opened</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Profile viewed 15 times</p>
                    <p className="text-xs text-gray-500">Today</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Quote accepted</p>
                    <p className="text-xs text-gray-500">Yesterday</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Section - Added for scrolling */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-xs text-green-600">+3 from last week</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-1">Response Time</p>
                <p className="text-2xl font-bold text-gray-900">8m</p>
                <p className="text-xs text-green-600">-2m improvement</p>
              </div>
            </div>

            {/* Additional Content for Scrolling Test */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Upcoming Bookings</h3>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Booking #{i}</p>
                      <p className="text-xs text-gray-500">Tomorrow at 2:00 PM</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Confirmed</span>
                  </div>
                ))}
              </div>
            </div>

            {/* More Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Performance This Month</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Lead Conversion</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Customer Satisfaction</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Panel Modal */}
      <ShareQRPanel
        isOpen={showSharePanel}
        onClose={() => setShowSharePanel(false)}
        profileUrl="indetail.com/d/elite-auto"
        shopName={detailer.shopName}
      />

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