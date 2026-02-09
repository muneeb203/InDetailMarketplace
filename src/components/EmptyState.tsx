import { Button } from './ui/button';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  illustration?: 'search' | 'inbox' | 'checkmark' | 'folder';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  illustration,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]"
    >
      {/* Icon/Illustration */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="mb-6"
      >
        {illustration ? (
          <IllustrationSVG type={illustration} />
        ) : (
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
            <Icon className="w-12 h-12 text-blue-600" />
          </div>
        )}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-md"
      >
        <h3 className="mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
      </motion.div>

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {actionLabel && onAction && (
            <Button onClick={onAction} className="bg-blue-600 hover:bg-blue-700">
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button onClick={onSecondaryAction} variant="outline">
              {secondaryActionLabel}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// Simple SVG Illustrations
function IllustrationSVG({ type }: { type: string }) {
  const illustrations = {
    search: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="50" fill="#EFF6FF" />
        <circle cx="50" cy="50" r="20" stroke="#3B82F6" strokeWidth="3" fill="none" />
        <line x1="65" y1="65" x2="80" y2="80" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    inbox: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <rect x="20" y="30" width="80" height="60" rx="8" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" />
        <path d="M20 50 L60 70 L100 50" stroke="#3B82F6" strokeWidth="2" fill="none" />
      </svg>
    ),
    checkmark: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="50" fill="#D1FAE5" />
        <path d="M40 60 L55 75 L80 45" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
    folder: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <path d="M20 40 L40 30 L60 40 L100 40 L100 90 L20 90 Z" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" />
      </svg>
    ),
  };

  return <div className="mb-4">{illustrations[type as keyof typeof illustrations]}</div>;
}
