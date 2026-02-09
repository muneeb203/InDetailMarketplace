import React, { useState } from 'react';
import { ArrowLeft, MapPin, Clock, Droplet, DollarSign, MessageCircle, Phone, Check, X, Image } from 'lucide-react';
import { cn } from '../ui/utils';

// Helper to get navigation functions (works with or without react-router)
function useNav() {
  try {
    const { useNavigate: rUseNavigate } = require('react-router-dom');
    return rUseNavigate();
  } catch {
    return (path: string, options?: any) => {
      if (path === '/pro/dashboard') {
        window.history.back();
      } else if (path.includes('quote-composer') || path.includes('messages')) {
        const leadName = options?.state?.lead?.clientName || 'customer';
        const actionType = path.includes('quote') ? 'quote composer' : 'messages';
        alert(`Opening ${actionType} for: ${leadName}`);
      }
    };
  }
}

interface Lead {
  id: string;
  clientName: string;
  services: string[];
  vehicle: string;
  distance: string;
  timeWindow: string;
  photos: string[];
  waterSource: 'yes' | 'no' | 'bring';
  depositRequired: boolean;
  timestamp: string;
}

export function ProLeadInbox() {
  const navigate = useNav();
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      clientName: 'Jessica T.',
      services: ['Interior Deep Clean', 'Pet Hair Removal'],
      vehicle: '2020 Honda CR-V',
      distance: '3.2 mi away',
      timeWindow: 'Tomorrow, 10 AM - 2 PM',
      photos: ['1', '2', '3'],
      waterSource: 'yes',
      depositRequired: true,
      timestamp: '15 min ago',
    },
    {
      id: '2',
      clientName: 'Marcus L.',
      services: ['Full Exterior Detail', 'Ceramic Coating'],
      vehicle: '2023 Tesla Model S',
      distance: '5.8 mi away',
      timeWindow: 'This Saturday, Flexible',
      photos: ['1', '2'],
      waterSource: 'bring',
      depositRequired: false,
      timestamp: '1 hour ago',
    },
    {
      id: '3',
      clientName: 'Amy K.',
      services: ['RV Detailing'],
      vehicle: '2018 Thor Motorhome',
      distance: '12.4 mi away',
      timeWindow: 'Next week, Monday-Friday',
      photos: ['1', '2', '3', '4'],
      waterSource: 'no',
      depositRequired: true,
      timestamp: '3 hours ago',
    },
  ]);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleAccept = (lead: Lead) => {
    setSelectedLead(lead);
    // Navigate to quote composer
    navigate('/pro/quote-composer', { state: { lead } });
  };

  const handlePass = (leadId: string) => {
    if (confirm('Pass on this lead? You won\'t be able to see it again.')) {
      setLeads(leads.filter(l => l.id !== leadId));
    }
  };

  const handleMessage = (lead: Lead) => {
    navigate('/pro/messages', { state: { lead } });
  };

  const handleRequestCall = (lead: Lead) => {
    alert(`Call request sent to ${lead.clientName}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/pro/dashboard')}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="font-bold text-xl text-gray-900">Lead Inbox</h1>
              <p className="text-sm text-gray-600">{leads.length} new opportunities</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {leads.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">
              No new leads at the moment. Check back soon for opportunities.
            </p>
          </div>
        ) : (
          leads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              {/* Lead Header */}
              <div className="p-4 border-b bg-gradient-to-br from-blue-50 to-white">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{lead.clientName}</h3>
                    <p className="text-sm text-gray-600">{lead.timestamp}</p>
                  </div>
                  {lead.depositRequired && (
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      <DollarSign className="w-3 h-3 inline mr-1" />
                      Deposit Ready
                    </span>
                  )}
                </div>

                {/* Services */}
                <div className="flex flex-wrap gap-2">
                  {lead.services.map((service) => (
                    <span key={service} className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Lead Details */}
              <div className="p-4 space-y-3">
                {/* Vehicle */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🚗</span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Vehicle</div>
                    <div className="font-medium text-gray-900">{lead.vehicle}</div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Distance</div>
                    <div className="font-medium text-gray-900">{lead.distance}</div>
                  </div>
                </div>

                {/* Time Window */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Preferred Time</div>
                    <div className="font-medium text-gray-900">{lead.timeWindow}</div>
                  </div>
                </div>

                {/* Water Source */}
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    lead.waterSource === 'yes' ? 'bg-green-100' : lead.waterSource === 'bring' ? 'bg-orange-100' : 'bg-red-100'
                  )}>
                    <Droplet className={cn(
                      "w-5 h-5",
                      lead.waterSource === 'yes' ? 'text-green-600' : lead.waterSource === 'bring' ? 'text-orange-600' : 'text-red-600'
                    )} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Water Source</div>
                    <div className="font-medium text-gray-900">
                      {lead.waterSource === 'yes' && 'Available on-site'}
                      {lead.waterSource === 'bring' && 'Pro will bring'}
                      {lead.waterSource === 'no' && 'Not available'}
                    </div>
                  </div>
                </div>

                {/* Photos */}
                {lead.photos.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Client Photos ({lead.photos.length})</div>
                    <div className="flex gap-2">
                      {lead.photos.slice(0, 4).map((photo, index) => (
                        <div key={index} className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden">
                          <Image className="w-6 h-6 text-gray-500" />
                        </div>
                      ))}
                      {lead.photos.length > 4 && (
                        <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">+{lead.photos.length - 4}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 bg-gray-50 border-t grid grid-cols-2 gap-3">
                <button
                  onClick={() => handlePass(lead.id)}
                  className="h-12 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  <span>Pass</span>
                </button>

                <button
                  onClick={() => handleAccept(lead)}
                  className="h-12 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold hover:from-green-700 hover:to-green-800 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept & Quote</span>
                </button>

                <button
                  onClick={() => handleMessage(lead)}
                  className="h-12 rounded-xl border-2 border-blue-300 bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Message</span>
                </button>

                <button
                  onClick={() => handleRequestCall(lead)}
                  className="h-12 rounded-xl border-2 border-blue-300 bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Request Call</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}