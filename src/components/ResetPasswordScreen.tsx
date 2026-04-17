import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, CheckCircle, Loader2, Shield, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { 
  updatePassword, 
  verifyResetSession, 
  signOutAfterReset, 
  validatePassword 
} from '../services/passwordResetService';

interface ResetPasswordScreenProps {
  onSuccess?: () => void;
  onBackToSignIn?: () => void;
}

export function ResetPasswordScreen({ onSuccess, onBackToSignIn }: ResetPasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [touched, setTouched] = useState<{ password?: boolean; confirmPassword?: boolean }>({});

  // Check if the reset session is valid on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const isValid = await verifyResetSession();
        setIsValidSession(isValid);
      } catch (error) {
        setIsValidSession(false);
      }
    };
    
    checkSession();
  }, []);

  const validate = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: 'password' | 'confirmPassword') => {
    setTouched({ ...touched, [field]: true });
    validate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ password: true, confirmPassword: true });
    
    if (!validate()) return;

    try {
      setIsLoading(true);
      await updatePassword(password);
      setIsSuccess(true);
      
      // Sign out after successful password reset
      setTimeout(async () => {
        await signOutAfterReset();
        onSuccess?.();
      }, 2000);
    } catch (error) {
      setErrors({ 
        password: error instanceof Error ? error.message : 'Failed to update password' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = password && confirmPassword && Object.keys(errors).length === 0;

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EAF5FF] to-white flex items-center justify-center p-6">
        <Card className="p-8 shadow-lg border-gray-200 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#0078FF]" />
          <p className="text-gray-600">Verifying reset link...</p>
        </Card>
      </div>
    );
  }

  // Invalid session state
  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EAF5FF] to-white flex items-center justify-center p-6">
        <Card className="p-8 shadow-lg border-gray-200 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Button
            onClick={onBackToSignIn}
            className="w-full h-11 bg-[#0078FF] hover:bg-[#0056CC] text-white font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF5FF] to-white flex flex-col p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto space-y-6 flex-1"
      >
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-[#0078FF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-[#0078FF]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isSuccess ? 'Password Updated!' : 'Create New Password'}
          </h1>
          <p className="text-gray-600">
            {isSuccess 
              ? 'Your password has been successfully updated'
              : 'Enter a strong password for your account'
            }
          </p>
        </div>

        <Card className="p-6 shadow-lg border-gray-200">
          {isSuccess ? (
            /* Success State */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">All Set!</h3>
                <p className="text-gray-600 text-sm">
                  You'll be redirected to sign in with your new password in a moment.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecting...</span>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div>
                <label htmlFor="new-password" className="text-sm font-medium text-gray-700 mb-2 block">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password) validate();
                    }}
                    onBlur={() => handleBlur('password')}
                    placeholder="Enter your new password"
                    className={`h-11 pr-10 ${
                      touched.password && errors.password
                        ? 'border-red-500 focus-visible:ring-red-500'
                        : 'focus-visible:ring-[#0078FF] focus-visible:border-[#0078FF]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                
                {/* Password Requirements */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <span className={password.length >= 6 ? 'text-green-600' : 'text-gray-500'}>
                      At least 6 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      /[a-zA-Z]/.test(password) && /\d/.test(password) ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <span className={/[a-zA-Z]/.test(password) && /\d/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                      Contains letters and numbers
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                  {touched.password && errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-red-600 mt-1.5"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700 mb-2 block">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (touched.confirmPassword) validate();
                    }}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder="Confirm your new password"
                    className={`h-11 pr-10 ${
                      touched.confirmPassword && errors.confirmPassword
                        ? 'border-red-500 focus-visible:ring-red-500'
                        : 'focus-visible:ring-[#0078FF] focus-visible:border-[#0078FF]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-red-600 mt-1.5"
                    >
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit Button */}
              <motion.div whileTap={isValid && !isLoading ? { scale: 0.98 } : {}}>
                <Button
                  type="submit"
                  className="w-full h-12 !bg-[#0078FF] hover:!bg-[#0056CC] active:!bg-[#0047A3] text-white font-semibold transition-colors duration-200 shadow-md disabled:!bg-gray-400 disabled:!text-gray-600 disabled:opacity-100 disabled:shadow-none disabled:cursor-not-allowed"
                  disabled={!isValid || isLoading}
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
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Updating Password...</span>
                      </motion.div>
                    ) : (
                      <motion.span
                        key="default"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Update Password
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </form>
          )}
        </Card>

        {/* Security Note */}
        {!isSuccess && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>Security tip:</strong> Choose a password that's unique to this account 
              and not used elsewhere. Consider using a password manager for better security.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}