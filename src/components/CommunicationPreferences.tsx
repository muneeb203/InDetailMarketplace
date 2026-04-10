import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Phone, MessageSquare, Video } from 'lucide-react';
import { motion } from 'motion/react';

export type CommPreference = 'voice' | 'voice-chat' | 'chat-only';

interface CommunicationPreferencesProps {
  value: CommPreference;
  onChange: (value: CommPreference) => void;
  showBadge?: boolean;
}

const preferences = [
  {
    value: 'voice' as CommPreference,
    label: 'Voice Preferred',
    description: 'I prefer phone calls for quick communication',
    icon: Phone,
    badge: 'Phone-Friendly',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    value: 'voice-chat' as CommPreference,
    label: 'Voice + Chat',
    description: "I'm comfortable with both calls and messages",
    icon: MessageSquare,
    badge: 'Phone-Friendly',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    value: 'chat-only' as CommPreference,
    label: 'Chat Only',
    description: 'I prefer text messages and chat',
    icon: MessageSquare,
    badge: null,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
];

export function CommunicationPreferences({ 
  value, 
  onChange,
  showBadge = true 
}: CommunicationPreferencesProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">Communication Preference</Label>
        {showBadge && (value === 'voice' || value === 'voice-chat') && (
          <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
            <Phone className="w-3 h-3 mr-1" />
            Phone-Friendly
          </Badge>
        )}
      </div>
      
      <p className="text-xs text-gray-600">
        Let others know how you prefer to communicate
      </p>

      <div className="space-y-2">
        {preferences.map((pref) => {
          const Icon = pref.icon;
          const isSelected = value === pref.value;

          return (
            <motion.button
              key={pref.value}
              onClick={() => onChange(pref.value)}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-left transition-all ${
                isSelected
                  ? `${pref.bgColor} border-2 ${pref.borderColor} shadow-sm`
                  : 'bg-white border-2 border-gray-200 hover:border-gray-300'
              }`}
              style={{ borderRadius: '12px', padding: '12px' }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isSelected ? pref.bgColor : 'bg-gray-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? pref.color : 'text-gray-500'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm">{pref.label}</p>
                    {isSelected && pref.badge && (
                      <Badge className="bg-green-100 text-green-700 border-green-300 text-xs px-1.5 py-0">
                        {pref.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{pref.description}</p>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 bg-[#0078FF] rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Helper Text */}
      <Card className="p-3 bg-blue-50 border-blue-200">
        <p className="text-xs text-gray-700">
          <strong>Tip:</strong> Selecting "Voice Preferred" or "Voice + Chat" will display a 
          "Phone-Friendly" badge on your profile, helping you connect faster with detailers who value quick calls.
        </p>
      </Card>
    </div>
  );
}

export function PhoneFriendlyBadge({ className = '' }: { className?: string }) {
  return (
    <Badge className={`bg-green-100 text-green-700 border-green-300 text-xs ${className}`}>
      <Phone className="w-3 h-3 mr-1" />
      Phone-Friendly
    </Badge>
  );
}