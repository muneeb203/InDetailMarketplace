import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Lead, Detailer, ServiceRequest } from '../types';
import { 
  DollarSign, AlertCircle, CheckCircle2, MapPin, Calendar, 
  Clock, Car, Sparkles, CreditCard, Zap 
} from 'lucide-react';
import { motion } from 'motion/react';
import { getLeadCost } from '../services/stripeService';
import { Alert, AlertDescription } from './ui/alert';

interface LeadAcceptanceModalProps {
  open: boolean;
  lead: Lead | null;
  request: ServiceRequest | null;
  detailer: Detailer;
  onAccept: () => void;
  onDecline: () => void;
  onBuyCredits: () => void;
  onClose: () => void;
}

export function LeadAcceptanceModal({
  open,
  lead,
  request,
  detailer,
  onAccept,
  onDecline,
  onBuyCredits,
  onClose,
}: LeadAcceptanceModalProps) {
  if (!lead || !request) return null;

  const leadCost = getLeadCost(detailer.isPro, false);
  const hasEnoughCredits = detailer.wallet >= leadCost;
  const remainingCredits = detailer.wallet - leadCost;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md max-h-[90vh] overflow-y-auto" 
        aria-describedby="lead-acceptance-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            New Lead Available
          </DialogTitle>
          <DialogDescription id="lead-acceptance-description">
            Review this service request and decide whether to accept
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Lead Cost Banner */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`
              p-4 rounded-xl border-2 
              ${hasEnoughCredits 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
              }
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className={`w-5 h-5 ${hasEnoughCredits ? 'text-green-600' : 'text-orange-600'}`} />
                <span className="text-sm">Lead Fee</span>
              </div>
              <span className="font-medium">${leadCost.toFixed(2)}</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Your Wallet</span>
                <span className="font-medium">${detailer.wallet.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">After Acceptance</span>
                <span className={`font-medium ${hasEnoughCredits ? 'text-green-600' : 'text-red-600'}`}>
                  ${remainingCredits.toFixed(2)}
                </span>
              </div>
            </div>

            {!hasEnoughCredits && (
              <div className="mt-3 pt-3 border-t border-orange-200">
                <div className="flex items-start gap-2 text-sm text-orange-800">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>Insufficient credits. You need ${(leadCost - detailer.wallet).toFixed(2)} more.</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Request Details */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h4 className="text-sm">Request Details</h4>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Car className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{request.vehicleType}</p>
                  <p className="text-xs text-gray-500">Vehicle Type</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{request.preferredDate}</p>
                  <p className="text-xs text-gray-500">Preferred Date</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{request.preferredTime}</p>
                  <p className="text-xs text-gray-500">Preferred Time</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm line-clamp-1">{request.location}</p>
                  <p className="text-xs text-gray-500">Service Location</p>
                </div>
              </div>
            </div>
          </div>

          {/* Services Requested */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm mb-2">Services Requested</h4>
            <div className="flex flex-wrap gap-2">
              {request.services.map((service) => (
                <Badge key={service} className="bg-blue-100 text-blue-700 border-blue-200">
                  {service}
                </Badge>
              ))}
            </div>
          </div>

          {/* Car Photos */}
          {request.carPhotos && request.carPhotos.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm mb-2">Car Photos</h4>
              <div className="grid grid-cols-3 gap-2">
                {request.carPhotos.map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`Car photo ${idx + 1}`}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {request.notes && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm mb-2">Customer Notes</h4>
              <p className="text-sm text-gray-700">{request.notes}</p>
            </div>
          )}

          {/* Pro Benefits */}
          {!detailer.isPro && (
            <Alert className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
              <Sparkles className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="text-yellow-900 text-sm">
                    <strong>Pro members</strong> get 25% off lead fees!
                  </p>
                  <p className="text-xs text-yellow-700">
                    This lead would cost ${(leadCost * 0.75).toFixed(2)} with Pro
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Success Potential */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm mb-1">Why accept this lead?</h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• Good match for your services</li>
                  <li>• Customer is serious and pre-qualified</li>
                  <li>• Only you will receive this lead (no competition)</li>
                  <li>• Average booking value: $150-$250</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          {hasEnoughCredits ? (
            <>
              <Button
                onClick={onAccept}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Accept Lead for ${leadCost.toFixed(2)}
              </Button>
              <Button
                onClick={onDecline}
                variant="outline"
                className="w-full"
              >
                Decline
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={onBuyCredits}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Buy Credits (${(leadCost - detailer.wallet).toFixed(2)} needed)
              </Button>
              <Button
                onClick={onDecline}
                variant="outline"
                className="w-full"
              >
                Decline This Lead
              </Button>
            </>
          )}
        </div>

        {/* Footer Info */}
        <p className="text-xs text-center text-gray-500 pt-2">
          Leads are exclusive. Once accepted, the customer will only work with you.
        </p>
      </DialogContent>
    </Dialog>
  );
}
