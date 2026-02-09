import React from 'react';
import { X, Copy, Download, Mail, MessageCircle, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareQRPanelProps {
  isOpen: boolean;
  onClose: () => void;
  profileUrl: string;
  shopName: string;
}

export function ShareQRPanel({
  isOpen,
  onClose,
  profileUrl,
  shopName,
}: ShareQRPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    // Placeholder for QR download
    alert('QR code download would start here');
  };

  const handleShare = (method: string) => {
    // Placeholder for share actions
    alert(`Share via ${method} would open here`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-bold mb-1">Share Your Profile</h2>
          <p className="text-blue-100 text-sm">Get more customers by sharing your link</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Profile Link
            </label>
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 font-mono text-sm text-gray-900 truncate">
                {profileUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="w-12 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors active:scale-95 flex-shrink-0"
                aria-label="Copy link"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <Copy className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-green-600 text-sm mt-2 animate-in fade-in duration-200">
                ✓ Link copied to clipboard!
              </p>
            )}
          </div>

          {/* QR Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              QR Code
            </label>
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center">
              {/* QR Code placeholder */}
              <div className="w-48 h-48 mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center mb-4 border border-gray-200">
                <div className="grid grid-cols-8 gap-1 p-4">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 ${
                        Math.random() > 0.5 ? 'bg-gray-900' : 'bg-white'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Scan to see {shopName}'s profile & book
              </p>
              <button
                onClick={handleDownloadQR}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download QR</span>
              </button>
            </div>
          </div>

          {/* Quick Share */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quick Share
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => handleShare('Messages')}
                className="flex-1 h-14 rounded-xl border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all active:scale-95 flex flex-col items-center justify-center gap-1"
              >
                <MessageCircle className="w-5 h-5 text-gray-700" />
                <span className="text-xs font-medium text-gray-700">Messages</span>
              </button>
              <button
                onClick={() => handleShare('Email')}
                className="flex-1 h-14 rounded-xl border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all active:scale-95 flex flex-col items-center justify-center gap-1"
              >
                <Mail className="w-5 h-5 text-gray-700" />
                <span className="text-xs font-medium text-gray-700">Email</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
