import React, { useState } from 'react';
import { Share2, Lightbulb, X } from 'lucide-react';
import { BrandHeader } from './BrandHeader';
import { ExposureMetrics } from './ExposureMetrics';
import { PromoBanner } from './PromoBanner';
import { ServiceSummaryCard } from './ServiceSummaryCard';
import { ActivityFeed } from './ActivityFeed';
import { UpcomingBookings } from './UpcomingBookings';
import { ShareQRPanel } from './ShareQRPanel';
import { DealerOrdersQueue } from './DealerOrdersQueue';
import { useAuth } from '../../context/AuthContext';
import { useDealerProfile } from '../../hooks/useDealerProfile';
import { useExposureMetrics } from '../../hooks/useExposureMetrics';
import { useUpcomingBookings } from '../../hooks/useUpcomingBookings';

interface ProDashboardProps {
  onNavigate?: (view: string, params?: any) => void;
}

const defaultActivity = [
  { id: '1', type: 'lead' as const, title: 'New lead opened', time: '2 hours ago' },
  { id: '2', type: 'view' as const, title: 'Profile viewed 15 times', time: 'Today' },
  { id: '3', type: 'quote_accepted' as const, title: 'Quote accepted', time: 'Yesterday' },
];
export function ProDashboard({ onNavigate }: ProDashboardProps) {
  const { currentUser } = useAuth();
  const { data: dealerProfile } = useDealerProfile(
    currentUser?.role === 'detailer' ? currentUser.id : undefined
  );
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);

  const serviceRadius = dealerProfile?.service_radius_miles ?? (dealerProfile?.services_offered as { serviceRadius?: number })?.serviceRadius ?? 10;
  const dealerServices = (dealerProfile?.services_offered as { specialties?: string[] })?.specialties ?? [];

  const detailer = {
    logo: dealerProfile?.logo_url ?? undefined,
    shopName: dealerProfile?.business_name ?? 'Elite Auto Detailing',
    tagline: 'Perfection in every detail',
    city: dealerProfile?.base_location ?? 'Set your location',
    radiusBadge: `${serviceRadius} mi radius`,
    badges: { verified: true, insured: true },
    rating: 4.9,
    jobCount: 247,
    serviceTags: dealerServices,
  };

  const { metrics, period, setPeriod, loading: metricsLoading } = useExposureMetrics(
    currentUser?.role === 'detailer' ? currentUser.id : undefined
  );
  const { bookings: upcomingBookings, loading: bookingsLoading } = useUpcomingBookings(
    currentUser?.role === 'detailer' ? currentUser.id : undefined
  );

  const dealerPromo = (dealerProfile?.promo as { title?: string; description?: string; startDate?: string; endDate?: string; active?: boolean }) | undefined;
  const promo = dealerPromo?.active && dealerPromo?.title
    ? {
        title: dealerPromo.title,
        description: dealerPromo.description ?? '',
        startDate: dealerPromo.startDate ?? '',
        endDate: dealerPromo.endDate ?? '',
        active: true,
        performanceIndicator: '+23% more visibility',
      }
    : {
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        active: false,
        performanceIndicator: '',
      };

  const tips = [
    { title: 'Add 3 new before/after photos', description: 'Profiles with fresh photos get 40% more views' },
    { title: 'Reply under 10 minutes', description: 'Quick responses increase quote acceptance by 25%' },
    { title: 'Pin a short intro video', description: 'Video intros build trust and boost bookings' },
  ];

  const handleShare = () => setShowSharePanel(true);
  const handleRequestOffer = () => onNavigate?.('pro-public-profile');
  const handleOpenSettings = (tab?: string) => onNavigate?.('settings', tab ? { tab } : {});

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white min-h-full">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Gig header + service summary + quick stats */}
          <div className="lg:col-span-1 space-y-5">
            <BrandHeader
              logo={detailer.logo}
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
              services={dealerServices}
              startingPrice="$99"
              estimatedTime="2–4 hrs"
              serviceRadius={`${serviceRadius} mi`}
              onRequestOffer={handleRequestOffer}
            />

            {/* Share */}
            <button
              onClick={handleShare}
              className="w-full h-14 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-2 shadow-sm"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">Share Profile</span>
            </button>

            {/* Trust: response time */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-0.5">Avg. response time</p>
              <p className="text-xl font-bold text-gray-900">8 min</p>
              <p className="text-xs text-green-600">Faster than most</p>
            </div>
          </div>

          {/* Right: Metrics, promo, orders, activity, bookings */}
          <div className="lg:col-span-2 space-y-5">
            <ExposureMetrics
              {...metrics}
              period={period}
              onPeriodChange={setPeriod}
              loading={metricsLoading}
              onTipsClick={() => setShowTipsModal(true)}
            />

            {/* Orders Queue */}
            {currentUser?.role === 'detailer' && (
              <DealerOrdersQueue dealerId={currentUser.id} onNavigate={onNavigate} />
            )}

            <PromoBanner
              {...promo}
              onCreatePromo={() => handleOpenSettings('promotions')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ActivityFeed items={defaultActivity} />
              <UpcomingBookings bookings={upcomingBookings} loading={bookingsLoading} />
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
