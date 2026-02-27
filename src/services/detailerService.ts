import { supabase } from '../lib/supabaseClient';
import { Detailer } from '../types';

export interface DetailerFilters {
  /** Case-insensitive partial match on dealer_profiles.business_name */
  businessName?: string;
  /** Single service for filter (e.g. "Full Detail") - filters via services_offered.specialties */
  service?: string;
  services?: string[];
  priceRange?: string;
  minRating?: number;
  location?: {
    lat: number;
    lng: number;
    radius?: number; // in miles
  };
  isPro?: boolean;
}

/**
 * Fetch all detailers from Supabase with optional filters
 */
export async function fetchDetailers(filters?: DetailerFilters): Promise<Detailer[]> {
  try {
    console.log('🔍 Fetching detailers from Supabase...');
    
    // Simpler query - just get dealer_profiles first
    let query = supabase
      .from('dealer_profiles')
      .select('*');

    // Dealer name search: case-insensitive partial match (ilike)
    if (filters?.businessName?.trim()) {
      query = query.ilike('business_name', `%${filters.businessName.trim()}%`);
    }

    // Apply filters
    if (filters?.priceRange) {
      query = query.eq('price_range', filters.priceRange);
    }

    // Service filter: dealer must offer this service (JSONB array contains)
    if (filters?.service?.trim()) {
      query = query.contains('services_offered', { specialties: [filters.service.trim()] });
    }

    if (filters?.isPro !== undefined) {
      query = query.eq('is_pro', filters.isPro);
    }

    query = query.order('rating', { ascending: false });

    const { data: dealerData, error: dealerError } = await query;

    if (dealerError) {
      console.error('❌ Error fetching dealer_profiles:', dealerError);
      throw dealerError;
    }

    if (!dealerData || dealerData.length === 0) {
      console.warn('⚠️ No dealer_profiles found in database');
      return [];
    }

    console.log(`✅ Found ${dealerData.length} dealer_profiles`);

    // Now fetch the corresponding profiles
    const dealerIds = dealerData.map(d => d.id);
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', dealerIds);

    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError);
      throw profileError;
    }

    console.log(`✅ Found ${profileData?.length || 0} matching profiles`);

    // Combine the data
    const detailers: Detailer[] = dealerData.map((dealer: any) => {
      const profile = profileData?.find(p => p.id === dealer.id);
      if (!profile) {
        console.warn(`⚠️ No profile found for dealer ${dealer.id}`);
        return null;
      }

      const servicesOffered = dealer.services_offered || {};
      
      const hasCoords = typeof dealer.location_lat === 'number' && typeof dealer.location_lng === 'number';
      return {
        id: profile.id,
        role: 'detailer',
        email: profile.email,
        phone: profile.phone || '',
        name: profile.name,
        businessName: dealer.business_name || 'Detailing Business',
        bio: dealer.bio || `Welcome to ${dealer.business_name || 'our business'}! We offer premium auto detailing services.`,
        logo: dealer.logo_url || undefined,
        avatar: profile.avatar_url || dealer.logo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        location: dealer.base_location || 'Unknown',
        ...(hasCoords && {
          coordinates: { lat: dealer.location_lat, lng: dealer.location_lng },
        }),
        serviceRadius: dealer.service_radius_miles ?? servicesOffered.serviceRadius ?? 15,
        priceRange: dealer.price_range || '$$',
        rating: dealer.rating ?? 0,
        reviewCount: dealer.review_count ?? 0,
        photos: dealer.portfolio_images || [],
        portfolioImages: (dealer.portfolio_images || []).map((url: string, idx: number) => ({
          id: `${dealer.id}-${idx}`,
          url,
          category: 'portfolio'
        })),
        services: servicesOffered.specialties || [],
        specialties: servicesOffered.specialties || [],
        isPro: dealer.is_pro || false,
        wallet: dealer.wallet || 0,
        completedJobs: dealer.completed_jobs || 0,
        responseTime: dealer.response_time,
        acceptanceRate: dealer.acceptance_rate,
        isVerified: dealer.is_verified || false,
        isInsured: dealer.is_insured || false,
        yearsInBusiness: dealer.years_in_business,
        certifications: dealer.certifications || [],
        createdAt: new Date(profile.created_at || Date.now()),
        operatingHours: dealer.operating_hours,
        commPreference: dealer.comm_preference || 'voice-chat', // Default to voice-chat to show call button
      };
    }).filter(Boolean) as Detailer[];

    console.log(`✅ Transformed ${detailers.length} detailers successfully`);

    // Apply client-side filters (for complex filtering)
    let filteredDetailers = detailers;

    // Filter by services
    if (filters?.services && filters.services.length > 0) {
      filteredDetailers = filteredDetailers.filter(detailer =>
        filters.services!.some(service =>
          detailer.services.includes(service)
        )
      );
    }

    // Filter by rating
    if (filters?.minRating) {
      filteredDetailers = filteredDetailers.filter(
        detailer => detailer.rating >= filters.minRating!
      );
    }

    // Filter by location/radius (simple distance calculation)
    if (filters?.location) {
      const { lat, lng, radius = 25 } = filters.location;
      filteredDetailers = filteredDetailers.filter(detailer => {
        // This is a simplified distance check
        // In production, you'd use PostGIS or a proper geospatial query
        if (!detailer.serviceArea?.center) return true;
        
        const distance = calculateDistance(
          lat,
          lng,
          detailer.serviceArea.center.lat,
          detailer.serviceArea.center.lng
        );
        
        return distance <= radius;
      });
    }

    return filteredDetailers;
  } catch (error) {
    console.error('Failed to fetch detailers:', error);
    throw error;
  }
}

