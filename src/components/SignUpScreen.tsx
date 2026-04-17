import { useState } from 'react';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ArrowLeft, Car, SprayCanIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SignUpScreenProps {
  role: 'client' | 'detailer';
  onBack: () => void;
  onGoogleSignUp: (data: { name: string; phone: string; role: 'client' | 'detailer' }) => void;
  onSwitchToSignIn: () => void;
  onChangeRole: () => void;
}

export function SignUpScreen({
  role,
  onBack,
  onGoogleSignUp,
  onSwitchToSignIn,
  onChangeRole,
}: SignUpScreenProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean; phone?: boolean }>({});

  // Early return if role is invalid
  if (!role) {
    console.error('SignUpScreen: role prop is required');
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EAF5FF] to-white flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600">Error: Invalid role configuration</p>
          <button onClick={onBack} className="mt-4 text-blue-600 hover:text-blue-800">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const validate = () => {
    const newErrors: { name?: string; phone?: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!phone) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: 'name' | 'phone') => {
    setTouched({ ...touched, [field]: true });
    validate();
  };

  const handleGoogleSubmit = () => {
    setTouched({ name: true, phone: true });
    if (!validate()) return;
    onGoogleSignUp({ name: name.trim(), phone, role: safeRole });
  };

  const isValid = name.trim() && phone && Object.keys(errors).length === 0;

  const roleConfig = {
    client: { icon: Car, label: 'Client' },
    detailer: { icon: SprayCanIcon, label: 'Detailer' },
  };
  
  // Ensure role is valid, default to 'client' if undefined
  const safeRole = role || 'client';
  const RoleIcon = roleConfig[safeRole]?.icon || Car;

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
            <p className="text-sm text-gray-600">You're one step closer to a spotless experience</p>
          </div>
        </div>

        {/* Role Chip */}
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
              <p className="text-sm">{roleConfig[safeRole]?.label || 'Client'}</p>
            </div>
          </div>
          <button onClick={onChangeRole} className="text-xs text-[#0078FF] hover:text-[#0056CC] transition-colors">
            Change
          </button>
        </motion.div>

        {/* Form */}
        <Card className="p-6 shadow-lg border-gray-200 space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="text-sm mb-2 block text-gray-700">Full Name</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => { setName(e.target.value); if (touched.name) validate(); }}
              onBlur={() => handleBlur('name')}
              placeholder="John Doe"
              autoComplete="name"
              className={`h-11 border-[#0078FF]/50 bg-white ${
                touched.name && errors.name
                  ? 'border-red-500 focus-visible:ring-red-500'
                  : 'focus-visible:ring-[#0078FF] focus-visible:border-[#0078FF]'
              }`}
            />
            <AnimatePresence>
              {touched.name && errors.name && (
                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-600 mt-1.5">
                  {errors.name}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="text-sm mb-2 block text-gray-700">Phone Number</label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); if (touched.phone) validate(); }}
              onBlur={() => handleBlur('phone')}
              placeholder="(555) 123-4567"
              autoComplete="tel"
              className={`h-11 border-[#0078FF]/50 bg-white ${
                touched.phone && errors.phone
                  ? 'border-red-500 focus-visible:ring-red-500'
                  : 'focus-visible:ring-[#0078FF] focus-visible:border-[#0078FF]'
              }`}
            />
            <AnimatePresence>
              {touched.phone && errors.phone && (
                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-600 mt-1.5">
                  {errors.phone}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Info note */}
          <p className="text-xs text-gray-500 text-center">
            Your email will be taken from your Google account
          </p>

          {/* Google Sign Up Button */}
          <motion.button
            type="button"
            whileTap={isValid ? { scale: 0.98 } : {}}
            onClick={handleGoogleSubmit}
            disabled={!isValid}
            className="w-full h-12 flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign Up with Google
          </motion.button>
        </Card>

        {/* Switch to Sign In */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button onClick={onSwitchToSignIn} className="text-[#0078FF] hover:text-[#0056CC] transition-colors">
              Sign In
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
