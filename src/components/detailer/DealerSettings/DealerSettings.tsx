import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import {
  User,
  ImageIcon,
  MapPin,
  Briefcase,
  Shield,
  Eye,
  BarChart3,
  Share2,
  Percent,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useDealerProfile } from '../../../hooks/useDealerProfile';
import { ProfileInfoSection } from './ProfileInfoSection';
import { PortfolioSection } from './PortfolioSection';
import { LocationSection } from './LocationSection';
import { BusinessDetailsSection } from './BusinessDetailsSection';
import { AccountSecuritySection } from './AccountSecuritySection';
import { SocialSection } from './SocialSection';
import { PromotionsSection } from './PromotionsSection';

interface DealerSettingsProps {
  onNavigate?: (view: string) => void;
  initialTab?: string;
}

const TAB_MAP: Record<string, string> = {
  profile: 'profile',
  portfolio: 'portfolio',
  location: 'location',
  business: 'business',
  social: 'social',
  promotions: 'promotions',
  promo: 'promotions',
  account: 'account',
};

export function DealerSettings({ onNavigate, initialTab }: DealerSettingsProps) {
  const { currentUser } = useAuth();
  const userId = currentUser?.role === 'detailer' ? currentUser.id : undefined;
  const { data, loading, error, refetch, updateLocal } = useDealerProfile(userId);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (initialTab && TAB_MAP[initialTab]) {
      setActiveTab(TAB_MAP[initialTab]);
    }
  }, [initialTab]);

  const completionScore = data
    ? [
        data.business_name,
        data.bio,
        data.logo_url,
        (data.portfolio_images?.length ?? 0) > 0,
        data.base_location,
        (data.services_offered as { specialties?: string[] })?.specialties?.length,
        data.price_range,
      ].filter(Boolean).length * 14
    : 0;

  if (!currentUser || currentUser.role !== 'detailer') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-gray-500">You must be signed in as a dealer to access settings.</p>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header with stats */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dealer Settings</h1>
        <p className="text-gray-600 text-sm">Manage your business profile and preferences</p>

        {/* Quick stats / completion */}
        <div className="mt-4 flex flex-wrap gap-4">
          <Card className="flex-1 min-w-[140px]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.min(completionScore, 100)}%</p>
                <p className="text-xs text-gray-500">Profile complete</p>
              </div>
            </CardContent>
          </Card>
          {onNavigate && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => onNavigate('pro-public-profile')}
            >
              <Eye className="w-4 h-4" />
              View Public Profile
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-1 h-auto flex-wrap p-1 bg-gray-100 rounded-xl">
          <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <ImageIcon className="w-4 h-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="location" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <MapPin className="w-4 h-4" />
            Location
          </TabsTrigger>
          <TabsTrigger value="business" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Briefcase className="w-4 h-4" />
            Business
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Share2 className="w-4 h-4" />
            Social
          </TabsTrigger>
          <TabsTrigger value="promotions" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Percent className="w-4 h-4" />
            Promotions
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Shield className="w-4 h-4" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileInfoSection userId={userId!} data={data} onUpdate={updateLocal} />
        </TabsContent>

        <TabsContent value="portfolio" className="mt-6">
          <PortfolioSection
            userId={userId!}
            onPortfolioChange={(urls) => updateLocal({ portfolio_images: urls })}
          />
        </TabsContent>

        <TabsContent value="location" className="mt-6">
          <LocationSection userId={userId!} data={data} onUpdate={updateLocal} />
        </TabsContent>

        <TabsContent value="business" className="mt-6">
          <BusinessDetailsSection userId={userId!} data={data} onUpdate={updateLocal} />
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          <SocialSection userId={userId!} data={data} onUpdate={updateLocal} />
        </TabsContent>

        <TabsContent value="promotions" className="mt-6">
          <PromotionsSection userId={userId!} data={data} onUpdate={updateLocal} />
        </TabsContent>

        <TabsContent value="account" className="mt-6">
          <AccountSecuritySection
            email={currentUser.email}
            onDeleteAccount={() => onNavigate?.('welcome')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
