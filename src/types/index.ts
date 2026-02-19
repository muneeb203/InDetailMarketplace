export type UserRole = 'customer' | 'detailer' | 'client';

export interface User {
  id: string;
  role: UserRole;
  email: string;
  phone: string;
  name: string;
  location?: string;
  createdAt: Date;
}

export interface Customer extends User {
  role: 'customer';
  vehicles: Vehicle[];
  fleets?: Fleet[];
  preferences?: string[];
  commPreference?: CommPreference;
}

export interface Fleet {
  id: string;
  name: string;
  notes?: string;
  vehicleIds: string[];
  isDefault: boolean;
}

export interface ServiceArea {
  center: {
    lat: number;
    lng: number;
  };
  radius: number; // in miles
  address?: string;
}

export interface OperatingHours {
  [key: string]: {
    isOpen: boolean;
    open: string;
    close: string;
  };
}

export interface PortfolioItem {
  id?: string;
  url: string;
  label?: string;
  category?: string;
}

export type CommPreference = 'voice' | 'voice-chat' | 'chat-only';
export type WaterSourceRequirement = 'required' | 'not-required' | 'case-by-case';

export interface SocialConnection {
  platform: 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'google-business';
  username?: string;
  url: string;
  isConnected: boolean;
  followerCount?: number;
  lastSynced?: Date;
}

export interface ExposureMetrics {
  profileViews: number;
  profileViewsTrend: number; // percentage change
  saves: number;
  savesTrend: number;
  leadOpens: number;
  leadOpensTrend: number;
  quoteAcceptRate: number;
  quoteAcceptRateTrend: number;
  period: '7' | '30'; // days
}

export interface PromoBanner {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  limitedInventory?: number;
  isActive: boolean;
}

export interface BrandAssets {
  logo?: string;
  bannerImage?: string;
  accentColor?: string;
  tagline?: string; // max 70 chars
  shortBio?: string; // max 240 chars
}

export interface BeforeAfterPhoto {
  id: string;
  beforeUrl: string;
  afterUrl: string;
  category?: string;
  description?: string;
}

export interface Detailer extends User {
  role: 'detailer';
  businessName: string;
  bio: string;
  avatar: string;
  tagline?: string;
  logo?: string;
  serviceArea?: ServiceArea;
  serviceRadius?: number;
  priceRange: string;
  rating: number;
  reviewCount?: number;
  photos: string[];
  portfolioImages?: PortfolioItem[];
  beforeAfterPhotos?: BeforeAfterPhoto[];
  services: string[];
  specialties?: string[];
  operatingHours?: OperatingHours;
  isPro: boolean;
  wallet: number;
  completedJobs: number;
  responseTime?: number;
  acceptanceRate?: number;
  commPreference?: CommPreference;
  waterSourceRequirement?: WaterSourceRequirement;
  introVideoUrl?: string;
  socialConnections?: SocialConnection[];
  brandAssets?: BrandAssets;
  exposureMetrics?: ExposureMetrics;
  promoBanners?: PromoBanner[];
  isVerified?: boolean;
  isInsured?: boolean;
  yearsInBusiness?: number;
  certifications?: string[];
}

export interface Vehicle {
  id: string;
  type?: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  nickname?: string;
  photo?: string;
  careNotes?: string;
  isDefault?: boolean;
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  vehicleType: string;
  services: string[];
  preferredDate: string;
  preferredTime: string;
  location: string;
  notes: string;
  carPhotos?: string[]; // Client car photos (up to 5)
  status: 'pending' | 'accepted' | 'declined' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
  detailerId?: string;
  price?: number;
}

export interface Lead {
  id: string;
  requestId: string;
  detailerId: string;
  customerId: string;
  status: 'pending' | 'accepted' | 'declined';
  cost: number;
  sentAt: Date;
  carPhotos?: string[]; // Car photos from the quote request
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  requestId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

export interface Booking {
  id: string;
  requestId: string;
  customerId: string;
  detailerId: string;
  services: string[];
  vehicleType: string;
  location: string;
  scheduledDate: string;
  scheduledTime: string;
  price: number;
  status: 'confirmed' | 'on-the-way' | 'started' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  detailerId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

/** Order status progression: pending → countered | accepted | rejected → paid → in_progress → completed */
export type OrderStatus =
  | 'pending'
  | 'countered'
  | 'accepted'
  | 'rejected'
  | 'paid'
  | 'in_progress'
  | 'completed';

export interface Order {
  id: string;
  gig_id: string;
  client_id: string;
  dealer_id: string;
  proposed_price: number;
  agreed_price: number | null;
  notes: string | null;
  scheduled_date: string | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  opened_at: string | null;
  // Joined data (from queries)
  dealer?: { id: string; business_name?: string; base_location?: string };
  client?: { id: string; name?: string };
}