/**
 * Fetch a single detailer by ID
 */
export async function fetchDetailerById(id: string): Promise<Detailer | null> {
  try {
    const { data, error } = await supabase
      .from('dealer_profiles')
      .select(`
        *,
        profiles!inner(
          id,
          email,
          phone,
          name,
          avatar_url,
          created_at,
          role
        )
      `)
      .eq('id', id)
      .eq('profiles.role', 'dealer')
      .single();

    if (error) {
      console.error('Error fetching detailer:', error);
      throw error;
    }

    if (!data) return null;

    const profile = data.profiles;
    const servicesOffered = data.services_offered || {};

    return {
      id: profile.id,
      role: 'detailer',
      email: profile.email,
      phone: profile.phone || '',
      name: profile.name,
      businessName: data.business_name || 'Detailing Business',
      bio: data.bio || `Welcome to ${data.business_name}!`,
      logo: data.logo_url || undefined,
      avatar: profile.avatar_url || data.logo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      location: data.base_location || 'Unknown',
      serviceRadius: data.service_radius_miles ?? servicesOffered.serviceRadius ?? 15,
      priceRange: data.price_range || '$',
      rating: data.rating ?? 0,
      reviewCount: data.review_count ?? 0,
      photos: data.portfolio_images || [],
      portfolioImages: data.portfolio_images?.map((url: string, idx: number) => ({
        id: `${data.id}-${idx}`,
        url,
        category: 'portfolio'
      })) || [],
      services: servicesOffered.specialties || [],
      specialties: servicesOffered.specialties || [],
      isPro: data.is_pro || false,
      wallet: data.wallet || 0,
      completedJobs: data.completed_jobs || 0,
      responseTime: data.response_time,
      acceptanceRate: data.acceptance_rate,
      isVerified: data.is_verified || false,
      isInsured: data.is_insured || false,
      yearsInBusiness: data.years_in_business,
      certifications: data.certifications || [],
      createdAt: new Date(profile.created_at),
      operatingHours: data.operating_hours,
    };
  } catch (error) {
    console.error('Failed to fetch detailer:', error);
    throw error;
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
