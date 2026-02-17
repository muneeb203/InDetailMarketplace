import React, { useState } from 'react';
import { ArrowLeft, Play, Star } from 'lucide-react';
import { BrandHeader } from './BrandHeader';
import { SocialIcons } from './SocialIcons';
import { BeforeAfterCarousel } from './BeforeAfterCarousel';
import { GalleryLightbox } from './GalleryLightbox';
import { SocialPreviewModal } from './SocialPreviewModal';
import { useAuth } from '../../context/AuthContext';
import { useDealerProfile } from '../../hooks/useDealerProfile';

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
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [selectedSocial, setSelectedSocial] = useState<{ platform: string; handle: string } | null>(null);
  
  const handleBack = () => {
    if (onNavigate) {
      onNavigate('pro-profile-editor');
    } else {
      navigate(-1);
    }
  };

  // Use real dealer profile when available, fallback to mock
  const detailer = {
    logo: dealerProfile?.logo_url ?? undefined,
    shopName: dealerProfile?.business_name ?? 'Elite Auto Detailing',
    tagline: 'Perfection in every detail',
    city: dealerProfile?.base_location ?? 'San Francisco',
    radiusBadge: '15 mi radius',
    badges: {
      verified: true,
      insured: true,
    },
    rating: 4.9,
    jobCount: 247,
  };

  const socialConnections = {
    instagram: { handle: 'eliteautodetailing', connected: true },
    tiktok: { handle: 'eliteautodetail', connected: true },
    youtube: { handle: 'eliteautodetailing', connected: false },
    facebook: { handle: 'eliteautodetail', connected: false },
    googleBusiness: { handle: 'elite-auto-detailing-sf', connected: true },
  };

  const portfolioItems = [
    { id: '1', before: '', after: '', caption: 'Complete Exterior Detail - Black Tesla Model S', tags: ['black paint', 'ceramic coating', 'luxury'] },
    { id: '2', before: '', after: '', caption: 'Interior Deep Clean - Pet Hair Removal', tags: ['pet hair', 'interior', 'odor removal'] },
    { id: '3', before: '', after: '', caption: 'Paint Correction - Swirl Removal', tags: ['paint correction', 'luxury', 'porsche'] },
    { id: '4', before: '', after: '', caption: 'Headlight Restoration', tags: ['headlight restore'] },
  ];

  const services = [
    { name: 'Exterior Wash & Wax', price: 'From $89', time: '1-2 hours' },
    { name: 'Interior Deep Clean', price: 'From $129', time: '2-3 hours' },
    { name: 'Full Detail Package', price: 'From $249', time: '4-5 hours' },
    { name: 'Paint Correction', price: 'From $399', time: '6-8 hours' },
    { name: 'Ceramic Coating', price: 'From $899', time: '2 days' },
    { name: 'RV Detailing', price: 'From $499', time: 'Half day' },
    { name: 'Fleet Services', price: 'Custom pricing', time: 'Flexible' },
  ];

  const reviews = [
    { id: '1', author: 'Sarah M.', rating: 5, text: 'Incredible attention to detail! My car looks brand new. Elite removed all the pet hair and the smell is completely gone.', tags: ['on time', 'pet hair wizard'] },
    { id: '2', author: 'Michael P.', rating: 5, text: 'Best detailer in SF! The paint correction was flawless. Worth every penny.', tags: ['luxury cars', 'paint expert'] },
  ];

  const handleSocialClick = (platform: string) => {
    const social = socialConnections[platform as keyof typeof socialConnections];
    if (social?.connected) {
      setSelectedSocial({ platform, handle: social.handle });
      setShowSocialModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
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

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Brand Header */}
        <BrandHeader {...detailer} />

        {/* Social Strip */}
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <SocialIcons
            {...socialConnections}
            onSocialClick={handleSocialClick}
          />
        </div>

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

        {/* Reviews & Highlights */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-900">Reviews & Highlights</h3>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-xl text-gray-900">4.9</span>
              <span className="text-gray-600">(247)</span>
            </div>
          </div>

          {/* Review keyword tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['on time', 'pet hair wizard', 'luxury cars', 'paint expert', 'professional'].map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>

          {/* Top review */}
          <div className="space-y-4">
            {reviews.slice(0, 1).map((review) => (
              <div key={review.id} className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{review.author}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-2">{review.text}</p>
                <div className="flex flex-wrap gap-1">
                  {review.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 h-11 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:border-blue-400 hover:bg-blue-50 transition-all">
            View All {reviews.length} Reviews
          </button>
        </div>

        {/* Brand Story */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">Our Story</h3>
          <div className="space-y-4 text-gray-700">
            <p>
              Elite Auto Detailing was founded with a simple mission: deliver perfection in every detail. 
              With over 10 years of experience and specialized training in paint correction and ceramic coatings, 
              we bring professional-grade results directly to your location.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">10+</div>
                <div className="text-sm text-gray-600">Years Experience</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">247</div>
                <div className="text-sm text-gray-600">Jobs Completed</div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="font-medium text-gray-900 mb-2">Certifications</div>
              <p className="text-sm">IDA Certified, Paint Correction Specialist</p>
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

      {/* Social Preview Modal */}
      {selectedSocial && (
        <SocialPreviewModal
          isOpen={showSocialModal}
          onClose={() => {
            setShowSocialModal(false);
            setSelectedSocial(null);
          }}
          platform={selectedSocial.platform}
          handle={selectedSocial.handle}
        />
      )}
    </div>
  );
}