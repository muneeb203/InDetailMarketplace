import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Shield, CheckCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { ResetPasswordScreen } from './ResetPasswordScreen';

export function ForgotPasswordDemo() {
  const [showModal, setShowModal] = useState(false);
  const [showResetScreen, setShowResetScreen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: 'User clicks "Forgot Password"',
      description: 'From the sign-in screen, user clicks the forgot password link',
      icon: Mail,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 2,
      title: 'Enter email address',
      description: 'User enters their email address to receive reset instructions',
      icon: Mail,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: 3,
      title: 'Email sent with reset link',
      description: 'System sends secure reset link to user\'s email address',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 4,
      title: 'User clicks reset link',
      description: 'User clicks the link in their email to access reset form',
      icon: Shield,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      id: 5,
      title: 'Create new password',
      description: 'User creates a new secure password with validation',
      icon: Eye,
      color: 'bg-indigo-100 text-indigo-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Forgot Password System Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A complete password reset flow with email verification, secure token handling, 
            and user-friendly interface components.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Integration</h3>
            <p className="text-gray-600 text-sm">
              Secure email delivery using Supabase Auth with customizable templates and redirect URLs.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Security First</h3>
            <p className="text-gray-600 text-sm">
              Token-based authentication with expiration, session validation, and secure password requirements.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">User Experience</h3>
            <p className="text-gray-600 text-sm">
              Intuitive modals, real-time validation, loading states, and clear success feedback.
            </p>
          </Card>
        </div>

        {/* Process Flow */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Password Reset Process
          </h2>
          
          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                  currentStep === step.id
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step.color}`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                <div className="text-2xl font-bold text-gray-300">
                  {step.id}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Demo Actions */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Try the Components
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Forgot Password Modal</h3>
              <p className="text-gray-600 text-sm">
                Opens a modal where users can enter their email address to receive a password reset link.
              </p>
              <Button
                onClick={() => setShowModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Mail className="w-4 h-4 mr-2" />
                Open Forgot Password Modal
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Reset Password Screen</h3>
              <p className="text-gray-600 text-sm">
                Full-screen component for creating a new password with validation and security features.
              </p>
              <Button
                onClick={() => setShowResetScreen(true)}
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50"
              >
                <Shield className="w-4 h-4 mr-2" />
                View Reset Password Screen
              </Button>
            </div>
          </div>
        </Card>

        {/* Technical Details */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Implementation</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Components Created</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                  <code className="bg-gray-100 px-2 py-1 rounded">ForgotPasswordModal.tsx</code>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                  <code className="bg-gray-100 px-2 py-1 rounded">ResetPasswordScreen.tsx</code>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                  <code className="bg-gray-100 px-2 py-1 rounded">ResetPasswordPage.tsx</code>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                  <code className="bg-gray-100 px-2 py-1 rounded">passwordResetService.ts</code>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Email validation and error handling
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Password strength requirements
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Session verification for security
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Responsive design with animations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Integration with existing auth system
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Modals */}
      <ForgotPasswordModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      {/* Full Screen Reset Password Demo */}
      {showResetScreen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="absolute top-4 right-4 z-10">
            <Button
              onClick={() => setShowResetScreen(false)}
              variant="outline"
              size="sm"
            >
              Close Demo
            </Button>
          </div>
          <ResetPasswordScreen
            onSuccess={() => {
              setShowResetScreen(false);
              alert('Demo: Password would be updated successfully!');
            }}
            onBackToSignIn={() => setShowResetScreen(false)}
          />
        </div>
      )}
    </div>
  );
}