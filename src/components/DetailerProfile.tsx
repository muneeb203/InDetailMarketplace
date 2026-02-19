import { useState, useEffect } from 'react';
import { Detailer } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Star, MapPin, Phone, Mail, Crown, CheckCircle2, ArrowLeft, Instagram, Facebook } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PhotoGallery } from './PhotoGallery';
import { fetchDealerSocialLinks, type SocialPlatform } from '../services/dealerSocialService';
import { fetchDealerReviews, fetchDealerRating } from '../services/dealerReviewService';

interface DetailerProfileProps {
  detailer: Detailer;
  onBack: () => void;
  onRequestQuote: () => void;
  onMessage: () => void;
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  );
}

const SOCIAL_ICONS = { instagram: Instagram, tiktok: TikTokIcon, facebook: Facebook } as const;

export function DetailerProfile({ detailer, onBack, onRequestQuote, onMessage }: DetailerProfileProps) {
  const [socialLinks, setSocialLinks] = useState<{ platform: SocialPlatform; url: string }[]>([]);
  const [reviews, setReviews] = useState<{ id: string; rating: number; review_text: string | null; created_at: string; client_name: string }[]>([]);
  const [dealerRating, setDealerRating] = useState<{ rating: number; review_count: number } | null>(null);

  useEffect(() => {
    fetchDealerSocialLinks(detailer.id)
      .then((rows) => setSocialLinks(rows.map((r) => ({ platform: r.platform, url: r.url }))))
      .catch(() => setSocialLinks([]));
  }, [detailer.id]);

  useEffect(() => {
    fetchDealerReviews(detailer.id).then(setReviews).catch(() => setReviews([]));
    fetchDealerRating(detailer.id).then(setDealerRating).catch(() => setDealerRating(null));
  }, [detailer.id]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="p-4">
          <Button variant="ghost" onClick={onBack} className="mb-2">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-24">
        {/* Photo Gallery - logo (profile picture) first, then portfolio */}
        {(detailer.logo ?? detailer.photos?.[0] ?? detailer.avatar) && (
          <div className="relative">
            <ImageWithFallback
              src={detailer.logo ?? detailer.photos?.[0] ?? detailer.avatar}
              alt={detailer.businessName}
              className="w-full h-64 object-cover"
            />
            {detailer.isPro && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-yellow-500 text-white border-0">
                  <Crown className="w-4 h-4 mr-1" />
                  Pro Detailer
                </Badge>
              </div>
            )}
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Business Info */}
          <div>
            <h1 className="mb-2">{detailer.businessName}</h1>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span>{(dealerRating?.rating ?? detailer.rating ?? 0).toFixed(1)}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{dealerRating?.review_count ?? detailer.reviewCount ?? 0} reviews</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{detailer.priceRange}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <MapPin className="w-5 h-5" />
              <span>{detailer.serviceArea}</span>
            </div>

            {/* Social icons */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                {socialLinks.map((link) => {
                  const Icon = SOCIAL_ICONS[link.platform];
                  const label = link.platform.charAt(0).toUpperCase() + link.platform.slice(1);
                  return (
                    <button
                      key={link.platform}
                      onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                      title={`Visit ${label}`}
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <Icon className="w-5 h-5 text-gray-600" />
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>{detailer.completedJobs} jobs completed</span>
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="mb-2">About</h3>
            <p className="text-gray-700">{detailer.bio}</p>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-3">Services Offered</h3>
            <div className="flex flex-wrap gap-2">
              {detailer.services.map(service => (
                <Badge key={service} variant="secondary">
                  {service}
                </Badge>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-3">Contact Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-5 h-5 text-gray-400" />
                <span>{detailer.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="w-5 h-5 text-gray-400" />
                <span>{detailer.email}</span>
              </div>
            </div>
          </div>

          {/* Portfolio Gallery */}
          {detailer.portfolioPhotos && detailer.portfolioPhotos.length > 0 && (
            <div>
              <PhotoGallery
                photos={detailer.portfolioPhotos}
                title="Portfolio"
                showVerifiedBadge={detailer.isPro}
              />
            </div>
          )}

          {/* Legacy Photo Gallery (fallback if no portfolio) */}
          {(!detailer.portfolioPhotos || detailer.portfolioPhotos.length === 0) && detailer.photos.length > 1 && (
            <div>
              <h3 className="mb-3">Work Gallery</h3>
              <div className="grid grid-cols-2 gap-3">
                {detailer.photos.slice(1).map((photo, index) => (
                  <ImageWithFallback
                    key={index}
                    src={photo}
                    alt={`Work sample ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div>
            <h3 className="mb-3">Recent Reviews</h3>
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        • {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    {review.review_text && <p className="text-sm text-gray-700 mb-2">{review.review_text}</p>}
                    <p className="text-sm text-gray-500 mt-1">- {review.client_name}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 py-4">No reviews yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            onClick={onMessage}
            variant="outline"
            className="flex-1"
          >
            Message
          </Button>
          <Button
            onClick={onRequestQuote}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Request Quote
          </Button>
        </div>
      </div>
    </div>
  );
}
