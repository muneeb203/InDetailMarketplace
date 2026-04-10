import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Sparkles, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface ServiceSpecialtiesSelectorProps {
  initialSpecialties?: string[];
  onChange: (specialties: string[]) => void;
  maxSelections?: number;
}

const SPECIALTIES = [
  { id: 'paint-correction', label: 'Paint Correction', emoji: '✨' },
  { id: 'ceramic-coating', label: 'Ceramic Coating', emoji: '🛡️' },
  { id: 'interior-detail', label: 'Interior Detailing', emoji: '🧼' },
  { id: 'exterior-wash', label: 'Exterior Wash & Wax', emoji: '💧' },
  { id: 'headlight-restoration', label: 'Headlight Restoration', emoji: '💡' },
  { id: 'engine-cleaning', label: 'Engine Bay Cleaning', emoji: '🔧' },
  { id: 'leather-care', label: 'Leather Care', emoji: '🪑' },
  { id: 'odor-removal', label: 'Odor Removal', emoji: '🌬️' },
  { id: 'pet-hair-removal', label: 'Pet Hair Removal', emoji: '🐕' },
  { id: 'scratch-removal', label: 'Scratch & Swirl Removal', emoji: '🔄' },
  { id: 'fleet-services', label: 'Fleet Services', emoji: '🚛' },
  { id: 'rv-detailing', label: 'RV Detailing', emoji: '🚐' },
  { id: 'rv-boat', label: 'RV & Boat Detailing', emoji: '⛵' },
  { id: 'mobile-only', label: 'Mobile Only', emoji: '🚗' },
  { id: 'eco-friendly', label: 'Eco-Friendly Products', emoji: '♻️' },
];

export function ServiceSpecialtiesSelector({
  initialSpecialties = [],
  onChange,
  maxSelections = 6,
}: ServiceSpecialtiesSelectorProps) {
  const [selected, setSelected] = useState<string[]>(initialSpecialties);

  const handleToggle = (specialtyId: string) => {
    let newSelected: string[];
    
    if (selected.includes(specialtyId)) {
      newSelected = selected.filter(id => id !== specialtyId);
    } else {
      if (selected.length >= maxSelections) {
        return; // Max selections reached
      }
      newSelected = [...selected, specialtyId];
    }
    
    setSelected(newSelected);
    onChange(newSelected);
  };

  const specialty = SPECIALTIES.find(s => selected.includes(s.id));
  const remainingSelections = maxSelections - selected.length;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          Service Specialties
        </CardTitle>
        <CardDescription>
          Highlight what makes you unique (select up to {maxSelections})
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Selection Counter */}
        <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
          <div>
            <p className="text-sm">
              <strong>{selected.length}</strong> of {maxSelections} selected
            </p>
            {remainingSelections > 0 && (
              <p className="text-xs text-gray-600">
                {remainingSelections} more {remainingSelections === 1 ? 'specialty' : 'specialties'} available
              </p>
            )}
          </div>
          {selected.length === maxSelections && (
            <Badge className="bg-purple-100 text-purple-700 border-purple-200">
              Max reached
            </Badge>
          )}
        </div>

        {/* Specialties Grid */}
        <div className="grid grid-cols-2 gap-3">
          {SPECIALTIES.map((specialty, index) => {
            const isSelected = selected.includes(specialty.id);
            const isDisabled = !isSelected && selected.length >= maxSelections;

            return (
              <motion.button
                key={specialty.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => !isDisabled && handleToggle(specialty.id)}
                disabled={isDisabled}
                className={`
                  relative p-4 rounded-xl border-2 transition-all text-left
                  ${isSelected 
                    ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md' 
                    : isDisabled
                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
                  }
                `}
              >
                {/* Checkmark */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}

                {/* Content */}
                <div className="space-y-1">
                  <div className="text-2xl">{specialty.emoji}</div>
                  <p className={`text-sm ${isSelected ? 'font-medium' : ''}`}>
                    {specialty.label}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Preview */}
        {selected.length > 0 && (
          <div className="bg-white border-2 border-purple-200 rounded-xl p-4">
            <h4 className="text-sm mb-2">Your Specialties</h4>
            <div className="flex flex-wrap gap-2">
              {selected.map((id) => {
                const specialty = SPECIALTIES.find(s => s.id === id);
                return specialty ? (
                  <Badge
                    key={id}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0"
                  >
                    {specialty.emoji} {specialty.label}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="text-sm mb-2">💡 Why this matters</h4>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>• Helps customers find detailers with specific expertise</li>
            <li>• Shows up in search filters and marketplace cards</li>
            <li>• Differentiates you from competitors</li>
            <li>• Can lead to higher-value specialized jobs</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
