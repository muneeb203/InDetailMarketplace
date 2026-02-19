import { supabase } from '../lib/supabaseClient';

export type SocialPlatform = 'instagram' | 'tiktok' | 'facebook';

export interface DealerSocialLink {
  id: string;
  dealer_id: string;
  platform: SocialPlatform;
  url: string;
  created_at: string;
  updated_at: string;
}

const PLATFORM_DOMAINS: Record<SocialPlatform, string> = {
  instagram: 'instagram.com',
  tiktok: 'tiktok.com',
  facebook: 'facebook.com',
};

export function validateSocialUrl(platform: SocialPlatform, url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (!trimmed.startsWith('https://')) {
    return 'URL must start with https://';
  }
  const domain = PLATFORM_DOMAINS[platform];
  if (!trimmed.toLowerCase().includes(domain)) {
    return `URL must contain ${domain}`;
  }
  return null;
}

export async function fetchDealerSocialLinks(dealerId: string): Promise<DealerSocialLink[]> {
  const { data, error } = await supabase
    .from('dealer_social_links')
    .select('*')
    .eq('dealer_id', dealerId)
    .order('platform');

  if (error) throw error;
  return (data || []) as DealerSocialLink[];
}

export async function upsertDealerSocialLink(
  dealerId: string,
  platform: SocialPlatform,
  url: string
): Promise<DealerSocialLink> {
  const { data, error } = await supabase
    .from('dealer_social_links')
    .upsert(
      { dealer_id: dealerId, platform, url: url.trim() },
      { onConflict: 'dealer_id,platform' }
    )
    .select()
    .single();

  if (error) throw error;
  return data as DealerSocialLink;
}

export async function deleteDealerSocialLink(
  dealerId: string,
  platform: SocialPlatform
): Promise<void> {
  const { error } = await supabase
    .from('dealer_social_links')
    .delete()
    .eq('dealer_id', dealerId)
    .eq('platform', platform);

  if (error) throw error;
}

export async function saveDealerSocialLink(
  dealerId: string,
  platform: SocialPlatform,
  url: string
): Promise<DealerSocialLink | null> {
  const trimmed = url.trim();
  if (!trimmed) {
    await deleteDealerSocialLink(dealerId, platform);
    return null;
  }
  return upsertDealerSocialLink(dealerId, platform, trimmed);
}
