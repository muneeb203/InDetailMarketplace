// Service Pricing System - TypeScript Types and Interfaces

// Vehicle Category
export interface VehicleCategory {
  id: string;
  name: string;
  description: string;
  display_order: number;
  created_at: string;
}

// Service (predefined or custom)
export interface Service {
  id: string;
  name: string;
  description: string;
  is_predefined: boolean;
  dealer_id: string | null;
  created_at: string;
}

// Pricing model type
export type PricingModel = 'single' | 'multi-tier';

// Service Offering
export interface ServiceOffering {
  id: string;
  dealer_id: string;
  service_id: string;
  pricing_model: PricingModel;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Service Price
export interface ServicePrice {
  id: string;
  service_offering_id: string;
  vehicle_category_id: string;
  price: number;
  created_at: string;
}

// Order Service (junction table record)
export interface OrderService {
  id: string;
  order_id: string;
  service_offering_id: string;
  service_name: string;
  price_at_order: number;
  created_at: string;
}

// Composite types for UI and service layer

// Service offering with all its prices
export interface ServiceOfferingWithPrices extends ServiceOffering {
  service: Service;
  prices: ServicePrice[];
}

// Service offering with single price for specific vehicle category
export interface ServiceOfferingWithPrice extends ServiceOffering {
  service: Service;
  price: number;
  vehicle_category_id: string;
}

// Service with offering status (for detailer configuration UI)
export interface ServiceWithOfferingStatus extends Service {
  offering_id: string | null;
  is_offered: boolean;
  pricing_model: PricingModel | null;
  is_active: boolean;
  prices: ServicePrice[];
}

// Order with vehicle category and services
export interface OrderWithServices {
  id: string;
  customer_id: string;
  dealer_id: string;
  vehicle_category_id: string;
  vehicle_category?: VehicleCategory;
  total_price: number;
  status: string;
  created_at: string;
  services: OrderService[];
}

// Form data types for UI components

// Pricing configuration form data
export interface PricingConfigurationData {
  pricing_model: PricingModel;
  prices: {
    vehicle_category_id: string;
    price: number;
  }[];
}

// Custom service form data
export interface CustomServiceFormData {
  name: string;
  description: string;
}

// Order creation with services
export interface CreateOrderWithServicesData {
  dealer_id: string;
  vehicle_category_id: string;
  service_offering_ids: string[];
  // Other order fields...
  notes?: string;
}
