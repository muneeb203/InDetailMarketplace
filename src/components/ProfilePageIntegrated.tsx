import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { 
  Edit3, 
  Save, 
  X, 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Clock, 
  Award,
  Camera,
  Shield,
  TrendingUp,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';

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
  bio: 'Professional detailer with over 8 years of experience. Specializing in ceramic coatings, paint correction, and high-end vehicle care.',
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
  ],
  serviceArea: 'San Francisco Bay Area',
};

const availableSpecialties = [
  'Ceramic Coating',
  'Paint Correction',
  'Interior Deep Clean',
  'Engine Bay Clean',
  'Headlight Restoration',
  'Wax & Polish',
];

export function ProfilePageIntegrated() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(mockProfile);
  const [editedData, setEditedData] = useState<ProfileData>(mockProfile);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleSave = () => {
    setProfileData(editedData);
    setIsEditMode(false);
    setShowSaveDialog(false);
  };

  const handleCancel = () => {
    if (JSON.stringify(editedData) !== JSON.stringify(profileData)) {
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

  const toggleSpecialty = (specialty: string) => {
    const specialties = editedData.specialties.includes(specialty)
      ? editedData.specialties.filter(s => s !== specialty)
      : [...editedData.specialties, specialty];
    setEditedData({ ...editedData, specialties });
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#EAF5FF] to-white overflow-hidden">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#0078FF] to-[#0056CC] text-white relative flex-shrink-0">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>

        <div className="px-4 py-4 relative">
          {/* Profile Header */}
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="relative group flex-shrink-0">
              <Avatar className="w-16 h-16 border-2 border-white shadow-lg">
                <AvatarImage src={profileData.avatar} />
                <AvatarFallback>{profileData.name[0]}</AvatarFallback>
              </Avatar>
              {isEditMode && (
                <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </button>
              )}
              {profileData.isVerified && (
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                  <Shield className="w-4 h-4 text-[#0078FF]" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {isEditMode ? (
                <div className="space-y-1.5">
                  <Input
                    value={editedData.name}
                    onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                    className="h-8 text-sm bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  />
                  <Input
                    value={editedData.tagline}
                    onChange={(e) => setEditedData({ ...editedData, tagline: e.target.value })}
                    className="h-7 text-xs bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-lg mb-0.5 flex items-center gap-2">
                    {profileData.name}
                    {profileData.isVerified && (
                      <Badge className="bg-white/20 text-white border-white/30 text-xs px-2 py-0">
                        <Shield className="w-2.5 h-2.5 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </h1>
                  <p className="text-xs text-white/90 mb-2">{profileData.tagline}</p>
                </>
              )}

              {/* Stats */}
              <div className="flex gap-3 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(profileData.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-white/40'
                      }`}
                    />
                  ))}
                  <span className="ml-1">
                    {profileData.rating} ({profileData.reviewCount})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {profileData.distance}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0">
              {isEditMode ? (
                <div className="flex gap-1.5">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs bg-white/20 border-white/30 text-white hover:bg-white/30"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    size="sm"
                    className="h-7 px-2 text-xs bg-white text-[#0078FF] hover:bg-white/90"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsEditMode(true)}
                  size="sm"
                  className="h-7 px-3 text-xs bg-white text-[#0078FF] hover:bg-white/90"
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 space-y-4">
          {/* Trust Stats */}
          <div className="grid grid-cols-3 gap-2">
            <Card className="p-3 text-center border">
              <TrendingUp className="w-5 h-5 text-[#0078FF] mx-auto mb-1" />
              <p className="text-lg text-[#0078FF]">{profileData.completedJobs}</p>
              <p className="text-xs text-gray-600">Jobs Done</p>
            </Card>
            <Card className="p-3 text-center border">
              <Award className="w-5 h-5 text-[#0078FF] mx-auto mb-1" />
              <p className="text-lg text-[#0078FF]">{profileData.yearsExperience}+</p>
              <p className="text-xs text-gray-600">Years Exp</p>
            </Card>
            <Card className="p-3 text-center border">
              <Users className="w-5 h-5 text-[#0078FF] mx-auto mb-1" />
              <p className="text-lg text-[#0078FF]">98%</p>
              <p className="text-xs text-gray-600">Satisfaction</p>
            </Card>
          </div>

          {/* About Section */}
          <Card className="p-4 border">
            <h2 className="text-sm mb-2 flex items-center gap-2">
              <div className="w-6 h-6 bg-[#0078FF]/10 rounded-lg flex items-center justify-center">
                <Users className="w-3 h-3 text-[#0078FF]" />
              </div>
              About
            </h2>
            {isEditMode ? (
              <Textarea
                value={editedData.bio}
                onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
                rows={3}
                className="w-full text-xs"
              />
            ) : (
              <p className="text-xs text-gray-700 leading-relaxed">{profileData.bio}</p>
            )}
          </Card>

          {/* Specialties */}
          <Card className="p-4 border">
            <h2 className="text-sm mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-[#0078FF]/10 rounded-lg flex items-center justify-center">
                <Award className="w-3 h-3 text-[#0078FF]" />
              </div>
              Specialties
            </h2>
            {isEditMode ? (
              <div className="flex flex-wrap gap-1.5">
                {availableSpecialties.map((specialty) => {
                  const isSelected = editedData.specialties.includes(specialty);
                  return (
                    <motion.button
                      key={specialty}
                      onClick={() => toggleSpecialty(specialty)}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                        isSelected
                          ? 'bg-[#0078FF] text-white border-[#0078FF] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#0078FF]'
                      }`}
                    >
                      {specialty}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {profileData.specialties.map((specialty) => (
                  <Badge
                    key={specialty}
                    variant="outline"
                    className="bg-blue-50 text-[#0078FF] border-blue-200 px-2 py-1 text-xs"
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          {/* Operating Hours */}
          <Card className="p-4 border">
            <h2 className="text-sm mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-[#0078FF]/10 rounded-lg flex items-center justify-center">
                <Clock className="w-3 h-3 text-[#0078FF]" />
              </div>
              Operating Hours
            </h2>
            <div className="space-y-1.5">
              {Object.entries(profileData.operatingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <span className="text-xs text-gray-700">{day}</span>
                  <span className="text-xs text-gray-900">
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
          <Card className="p-4 border">
            <h2 className="text-sm mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-[#0078FF]/10 rounded-lg flex items-center justify-center">
                <Phone className="w-3 h-3 text-[#0078FF]" />
              </div>
              Contact Information
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <Phone className="w-4 h-4 text-[#0078FF] flex-shrink-0" />
                {isEditMode ? (
                  <Input
                    value={editedData.phone}
                    onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                    className="flex-1 h-7 text-xs"
                  />
                ) : (
                  <span className="text-xs text-gray-900">{profileData.phone}</span>
                )}
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <Mail className="w-4 h-4 text-[#0078FF] flex-shrink-0" />
                {isEditMode ? (
                  <Input
                    value={editedData.email}
                    onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                    className="flex-1 h-7 text-xs"
                  />
                ) : (
                  <span className="text-xs text-gray-900">{profileData.email}</span>
                )}
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <MapPin className="w-4 h-4 text-[#0078FF] flex-shrink-0" />
                <span className="text-xs text-gray-900">{profileData.serviceArea}</span>
              </div>
            </div>
          </Card>

          {/* Portfolio Gallery */}
          <Card className="p-4 border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm flex items-center gap-2">
                <div className="w-6 h-6 bg-[#0078FF]/10 rounded-lg flex items-center justify-center">
                  <Camera className="w-3 h-3 text-[#0078FF]" />
                </div>
                Portfolio ({profileData.portfolio.length})
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {profileData.portfolio.map((image, index) => (
                <div
                  key={image}
                  className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                >
                  <img
                    src={image}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              You have unsaved changes. Do you want to save them before leaving edit mode?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardChanges} className="text-xs">
              Discard Changes
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSave} className="bg-[#0078FF] hover:bg-[#0056CC] text-xs">
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
