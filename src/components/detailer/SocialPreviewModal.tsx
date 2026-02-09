import React from 'react';
import { X, ExternalLink, Instagram, Youtube, Facebook } from 'lucide-react';
import { cn } from '../ui/utils';

interface SocialPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: string;
  handle: string;
}

export function SocialPreviewModal({
  isOpen,
  onClose,
  platform,
  handle,
}: SocialPreviewModalProps) {
  if (!isOpen) return null;

  const getPlatformIcon = () => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-6 h-6" />;
      case 'youtube':
        return <Youtube className="w-6 h-6" />;
      case 'facebook':
        return <Facebook className="w-6 h-6" />;
      case 'tiktok':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getPlatformColor = () => {
    switch (platform) {
      case 'instagram':
        return 'from-purple-500 via-pink-500 to-orange-400';
      case 'youtube':
        return 'from-red-600 to-red-700';
      case 'facebook':
        return 'from-blue-600 to-blue-700';
      case 'tiktok':
        return 'from-black to-gray-900';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  // Mock posts (6 placeholders)
  const mockPosts = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    image: `https://images.unsplash.com/photo-${1580273916089 + i * 1000000}-${Math.random().toString(36).substring(7)}?w=400&h=400&fit=crop`,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        {/* Header */}
        <div className={cn("bg-gradient-to-r text-white p-6", getPlatformColor())}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              {getPlatformIcon()}
            </div>
            <div>
              <div className="text-sm opacity-90 capitalize">{platform}</div>
              <div className="font-semibold text-lg">@{handle}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Posts grid */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {mockPosts.map((post) => (
              <div
                key={post.id}
                className="aspect-square rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden"
              >
                <div className="w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                  <span className="text-4xl opacity-20">🚗</span>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all active:scale-95">
              Follow
            </button>
            <button className="flex-1 h-12 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-2">
              <span>View More</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
