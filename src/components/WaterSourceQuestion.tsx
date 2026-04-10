import { Card } from './ui/card';
import { Label } from './ui/label';
import { Droplet, Check, X, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export type WaterSourceAnswer = 'yes' | 'no' | 'not-sure';
export type WaterSourceRequirement = 'required' | 'not-required' | 'case-by-case';

interface WaterSourceQuestionProps {
  value: WaterSourceAnswer | null;
  onChange: (value: WaterSourceAnswer) => void;
  role: 'client' | 'detailer';
  // For detailer
  requirement?: WaterSourceRequirement;
  onRequirementChange?: (value: WaterSourceRequirement) => void;
}

const clientOptions = [
  {
    value: 'yes' as WaterSourceAnswer,
    label: 'Yes',
    description: 'I have a hose and water access',
    icon: Check,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
  },
  {
    value: 'no' as WaterSourceAnswer,
    label: 'No',
    description: 'No water source available',
    icon: X,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
  },
  {
    value: 'not-sure' as WaterSourceAnswer,
    label: 'Not Sure',
    description: 'I need to check or ask',
    icon: HelpCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-400',
  },
];

const detailerOptions = [
  {
    value: 'required' as WaterSourceRequirement,
    label: 'Required',
    description: 'I need water access for all services',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
  },
  {
    value: 'not-required' as WaterSourceRequirement,
    label: 'Not Required',
    description: 'I bring my own water supply',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
  },
  {
    value: 'case-by-case' as WaterSourceRequirement,
    label: 'Case-by-Case',
    description: 'Depends on the service type',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-400',
  },
];

export function WaterSourceQuestion({ 
  value, 
  onChange,
  role,
  requirement,
  onRequirementChange 
}: WaterSourceQuestionProps) {
  if (role === 'detailer' && onRequirementChange) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-sm flex items-center gap-2">
            <Droplet className="w-4 h-4 text-[#0078FF]" />
            Water Source Requirement
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-gray-400 hover:text-gray-600" aria-label="Learn more about water requirements">
                  <HelpCircle className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  Let clients know if you need them to provide water access or if you bring your own water supply.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="space-y-2">
          {detailerOptions.map((option) => {
            const isSelected = requirement === option.value;

            return (
              <motion.button
                key={option.value}
                onClick={() => onRequirementChange(option.value)}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? `${option.bgColor} ${option.borderColor} shadow-sm`
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? option.bgColor : 'bg-gray-100'
                    }`}
                  >
                    <Droplet className={`w-4 h-4 ${isSelected ? option.color : 'text-gray-500'}`} />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm">{option.label}</p>
                    <p className="text-xs text-gray-600">{option.description}</p>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 bg-[#0078FF] rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // Client view
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-sm flex items-center gap-2">
          <Droplet className="w-4 h-4 text-[#0078FF]" />
          Do you have a hose/water source?
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-gray-400 hover:text-gray-600" aria-label="Why we ask about water source">
                <HelpCircle className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">
                Some detailers need water access at your location, while others bring their own supply. 
                This helps match you with the right detailer.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <p className="text-xs text-gray-600">
        Some detailers require water access, while others bring their own supply
      </p>

      <div className="grid grid-cols-3 gap-2">
        {clientOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;

          return (
            <motion.button
              key={option.value}
              onClick={() => onChange(option.value)}
              whileTap={{ scale: 0.98 }}
              className={`p-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? `${option.bgColor} ${option.borderColor} shadow-sm`
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? option.bgColor : 'bg-gray-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? option.color : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className="text-sm mb-0.5">{option.label}</p>
                  <p className="text-xs text-gray-600 leading-tight">{option.description}</p>
                </div>
                {isSelected && (
                  <div className="w-4 h-4 bg-[#0078FF] rounded-full flex items-center justify-center mt-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export function WaterSourcePill({ requirement }: { requirement: WaterSourceRequirement }) {
  const config = {
    'required': {
      label: 'Water Required',
      className: 'bg-blue-100 text-blue-700 border-blue-300',
    },
    'not-required': {
      label: 'Water Not Needed',
      className: 'bg-green-100 text-green-700 border-green-300',
    },
    'case-by-case': {
      label: 'Water: Case-by-Case',
      className: 'bg-gray-100 text-gray-700 border-gray-300',
    },
  };

  const { label, className } = config[requirement];

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${className}`}>
      <Droplet className="w-3 h-3" />
      {label}
    </div>
  );
}
