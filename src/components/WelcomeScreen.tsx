import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Car, Sparkles, Check, SprayCanIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WelcomeScreenProps {
  onContinue: (role: 'client' | 'detailer') => void;
  onViewTerms?: () => void;
  onViewPrivacy?: () => void;
}

export function WelcomeScreen({ onContinue, onViewTerms, onViewPrivacy }: WelcomeScreenProps) {
  const [selectedRole, setSelectedRole] = useState<'client' | 'detailer' | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      onContinue(selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF5FF] to-white flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-20 h-20 bg-gradient-to-br from-[#0078FF] to-[#0056CC] rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-200"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl"
          >
            Welcome to InDetail
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600"
          >
            Where trusted local pros meet car owners like you
          </motion.p>
        </div>

        {/* Selection Instruction */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-gray-700"
        >
          Select your role to get started
        </motion.p>

        {/* Role Selection Cards */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`p-6 cursor-pointer transition-all duration-300 border-2 relative overflow-hidden ${
                selectedRole === 'client'
                  ? 'border-[#0078FF] shadow-xl shadow-blue-100 bg-blue-50/30'
                  : 'border-gray-200 hover:border-[#0078FF] hover:shadow-lg'
              }`}
              onClick={() => setSelectedRole('client')}
            >
              {/* Selection Indicator */}
              <AnimatePresence>
                {selectedRole === 'client' && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute top-4 right-4 w-8 h-8 bg-[#0078FF] rounded-full flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Glow Effect on Hover */}
              {selectedRole === 'client' && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#0078FF]/5 to-blue-100/20 pointer-events-none" />
              )}

              <div className="flex items-start gap-4 relative">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    selectedRole === 'client'
                      ? 'bg-[#0078FF] shadow-lg shadow-blue-200'
                      : 'bg-blue-100'
                  }`}
                >
                  <Car
                    className={`w-7 h-7 ${
                      selectedRole === 'client' ? 'text-white' : 'text-[#0078FF]'
                    }`}
                  />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="mb-2">I'm a Car Owner / Client</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Find trusted detailers near you and book on your schedule
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`p-6 cursor-pointer transition-all duration-300 border-2 relative overflow-hidden ${
                selectedRole === 'detailer'
                  ? 'border-[#0078FF] shadow-xl shadow-blue-100 bg-blue-50/30'
                  : 'border-gray-200 hover:border-[#0078FF] hover:shadow-lg'
              }`}
              onClick={() => setSelectedRole('detailer')}
            >
              {/* Selection Indicator */}
              <AnimatePresence>
                {selectedRole === 'detailer' && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute top-4 right-4 w-8 h-8 bg-[#0078FF] rounded-full flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Glow Effect */}
              {selectedRole === 'detailer' && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#0078FF]/5 to-blue-100/20 pointer-events-none" />
              )}

              <div className="flex items-start gap-4 relative">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    selectedRole === 'detailer'
                      ? 'bg-[#0078FF] shadow-lg shadow-blue-200'
                      : 'bg-blue-100'
                  }`}
                >
                  <SprayCanIcon
                    className={`w-7 h-7 ${
                      selectedRole === 'detailer' ? 'text-white' : 'text-[#0078FF]'
                    }`}
                  />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="mb-2">I'm a Detailer</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Grow your business and reach more customers effortlessly
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            onClick={handleContinue}
            disabled={!selectedRole}
            className="w-full h-12 bg-[#0078FF] hover:bg-[#0056CC] text-white disabled:bg-gray-300 disabled:text-gray-500 transition-all duration-300 shadow-lg shadow-blue-200/50 disabled:shadow-none"
            size="lg"
          >
            Continue
          </Button>
        </motion.div>

        {/* Helper Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-gray-500"
        >
          You can change this later in Settings
        </motion.p>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center text-xs text-gray-400 pt-4"
        >
          By continuing, you agree to our{' '}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (onViewTerms) {
                onViewTerms();
              }
            }}
            className="text-[#0078FF] hover:text-[#0056CC] underline transition-colors"
          >
            Terms of Service
          </button>
          {' '}and{' '}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (onViewPrivacy) {
                onViewPrivacy();
              }
            }}
            className="text-[#0078FF] hover:text-[#0056CC] underline transition-colors"
          >
            Privacy Policy
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
}
