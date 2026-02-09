import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Car, Plus, Edit3, Star, Trash2, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  nickname?: string;
  photo?: string;
  careNotes?: string;
  isDefault?: boolean;
}

interface VehicleManagementProps {
  vehicles: Vehicle[];
  onUpdate: (vehicles: Vehicle[]) => void;
}

const MAKES = ['Acura', 'Audi', 'BMW', 'Chevrolet', 'Ford', 'Honda', 'Lexus', 'Mercedes-Benz', 'Tesla', 'Toyota', 'Volkswagen'];
const COLORS = ['Black', 'White', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Brown', 'Yellow', 'Orange'];

export function VehicleManagement({ vehicles, onUpdate }: VehicleManagementProps) {
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingVehicle({
      id: Date.now().toString(),
      make: '',
      model: '',
      year: new Date().getFullYear(),
      isDefault: vehicles.length === 0,
    });
    setIsAdding(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle({ ...vehicle });
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!editingVehicle) return;

    if (!editingVehicle.make || !editingVehicle.model) {
      toast.error('Please fill in required fields');
      return;
    }

    if (isAdding) {
      onUpdate([...vehicles, editingVehicle]);
      toast.success('Vehicle added', {
        description: 'Your vehicle has been saved successfully.',
      });
    } else {
      onUpdate(vehicles.map((v) => (v.id === editingVehicle.id ? editingVehicle : v)));
      toast.success('Vehicle updated', {
        description: 'Changes have been saved.',
      });
    }

    setEditingVehicle(null);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    onUpdate(vehicles.filter((v) => v.id !== id));
    toast.success('Vehicle removed');
  };

  const handleSetDefault = (id: string) => {
    onUpdate(
      vehicles.map((v) => ({
        ...v,
        isDefault: v.id === id,
      }))
    );
    toast.success('Default vehicle updated');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1>Your Vehicles</h1>
          <p className="text-gray-600">
            Your car is in trusted hands — local pros, tailored to your ride.
          </p>
        </div>

        {/* Add Button */}
        <Button onClick={handleAdd} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Add Vehicle
        </Button>

        {/* Vehicle Cards */}
        {vehicles.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="mb-2">No vehicles yet</h3>
            <p className="text-gray-500 text-sm mb-6">
              Add your first vehicle to get personalized detailing quotes
            </p>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Vehicle
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {vehicles.map((vehicle) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Card Header */}
                    <div
                      className="p-6 cursor-pointer"
                      onClick={() =>
                        setExpandedId(expandedId === vehicle.id ? null : vehicle.id)
                      }
                    >
                      <div className="flex items-start gap-4">
                        {/* Vehicle Photo */}
                        <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100">
                          {vehicle.photo ? (
                            <ImageWithFallback
                              src={vehicle.photo}
                              alt={`${vehicle.make} ${vehicle.model}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Car className="w-8 h-8 text-blue-600" />
                            </div>
                          )}
                        </div>

                        {/* Vehicle Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="truncate">
                                  {vehicle.year} {vehicle.make} {vehicle.model}
                                </h3>
                                {vehicle.isDefault && (
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                                )}
                              </div>
                              {vehicle.nickname && (
                                <p className="text-sm text-gray-600">"{vehicle.nickname}"</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                {vehicle.color && (
                                  <Badge variant="secondary" className="text-xs">
                                    {vehicle.color}
                                  </Badge>
                                )}
                                {vehicle.isDefault && (
                                  <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                                    Default
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(vehicle);
                                }}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(vehicle.id);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedId === vehicle.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t bg-gray-50"
                        >
                          <div className="p-6 space-y-4">
                            {vehicle.careNotes && (
                              <div>
                                <h4 className="text-sm mb-2">Care Notes</h4>
                                <p className="text-sm text-gray-700">{vehicle.careNotes}</p>
                              </div>
                            )}
                            {!vehicle.isDefault && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSetDefault(vehicle.id)}
                                className="gap-2"
                              >
                                <Star className="w-3 h-3" />
                                Set as Default
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Tips */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="text-sm mb-2">Vehicle Tips</h4>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>• Set a default vehicle for faster quote requests</li>
            <li>• Add care notes (e.g., "leather-safe cleaners only")</li>
            <li>• Upload a photo to help detailers assess your needs</li>
            <li>• Manage multiple vehicles in one place</li>
          </ul>
        </Card>
      </div>

      {/* Edit/Add Dialog */}
      <Dialog
        open={editingVehicle !== null}
        onOpenChange={() => {
          setEditingVehicle(null);
          setIsAdding(false);
        }}
      >
        <DialogContent className="max-w-md" aria-describedby="vehicle-dialog-description">
          <DialogHeader>
            <DialogTitle>{isAdding ? 'Add Vehicle' : 'Edit Vehicle'}</DialogTitle>
            <DialogDescription id="vehicle-dialog-description">
              {isAdding
                ? 'Add your vehicle details to get accurate quotes'
                : 'Update your vehicle information'}
            </DialogDescription>
          </DialogHeader>

          {editingVehicle && (
            <div className="space-y-4 py-4">
              {/* Photo */}
              <div>
                <label className="text-sm mb-2 block">Vehicle Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                    {editingVehicle.photo ? (
                      <ImageWithFallback
                        src={editingVehicle.photo}
                        alt="Vehicle"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    Upload Photo
                  </Button>
                </div>
              </div>

              {/* Make */}
              <div>
                <label className="text-sm mb-2 block">
                  Make <span className="text-red-500">*</span>
                </label>
                <Select
                  value={editingVehicle.make}
                  onValueChange={(make) =>
                    setEditingVehicle({ ...editingVehicle, make })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select make" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAKES.map((make) => (
                      <SelectItem key={make} value={make}>
                        {make}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Model */}
              <div>
                <label className="text-sm mb-2 block">
                  Model <span className="text-red-500">*</span>
                </label>
                <Input
                  value={editingVehicle.model}
                  onChange={(e) =>
                    setEditingVehicle({ ...editingVehicle, model: e.target.value })
                  }
                  placeholder="e.g., Civic, Model 3, Accord"
                />
              </div>

              {/* Year */}
              <div>
                <label className="text-sm mb-2 block">Year</label>
                <Input
                  type="number"
                  value={editingVehicle.year}
                  onChange={(e) =>
                    setEditingVehicle({
                      ...editingVehicle,
                      year: parseInt(e.target.value),
                    })
                  }
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              {/* Color */}
              <div>
                <label className="text-sm mb-2 block">Color</label>
                <Select
                  value={editingVehicle.color || ''}
                  onValueChange={(color) =>
                    setEditingVehicle({ ...editingVehicle, color })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nickname */}
              <div>
                <label className="text-sm mb-2 block">Nickname (optional)</label>
                <Input
                  value={editingVehicle.nickname || ''}
                  onChange={(e) =>
                    setEditingVehicle({ ...editingVehicle, nickname: e.target.value })
                  }
                  placeholder='e.g., "The Beast", "Daily Driver"'
                />
              </div>

              {/* Care Notes */}
              <div>
                <label className="text-sm mb-2 block">Care Notes (optional)</label>
                <Textarea
                  value={editingVehicle.careNotes || ''}
                  onChange={(e) =>
                    setEditingVehicle({ ...editingVehicle, careNotes: e.target.value })
                  }
                  placeholder="e.g., Leather-safe cleaners only, ceramic coated"
                  className="min-h-[80px]"
                />
              </div>

              {/* Default */}
              {vehicles.length > 0 && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="default"
                    checked={editingVehicle.isDefault || false}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        isDefault: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <label htmlFor="default" className="text-sm">
                    Set as default vehicle
                  </label>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  {isAdding ? 'Add Vehicle' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingVehicle(null);
                    setIsAdding(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
