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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Brand Header Card */}
        <BrandHeader {...detailer} />

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onNavigate?.('pro-profile-editor', { tab: 'brand' })}
            className="h-20 rounded-xl bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all active:scale-95 flex flex-col items-center justify-center gap-1.5"
          >
            <Edit3 className="w-5 h-5 text-gray-700" />
            <span className="text-xs font-medium text-gray-700">Edit Profile</span>
          </button>
          
          <button
            onClick={() => onNavigate?.('pro-profile-editor', { tab: 'portfolio' })}
            className="h-20 rounded-xl bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all active:scale-95 flex flex-col items-center justify-center gap-1.5"
          >
            <Folder className="w-5 h-5 text-gray-700" />
            <span className="text-xs font-medium text-gray-700">Portfolio</span>
          </button>
          
          <button
            onClick={() => setShowSharePanel(true)}
            className="h-20 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all active:scale-95 flex flex-col items-center justify-center gap-1.5 shadow-sm"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-xs font-medium">Share</span>
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