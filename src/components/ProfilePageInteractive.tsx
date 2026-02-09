import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { VisuallyHidden } from './ui/visually-hidden';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileData {
  name: string;
  tagline: string;
  bio: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  yearsExperience: number;
  isVerified: boolean;
  distance: string;
  phone: string;
  email: string;
  specialties: string[];
  operatingHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  portfolio: string[];
  serviceArea: string;
}

const mockProfile: ProfileData = {
  name: 'Mike Johnson',
  tagline: 'Premium Auto Detailing Specialist',
  bio: 'Professional detailer with over 8 years of experience. Specializing in ceramic coatings, paint correction, and high-end vehicle care. I take pride in delivering showroom-quality results for every vehicle.',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
  rating: 4.9,
  reviewCount: 127,
  completedJobs: 342,
  yearsExperience: 8,
  isVerified: true,
  distance: '2.3 miles away',
  phone: '(555) 123-4567',
  email: 'mike@detailpro.com',
  specialties: ['Ceramic Coating', 'Paint Correction', 'Interior Deep Clean', 'Engine Bay Clean'],
  operatingHours: {
    Monday: { open: '8:00 AM', close: '6:00 PM', closed: false },
    Tuesday: { open: '8:00 AM', close: '6:00 PM', closed: false },
    Wednesday: { open: '8:00 AM', close: '6:00 PM', closed: false },
    Thursday: { open: '8:00 AM', close: '6:00 PM', closed: false },
    Friday: { open: '8:00 AM', close: '6:00 PM', closed: false },
    Saturday: { open: '9:00 AM', close: '4:00 PM', closed: false },
    Sunday: { open: '', close: '', closed: true },
  },
  portfolio: [
    'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800',
    'https://images.unsplash.com/photo-1621993202323-f438eec934ff?w=800',
    'https://images.unsplash.com/photo-1632823471565-1ecdf7610f1e?w=800',
    'https://images.unsplash.com/photo-1600704339988-f6ee5d4bd8f8?w=800',
    'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800',
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
  ],
  serviceArea: 'San Francisco Bay Area',
};

