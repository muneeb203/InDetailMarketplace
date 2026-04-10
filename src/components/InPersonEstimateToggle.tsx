import { Card } from './ui/card';
import { Label } from './ui/label';
import { ClipboardList, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface InPersonEstimateToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function InPersonEstimateToggle({ value, onChange }: InPersonEstimateToggleProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm">Service Type</Label>
      
      <p className="text-xs text-gray-600">
        Choose whether you want a full service booking or an in-person estimate first
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Full Service */}
        <motion.button
          onClick={() => onChange(false)}
          whileTap={{ scale: 0.98 }}
          className={`p-4 rounded-xl border-2 transition-all ${
            !value
              ? 'bg-[#0078FF]/5 border-[#0078FF] shadow-sm'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                !value ? 'bg-[#0078FF]/10' : 'bg-gray-100'
              }`}
            >
              <Calendar className={`w-6 h-6 ${!value ? 'text-[#0078FF]' : 'text-gray-500'}`} />
            </div>
            <div>
              <p className="text-sm mb-0.5">Full Service</p>
              <p className="text-xs text-gray-600">Book and schedule service</p>
            </div>
            {!value && (
              <div className="w-4 h-4 bg-[#0078FF] rounded-full flex items-center justify-center mt-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            )}
          </div>
        </motion.button>

        {/* In-Person Estimate */}
        <motion.button
          onClick={() => onChange(true)}
          whileTap={{ scale: 0.98 }}
          className={`p-4 rounded-xl border-2 transition-all ${
            value
              ? 'bg-green-50 border-green-500 shadow-sm'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                value ? 'bg-green-100' : 'bg-gray-100'
              }`}
            >
              <ClipboardList className={`w-6 h-6 ${value ? 'text-green-600' : 'text-gray-500'}`} />
            </div>
            <div>
              <p className="text-sm mb-0.5">In-Person Estimate</p>
              <p className="text-xs text-gray-600">15-20 min on-site quote</p>
            </div>
            {value && (
              <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center mt-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            )}
          </div>
        </motion.button>
      </div>

      {/* Information Card */}
      {value && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="p-3 bg-green-50 border-green-200">
            <p className="text-xs text-gray-700">
              <strong>In-Person Estimate:</strong> A detailer will visit your location for 15-20 minutes 
              to inspect your vehicle and provide an accurate quote. You can convert this to a full booking 
              with one tap after receiving the estimate.
            </p>
          </Card>
        </motion.div>
      )}

      {!value && (
        <Card className="p-3 bg-blue-50 border-blue-200">
          <p className="text-xs text-gray-700">
            <strong>Full Service:</strong> Request quotes from detailers and book your service directly. 
            Detailers will provide estimates based on your photos and description.
          </p>
        </Card>
      )}
    </div>
  );
}
