import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResetPasswordScreen } from '../components/ResetPasswordScreen';

export function ResetPasswordPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Redirect to sign in page after successful password reset
    navigate('/signin', { 
      replace: true,
      state: { message: 'Password updated successfully. Please sign in with your new password.' }
    });
  };

  const handleBackToSignIn = () => {
    navigate('/signin', { replace: true });
  };

  return (
    <ResetPasswordScreen
      onSuccess={handleSuccess}
      onBackToSignIn={handleBackToSignIn}
    />
  );
}