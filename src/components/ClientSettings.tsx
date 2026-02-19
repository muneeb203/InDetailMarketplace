import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User, Car, Loader2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useClientProfile } from '../hooks/useClientProfile';
import { updateClientProfileInfo, updateClientVehicle } from '../services/clientSettingsService';
import { toast } from 'sonner';
import type { Customer } from '../types';

export function ClientSettings() {
  const { currentUser, setCurrentUser } = useAuth();
  const { vehicles, refetch: refetchVehicles } = useClientProfile(
    currentUser?.role === 'client' ? currentUser.id : undefined
  );

  const client = currentUser?.role === 'client' ? (currentUser as Customer) : null;
  const vehicle = vehicles[0];

  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  useEffect(() => {
    if (client) {
      setProfileForm({ name: client.name ?? '', email: client.email ?? '', phone: client.phone ?? '' });
    }
  }, [client?.id, client?.name, client?.email, client?.phone]);

  const [vehicleForm, setVehicleForm] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
  });
  useEffect(() => {
    if (vehicle) {
      setVehicleForm({ make: vehicle.make ?? '', model: vehicle.model ?? '', year: vehicle.year ?? new Date().getFullYear() });
    } else if (client?.vehicles?.[0]) {
      const v = client.vehicles[0];
      setVehicleForm({ make: v.make ?? '', model: v.model ?? '', year: v.year ?? new Date().getFullYear() });
    }
  }, [vehicle?.make, vehicle?.model, vehicle?.year, client?.vehicles]);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingVehicle, setSavingVehicle] = useState(false);

  const handleSaveProfile = async () => {
    if (!client) return;
    setSavingProfile(true);
    try {
      await updateClientProfileInfo(client.id, {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
      });
      setCurrentUser({
        ...client,
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
      });
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveVehicle = async () => {
    if (!client) return;
    const year = parseInt(String(vehicleForm.year), 10);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
      toast.error('Please enter a valid year');
      return;
    }
    if (!vehicleForm.make.trim() || !vehicleForm.model.trim()) {
      toast.error('Make and model are required');
      return;
    }
    setSavingVehicle(true);
    try {
      await updateClientVehicle(client.id, {
        make: vehicleForm.make.trim(),
        model: vehicleForm.model.trim(),
        year,
      });
      await refetchVehicles();
      const updatedVehicles = client.vehicles?.length
        ? [{ ...client.vehicles[0], make: vehicleForm.make.trim(), model: vehicleForm.model.trim(), year }]
        : [{ id: '1', make: vehicleForm.make.trim(), model: vehicleForm.model.trim(), year, type: 'Sedan', isDefault: true }];
      setCurrentUser({ ...client, vehicles: updatedVehicles });
      toast.success('Vehicle updated successfully');
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Failed to update vehicle');
    } finally {
      setSavingVehicle(false);
    }
  };

  const profileChanged =
    profileForm.name !== (client?.name ?? '') ||
    profileForm.email !== (client?.email ?? '') ||
    profileForm.phone !== (client?.phone ?? '');
  const vehicleChanged =
    vehicleForm.make !== (vehicle?.make ?? '') ||
    vehicleForm.model !== (vehicle?.model ?? '') ||
    vehicleForm.year !== (vehicle?.year ?? new Date().getFullYear());

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl">
          <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="vehicle" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Car className="w-4 h-4" />
            Vehicle
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your name, email, and phone number</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="your@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={!profileChanged || savingProfile}>
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span className="ml-2">Save Profile</span>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicle" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Details</CardTitle>
              <CardDescription>Update your car information for service requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={vehicleForm.make}
                  onChange={(e) => setVehicleForm((v) => ({ ...v, make: e.target.value }))}
                  placeholder="e.g. Tesla, Toyota, Honda"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm((v) => ({ ...v, model: e.target.value }))}
                  placeholder="e.g. Model 3, Camry, Civic"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  min={1900}
                  max={new Date().getFullYear() + 1}
                  value={vehicleForm.year}
                  onChange={(e) => setVehicleForm((v) => ({ ...v, year: parseInt(e.target.value, 10) || new Date().getFullYear() }))}
                  placeholder="e.g. 2022"
                />
              </div>
              <Button onClick={handleSaveVehicle} disabled={!vehicleChanged || savingVehicle}>
                {savingVehicle ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span className="ml-2">Save Vehicle</span>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
