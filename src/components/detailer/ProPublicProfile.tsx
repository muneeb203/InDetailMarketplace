import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Star, Instagram, Facebook } from 'lucide-react';
import { BrandHeader } from './BrandHeader';
import { BeforeAfterCarousel } from './BeforeAfterCarousel';
import { GalleryLightbox } from './GalleryLightbox';
import { useAuth } from '../../context/AuthContext';
import { useDealerProfile } from '../../hooks/useDealerProfile';
import { fetchDealerSocialLinks, type SocialPlatform } from '../../services/dealerSocialService';
import { getDealerCompletedOrdersCount } from '../../services/orderService';
import { fetchDealerReviews, fetchDealerRating } from '../../services/dealerReviewService';

// Helper to get navigation functions (works with or without react-router)
function useNav() {
  try {
    const { useNavigate: rUseNavigate } = require('react-router-dom');
    return rUseNavigate();
  } catch {
    return (path: string | number) => {
      if (path === -1) {
        window.history.back();
      }
    };
  }
}

interface ProPublicProfileProps {
  onNavigate?: (view: string, params?: any) => void;
}

export function ProPublicProfile({ onNavigate }: ProPublicProfileProps = {}) {
  const navigate = useNav();
  const { currentUser } = useAuth();
  const { data: dealerProfile } = useDealerProfile(
    currentUser?.role === 'detailer' ? currentUser.id : undefined
  );
  const [showGallery, setShowGallery] = useState(false);
  const [socialLinks, setSocialLinks] = useState<{ platform: SocialPlatform; url: string }[]>([]);
  const [completedJobs, setCompletedJobs] = useState<number>(0);
  const [reviews, setReviews] = useState<{ id: string; rating: number; review_text: string | null; created_at: string; client_name: string }[]>([]);
  const [dealerRating, setDealerRating] = useState<{ rating: number; review_count: number } | null>(null);

  useEffect(() => {
    if (currentUser?.role === 'detailer' && currentUser.id) {
      fetchDealerSocialLinks(currentUser.id)
        .then((rows) => setSocialLinks(rows.map((r) => ({ platform: r.platform, url: r.url }))))
        .catch(() => setSocialLinks([]));
    }
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    if (currentUser?.role === 'detailer' && currentUser.id) {
      getDealerCompletedOrdersCount(currentUser.id).then(setCompletedJobs);
    }
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    if (currentUser?.role === 'detailer' && currentUser.id) {
      fetchDealerReviews(currentUser.id).then(setReviews).catch(() => setReviews([]));
      fetchDealerRating(currentUser.id).then(setDealerRating).catch(() => setDealerRating(null));
    }
  }, [currentUser?.id, currentUser?.role]);
  
  const handleBack = () => {
    if (onNavigate) {
      onNavigate('settings');
    } else {
      navigate(-1);
    }
  };

  const serviceRadius = dealerProfile?.service_radius_miles ?? (dealerProfile?.services_offered as { serviceRadius?: number })?.serviceRadius ?? 10;
  const dealerServices = (dealerProfile?.services_offered as { specialties?: string[] })?.specialties ?? [];

  // Use real dealer profile when available, fallback to mock
  const detailer = {
    logo: dealerProfile?.logo_url ?? undefined,
    shopName: dealerProfile?.business_name ?? 'Elite Auto Detailing',
    tagline: 'Perfection in every detail',
    city: dealerProfile?.base_location ?? 'Set your location',
    radiusBadge: `${serviceRadius} mi radius`,
    serviceTags: dealerServices,
    badges: {
      verified: true,
      insured: true,
    },
    rating: dealerRating?.rating ?? 0,
    jobCount: completedJobs,
  };

  const portfolioItems = [
    { id: '1', before: '', after: '', caption: 'Complete Exterior Detail - Black Tesla Model S', tags: ['black paint', 'ceramic coating', 'luxury'] },
    { id: '2', before: '', after: '', caption: 'Interior Deep Clean - Pet Hair Removal', tags: ['pet hair', 'interior', 'odor removal'] },
    { id: '3', before: '', after: '', caption: 'Paint Correction - Swirl Removal', tags: ['paint correction', 'luxury', 'porsche'] },
    { id: '4', before: '', after: '', caption: 'Headlight Restoration', tags: ['headlight restore'] },
  ];

  const services = dealerServices.length > 0
    ? dealerServices.map((name) => ({ name, price: 'Custom', time: '—' }))
    : [
        { name: 'Exterior Wash & Wax', price: 'From $89', time: '1-2 hours' },
        { name: 'Interior Deep Clean', price: 'From $129', time: '2-3 hours' },
        { name: 'Full Detail Package', price: 'From $249', time: '4-5 hours' },
      ];

  const handleSocialClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  function TikTokIcon({ className }: { className?: string }) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
      </svg>
    );
  }
  const SOCIAL_ICONS = { instagram: Instagram, tiktok: TikTokIcon, facebook: Facebook } as const;

  return (
    <div className="flex flex-col h-full min-h-0 bg-gradient-to-b from-gray-50 to-white">
      {/* Header - fixed */}
      <div className="flex-shrink-0 bg-white border-b z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="font-semibold text-gray-900">Public Profile Preview</h1>
            <p className="text-xs text-gray-600">This is how customers see your profile</p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 space-y-4 pb-24">
        {/* Brand Header */}
        <BrandHeader {...detailer} />

        {/* Social Strip - from dealer_social_links */}
        {socialLinks.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-900">Follow Us</span>
              <span className="text-xs text-gray-500">({socialLinks.length} connected)</span>
            </div>
            <div className="flex items-center gap-2">
              {socialLinks.map((link) => {
                const Icon = SOCIAL_ICONS[link.platform];
                const label = link.platform.charAt(0).toUpperCase() + link.platform.slice(1);
                const colors: Record<SocialPlatform, string> = {
                  instagram: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
                  tiktok: 'bg-black',
                  facebook: 'bg-blue-600',
                };
                return (
                  <button
                    key={link.platform}
                    onClick={() => handleSocialClick(link.url)}
                    title={`Visit ${label}`}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95 ${colors[link.platform]}`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">Add your social links in Settings → Social to show them here.</p>
          </div>
        )}

        {/* Video Intro */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-blue-900 to-indigo-900 relative flex items-center justify-center cursor-pointer group">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-blue-600 ml-1" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white font-medium">Meet Your Detailer - Introduction Video</p>
            </div>
          </div>
        </div>

        {/* Before/After Carousel */}
        <BeforeAfterCarousel
          items={portfolioItems}
          onViewGallery={() => setShowGallery(true)}
        />

        {/* Services & Pricing */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">Services & Starting Prices</h3>
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">{service.name}</div>
                  <div className="text-sm text-gray-600">{service.time}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">{service.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews & Highlights - real client reviews only */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-900">Reviews & Highlights</h3>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-xl text-gray-900">{(dealerRating?.rating ?? 0).toFixed(1)}</span>
              <span className="text-gray-600">({dealerRating?.review_count ?? 0} reviews)</span>
            </div>
          </div>

          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{review.client_name}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.review_text && <p className="text-gray-700 text-sm leading-relaxed">{review.review_text}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">No reviews yet. Reviews will appear here after clients complete orders and leave feedback.</p>
            )}
          </div>
        </div>

        {/* Brand Story / Our Story - from dealer_profiles.bio */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">Our Story</h3>
          <div className="space-y-4 text-gray-700">
            {dealerProfile?.bio ? (
              <p className="whitespace-pre-line">{dealerProfile.bio}</p>
            ) : (
              <p className="text-gray-500 italic">Add your bio in Settings → Profile to tell customers about your business.</p>
            )}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              {dealerProfile?.years_in_business != null && dealerProfile.years_in_business > 0 && (
                <div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">{dealerProfile.years_in_business}+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
              )}
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">{completedJobs}</div>
                <div className="text-sm text-gray-600">Jobs Completed</div>
              </div>
            </div>
            {dealerProfile?.certifications && dealerProfile.certifications.length > 0 && (
              <div className="pt-4 border-t">
                <div className="font-medium text-gray-900 mb-2">Certifications</div>
                <p className="text-sm">{dealerProfile.certifications.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Sticky Request Quote Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/client/request-quote')}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all active:scale-95 shadow-lg"
          >
            Request Quote
          </button>
        </div>
      </div>

      {/* Gallery Lightbox */}
      <GalleryLightbox
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        items={portfolioItems}
      />

    </div>
  );
}