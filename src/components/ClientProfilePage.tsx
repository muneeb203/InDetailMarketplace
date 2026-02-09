import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { 
  Edit3, 
  Save, 
  X, 
  Camera, 
  Phone, 
  Mail, 
  User,
  Car,
  Plus,
  Check,
  Sparkles,
  Layers,
  MessageCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { CommunicationPreferences, CommPreference } from './CommunicationPreferences';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  nickname?: string;
  photo?: string;
  isDefault: boolean;
}

interface Fleet {
  id: string;
  name: string;
  notes?: string;
  vehicleIds: string[];
  isDefault: boolean;
}

interface ClientProfileData {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  preferences: string[];
  commPreference: CommPreference;
  vehicles: Vehicle[];
  fleets: Fleet[];
}

const availablePreferences = [
  'Eco-friendly products',
  'Leather care',
  'Pet hair removal',
  'Interior fragrance off',
  'Waterless wash',
  'UV protection',
];

const mockClientProfile: ClientProfileData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '(555) 123-4567',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  preferences: ['Eco-friendly products', 'Interior fragrance off'],
  commPreference: 'voice-chat',
  vehicles: [
    {
      id: '1',
      make: 'Tesla',
      model: 'Model 3',
      year: 2022,
      color: 'Midnight Silver',
      nickname: 'Silver Lightning',
      photo: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
      isDefault: true,
    },
  ],
  fleets: [],
};

