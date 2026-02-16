import React, { useState } from 'react';
import { Edit3, Share2, Lightbulb, X, Megaphone } from 'lucide-react';
import { BrandHeader } from './BrandHeader';
import { ExposureMetrics } from './ExposureMetrics';
import { PromoBanner } from './PromoBanner';
import { ServiceSummaryCard } from './ServiceSummaryCard';
import { ActivityFeed } from './ActivityFeed';
import { UpcomingBookings } from './UpcomingBookings';
import { ShareQRPanel } from './ShareQRPanel';

interface ProDashboardProps {
  onNavigate?: (view: string, params?: any) => void;
}

const defaultServices = ['Full Detail', 'Exterior Wash', 'Interior Detail', 'Ceramic Coating'];
const defaultActivity = [
  { id: '1', type: 'lead' as const, title: 'New lead opened', time: '2 hours ago' },
  { id: '2', type: 'view' as const, title: 'Profile viewed 15 times', time: 'Today' },
  { id: '3', type: 'quote_accepted' as const, title: 'Quote accepted', time: 'Yesterday' },
];
const defaultBookings = [
  { id: '1', clientName: 'Sarah M.', serviceType: 'Full Detail', date: 'Tomorrow', time: '2:00 PM', status: 'confirmed' as const },
  { id: '2', clientName: 'James K.', serviceType: 'Interior Detail', date: 'Dec 30', time: '10:00 AM', status: 'pending' as const },
];

export function ProDashboard({ onNavigate }: ProDashboardProps) {
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);

  const detailer = {
    logo: undefined,
    shopName: 'Elite Auto Detailing',
    tagline: 'Perfection in every detail',
    city: 'San Francisco',
    radiusBadge: '15 mi radius',
    badges: { verified: true, insured: true },
    rating: 4.9,
    jobCount: 247,
    serviceTags: ['Car Wash', 'Detailing', 'Interior Cleaning'],
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
    performanceIndicator: '+23% more visibility',
  };

  const tips = [
    { title: 'Add 3 new before/after photos', description: 'Profiles with fresh photos get 40% more views' },
    { title: 'Reply under 10 minutes', description: 'Quick responses increase quote acceptance by 25%' },
    { title: 'Pin a short intro video', description: 'Video intros build trust and boost bookings' },
  ];

  const handleEditGig = () => onNavigate?.('pro-profile-editor', { tab: 'brand' });
  const handlePromote = () => onNavigate?.('pro-profile-editor', { tab: 'brand', section: 'promo' });
  const handleShare = () => setShowSharePanel(true);
  const handleRequestOffer = () => onNavigate?.('pro-public-profile');

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white min-h-full">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Gig header + service summary + quick stats */}
          <div className="lg:col-span-1 space-y-5">
            <BrandHeader
              shopName={detailer.shopName}
              tagline={detailer.tagline}
              city={detailer.city}
              radiusBadge={detailer.radiusBadge}
              badges={detailer.badges}
              rating={detailer.rating}
              jobCount={detailer.jobCount}
              serviceTags={detailer.serviceTags}
            />

            <ServiceSummaryCard
              services={defaultServices}
              startingPrice="$99"
              estimatedTime="2–4 hrs"
              serviceRadius="15 mi"
              onRequestOffer={handleRequestOffer}
            />

            {/* Quick actions: Edit Gig, Promote, Share */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleEditGig}
                className="h-24 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-2"
              >
                <Edit3 className="w-5 h-5 text-gray-700" />
                <span className="text-xs font-medium text-gray-700">Edit Gig</span>
              </button>
              <button
                onClick={handlePromote}
                className="h-24 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-2"
              >
                <Megaphone className="w-5 h-5 text-gray-700" />
                <span className="text-xs font-medium text-gray-700">Promote</span>
              </button>
              <button
                onClick={handleShare}
                className="h-24 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-2 shadow-sm"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-xs font-medium">Share</span>
              </button>
            </div>

            {/* Trust: response time */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-0.5">Avg. response time</p>
              <p className="text-xl font-bold text-gray-900">8 min</p>
              <p className="text-xs text-green-600">Faster than most</p>
            </div>
          </div>

          {/* Right: Metrics, promo, activity, bookings */}
          <div className="lg:col-span-2 space-y-5">
            <ExposureMetrics {...metrics} onTipsClick={() => setShowTipsModal(true)} />

            <PromoBanner
              {...promo}
              onCreatePromo={() => onNavigate?.('pro-profile-editor', { tab: 'brand', section: 'promo' })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ActivityFeed items={defaultActivity} />
              <UpcomingBookings bookings={defaultBookings} />
            </div>

            {/* Performance summary */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Performance this month</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Lead conversion</span>
                    <span className="font-medium text-gray-900">68%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '68%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Customer satisfaction</span>
                    <span className="font-medium text-gray-900">92%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShareQRPanel
        isOpen={showSharePanel}
        onClose={() => setShowSharePanel(false)}
        profileUrl="indetail.com/d/elite-auto"
        shopName={detailer.shopName}
      />

      {showTipsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTipsModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white">
              <button
                onClick={() => setShowTipsModal(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Growth tips</h2>
                  <p className="text-blue-100 text-sm">Boost your exposure</p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {tips.map((tip, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{tip.title}</h3>
                    <p className="text-gray-600 text-xs">{tip.description}</p>
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
