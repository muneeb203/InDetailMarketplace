import { ClientProfilePage } from './ClientProfilePage';
import { DetailerProfileHome } from './detailer/DetailerProfileHome';

interface ProfileRoleAwareProps {
  role: 'client' | 'detailer';
  onNavigate?: (view: string, params?: any) => void;
}

export function ProfileRoleAware({ role, onNavigate }: ProfileRoleAwareProps) {
  if (role === 'client') {
    return <ClientProfilePage />;
  }

  return <DetailerProfileHome onNavigate={onNavigate} />;
}