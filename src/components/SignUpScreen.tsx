import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Eye, EyeOff, Car, SprayCanIcon, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SignUpScreenProps {
  role: 'client' | 'detailer';
  onBack: () => void;
  onSignUp: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'client' | 'detailer';
  }) => Promise<void> | void;
  onSwitchToSignIn: () => void;
  onChangeRole: () => void;
}

export function SignUpScreen({
  role,
  onBack,
  onSignUp,
  onSwitchToSignIn,
  onChangeRole,
}: SignUpScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!phone) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    validate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    if (!validate()) return;

    try {
      setIsLoading(true);
      await onSignUp({ name, email, phone, password, role });
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid =
    name.trim() &&
    email &&
    phone &&
    password.length >= 8 &&
    password === confirmPassword;

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
            <h1>Create Account</h1>
            <p className="text-sm text-gray-600">
              You're one step closer to a spotless experience
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
              <p className="text-xs text-gray-600">Signing up as</p>
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
            {/* Name */}
            <div>
              <label htmlFor="name" className="text-sm mb-2 block text-gray-700">
                Full Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (touched.name) validate();
                }}
                onBlur={() => handleBlur('name')}
                placeholder="John Doe"
                className={`h-11 border-[#0078FF]/50 bg-white ${
                  touched.name && errors.name
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : 'focus-visible:ring-[#0078FF] focus-visible:border-[#0078FF]'
                }`}
              />
              <AnimatePresence>
                {touched.name && errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-600 mt-1.5"
                  >
                    {errors.name}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

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
                className={`h-11 border-[#0078FF]/50 bg-white ${
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

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="text-sm mb-2 block text-gray-700">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (touched.phone) validate();
                }}
                onBlur={() => handleBlur('phone')}
                placeholder="(555) 123-4567"
                className={`h-11 border-[#0078FF]/50 bg-white ${
                  touched.phone && errors.phone
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : 'focus-visible:ring-[#0078FF] focus-visible:border-[#0078FF]'
                }`}
              />
              <AnimatePresence>
                {touched.phone && errors.phone && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-600 mt-1.5"
                  >
                    {errors.phone}
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
                  placeholder="Minimum 8 characters"
                  className={`h-11 pr-10 border-[#0078FF]/50 bg-white ${
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="text-sm mb-2 block text-gray-700">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (touched.confirmPassword) validate();
                }}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="Re-enter your password"
                className={`h-11 border-[#0078FF]/50 bg-white ${
                  touched.confirmPassword && errors.confirmPassword
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : 'focus-visible:ring-[#0078FF] focus-visible:border-[#0078FF]'
                }`}
              />
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

            {/* Remember Me */}
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

            {/* Submit Button */}
            <motion.div
              whileTap={isValid && !isLoading ? { scale: 0.98 } : {}}
            >
              <Button
                type="submit"
                className={`w-full h-12 font-semibold ${
                  isSuccess
                    ? '!bg-green-600 hover:!bg-green-600 disabled:!bg-green-600'
                    : '!bg-[#0078FF] hover:!bg-[#0078FF] active:!bg-[#0078FF] disabled:!bg-[#0078FF] disabled:hover:!bg-[#0078FF] disabled:!text-white'
                } text-white shadow-md ${
                  isValid && !isLoading && !isSuccess
                    ? 'shadow-blue-200/50'
                    : 'shadow-none'
                } disabled:opacity-100 disabled:cursor-not-allowed`}
                disabled={!isValid || isLoading || isSuccess}
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
                      <span>Creating Account...</span>
                    </motion.div>
                  ) : isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      <span>Account Created!</span>
                    </motion.div>
                  ) : (
                    <motion.span
                      key="default"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Create Account
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </form>
        </Card>

        {/* Switch to Sign In */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onSwitchToSignIn}
              className="text-[#0078FF] hover:text-[#0056CC] transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
