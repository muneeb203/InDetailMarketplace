import React from 'react';
import { Instagram, Youtube, Facebook } from 'lucide-react';
import { cn } from '../ui/utils';

interface SocialIconsProps {
  instagram?: { handle: string; connected: boolean };
  tiktok?: { handle: string; connected: boolean };
  youtube?: { handle: string; connected: boolean };
  facebook?: { handle: string; connected: boolean };
  googleBusiness?: { handle: string; connected: boolean };
  onSocialClick?: (platform: string) => void;
  className?: string;
}

export function SocialIcons({
  instagram,
  tiktok,
  youtube,
  facebook,
  googleBusiness,
  onSocialClick,
  className,
}: SocialIconsProps) {
  const socials = [
    { key: 'instagram', data: instagram, icon: Instagram, color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400' },
    { key: 'tiktok', data: tiktok, icon: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
      </svg>
    ), color: 'bg-black' },
    { key: 'youtube', data: youtube, icon: Youtube, color: 'bg-red-600' },
    { key: 'facebook', data: facebook, icon: Facebook, color: 'bg-blue-600' },
    { key: 'googleBusiness', data: googleBusiness, icon: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
      </svg>
    ), color: 'bg-white border border-gray-300' },
  ];

  const connectedSocials = socials.filter(social => social.data?.connected);

  if (connectedSocials.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-gray-600 mr-1">Follow:</span>
      {connectedSocials.map(({ key, data, icon: Icon, color }) => (
        <button
          key={key}
          onClick={() => onSocialClick?.(key)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95",
            color
          )}
          aria-label={`View ${key} profile`}
        >
          <Icon className={cn("w-5 h-5", key === 'googleBusiness' && "text-gray-700")} />
        </button>
      ))}
      <span className="text-xs text-gray-500 ml-1">
        {connectedSocials.length} connected
      </span>
    </div>
  );
}
