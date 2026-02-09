import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Instagram, 
  Youtube, 
  Facebook, 
  Link, 
  Check, 
  X,
  ExternalLink
} from 'lucide-react';
import { SocialConnection } from '../types';
import { toast } from "sonner";

interface SocialConnectionsStepProps {
  onSave: (connections: SocialConnection[]) => void;
  initialConnections?: SocialConnection[];
}

export function SocialConnectionsStep({ onSave, initialConnections = [] }: SocialConnectionsStepProps) {
  const [connections, setConnections] = useState<SocialConnection[]>(
    initialConnections.length > 0
      ? initialConnections
      : [
          {
            platform: 'instagram',
            username: '',
            url: '',
            isConnected: false,
          },
          {
            platform: 'tiktok',
            username: '',
            url: '',
            isConnected: false,
          },
          {
            platform: 'youtube',
            username: '',
            url: '',
            isConnected: false,
          },
          {
            platform: 'facebook',
            username: '',
            url: '',
            isConnected: false,
          },
          {
            platform: 'google-business',
            username: '',
            url: '',
            isConnected: false,
          },
        ]
  );

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return Instagram;
      case 'youtube':
        return Youtube;
      case 'facebook':
        return Facebook;
      case 'tiktok':
        return () => (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
          </svg>
        );
      case 'google-business':
        return () => (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        );
      default:
        return Link;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return 'from-purple-500 to-pink-500';
      case 'tiktok':
        return 'from-black to-gray-800';
      case 'youtube':
        return 'from-red-600 to-red-700';
      case 'facebook':
        return 'from-blue-600 to-blue-700';
      case 'google-business':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-gray-600 to-gray-700';
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

  const handleConnect = (index: number) => {
    const connection = connections[index];
    
    if (!connection.url) {
      toast.error('Please enter a profile URL');
      return;
    }

    // Mock OAuth flow - in production, this would open OAuth window
    const updatedConnections = [...connections];
    updatedConnections[index] = {
      ...connection,
      isConnected: true,
      lastSynced: new Date(),
    };
    setConnections(updatedConnections);
    toast.success(`${getPlatformName(connection.platform)} connected!`);
  };

  const handleDisconnect = (index: number) => {
    const updatedConnections = [...connections];
    updatedConnections[index] = {
      ...updatedConnections[index],
      isConnected: false,
      lastSynced: undefined,
    };
    setConnections(updatedConnections);
    toast.success('Disconnected');
  };

  const handleUrlChange = (index: number, url: string) => {
    const updatedConnections = [...connections];
    updatedConnections[index] = {
      ...updatedConnections[index],
      url,
    };
    setConnections(updatedConnections);
  };

  const handleSave = () => {
    const connectedPlatforms = connections.filter(c => c.isConnected);
    onSave(connections);
    
    if (connectedPlatforms.length > 0) {
      toast.success(`${connectedPlatforms.length} social platform(s) connected!`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2>Connect Your Social Media</h2>
        <p className="text-gray-600">
          Showcase your work and build trust by connecting your social profiles. 
          Customers can see your latest posts and transformations directly in your profile.
        </p>
      </div>

      {/* Connection Cards */}
      <div className="space-y-4">
        {connections.map((connection, index) => {
          const Icon = getPlatformIcon(connection.platform);
          
          return (
            <Card key={connection.platform} className="p-4">
              <div className="flex items-start gap-4">
                {/* Platform Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getPlatformColor(connection.platform)} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 space-y-3">
                  {/* Platform Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4>{getPlatformName(connection.platform)}</h4>
                      {connection.isConnected && (
                        <Badge className="mt-1 bg-green-100 text-green-700 border-0 text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* URL Input */}
                  {!connection.isConnected ? (
                    <div className="space-y-2">
                      <Label htmlFor={`url-${connection.platform}`}>Profile URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id={`url-${connection.platform}`}
                          type="url"
                          placeholder={`https://${connection.platform}.com/yourprofile`}
                          value={connection.url}
                          onChange={(e) => handleUrlChange(index, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleConnect(index)}
                          className={`bg-gradient-to-r ${getPlatformColor(connection.platform)} text-white`}
                        >
                          Connect
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Paste your profile URL to connect and sync your posts
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-700">
                            Syncing posts automatically
                          </span>
                        </div>
                        <a
                          href={connection.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConnect(index)}
                          className="flex-1"
                        >
                          Re-sync
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect(index)}
                          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Benefits Card */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <h4>Why Connect Social Media?</h4>
        <ul className="mt-2 space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 flex-shrink-0">✓</span>
            <span>Showcase your latest work automatically</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 flex-shrink-0">✓</span>
            <span>Build trust with real customer transformations</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 flex-shrink-0">✓</span>
            <span>Increase profile views by up to 3x</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 flex-shrink-0">✓</span>
            <span>Customers can follow you for updates</span>
          </li>
        </ul>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={handleSave}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
        >
          Continue
        </Button>
      </div>

      <p className="text-xs text-center text-gray-500">
        You can always add or update your social connections later in your profile settings
      </p>
    </div>
  );
}
