import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { sendPasswordResetEmail, validateEmail } from '../services/passwordResetService';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await sendPasswordResetEmail(email);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setIsLoading(false);
    setIsSuccess(false);
    setError('');
    setTouched(false);
    onClose();
  };

  const handleBackToLogin = () => {
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md mx-4"
        >
          <Card className="p-4 sm:p-6 shadow-2xl border-gray-200 bg-white max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                {isSuccess ? (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                )}
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    {isSuccess ? 'Check Your Email' : 'Reset Password'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {isSuccess 
                      ? 'We sent you a reset link' 
                      : 'Enter your email to receive a reset link'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {isSuccess ? (
              /* Success State */
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <p className="text-xs text-green-700 mt-2">
                    Check your inbox and click the link to reset your password. 
                    The link will expire in 1 hour.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Button
                    onClick={handleBackToLogin}
                    className="w-full h-12 bg-[#0078FF] hover:bg-[#0056CC] text-white font-medium touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Button>
                  
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setEmail('');
                      setTouched(false);
                    }}
                    className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors min-h-[44px] flex items-center justify-center touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    Try a different email
                  </button>
                </div>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="text-sm font-medium text-gray-700 mb-2 block">
                    Email Address
                  </label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    onBlur={() => setTouched(true)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`h-11 ${
                      (touched && !validateEmail(email)) || error
                        ? 'border-red-500 focus-visible:ring-red-500'
                        : 'focus-visible:ring-[#0078FF] focus-visible:border-[#0078FF]'
                    }`}
                    disabled={isLoading}
                  />
                  
                  {/* Error Message */}
                  <AnimatePresence>
                    {((touched && !validateEmail(email)) || error) && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-red-600 mt-1.5"
                      >
                        {error || 'Please enter a valid email address'}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    type="submit"
                    disabled={!email || !validateEmail(email) || isLoading}
                    className="w-full h-12 bg-[#0078FF] hover:bg-[#0056CC] disabled:bg-gray-400 disabled:text-gray-600 text-white font-medium transition-colors touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending Reset Link...</span>
                        </motion.div>
                      ) : (
                        <motion.span
                          key="default"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Send Reset Link
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                  
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors min-h-[44px] flex items-center justify-center touch-manipulation"
                    disabled={isLoading}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Help Text */}
            {!isSuccess && (
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>Note:</strong> If you don't receive an email within a few minutes, 
                  check your spam folder or try again with a different email address.
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}