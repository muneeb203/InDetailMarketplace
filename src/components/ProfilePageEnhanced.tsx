import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar } from './ui/avatar';
import { Detailer } from '../types';
import {
  Edit3, Check, X, MapPin, Star, Clock, Award, Verified,
  MessageCircle, DollarSign, Camera, Plus, GripVertical, Trash2,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { PortfolioManager } from './PortfolioManager';
import { ServiceRadiusSelector } from './ServiceRadiusSelector';
import { ServiceSpecialtiesSelector } from './ServiceSpecialtiesSelector';
import { OperatingHoursEditor } from './OperatingHoursEditor';
import { TrustBadges } from './TrustBadges';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from "sonner";
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ProfilePageEnhancedProps {
  detailer: Detailer;
  isOwnProfile?: boolean;
  userLocation?: { lat: number; lng: number };
  onUpdate?: (updates: Partial<Detailer>) => void;
  onRequestQuote?: () => void;
  onMessage?: () => void;
}

export function ProfilePageEnhanced({
  detailer,
  isOwnProfile = false,
  userLocation,
  onUpdate,
  onRequestQuote,
  onMessage,
}: ProfilePageEnhancedProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<Detailer>>(detailer);
  const [showPortfolioManager, setShowPortfolioManager] = useState(false);
  const [showServiceAreaEditor, setShowServiceAreaEditor] = useState(false);

  // Calculate distance if user location available
  const distance = userLocation && detailer.location
    ? calculateDistance(userLocation, parseLocation(detailer.location))
    : null;

  const isInServiceArea = distance !== null && detailer.serviceRadius
    ? distance <= detailer.serviceRadius
    : false;

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editedData);
      toast.success('Profile updated', {
        description: 'Your changes have been saved successfully.',
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(detailer);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Top Actions */}
          <div className="flex items-center justify-between">
            {isOwnProfile && (
              <Button
                variant={isEditing ? 'ghost' : 'outline'}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="gap-2"
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </>
                )}
              </Button>
            )}
            {!isOwnProfile && (
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMessage}
                  className="gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </Button>
                <Button
                  onClick={onRequestQuote}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Request Quote
                </Button>
              </div>
            )}
          </div>

          {/* Profile Header */}
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              {isEditing ? (
                <div className="relative group">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <ImageWithFallback
                      src={editedData.avatar || detailer.avatar}
                      alt={detailer.businessName}
                      className="w-full h-full object-cover"
                    />
                  </Avatar>
                  <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                </div>
              ) : (
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <ImageWithFallback
                    src={detailer.avatar}
                    alt={detailer.businessName}
                    className="w-full h-full object-cover"
                  />
                </Avatar>
              )}
            </div>

            {/* Name, Tagline, and Details */}
            <div className="flex-1 space-y-3">
              {isEditing ? (
                <Input
                  value={editedData.businessName || ''}
                  onChange={(e) =>
                    setEditedData({ ...editedData, businessName: e.target.value })
                  }
                  placeholder="Business Name"
                  className="text-2xl h-auto p-2"
                />
              ) : (
                <h1>{detailer.businessName}</h1>
              )}

              {/* Tagline */}
              {isEditing ? (
                <Input
                  value={editedData.tagline || ''}
                  onChange={(e) =>
                    setEditedData({ ...editedData, tagline: e.target.value })
                  }
                  placeholder="Your professional tagline..."
                  className="text-sm"
                />
              ) : detailer.tagline ? (
                <p className="text-gray-600">{detailer.tagline}</p>
              ) : null}

              {/* Trust Badges & Metrics */}
              <div className="flex items-center gap-3 flex-wrap">
                {detailer.isPro && (
                  <Badge className="gap-1 bg-gradient-to-r from-yellow-500 to-amber-500 border-0">
                    <Verified className="w-3 h-3" />
                    Verified Detailer
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{detailer.rating.toFixed(1)}</span>
                  <span className="text-gray-500">({detailer.reviewCount || 0})</span>
                </div>
                {distance !== null && (
                  <Badge variant="secondary" className="gap-1">
                    <MapPin className="w-3 h-3" />
                    {distance.toFixed(1)} mi
                  </Badge>
                )}
                {isInServiceArea && (
                  <Badge className="gap-1 bg-green-100 text-green-700 border-green-200">
                    <Navigation className="w-3 h-3" />
                    Serves your area
                  </Badge>
                )}
              </div>

              {/* Wallet for Own Profile */}
              {isOwnProfile && !isEditing && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-sm">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-900">{detailer.wallet} credits</span>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">
                    Buy Credits
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mini Portfolio Carousel */}
          {!isEditing && detailer.portfolioImages && detailer.portfolioImages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
              {detailer.portfolioImages.slice(0, 3).map((img, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-200"
                >
                  <ImageWithFallback
                    src={img.url}
                    alt={img.label || `Portfolio ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {detailer.portfolioImages.length > 3 && (
                <div className="flex-shrink-0 w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                  <span className="text-gray-500 text-sm">
                    +{detailer.portfolioImages.length - 3} more
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Save/Cancel Actions in Edit Mode */}
          {isEditing && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <Button onClick={handleSave} className="gap-2">
                <Check className="w-4 h-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-4xl mx-auto p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            {isEditing && <TabsTrigger value="settings">Settings</TabsTrigger>}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Services & Specialties */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Services & Specialties
              </h3>
              {isEditing ? (
                <ServiceSpecialtiesSelector
                  selectedSpecialties={editedData.specialties || detailer.specialties || []}
                  onChange={(specialties) =>
                    setEditedData({ ...editedData, specialties })
                  }
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {detailer.services.map((service) => (
                    <Badge key={service} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                  {detailer.specialties?.map((specialty) => (
                    <Badge
                      key={specialty}
                      className="bg-blue-100 text-blue-700 border-blue-200"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>

            {/* About */}
            <Card className="p-6">
              <h3 className="mb-4">About</h3>
              {isEditing ? (
                <Textarea
                  value={editedData.bio || ''}
                  onChange={(e) =>
                    setEditedData({ ...editedData, bio: e.target.value })
                  }
                  placeholder="Tell customers about your experience and what makes you unique..."
                  className="min-h-[120px]"
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-line">{detailer.bio}</p>
              )}
            </Card>

            {/* Operating Hours */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Operating Hours
              </h3>
              {isEditing ? (
                <OperatingHoursEditor
                  hours={editedData.operatingHours || detailer.operatingHours || {}}
                  onChange={(operatingHours) =>
                    setEditedData({ ...editedData, operatingHours })
                  }
                />
              ) : detailer.operatingHours ? (
                <div className="space-y-2 text-sm">
                  {Object.entries(detailer.operatingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{day}</span>
                      <span>
                        {hours.isOpen ? `${hours.open} - ${hours.close}` : 'Closed'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No hours set</p>
              )}
            </Card>

            {/* Service Area */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Service Area
              </h3>
              {isEditing ? (
                <div className="space-y-3">
                  <ServiceRadiusSelector
                    center={detailer.serviceArea?.center}
                    radius={editedData.serviceRadius || detailer.serviceRadius || 10}
                    onRadiusChange={(serviceRadius) =>
                      setEditedData({ ...editedData, serviceRadius })
                    }
                    onCenterChange={(center) =>
                      setEditedData({
                        ...editedData,
                        serviceArea: { center, radius: editedData.serviceRadius || 10 },
                      })
                    }
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    Serving within {detailer.serviceRadius || 10} miles of {detailer.location}
                  </p>
                  {detailer.serviceArea?.center && (
                    <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Trust Metrics */}
            {!isEditing && (
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                <h3 className="mb-4">Why Choose {detailer.businessName}?</h3>
                <TrustBadges detailer={detailer} variant="detailed" />
                <p className="text-sm text-gray-600 mt-4 italic">
                  Trusted local pros tailoring care to your vehicle.
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="mt-6">
            {isEditing ? (
              <PortfolioManager
                images={editedData.portfolioImages || detailer.portfolioImages || []}
                onChange={(portfolioImages) =>
                  setEditedData({ ...editedData, portfolioImages })
                }
              />
            ) : detailer.portfolioImages && detailer.portfolioImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {detailer.portfolioImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-2xl overflow-hidden bg-gray-100"
                  >
                    <ImageWithFallback
                      src={img.url}
                      alt={img.label || `Portfolio ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {img.label && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <p className="text-white text-sm">{img.label}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="mb-2">No portfolio images yet</h3>
                <p className="text-gray-500 text-sm">
                  Add your first portfolio image to stand out
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-6">
            <Card className="p-6 text-center">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="mb-2">Reviews coming soon</h3>
              <p className="text-gray-500 text-sm">
                Customer reviews will be displayed here
              </p>
            </Card>
          </TabsContent>

          {/* Settings Tab (Edit Mode Only) */}
          {isEditing && (
            <TabsContent value="settings" className="space-y-6 mt-6">
              <Card className="p-6">
                <h3 className="mb-4">Business Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">
                      Business Logo
                    </label>
                    <div className="flex items-center gap-4">
                      {editedData.logo ? (
                        <ImageWithFallback
                          src={editedData.logo}
                          alt="Logo"
                          className="w-16 h-16 rounded-lg border"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Camera className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <Button variant="outline" size="sm">
                        Upload Logo
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

// Utility functions
function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function parseLocation(location: string): { lat: number; lng: number } {
  // Simple mock - in real app would geocode
  return { lat: 0, lng: 0 };
}
