import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ArrowLeft, Eye, EyeOff, Car, SprayCanIcon, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SignInScreenProps {
  role: 'client' | 'detailer';
  onBack: () => void;
  onSignIn: (email: string, password: string, role: 'client' | 'detailer') => Promise<void> | void;
  onGoogleSignIn?: () => void;
  onSwitchToSignUp: () => void;
  onChangeRole: () => void;
}

export function SignInScreen({
  role,
  onBack,
  onSignIn,
  onGoogleSignIn,
  onSwitchToSignUp,
  onChangeRole,
}: SignInScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched({ ...touched, [field]: true });
    validate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!validate()) return;

    try {
      setIsLoading(true);
      await onSignIn(email, password, role);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = email && password && Object.keys(errors).length === 0;

  const roleConfig = {
    client: {
      icon: Car,
      label: 'Client',
      color: 'bg-blue-100 text-[#0078FF] border-blue-200',
    },
    detailer: {
      icon: SprayCanIcon,
      label: 'Detailer',
      color: 'bg-blue-100 text-[#0078FF] border-blue-200',
    },
  };

  const RoleIcon = roleConfig[role].icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF5FF] to-white flex flex-col p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto space-y-6 flex-1"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1>Sign In</h1>
            <p className="text-sm text-gray-600">
              Welcome back to InDetail
            </p>
          </div>
        </div>

        {/* Role Confirmation Chip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0078FF]/10 rounded-xl flex items-center justify-center">
              <RoleIcon className="w-5 h-5 text-[#0078FF]" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Signing in as</p>
              <p className="text-sm">{roleConfig[role].label}</p>
            </div>
          </div>
          <button
            onClick={onChangeRole}
            className="text-xs text-[#0078FF] hover:text-[#0056CC] transition-colors"
          >
            Change
          </button>
        </motion.div>

        {/* Form */}
        <Card className="p-6 shadow-lg border-gray-200">
          {/* Google Sign In */}
          {onGoogleSignIn && (
            <div className="mb-5">
              <button
                type="button"
                onClick={onGoogleSignIn}
                className="w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm text-sm font-medium text-gray-700"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
              <div className="flex items-center gap-3 mt-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="text-sm mb-2 block text-gray-700">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (touched.email) validate();
                }}
                onBlur={() => handleBlur('email')}
                placeholder="you@example.com"
                className={`h-11 ${
                  touched.email && errors.email
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : 'focus-visible:ring-[#0078FF] focus-visible:border-[#0078FF]'
                }`}
              />
              <AnimatePresence>
                {touched.email && errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-600 mt-1.5"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-sm mb-2 block text-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) validate();
                  }}
                  onBlur={() => handleBlur('password')}
                  placeholder="Enter your password"
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    rememberMe
                      ? 'bg-[#0078FF] border-[#0078FF]'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {rememberMe && <Check className="w-3 h-3 text-white" />}
                </button>
                <label className="text-sm text-gray-700 cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-[#0078FF] hover:text-[#0056CC] transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
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
                      <span>Signing In...</span>
                    </motion.div>
                  ) : (
                    <motion.span
                      key="default"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Sign In
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </form>
        </Card>

        {/* Switch to Sign Up */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignUp}
              className="text-[#0078FF] hover:text-[#0056CC] transition-colors"
            >
              Sign Up
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
