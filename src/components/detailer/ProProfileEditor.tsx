import React, { useState } from 'react';
import { ArrowLeft, Save, Eye, Upload, Plus, X, Trash2, GripVertical, MapPin, Clock, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { SocialIcons } from './SocialIcons';
import { SocialPreviewModal } from './SocialPreviewModal';
import { DealerImageManager } from './DealerImageManager';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../ui/utils';

// Helper to get navigation functions (works with or without react-router)
function useNav() {
  try {
    // Try to use react-router if available
    const { useNavigate: rUseNavigate, useLocation: rUseLocation } = require('react-router-dom');
    return {
      navigate: rUseNavigate(),
      location: rUseLocation(),
    };
  } catch {
    // Fallback to mock navigation
    return {
      navigate: (path: string | number) => {
        if (path === '/pro/dashboard' || path === -1) {
          window.history.back();
        }
      },
      location: { search: '' },
    };
  }
}

type Tab = 'brand' | 'social' | 'portfolio' | 'services' | 'radius' | 'availability' | 'contact';

interface ProProfileEditorProps {
  onNavigate?: (view: string, params?: any) => void;
}

export function ProProfileEditor({ onNavigate }: ProProfileEditorProps = {}) {
  const { navigate, location } = useNav();
  const { currentUser } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = (queryParams.get('tab') as Tab) || 'brand';

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [selectedSocial, setSelectedSocial] = useState<{ platform: string; handle: string } | null>(null);

  // Brand tab state
  const [brandData, setBrandData] = useState({
    tagline: 'Perfection in every detail',
    bio: 'Premium mobile auto detailing with 10+ years of experience. Specializing in luxury vehicles and paint correction.',
    accentColor: '#0078FF',
    yearsInBusiness: '10',
    certifications: 'IDA Certified, Paint Correction Specialist',
  });

  // Social tab state
  const [socialConnections, setSocialConnections] = useState({
    instagram: { handle: 'eliteautodetailing', connected: true },
    tiktok: { handle: 'eliteautodetail', connected: true },
    youtube: { handle: 'eliteautodetailing', connected: false },
    facebook: { handle: 'eliteautodetail', connected: false },
    googleBusiness: { handle: 'elite-auto-detailing-sf', connected: true },
  });
  const [showSocialStrip, setShowSocialStrip] = useState(true);

  // Portfolio tab state
  const [portfolioItems, setPortfolioItems] = useState([
    { id: '1', title: 'Full Exterior Detail', tags: ['black paint', 'ceramic coating'], pinned: true },
    { id: '2', title: 'Pet Hair Removal', tags: ['pet hair', 'interior'], pinned: true },
    { id: '3', title: 'Paint Correction', tags: ['paint correction', 'luxury'], pinned: false },
  ]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'brand', label: 'Brand' },
    { id: 'social', label: 'Social' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'services', label: 'Services' },
    { id: 'radius', label: 'Radius' },
    { id: 'availability', label: 'Hours' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleSocialClick = (platform: string) => {
    const social = socialConnections[platform as keyof typeof socialConnections];
    if (social?.connected) {
      setSelectedSocial({ platform, handle: social.handle });
      setShowSocialModal(true);
    }
  };

  const handleSave = () => {
    toast.success('Profile saved successfully!');
    if (onNavigate) {
      onNavigate('settings');
    } else {
      navigate('/settings');
    }
  };

  const handlePreview = () => {
    if (onNavigate) {
      onNavigate('pro-public-profile');
    } else {
      navigate('/pro/public-profile');
    }
  };
  
  const handleBack = () => {
    if (onNavigate) {
      onNavigate('pro-dashboard');
    } else {
      navigate('/pro/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="font-bold text-xl text-gray-900">Profile Editor</h1>
              <p className="text-sm text-gray-600">Edit your professional profile</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 overflow-x-auto">
          <div className="flex gap-1 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4">
        {/* Brand Tab */}
        {activeTab === 'brand' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="font-semibold text-lg mb-4">Brand Assets</h2>
              
              <div className="space-y-6">
                {/* Logo & Portfolio (Supabase Storage) */}
                {currentUser?.role === 'detailer' && currentUser?.id && (
                  <DealerImageManager userId={currentUser.id} />
                )}

                {/* Banner Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
                  <div className="h-32 rounded-xl bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer transition-colors">
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload banner (recommended: 1200x300)</p>
                    </div>
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={brandData.accentColor}
                      onChange={(e) => setBrandData({ ...brandData, accentColor: e.target.value })}
                      className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                    <input
                      type="text"
                      value={brandData.accentColor}
                      onChange={(e) => setBrandData({ ...brandData, accentColor: e.target.value })}
                      className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 font-mono text-sm focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tagline <span className="text-gray-500">({brandData.tagline.length}/70)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={70}
                    value={brandData.tagline}
                    onChange={(e) => setBrandData({ ...brandData, tagline: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-400 focus:outline-none"
                    placeholder="Your catchy tagline"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio <span className="text-gray-500">({brandData.bio.length}/240)</span>
                  </label>
                  <textarea
                    maxLength={240}
                    rows={4}
                    value={brandData.bio}
                    onChange={(e) => setBrandData({ ...brandData, bio: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-400 focus:outline-none resize-none"
                    placeholder="Tell customers about your business"
                  />
                </div>

                {/* Years in Business */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years in Business</label>
                  <input
                    type="number"
                    min="0"
                    value={brandData.yearsInBusiness}
                    onChange={(e) => setBrandData({ ...brandData, yearsInBusiness: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-400 focus:outline-none"
                  />
                </div>

                {/* Certifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certifications & Training</label>
                  <textarea
                    rows={3}
                    value={brandData.certifications}
                    onChange={(e) => setBrandData({ ...brandData, certifications: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-400 focus:outline-none resize-none"
                    placeholder="List your certifications, training, and credentials"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Social Tab */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="font-semibold text-lg mb-4">Social Media Connections</h2>
              
              <div className="space-y-4">
                {Object.entries(socialConnections).map(([platform, data]) => (
                  <div key={platform} className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        data.connected ? "bg-gradient-to-br from-blue-500 to-blue-600" : "bg-gray-200"
                      )}>
                        <span className="text-white font-medium capitalize text-sm">
                          {platform.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 capitalize">{platform}</div>
                        {data.connected ? (
                          <div className="text-sm text-gray-600">@{data.handle}</div>
                        ) : (
                          <div className="text-sm text-gray-500">Not connected</div>
                        )}
                      </div>
                    </div>
                    
                    {data.connected ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSocialClick(platform)}
                          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors text-sm"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => setSocialConnections({
                            ...socialConnections,
                            [platform]: { ...data, connected: false }
                          })}
                          className="px-4 py-2 rounded-lg border-2 border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors text-sm"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSocialConnections({
                          ...socialConnections,
                          [platform]: { ...data, connected: true }
                        })}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSocialStrip}
                    onChange={(e) => setShowSocialStrip(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Show social strip on public profile</div>
                    <div className="text-sm text-gray-600">Display your connected social accounts to customers</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Before & After Gallery</h2>
                <button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Set
                </button>
              </div>

              <div className="space-y-3">
                {portfolioItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors bg-white">
                    <button className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                      <GripVertical className="w-5 h-5" />
                    </button>

                    <div className="grid grid-cols-2 gap-2 w-32">
                      <div className="aspect-square rounded bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-2xl opacity-30">🚗</span>
                      </div>
                      <div className="aspect-square rounded bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                        <span className="text-2xl opacity-40">✨</span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600">
                            {tag}
                          </span>
                        ))}
                        {item.pinned && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-xs text-blue-700 font-medium">
                            ⭐ Pinned
                          </span>
                        )}
                      </div>
                    </div>

                    <button className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-900">
                  <strong>Tip:</strong> Pin up to 3 signature jobs to show first. Drag to reorder.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Services & Pricing Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="font-semibold text-lg mb-4">Services & Pricing</h2>
              <p className="text-gray-600 text-sm mb-6">Set starting prices for each service</p>

              <div className="space-y-4">
                {[
                  'Exterior Wash & Wax',
                  'Interior Deep Clean',
                  'Engine Bay Detail',
                  'Headlight Restoration',
                  'Paint Correction',
                  'Ceramic Coating',
                  'RV Detailing',
                  'Fleet Services'
                ].map((service) => (
                  <div key={service} className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200">
                    <span className="font-medium text-gray-900">{service}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">From</span>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-24 px-3 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-400 focus:outline-none text-right"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Service Radius Tab */}
        {activeTab === 'radius' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="font-semibold text-lg mb-4">Service Radius</h2>
              
              {/* Map placeholder */}
              <div className="aspect-video rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 mb-4 flex items-center justify-center border-2 border-gray-200">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-600">Interactive map</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Radius (miles)</label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  defaultValue="15"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>5 mi</span>
                  <span className="font-medium text-blue-600">15 miles</span>
                  <span>50 mi</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="font-semibold text-lg mb-4">Availability</h2>
              
              <div className="space-y-3">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div key={day} className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200">
                    <input type="checkbox" defaultChecked={day !== 'Sunday'} className="w-5 h-5 rounded border-gray-300 text-blue-600" />
                    <span className="font-medium text-gray-900 w-28">{day}</span>
                    <input type="time" defaultValue="09:00" className="px-3 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-400 focus:outline-none" />
                    <span className="text-gray-500">to</span>
                    <input type="time" defaultValue="18:00" className="px-3 py-2 rounded-lg border-2 border-gray-300 focus:border-blue-400 focus:outline-none" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contact Preferences Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="font-semibold text-lg mb-4">Contact Preferences</h2>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Enable "Request a Call" windows</div>
                    <div className="text-sm text-gray-600">Let customers schedule callback times</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Masked phone calls</div>
                    <div className="text-sm text-gray-600">Protect your privacy with number masking</div>
                  </div>
                </label>

                <div className="p-4 rounded-xl border-2 border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Languages Spoken</label>
                  <input
                    type="text"
                    defaultValue="English, Spanish"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-400 focus:outline-none"
                    placeholder="e.g., English, Spanish"
                  />
                </div>

                <div className="p-4 rounded-xl border-2 border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Response Time Promise</label>
                  <select className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-400 focus:outline-none">
                    <option>Under 15 minutes</option>
                    <option>Under 30 minutes</option>
                    <option>Under 1 hour</option>
                    <option>Within 2 hours</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-3">
          <button
            onClick={handlePreview}
            className="flex-1 h-12 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:border-blue-400 hover:bg-blue-50 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
          <button
            onClick={handleSave}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Social Preview Modal */}
      {selectedSocial && (
        <SocialPreviewModal
          isOpen={showSocialModal}
          onClose={() => {
            setShowSocialModal(false);
            setSelectedSocial(null);
          }}
          platform={selectedSocial.platform}
          handle={selectedSocial.handle}
        />
      )}
    </div>
  );
}