export function ProfilePageInteractive({ 
  isOwner = false,
  onMessageClick,
  onRequestQuote,
}: { 
  isOwner?: boolean;
  onMessageClick?: () => void;
  onRequestQuote?: () => void;
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(mockProfile);
  const [editedData, setEditedData] = useState<ProfileData>(mockProfile);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleSave = () => {
    setProfileData(editedData);
    setIsEditMode(false);
    setShowSaveDialog(false);
  };

  const handleCancel = () => {
    if (JSON.stringify(editedData) !== JSON.stringify(profileData)) {
      // Show warning if there are unsaved changes
      setShowSaveDialog(true);
    } else {
      setIsEditMode(false);
    }
  };

  const handleDiscardChanges = () => {
    setEditedData(profileData);
    setIsEditMode(false);
    setShowSaveDialog(false);
  };

  const removePortfolioImage = (index: number) => {
    setEditedData({
      ...editedData,
      portfolio: editedData.portfolio.filter((_, i) => i !== index),
    });
  };

  const addPortfolioImage = () => {
    // In production, this would open file picker
    const newImage = 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800';
    setEditedData({
      ...editedData,
      portfolio: [...editedData.portfolio, newImage],
    });
  };

  const toggleSpecialty = (specialty: string) => {
    const specialties = editedData.specialties.includes(specialty)
      ? editedData.specialties.filter(s => s !== specialty)
      : [...editedData.specialties, specialty];
    setEditedData({ ...editedData, specialties });
  };

  const availableSpecialties = [
    'Ceramic Coating',
    'Paint Correction',
    'Interior Deep Clean',
    'Engine Bay Clean',
    'Headlight Restoration',
    'Wax & Polish',
    'Pet Hair Removal',
    'Odor Removal',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF5FF] to-white pb-24">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#0078FF] to-[#0056CC] text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8 relative">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                <AvatarImage src={profileData.avatar} />
                <AvatarFallback>{profileData.name[0]}</AvatarFallback>
              </Avatar>
              {isEditMode && (
                <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </button>
              )}
              {profileData.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="w-5 h-5 text-[#0078FF]" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              {isEditMode ? (
                <div className="space-y-2">
                  <Input
                    value={editedData.name}
                    onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                    className="h-10 bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  />
                  <Input
                    value={editedData.tagline}
                    onChange={(e) => setEditedData({ ...editedData, tagline: e.target.value })}
                    className="h-9 bg-white/20 border-white/30 text-white placeholder:text-white/60 text-sm"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl mb-1 flex items-center gap-2">
                    {profileData.name}
                    {profileData.isVerified && (
                      <Badge className="bg-white/20 text-white border-white/30">
                        <Check className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </h1>
                  <p className="text-white/90 mb-3">{profileData.tagline}</p>
                </>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(profileData.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-white/40'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm">
                    {profileData.rating} ({profileData.reviewCount} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  {profileData.distance}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 w-full sm:w-auto">
              {isOwner ? (
                isEditMode ? (
                  <>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="flex-1 sm:flex-none bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="flex-1 sm:flex-none bg-white text-[#0078FF] hover:bg-white/90"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditMode(true)}
                    className="flex-1 sm:flex-none bg-white text-[#0078FF] hover:bg-white/90"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )
              ) : (
                <>
                  <Button
                    onClick={onMessageClick}
                    variant="outline"
                    className="flex-1 bg-white/20 border-white/30 text-white hover:bg-white/30"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button
                    onClick={onRequestQuote}
                    className="flex-1 bg-white text-[#0078FF] hover:bg-white/90"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Request Quote
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Trust Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center border-2 border-gray-200">
            <TrendingUp className="w-6 h-6 text-[#0078FF] mx-auto mb-2" />
            <p className="text-2xl text-[#0078FF] mb-1">{profileData.completedJobs}</p>
            <p className="text-xs text-gray-600">Jobs Completed</p>
          </Card>
          <Card className="p-4 text-center border-2 border-gray-200">
            <Award className="w-6 h-6 text-[#0078FF] mx-auto mb-2" />
            <p className="text-2xl text-[#0078FF] mb-1">{profileData.yearsExperience}+</p>
            <p className="text-xs text-gray-600">Years Experience</p>
          </Card>
          <Card className="p-4 text-center border-2 border-gray-200">
            <Users className="w-6 h-6 text-[#0078FF] mx-auto mb-2" />
            <p className="text-2xl text-[#0078FF] mb-1">98%</p>
            <p className="text-xs text-gray-600">Satisfaction</p>
          </Card>
        </div>

        {/* About Section */}
        <Card className="p-6 border-2 border-gray-200">
          <h2 className="text-xl mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0078FF]/10 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-[#0078FF]" />
            </div>
            About
          </h2>
          {isEditMode ? (
            <Textarea
              value={editedData.bio}
              onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
              rows={4}
              className="w-full"
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
          )}
        </Card>

        {/* Specialties */}
        <Card className="p-6 border-2 border-gray-200">
          <h2 className="text-xl mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0078FF]/10 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-[#0078FF]" />
            </div>
            Specialties
          </h2>
          {isEditMode ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Select your specialties:</p>
              <div className="flex flex-wrap gap-2">
                {availableSpecialties.map((specialty) => {
                  const isSelected = editedData.specialties.includes(specialty);
                  return (
                    <motion.button
                      key={specialty}
                      onClick={() => toggleSpecialty(specialty)}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-xl text-sm transition-all border-2 ${
                        isSelected
                          ? 'bg-[#0078FF] text-white border-[#0078FF] shadow-md shadow-blue-200'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#0078FF]'
                      }`}
                    >
                      {specialty}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profileData.specialties.map((specialty) => (
                <Badge
                  key={specialty}
                  variant="outline"
                  className="bg-blue-50 text-[#0078FF] border-blue-200 px-3 py-1.5"
                >
                  {specialty}
                </Badge>
              ))}
            </div>
          )}
        </Card>

        {/* Operating Hours */}
        <Card className="p-6 border-2 border-gray-200">
          <h2 className="text-xl mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0078FF]/10 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#0078FF]" />
            </div>
            Operating Hours
          </h2>
          <div className="space-y-2">
            {Object.entries(profileData.operatingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">{day}</span>
                <span className="text-sm text-gray-900">
                  {hours.closed ? (
                    <span className="text-gray-500">Closed</span>
                  ) : (
                    `${hours.open} - ${hours.close}`
                  )}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6 border-2 border-gray-200">
          <h2 className="text-xl mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0078FF]/10 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-[#0078FF]" />
            </div>
            Contact Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Phone className="w-5 h-5 text-[#0078FF]" />
              {isEditMode ? (
                <Input
                  value={editedData.phone}
                  onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                  className="flex-1"
                />
              ) : (
                <span className="text-gray-900">{profileData.phone}</span>
              )}
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Mail className="w-5 h-5 text-[#0078FF]" />
              {isEditMode ? (
                <Input
                  value={editedData.email}
                  onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                  className="flex-1"
                />
              ) : (
                <span className="text-gray-900">{profileData.email}</span>
              )}
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <MapPin className="w-5 h-5 text-[#0078FF]" />
              <span className="text-gray-900">{profileData.serviceArea}</span>
            </div>
          </div>
        </Card>

        {/* Portfolio Gallery */}
        <Card className="p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0078FF]/10 rounded-lg flex items-center justify-center">
                <Camera className="w-4 h-4 text-[#0078FF]" />
              </div>
              Portfolio ({profileData.portfolio.length})
            </h2>
            {isEditMode && (
              <Button
                onClick={addPortfolioImage}
                size="sm"
                className="bg-[#0078FF] hover:bg-[#0056CC] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Photo
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <AnimatePresence>
              {profileData.portfolio.map((image, index) => (
                <motion.div
                  key={image}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                  onClick={() => !isEditMode && setSelectedImage(image)}
                >
                  <img
                    src={image}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  {isEditMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePortfolioImage(index);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Card>
      </div>

      {/* Image Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black" aria-describedby="image-lightbox-description">
          <VisuallyHidden>
            <DialogTitle>Portfolio Image Gallery</DialogTitle>
          </VisuallyHidden>
          <DialogDescription id="image-lightbox-description" className="sr-only">
            Full-screen portfolio image viewer with navigation controls
          </DialogDescription>
          {selectedImage && (
            <div className="relative">
              <img
                src={profileData.portfolio[currentImageIndex]}
                alt="Portfolio"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              {profileData.portfolio.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((currentImageIndex - 1 + profileData.portfolio.length) % profileData.portfolio.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((currentImageIndex + 1) % profileData.portfolio.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Do you want to save them before leaving edit mode?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardChanges}>
              Discard Changes
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSave} className="bg-[#0078FF] hover:bg-[#0056CC]">
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}