export function ClientProfilePage() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState<ClientProfileData>(mockClientProfile);
  const [editedData, setEditedData] = useState<ClientProfileData>(mockClientProfile);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showFleetModal, setShowFleetModal] = useState(false);
  const [fleetForm, setFleetForm] = useState({
    name: '',
    notes: '',
    vehicleIds: [] as string[],
  });

  const [vehicleForm, setVehicleForm] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    nickname: '',
    photo: '',
  });

  const handleSave = () => {
    setProfileData(editedData);
    setIsEditMode(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    setEditedData(profileData);
    setIsEditMode(false);
  };

  const togglePreference = (preference: string) => {
    const preferences = editedData.preferences.includes(preference)
      ? editedData.preferences.filter(p => p !== preference)
      : [...editedData.preferences, preference];
    setEditedData({ ...editedData, preferences });
  };

  const openAddVehicleModal = () => {
    setEditingVehicle(null);
    setVehicleForm({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      nickname: '',
      photo: '',
    });
    setShowVehicleModal(true);
  };

  const openEditVehicleModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      nickname: vehicle.nickname || '',
      photo: vehicle.photo || '',
    });
    setShowVehicleModal(true);
  };

  const handleSaveVehicle = () => {
    if (!vehicleForm.make || !vehicleForm.model) {
      toast.error('Please fill in make and model');
      return;
    }

    if (editingVehicle) {
      // Update existing vehicle
      const updatedVehicles = editedData.vehicles.map(v =>
        v.id === editingVehicle.id
          ? { ...v, ...vehicleForm }
          : v
      );
      setEditedData({ ...editedData, vehicles: updatedVehicles });
      setProfileData({ ...profileData, vehicles: updatedVehicles });
      toast.success('Vehicle updated!');
    } else {
      // Add new vehicle
      const newVehicle: Vehicle = {
        id: Date.now().toString(),
        ...vehicleForm,
        isDefault: editedData.vehicles.length === 0,
      };
      const updatedVehicles = [...editedData.vehicles, newVehicle];
      setEditedData({ ...editedData, vehicles: updatedVehicles });
      setProfileData({ ...profileData, vehicles: updatedVehicles });
      toast.success('Vehicle added successfully!');
    }

    setShowVehicleModal(false);
  };

  const setDefaultVehicle = (vehicleId: string) => {
    const updatedVehicles = editedData.vehicles.map(v => ({
      ...v,
      isDefault: v.id === vehicleId,
    }));
    setEditedData({ ...editedData, vehicles: updatedVehicles });
    setProfileData({ ...profileData, vehicles: updatedVehicles });
    toast.success('Default vehicle updated!');
  };

  // Fleet Management Handlers
  const openCreateFleetModal = () => {
    setFleetForm({
      name: '',
      notes: '',
      vehicleIds: [],
    });
    setShowFleetModal(true);
  };

  const handleSaveFleet = () => {
    if (!fleetForm.name) {
      toast.error('Please enter a fleet name');
      return;
    }

    const newFleet: Fleet = {
      id: Date.now().toString(),
      name: fleetForm.name,
      notes: fleetForm.notes,
      vehicleIds: fleetForm.vehicleIds,
      isDefault: profileData.fleets.length === 0,
    };

    const updatedFleets = [...profileData.fleets, newFleet];
    setProfileData({ ...profileData, fleets: updatedFleets });
    setEditedData({ ...editedData, fleets: updatedFleets });
    toast.success('Fleet created successfully!');
    setShowFleetModal(false);
  };

  const toggleVehicleInFleet = (vehicleId: string) => {
    setFleetForm({
      ...fleetForm,
      vehicleIds: fleetForm.vehicleIds.includes(vehicleId)
        ? fleetForm.vehicleIds.filter(id => id !== vehicleId)
        : [...fleetForm.vehicleIds, vehicleId],
    });
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#EAF5FF] to-white overflow-hidden">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#0078FF] to-[#0056CC] text-white relative flex-shrink-0">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>

        <div className="px-4 py-4 relative">
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
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {isEditMode ? (
                <Input
                  value={editedData.name}
                  onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                  className="h-8 text-sm bg-white/20 border-white/30 text-white placeholder:text-white/60 mb-2"
                  placeholder="Your name"
                />
              ) : (
                <h1 className="text-lg mb-1">{profileData.name}</h1>
              )}
              <p className="text-xs text-white/90">Client Account</p>
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
          {/* My Info */}
          <Card className="p-4 border">
            <h2 className="text-sm mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-[#0078FF]/10 rounded-lg flex items-center justify-center">
                <User className="w-3 h-3 text-[#0078FF]" />
              </div>
              My Info
            </h2>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <Mail className="w-4 h-4 text-[#0078FF] flex-shrink-0" />
                {isEditMode ? (
                  <Input
                    value={editedData.email}
                    onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                    className="flex-1 h-7 text-xs"
                    placeholder="Email"
                  />
                ) : (
                  <span className="text-xs text-gray-900">{profileData.email}</span>
                )}
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <Phone className="w-4 h-4 text-[#0078FF] flex-shrink-0" />
                {isEditMode ? (
                  <Input
                    value={editedData.phone}
                    onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                    className="flex-1 h-7 text-xs"
                    placeholder="Phone"
                  />
                ) : (
                  <span className="text-xs text-gray-900">{profileData.phone}</span>
                )}
              </div>
            </div>
          </Card>

          {/* Preferences */}
          <Card className="p-4 border">
            <h2 className="text-sm mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-[#0078FF]/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-[#0078FF]" />
              </div>
              Cleaning Preferences
            </h2>
            {isEditMode ? (
              <div className="flex flex-wrap gap-1.5">
                {availablePreferences.map((preference) => {
                  const isSelected = editedData.preferences.includes(preference);
                  return (
                    <motion.button
                      key={preference}
                      onClick={() => togglePreference(preference)}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                        isSelected
                          ? 'bg-[#0078FF] text-white border-[#0078FF] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#0078FF]'
                      }`}
                    >
                      {preference}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <>
                {profileData.preferences.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profileData.preferences.map((preference) => (
                      <Badge
                        key={preference}
                        variant="outline"
                        className="bg-blue-50 text-[#0078FF] border-blue-200 px-2 py-1 text-xs"
                      >
                        {preference}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No preferences set</p>
                )}
              </>
            )}
          </Card>

          {/* Communication Preferences */}
          <Card className="p-4 border">
            <h2 className="text-sm mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-[#0078FF]/10 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-3 h-3 text-[#0078FF]" />
              </div>
              Communication Preference
            </h2>
            {isEditMode ? (
              <CommunicationPreferences
                value={editedData.commPreference}
                onChange={(value) => setEditedData({ ...editedData, commPreference: value })}
                showBadge={false}
              />
            ) : (
              <CommunicationPreferences
                value={profileData.commPreference}
                onChange={() => {}}
                showBadge={true}
              />
            )}
          </Card>

          {/* Saved Vehicles */}
          <Card className="p-4 border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm flex items-center gap-2">
                <div className="w-6 h-6 bg-[#0078FF]/10 rounded-lg flex items-center justify-center">
                  <Car className="w-3 h-3 text-[#0078FF]" />
                </div>
                Saved Vehicles
              </h2>
              <div className="flex gap-2">
                <Button
                  onClick={openCreateFleetModal}
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                  disabled={profileData.vehicles.length === 0}
                >
                  <Layers className="w-3 h-3 mr-1" />
                  Create Fleet
                </Button>
                <Button
                  onClick={openAddVehicleModal}
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs border-[#0078FF] text-[#0078FF] hover:bg-[#0078FF] hover:text-white"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Vehicle
                </Button>
              </div>
            </div>

            {/* Fleets */}
            {profileData.fleets.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-xs text-gray-600 mb-2">Your Fleets</p>
                {profileData.fleets.map((fleet) => {
                  const fleetVehicles = profileData.vehicles.filter(v => 
                    fleet.vehicleIds.includes(v.id)
                  );
                  return (
                    <Card
                      key={fleet.id}
                      className="p-3 border border-green-200 bg-green-50/30 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Layers className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-sm">{fleet.name}</h3>
                            {fleet.notes && (
                              <p className="text-xs text-gray-600">{fleet.notes}</p>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-green-600 text-white text-xs px-2 py-0">
                          {fleetVehicles.length} {fleetVehicles.length === 1 ? 'vehicle' : 'vehicles'}
                        </Badge>
                      </div>
                      {fleetVehicles.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {fleetVehicles.slice(0, 3).map((vehicle) => (
                            <div key={vehicle.id} className="flex items-center gap-2 text-xs text-gray-700 bg-white rounded px-2 py-1">
                              <Car className="w-3 h-3 text-green-600" />
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </div>
                          ))}
                          {fleetVehicles.length > 3 && (
                            <p className="text-xs text-gray-600 px-2">
                              +{fleetVehicles.length - 3} more
                            </p>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}

            {profileData.vehicles.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-600 mb-2">Individual Vehicles</p>
                {profileData.vehicles.map((vehicle) => (
                  <motion.div
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group"
                  >
                    <Card
                      className="p-3 cursor-pointer hover:shadow-md transition-all border hover:border-[#0078FF]/30"
                      onClick={() => openEditVehicleModal(vehicle)}
                    >
                      <div className="flex gap-3">
                        {/* Vehicle Photo */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {vehicle.photo ? (
                            <img
                              src={vehicle.photo}
                              alt={`${vehicle.make} ${vehicle.model}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Car className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Vehicle Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <h3 className="text-sm truncate">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </h3>
                              {vehicle.nickname && (
                                <p className="text-xs text-gray-600 truncate">"{vehicle.nickname}"</p>
                              )}
                            </div>
                            {vehicle.isDefault && (
                              <Badge className="bg-[#0078FF] text-white text-xs px-2 py-0 flex-shrink-0 ml-2">
                                <Check className="w-2.5 h-2.5 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">{vehicle.color}</p>
                          {!vehicle.isDefault && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDefaultVehicle(vehicle.id);
                              }}
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs text-[#0078FF] hover:bg-blue-50 mt-1"
                            >
                              Set as Default
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Car className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-xs text-gray-600 mb-3">Add your first vehicle for faster booking.</p>
                <Button
                  onClick={openAddVehicleModal}
                  size="sm"
                  className="bg-[#0078FF] hover:bg-[#0056CC] text-white h-8 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Vehicle
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Add/Edit Vehicle Modal */}
      <Dialog open={showVehicleModal} onOpenChange={setShowVehicleModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">
              {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingVehicle ? 'Edit your vehicle details' : 'Add a new vehicle to your profile'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-700 mb-1 block">Make *</label>
                <Input
                  value={vehicleForm.make}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                  placeholder="Tesla"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-gray-700 mb-1 block">Model *</label>
                <Input
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                  placeholder="Model 3"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-700 mb-1 block">Year</label>
                <Input
                  type="number"
                  value={vehicleForm.year}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, year: parseInt(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-gray-700 mb-1 block">Color</label>
                <Input
                  value={vehicleForm.color}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                  placeholder="Midnight Silver"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-700 mb-1 block">Nickname (optional)</label>
              <Input
                value={vehicleForm.nickname}
                onChange={(e) => setVehicleForm({ ...vehicleForm, nickname: e.target.value })}
                placeholder="Silver Lightning"
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-gray-700 mb-1 block">Photo URL (optional)</label>
              <Input
                value={vehicleForm.photo}
                onChange={(e) => setVehicleForm({ ...vehicleForm, photo: e.target.value })}
                placeholder="https://..."
                className="h-8 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowVehicleModal(false)}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveVehicle}
              size="sm"
              className="bg-[#0078FF] hover:bg-[#0056CC] text-white text-xs"
            >
              <Save className="w-3 h-3 mr-1" />
              Save Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Fleet Modal */}
      <Dialog open={showFleetModal} onOpenChange={setShowFleetModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Create Fleet</DialogTitle>
            <DialogDescription className="sr-only">
              Create a new fleet by selecting vehicles from your saved vehicles
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-700 mb-1 block">Fleet Name *</label>
              <Input
                value={fleetForm.name}
                onChange={(e) => setFleetForm({ ...fleetForm, name: e.target.value })}
                placeholder="Company Cars"
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-gray-700 mb-1 block">Notes (Optional)</label>
              <Input
                value={fleetForm.notes}
                onChange={(e) => setFleetForm({ ...fleetForm, notes: e.target.value })}
                placeholder="For business use"
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label className="text-xs text-gray-700 mb-2 block">Add Vehicles to Fleet</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {profileData.vehicles.length > 0 ? (
                  profileData.vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      onClick={() => toggleVehicleInFleet(vehicle.id)}
                      className={`p-2 rounded-lg border cursor-pointer transition-all ${
                        fleetForm.vehicleIds.includes(vehicle.id)
                          ? 'bg-[#0078FF] border-[#0078FF] text-white'
                          : 'bg-white border-gray-200 hover:border-[#0078FF]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Car className="w-3 h-3" />
                          <p className="text-xs">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </p>
                        </div>
                        {fleetForm.vehicleIds.includes(vehicle.id) && (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 text-center py-4">
                    Add vehicles first to create a fleet
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {fleetForm.vehicleIds.length} vehicle{fleetForm.vehicleIds.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowFleetModal(false)}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveFleet}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white text-xs"
            >
              <Save className="w-3 h-3 mr-1" />
              Create Fleet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}