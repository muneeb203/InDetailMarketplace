import { useState } from 'react';

interface AvatarWithFallbackProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-2xl',
};

export function AvatarWithFallback({ 
  src, 
  name, 
  size = 'md',
  className = '' 
}: AvatarWithFallbackProps) {
  const [imageError, setImageError] = useState(false);
  
  // Get first letter of name (or first letter of first word if multiple words)
  const getInitial = () => {
    if (!name) return '?';
    const trimmed = name.trim();
    return trimmed.charAt(0).toUpperCase();
  };

  const showFallback = !src || imageError;

  return (
    <div 
      className={`${sizeClasses[size]} rounded-lg flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 flex-shrink-0 ${className}`}
    >
      {showFallback ? (
        <span className="font-semibold text-white">
          {getInitial()}
        </span>
      ) : (
        <img
          src={src}
          alt={`${name} logo`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
}
