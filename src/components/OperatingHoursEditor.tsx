import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Clock } from 'lucide-react';
import { OperatingHours } from '../types';
import { motion } from 'motion/react';

interface OperatingHoursEditorProps {
  initialHours?: OperatingHours;
  onChange: (hours: OperatingHours) => void;
}

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
] as const;

const TIME_OPTIONS = [
  '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

export function OperatingHoursEditor({ initialHours, onChange }: OperatingHoursEditorProps) {
  const [hours, setHours] = useState<OperatingHours>(initialHours || {
    mon: ['9:00', '17:00'],
    tue: ['9:00', '17:00'],
    wed: ['9:00', '17:00'],
    thu: ['9:00', '17:00'],
    fri: ['9:00', '17:00'],
  });

  const handleDayToggle = (day: keyof OperatingHours, enabled: boolean) => {
    const newHours = { ...hours };
    if (enabled) {
      newHours[day] = ['9:00', '17:00'];
    } else {
      delete newHours[day];
    }
    setHours(newHours);
    onChange(newHours);
  };

  const handleTimeChange = (
    day: keyof OperatingHours,
    index: 0 | 1,
    time: string
  ) => {
    const newHours = { ...hours };
    if (newHours[day]) {
      const times = [...newHours[day]!];
      times[index] = time;
      newHours[day] = times as [string, string];
      setHours(newHours);
      onChange(newHours);
    }
  };

  const activeDaysCount = Object.keys(hours).length;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          Operating Hours
        </CardTitle>
        <CardDescription>
          Set your availability so customers know when to book
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="bg-purple-50 rounded-xl p-4">
          <p className="text-sm text-gray-700">
            You're available <strong>{activeDaysCount} {activeDaysCount === 1 ? 'day' : 'days'}</strong> per week
          </p>
        </div>

        {/* Days List */}
        <div className="space-y-3">
          {DAYS.map(({ key, label }, index) => {
            const isActive = !!hours[key];
            const dayHours = hours[key];

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  border-2 rounded-xl p-4 transition-all
                  ${isActive ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-gray-50'}
                `}
              >
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor={`${key}-toggle`} className="text-sm cursor-pointer">
                    {label}
                  </Label>
                  <Switch
                    id={`${key}-toggle`}
                    checked={isActive}
                    onCheckedChange={(checked) => handleDayToggle(key, checked)}
                  />
                </div>

                {isActive && dayHours && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-1">
                      <Label htmlFor={`${key}-start`} className="text-xs text-gray-600 mb-1 block">
                        Open
                      </Label>
                      <Select
                        value={dayHours[0]}
                        onValueChange={(value) => handleTimeChange(key, 0, value)}
                      >
                        <SelectTrigger id={`${key}-start`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {formatTime(time)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <span className="text-gray-400 mt-5">→</span>

                    <div className="flex-1">
                      <Label htmlFor={`${key}-end`} className="text-xs text-gray-600 mb-1 block">
                        Close
                      </Label>
                      <Select
                        value={dayHours[1]}
                        onValueChange={(value) => handleTimeChange(key, 1, value)}
                      >
                        <SelectTrigger id={`${key}-end`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {formatTime(time)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                )}

                {!isActive && (
                  <p className="text-xs text-gray-500 italic">Closed</p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="text-sm mb-2">💡 Tip</h4>
          <p className="text-xs text-gray-700">
            Customers can see your availability and will prefer to book during your operating hours.
            You can still accept requests outside these times if you choose.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function formatTime(time: string): string {
  const [hours] = time.split(':');
  const hour = parseInt(hours);
  if (hour < 12) {
    return `${hour}:00 AM`;
  } else if (hour === 12) {
    return '12:00 PM';
  } else {
    return `${hour - 12}:00 PM`;
  }
}
