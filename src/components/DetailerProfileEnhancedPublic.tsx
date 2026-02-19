import { useState, useEffect, useRef } from 'react';
import { Detailer } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Shield, 
  Award, 
  Phone, 
  Mail, 
  Crown,
  Instagram,
  Youtube,
  Facebook,
  Play,
  Eye,
  BadgeCheck,
  Sparkles,
  Bookmark,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { trackProfileView, toggleDealerSave, getPublicDealerStats, isDealerSavedByClient } from '../services/exposureService';
import { fetchDealerSocialLinks, type SocialPlatform } from '../services/dealerSocialService';
import { fetchDealerReviews, fetchDealerRating } from '../services/dealerReviewService';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BeforeAfterCarousel } from './BeforeAfterCarousel';
import { TrustCuesBadge } from './TrustCuesBadge';

interface DetailerProfileEnhancedPublicProps {
  detailer: Detailer;
  onBack: () => void;
  onRequestQuote: () => void;
  onMessage: () => void;
}

export function DetailerProfileEnhancedPublic({
  detailer,
  onBack,
  onRequestQuote,
  onMessage,
}: DetailerProfileEnhancedPublicProps) {
  const { currentUser } = useAuth();
  const [dealerSocialLinks, setDealerSocialLinks] = useState<{ platform: SocialPlatform; url: string }[]>([]);
  const [reviews, setReviews] = useState<{ id: string; rating: number; review_text: string | null; created_at: string; client_name: string }[]>([]);
  const [dealerRating, setDealerRating] = useState<{ rating: number; review_count: number } | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [publicStats, setPublicStats] = useState<{ profile_views: number; saves: number } | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const profileViewTracked = useRef(false);

  // Track profile view once per page load (do not block UI)
  useEffect(() => {
    if (profileViewTracked.current) return;
    profileViewTracked.current = true;
    const viewerId = currentUser?.id ?? null;
    if (viewerId === detailer.id) return; // Don't track own profile
    trackProfileView(detailer.id, viewerId);
  }, [detailer.id, currentUser?.id]);

  // Fetch public stats (profile views, saves) and saved state for clients
  useEffect(() => {
    getPublicDealerStats(detailer.id).then(setPublicStats);
    if (currentUser?.role === 'client') {
      isDealerSavedByClient(detailer.id, currentUser.id).then(setIsSaved);
    }
  }, [detailer.id, currentUser?.id, currentUser?.role]);

  // Fetch dealer social links for gig page
  useEffect(() => {
    fetchDealerSocialLinks(detailer.id)
      .then((rows) => setDealerSocialLinks(rows.map((r) => ({ platform: r.platform, url: r.url }))))
      .catch(() => setDealerSocialLinks([]));
  }, [detailer.id]);

  // Fetch dealer reviews and rating
  useEffect(() => {
    fetchDealerReviews(detailer.id).then(setReviews).catch(() => setReviews([]));
    fetchDealerRating(detailer.id).then(setDealerRating).catch(() => setDealerRating(null));
  }, [detailer.id]);

  const handleSaveToggle = async () => {
    if (currentUser?.role !== 'client') return;
    const saved = await toggleDealerSave(detailer.id, currentUser.id);
    setIsSaved(saved);
    setPublicStats((s) => s ? { ...s, saves: s.saves + (saved ? 1 : -1) } : { profile_views: 0, saves: saved ? 1 : 0 });
  };

  const handleSocialClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Mock before/after photos
  const mockBeforeAfterPhotos = detailer.beforeAfterPhotos || [
    {
      id: '1',
      beforeUrl: 'https://images.unsplash.com/photo-1449130015084-2d48d6b97f0a?w=600&q=80',
      afterUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80',
      category: 'Interior Deep Clean',
      description: 'Complete interior restoration with steam cleaning and conditioning',
    },
    {
      id: '2',
      beforeUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80',
      afterUrl: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600&q=80',
      category: 'Exterior Detail',
      description: 'Paint correction and ceramic coating application',
    },
    {
      id: '3',
      beforeUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&q=80',
      afterUrl: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&q=80',
      category: 'Engine Bay',
      description: 'Engine detailing and protection',
    },
  ];

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return Instagram;
      case 'youtube':
        return Youtube;
      case 'facebook':
        return Facebook;
      case 'tiktok':
        return () => (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
          </svg>
        );
      case 'google-business':
        return () => (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        );
      default:
        return Facebook;
    }
  };

  const getSocialPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600';
      case 'tiktok':
        return 'bg-black hover:bg-gray-800';
      case 'youtube':
        return 'bg-red-600 hover:bg-red-700';
      case 'facebook':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'google-business':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  // Mock services with pricing
  const servicesWithPricing = [
    { name: 'Basic Wash & Wax', price: '$79', popular: false },
    { name: 'Interior Deep Clean', price: '$129', popular: true },
    { name: 'Exterior Detail', price: '$149', popular: true },
    { name: 'Full Detail', price: '$249', popular: false },
    { name: 'Paint Correction', price: '$399', popular: false },
    { name: 'Ceramic Coating', price: '$699', popular: false },
    { name: 'Headlight Restoration', price: '$89', popular: false },
    { name: 'Engine Bay Detail', price: '$79', popular: false },
    { name: 'Pet Hair Removal', price: '+$49', popular: false },
    { name: 'Odor Elimination', price: '+$59', popular: false },
    { name: 'RV Detailing', price: 'Custom', popular: false },
    { name: 'Fleet Services', price: 'Custom', popular: false },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="p-4">
          <Button variant="ghost" onClick={onBack} className="gap-2 hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-24">
        {/* Brand Header Card */}
        {/* Gig Brief Details */}
        <Card className="m-4 p-6 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border-2 border-blue-100">
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-3">Gig Details</p>
          <div className="flex gap-4 mb-4">
            {/* Logo/Avatar */}
            <div className="relative flex-shrink-0">
              <ImageWithFallback
                src={detailer.logo || detailer.avatar}
                alt={detailer.businessName}
                className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-lg"
              />
              {detailer.isPro && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Business Info */}
            <div className="flex-1">
              <h1 className="mb-1">{detailer.businessName}</h1>
              {detailer.tagline && (
                <p className="text-gray-600 mb-2">{detailer.tagline}</p>
              )}
              
              {/* Location & Radius */}
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{detailer.location}</span>
                {detailer.serviceRadius && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-0">
                    {detailer.serviceRadius} mile radius
                  </Badge>
                )}
              </div>

              {/* Trust Badges */}
              <TrustCuesBadge detailer={detailer} variant="compact" showExposure={false} />
            </div>
          </div>

          {/* Rating & Stats */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="font-medium">{(dealerRating?.rating ?? detailer.rating ?? 0).toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({dealerRating?.review_count ?? detailer.reviewCount ?? 0} reviews)</span>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1 text-gray-600">
              <BadgeCheck className="w-4 h-4" />
              <span className="text-sm">{detailer.completedJobs} jobs completed</span>
            </div>
            {detailer.yearsInBusiness && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-600">{detailer.yearsInBusiness}+ years</span>
              </>
            )}
          </div>
        </Card>

        {/* Social Strip - only show when dealer has social links */}
        {dealerSocialLinks.length > 0 && (
          <Card className="mx-4 mb-4 p-4">
            <div className="flex items-center gap-2 mb-3">
              <h4>Follow Us</h4>
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-0 text-xs">
                Socials Connected
              </Badge>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dealerSocialLinks.map((social) => {
                const Icon = getSocialIcon(social.platform);
                const label = social.platform.charAt(0).toUpperCase() + social.platform.slice(1);
                return (
                  <Button
                    key={social.platform}
                    onClick={() => handleSocialClick(social.url)}
                    title={`Visit ${label}`}
                    className={`flex-shrink-0 gap-2 ${getSocialPlatformColor(social.platform)} text-white transition-transform hover:scale-105`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </Button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">View our latest work and customer transformations</p>
          </Card>
        )}

        {/* Video Intro (if available) */}
        {detailer.introVideoUrl && (
          <Card className="mx-4 mb-4 overflow-hidden">
            <div className="relative aspect-video bg-gray-900">
              {!videoPlaying ? (
                <>
                  <ImageWithFallback
                    src={detailer.photos[0] || 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80'}
                    alt="Video intro"
                    className="w-full h-full object-cover opacity-60"
                  />
                  <Button
                    onClick={() => setVideoPlaying(true)}
                    className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-white/95 hover:bg-white shadow-2xl"
                  >
                    <Play className="w-8 h-8 text-blue-600 ml-1" />
                  </Button>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className="bg-blue-600 text-white">Meet Your Detailer - 30 sec intro</Badge>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <p>Video player would load here</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Before/After Carousel */}
        {mockBeforeAfterPhotos.length > 0 && (
          <div className="mx-4 mb-4">
            <BeforeAfterCarousel photos={mockBeforeAfterPhotos} />
          </div>
        )}

        {/* Services & Pricing */}
        <Card className="mx-4 mb-4 p-6">
          <h3 className="mb-4">Services & Starting Prices</h3>
          <div className="grid grid-cols-1 gap-2">
            {servicesWithPricing.map((service) => (
              <div
                key={service.name}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                  service.popular
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{service.name}</span>
                  {service.popular && (
                    <Badge className="bg-blue-600 text-white text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
                <span className="font-medium text-blue-600">{service.price}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900">
              💡 Prices shown are starting rates. Final quote depends on vehicle condition and specific needs.
            </p>
          </div>
        </Card>

        {/* Reviews & Highlights */}
        <Card className="mx-4 mb-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3>Reviews & Highlights</h3>
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
              <span className="text-2xl font-medium">{(dealerRating?.rating ?? detailer.rating ?? 0).toFixed(1)}</span>
              <span className="text-gray-500">/ 5</span>
              <span className="text-gray-500 text-sm">({dealerRating?.review_count ?? detailer.reviewCount ?? 0} reviews)</span>
            </div>
          </div>

          {/* Reviews from dealer_reviews */}
          <div className="space-y-3">
            {reviews.length > 0 ? (
              reviews.slice(0, 10).map((review) => (
                <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      • {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {review.review_text && <p className="text-sm text-gray-700 mb-2">{review.review_text}</p>}
                  <p className="text-sm font-medium text-gray-600">- {review.client_name}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">No reviews yet.</p>
            )}
          </div>
        </Card>

        {/* Brand Story */}
        <Card className="mx-4 mb-4 p-6 bg-gradient-to-br from-white to-blue-50">
          <h3 className="mb-3">About {detailer.businessName}</h3>
          <p className="text-gray-700 mb-4">{detailer.bio}</p>
          
          {detailer.certifications && detailer.certifications.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm mb-2">Certifications & Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {detailer.certifications.map((cert) => (
                  <Badge key={cert} className="bg-blue-600 text-white">
                    <Award className="w-3 h-3 mr-1" />
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {detailer.specialties && detailer.specialties.length > 0 && (
            <div>
              <h4 className="text-sm mb-2">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {detailer.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Save Dealer + Exposure indicator */}
        <div className="mx-4 mb-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          {currentUser?.role === 'client' && (
            <Button
              variant={isSaved ? 'default' : 'outline'}
              size="sm"
              onClick={handleSaveToggle}
              className="gap-2"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved' : 'Save Dealer'}
              {(publicStats?.saves ?? 0) > 0 && (
                <span className="text-xs opacity-80">({(publicStats?.saves ?? 0).toLocaleString()})</span>
              )}
            </Button>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Eye className="w-4 h-4" />
            <span>
              Seen by {(publicStats?.profile_views ?? 0).toLocaleString()} customers
            </span>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTAs - Text Dealer & Request Quote */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-30">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            onClick={onMessage}
            variant="outline"
            className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 gap-2"
          >
            <Mail className="w-4 h-4" />
            Text Dealer
          </Button>
          <Button
            onClick={onRequestQuote}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg gap-2"
          >
            Request Service
          </Button>
        </div>
      </div>

    </div>
  );
}
