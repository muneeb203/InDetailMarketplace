import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ArrowLeft, Eye, EyeOff, Car, SprayCanIcon, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SignInScreenProps {
  role: 'client' | 'detailer';
  onBack: () => void;
  onSignIn: (email: string, password: string, role: 'client' | 'detailer') => void;
  onSwitchToSignUp: () => void;
  onChangeRole: () => void;
}

export function SignInScreen({
  role,
  onBack,
  onSignIn,
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

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onSignIn(email, password, role);
    }, 800);
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
                className="w-full h-12 bg-[#0078FF] hover:bg-[#0056CC] text-white transition-all duration-300 shadow-lg shadow-blue-200/50 disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed"
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
