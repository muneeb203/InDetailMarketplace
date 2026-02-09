import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Share2, Link, QrCode, Check, Download } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ShareProfileCardProps {
  detailerId: string;
  businessName: string;
}

export function ShareProfileCard({ detailerId, businessName }: ShareProfileCardProps) {
  const [copied, setCopied] = useState(false);

  const profileUrl = `${window.location.origin}/profile/${detailerId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success('Profile link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleDownloadQR = () => {
    // In production, this would generate and download a QR code
    toast.success('QR code downloaded!', {
      description: 'Share this QR code to make it easy for customers to find your profile.',
    });
  };

  return (
    <Card className="p-6 space-y-4 bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
          <Share2 className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3>Share Your Profile</h3>
          <p className="text-sm text-gray-600 mt-1">
            Make it easy for customers to find and book your services
          </p>
        </div>
      </div>

      {/* Profile URL Display */}
      <div className="p-3 bg-white border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-500 mb-1">Your Profile URL</p>
        <p className="text-sm text-gray-700 font-mono break-all">{profileUrl}</p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="gap-2 hover:bg-blue-50 hover:border-blue-300"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Link className="w-4 h-4" />
              Copy Link
            </>
          )}
        </Button>

        <Button
          onClick={handleDownloadQR}
          variant="outline"
          className="gap-2 hover:bg-purple-50 hover:border-purple-300"
        >
          <QrCode className="w-4 h-4" />
          Download QR
        </Button>
      </div>

      {/* QR Code Preview (Placeholder) */}
      <div className="relative p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
            <QrCode className="w-16 h-16 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">{businessName}</p>
            <p className="text-xs text-gray-500 mt-1">Scan to view profile</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownloadQR}
            className="gap-2"
          >
            <Download className="w-3 h-3" />
            Download High-Res
          </Button>
        </div>
      </div>

      {/* Tips */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-900">
          💡 <strong>Pro Tip:</strong> Add your QR code to business cards, vehicle signage, 
          or promotional materials to drive more bookings!
        </p>
      </div>
    </Card>
  );
}
