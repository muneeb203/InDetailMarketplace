import { Check, Clock, Navigation, Play, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export type BookingStatus = 'requested' | 'accepted' | 'on-the-way' | 'started' | 'completed';

interface StatusStripProps {
  status: BookingStatus;
  className?: string;
}

const STATUSES = [
  { key: 'requested', label: 'Requested', icon: Clock },
  { key: 'accepted', label: 'Accepted', icon: Check },
  { key: 'on-the-way', label: 'On the Way', icon: Navigation },
  { key: 'started', label: 'Started', icon: Play },
  { key: 'completed', label: 'Completed', icon: CheckCircle },
];

export function StatusStrip({ status, className = '' }: StatusStripProps) {
  const currentIndex = STATUSES.findIndex((s) => s.key === status);

  return (
    <div className={`bg-white border-y py-4 ${className}`}>
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {STATUSES.map((item, index) => {
            const Icon = item.icon;
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={item.key} className="flex items-center flex-1">
                {/* Status Item */}
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                      backgroundColor: isActive ? '#3b82f6' : '#e5e7eb',
                    }}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center mb-2
                      ${isCurrent ? 'ring-4 ring-blue-100' : ''}
                    `}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? 'text-white' : 'text-gray-400'
                      }`}
                    />
                  </motion.div>
                  <span
                    className={`text-xs text-center ${
                      isActive ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Connector Line */}
                {index < STATUSES.length - 1 && (
                  <div className="flex-1 h-0.5 bg-gray-200 mx-2 relative">
                    <motion.div
                      initial={false}
                      animate={{
                        width: index < currentIndex ? '100%' : '0%',
                      }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 bg-blue-600"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
