import { Detailer } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Star, MapPin, Phone, Mail, Crown, CheckCircle2, ArrowLeft } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PhotoGallery } from './PhotoGallery';

interface DetailerProfileProps {
  detailer: Detailer;
  onBack: () => void;
  onRequestQuote: () => void;
  onMessage: () => void;
}

export function DetailerProfile({ detailer, onBack, onRequestQuote, onMessage }: DetailerProfileProps) {
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
        {/* Photo Gallery */}
        {detailer.photos.length > 0 && (
          <div className="relative">
            <ImageWithFallback
              src={detailer.photos[0]}
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
                <span>{detailer.rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{detailer.reviewCount} reviews</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{detailer.priceRange}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <MapPin className="w-5 h-5" />
              <span>{detailer.serviceArea}</span>
            </div>

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

          {/* Reviews Section Placeholder */}
          <div>
            <h3 className="mb-3">Recent Reviews</h3>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">• 2 weeks ago</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Great service! My car looks brand new. Very professional and thorough.
                  </p>
                  <p className="text-sm text-gray-500 mt-1">- Customer</p>
                </div>
              ))}
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
