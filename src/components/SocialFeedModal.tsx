import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, ExternalLink, Users } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SocialConnection } from '../types';

interface SocialFeedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: SocialConnection;
}

export function SocialFeedModal({ open, onOpenChange, connection }: SocialFeedModalProps) {
  // Mock feed data - in production, this would be fetched from the social platform API
  const mockPosts = [
    {
      id: '1',
      thumbnail: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&q=80',
      likes: 234,
      comments: 12,
    },
    {
      id: '2',
      thumbnail: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=400&q=80',
      likes: 189,
      comments: 8,
    },
    {
      id: '3',
      thumbnail: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400&q=80',
      likes: 312,
      comments: 15,
    },
    {
      id: '4',
      thumbnail: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400&q=80',
      likes: 156,
      comments: 7,
    },
    {
      id: '5',
      thumbnail: 'https://images.unsplash.com/photo-1610047802935-eb567e1eb88c?w=400&q=80',
      likes: 278,
      comments: 11,
    },
    {
      id: '6',
      thumbnail: 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=400&q=80',
      likes: 201,
      comments: 9,
    },
  ];

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'tiktok':
        return 'bg-black';
      case 'youtube':
        return 'bg-red-600';
      case 'facebook':
        return 'bg-blue-600';
      case 'google-business':
        return 'bg-blue-500';
      default:
        return 'bg-gray-600';
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'google-business':
        return 'Google Business';
      default:
        return platform.charAt(0).toUpperCase() + platform.slice(1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-white">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${getPlatformColor(connection.platform)} flex items-center justify-center text-white`}>
                {getPlatformName(connection.platform).charAt(0)}
              </div>
              <div>
                <h3 className="text-lg">{getPlatformName(connection.platform)}</h3>
                {connection.username && (
                  <p className="text-sm text-gray-500">@{connection.username}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Profile Info */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-white border-b">
            <div className="flex items-center justify-between">
              {connection.followerCount && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="w-4 h-4" />
                  <span>{connection.followerCount.toLocaleString()} followers</span>
                </div>
              )}
              <Badge variant="secondary" className="gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Connected
              </Badge>
            </div>
          </div>

          {/* Feed Grid */}
          <div className="flex-1 overflow-auto p-4 bg-gray-50">
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <h4>Latest Posts</h4>
                <p className="text-sm text-gray-500">Last 6 posts</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {mockPosts.map((post) => (
                <button
                  key={post.id}
                  className="relative aspect-square rounded-lg overflow-hidden group hover:opacity-90 transition-opacity"
                >
                  <ImageWithFallback
                    src={post.thumbnail}
                    alt="Social post"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 text-white text-xs">
                      <span>❤️ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Empty State */}
            {mockPosts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No posts available</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t bg-white flex gap-3">
            <Button
              onClick={() => window.open(connection.url, '_blank')}
              variant="outline"
              className="flex-1 gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Visit Profile
            </Button>
            <Button
              onClick={() => window.open(connection.url, '_blank')}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Follow
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
