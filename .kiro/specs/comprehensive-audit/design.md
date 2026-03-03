# Design Document: Comprehensive Audit Remediation

## Overview

This design document outlines the systematic approach to address 190+ issues identified in the InDetail Marketplace App audit. The remediation is organized into 6 phases over 6-8 months, prioritizing critical security issues, core business functionality, and production readiness.

### Current State
- 35% production ready
- 40% of visible features non-functional or using mock data
- 23 critical issues blocking production
- 47 high-priority issues affecting major functionality
- Extensive use of hardcoded mock data throughout the application

### Target State
- 100% production ready
- All mock data replaced with real database operations
- All critical security vulnerabilities resolved
- Core business features fully functional
- Comprehensive testing coverage
- Production monitoring and error tracking
- Scalable architecture supporting growth

### Success Criteria
- Zero critical security vulnerabilities
- All payment processing functional with real Stripe integration
- All database operations persisted and transactional
- 80%+ test coverage
- Sub-2s page load times
- 99.9% uptime
- Full mobile responsiveness


## Architecture

### System Architecture Overview

The remediation will transform the current client-heavy architecture into a proper three-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  - UI Components (TypeScript + Tailwind)                    │
│  - State Management (React Context + Hooks)                 │
│  - Client-side Validation                                   │
│  - Real-time Updates (Supabase Realtime)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   API/Service Layer                          │
│  - Supabase Edge Functions (Deno)                          │
│  - Business Logic Validation                                │
│  - Third-party Integrations (Stripe, Twilio, SendGrid)     │
│  - Rate Limiting & Security                                 │
│  - Webhook Handlers                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer (Supabase)                     │
│  - PostgreSQL Database                                      │
│  - Row Level Security (RLS)                                 │
│  - Storage Buckets (Images, Documents)                      │
│  - Realtime Subscriptions                                   │
│  - Database Functions & Triggers                            │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Changes

1. **Move Business Logic to Server**
   - Wallet operations → Edge Functions with database transactions
   - Lead management → Server-side with proper validation
   - Payment processing → Stripe webhooks + Edge Functions
   - Status transitions → Database triggers + validation functions

2. **Implement Proper Data Flow**
   - Client → API → Database (no direct client-to-database for sensitive operations)
   - Real-time updates via Supabase subscriptions
   - Optimistic UI updates with rollback on failure

3. **Security Hardening**
   - Row Level Security (RLS) on all tables
   - API rate limiting via Edge Functions
   - Input validation at multiple layers
   - Secure file upload with virus scanning

4. **Scalability Improvements**
   - Database connection pooling
   - CDN for static assets
   - Image optimization pipeline
   - Caching strategy (Redis for hot data)


## Components and Interfaces

### Phase 1: Critical Security & Infrastructure (Weeks 1-2)

#### 1.1 Authentication Service Enhancements

**Component**: `authService.ts` (enhanced)

**Interfaces**:
```typescript
interface PasswordResetRequest {
  email: string;
  redirectUrl: string;
}

interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

interface SessionConfig {
  persistSession: boolean;
  autoRefreshToken: boolean;
  detectSessionInUrl: boolean;
}

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}
```

**New Functions**:
- `requestPasswordReset(email: string): Promise<void>`
- `confirmPasswordReset(token: string, password: string): Promise<void>`
- `verifyEmailAddress(token: string): Promise<void>`
- `resendVerificationEmail(email: string): Promise<void>`
- `checkRateLimit(identifier: string, action: string): Promise<boolean>`

#### 1.2 Wallet Service (Server-side)

**Component**: Supabase Edge Function `wallet-operations`

**Interfaces**:
```typescript
interface WalletTransaction {
  id: string;
  user_id: string;
  type: 'credit' | 'debit' | 'refund' | 'bonus';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  reference_type?: 'lead' | 'order' | 'purchase' | 'refund';
  reference_id?: string;
  stripe_payment_intent_id?: string;
  created_at: Date;
}

interface WalletOperationRequest {
  user_id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  reference_type?: string;
  reference_id?: string;
  idempotency_key: string;
}

interface WalletBalance {
  user_id: string;
  balance: number;
  currency: 'USD';
  last_updated: Date;
}
```

**Edge Function Endpoints**:
- `POST /wallet/debit` - Deduct credits (lead purchase, etc.)
- `POST /wallet/credit` - Add credits (purchase, refund, bonus)
- `GET /wallet/balance` - Get current balance
- `GET /wallet/transactions` - Get transaction history

#### 1.3 Photo Storage Service (Real Implementation)

**Component**: `photoStorageService.ts` (rewritten)

**Interfaces**:
```typescript
interface UploadOptions {
  bucket: 'avatars' | 'portfolios' | 'vehicles' | 'job-photos';
  folder?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  compress?: boolean;
  generateThumbnail?: boolean;
}

interface UploadResult {
  url: string;
  path: string;
  thumbnailUrl?: string;
  size: number;
  contentType: string;
}

interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}
```

**Functions**:
- `uploadPhoto(file: File, options: UploadOptions): Promise<UploadResult>`
- `deletePhoto(path: string): Promise<void>`
- `getSignedUrl(path: string, expiresIn?: number): Promise<string>`
- `transformImage(path: string, options: ImageTransformOptions): Promise<string>`
- `compressImage(file: File, quality: number): Promise<File>`


### Phase 2: Core Business Features (Weeks 3-6)

#### 2.1 Lead Management System

**Component**: `leadService.ts` + Edge Function `lead-operations`

**Interfaces**:
```typescript
interface Lead {
  id: string;
  request_id: string;
  detailer_id: string;
  customer_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  cost: number;
  sent_at: Date;
  expires_at: Date;
  accepted_at?: Date;
  declined_at?: Date;
  decline_reason?: string;
}

interface LeadPurchaseRequest {
  detailer_id: string;
  request_id: string;
  cost: number;
  idempotency_key: string;
}

interface LeadMatchingCriteria {
  service_types: string[];
  location: { lat: number; lng: number };
  max_distance_miles: number;
  vehicle_type?: string;
  budget_range?: { min: number; max: number };
}
```

**Edge Function Endpoints**:
- `POST /leads/purchase` - Purchase a lead (atomic: check wallet, deduct, create lead)
- `POST /leads/accept` - Accept a lead
- `POST /leads/decline` - Decline a lead with reason
- `GET /leads/available` - Get available leads for detailer
- `GET /leads/purchased` - Get detailer's purchased leads

#### 2.2 Payment Processing (Stripe Integration)

**Component**: `stripeService.ts` (rewritten) + Edge Functions

**Interfaces**:
```typescript
interface PaymentIntentRequest {
  amount: number;
  currency: 'usd';
  customer_id: string;
  metadata: {
    user_id: string;
    type: 'credit_purchase' | 'order_payment';
    reference_id?: string;
  };
}

interface StripeCustomer {
  stripe_customer_id: string;
  user_id: string;
  email: string;
  default_payment_method?: string;
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonus_credits: number;
  popular: boolean;
}
```

**Edge Function Endpoints**:
- `POST /stripe/create-payment-intent` - Create payment intent for credit purchase
- `POST /stripe/webhook` - Handle Stripe webhooks (payment success, failure, refund)
- `POST /stripe/create-customer` - Create Stripe customer
- `GET /stripe/payment-methods` - Get saved payment methods

#### 2.3 Reviews and Ratings System

**Component**: `reviewService.ts` + Database triggers

**Interfaces**:
```typescript
interface Review {
  id: string;
  order_id: string;
  detailer_id: string;
  customer_id: string;
  rating: number; // 1-5
  title?: string;
  comment?: string;
  photos?: string[];
  response?: string;
  response_at?: Date;
  helpful_count: number;
  created_at: Date;
  updated_at: Date;
}

interface ReviewStats {
  detailer_id: string;
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recent_reviews: Review[];
}
```

**Functions**:
- `submitReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review>`
- `respondToReview(reviewId: string, response: string): Promise<void>`
- `getDetailerReviews(detailerId: string, limit?: number): Promise<Review[]>`
- `calculateDetailerRating(detailerId: string): Promise<ReviewStats>`
- `markReviewHelpful(reviewId: string, userId: string): Promise<void>`

**Database Trigger**: Auto-calculate average rating when review is added/updated


#### 2.4 Geolocation Service (Real Implementation)

**Component**: `geocodingService.ts` (rewritten)

**Interfaces**:
```typescript
interface GeocodingResult {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  components: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  confidence: number;
}

interface ReverseGeocodingResult {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface DistanceCalculation {
  distance_miles: number;
  distance_km: number;
  duration_minutes?: number;
}
```

**Functions**:
- `geocodeAddress(address: string): Promise<GeocodingResult[]>`
- `reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodingResult>`
- `calculateDistance(from: Coordinates, to: Coordinates): number`
- `isWithinRadius(center: Coordinates, point: Coordinates, radiusMiles: number): boolean`
- `batchGeocode(addresses: string[]): Promise<GeocodingResult[]>`

**Provider Strategy**:
- Primary: Google Maps Geocoding API (paid, reliable)
- Fallback: Mapbox Geocoding API
- Cache results in database for 30 days

#### 2.5 Messaging Service (Real Implementation)

**Component**: `messagingService.ts` (rewritten) + Realtime subscriptions

**Interfaces**:
```typescript
interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  type: 'text' | 'image' | 'voice' | 'system';
  attachment_url?: string;
  read_at?: Date;
  delivered_at?: Date;
  created_at: Date;
}

interface Conversation {
  id: string;
  participants: string[];
  last_message?: Message;
  unread_count: { [userId: string]: number };
  created_at: Date;
  updated_at: Date;
}

interface TypingIndicator {
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
  timestamp: Date;
}
```

**Functions**:
- `sendMessage(conversationId: string, content: string, type: string): Promise<Message>`
- `markAsRead(messageIds: string[], userId: string): Promise<void>`
- `getConversations(userId: string): Promise<Conversation[]>`
- `getMessages(conversationId: string, limit?: number): Promise<Message[]>`
- `subscribeToConversation(conversationId: string, callback: Function): Subscription`
- `sendTypingIndicator(conversationId: string, isTyping: boolean): Promise<void>`

**Realtime Features**:
- Message delivery via Supabase Realtime
- Typing indicators via presence channel
- Read receipts via database updates + subscriptions


### Phase 3: Notification System (Weeks 7-8)

#### 3.1 Notification Service

**Component**: `notificationService.ts` + Edge Functions

**Interfaces**:
```typescript
interface Notification {
  id: string;
  user_id: string;
  type: 'lead' | 'order' | 'message' | 'review' | 'payment' | 'system';
  title: string;
  body: string;
  data?: Record<string, any>;
  read_at?: Date;
  action_url?: string;
  created_at: Date;
}

interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  notification_types: {
    leads: boolean;
    orders: boolean;
    messages: boolean;
    reviews: boolean;
    payments: boolean;
    marketing: boolean;
  };
}

interface EmailTemplate {
  template_id: string;
  subject: string;
  variables: Record<string, string>;
}
```

**Functions**:
- `createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification>`
- `sendEmail(to: string, template: EmailTemplate): Promise<void>`
- `sendSMS(to: string, message: string): Promise<void>`
- `sendPushNotification(userId: string, notification: Notification): Promise<void>`
- `getNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>`
- `markAsRead(notificationIds: string[]): Promise<void>`
- `updatePreferences(userId: string, preferences: NotificationPreferences): Promise<void>`

**Integration Points**:
- Email: SendGrid or AWS SES
- SMS: Twilio
- Push: Firebase Cloud Messaging (FCM) or OneSignal

**Trigger Events**:
- New lead available → Email + Push to detailer
- Lead accepted → Email to customer
- Order status change → Email + Push to both parties
- New message → Push notification
- Payment received → Email receipt
- Review submitted → Email to detailer

### Phase 4: Search & Discovery (Weeks 9-10)

#### 4.1 Enhanced Search Service

**Component**: `searchService.ts` + PostgreSQL full-text search

**Interfaces**:
```typescript
interface SearchQuery {
  query?: string;
  filters: {
    services?: string[];
    price_range?: { min: number; max: number };
    rating_min?: number;
    distance_max?: number;
    availability?: Date;
  };
  location: {
    lat: number;
    lng: number;
  };
  sort_by: 'relevance' | 'rating' | 'distance' | 'price_low' | 'price_high';
  page: number;
  limit: number;
}

interface SearchResult {
  detailer: DetailerProfile;
  distance_miles: number;
  relevance_score: number;
  matching_services: string[];
  available_slots?: Date[];
}

interface SearchSuggestion {
  type: 'service' | 'location' | 'detailer';
  text: string;
  count: number;
}
```

**Functions**:
- `searchDetailers(query: SearchQuery): Promise<{ results: SearchResult[]; total: number }>`
- `getSuggestions(partial: string, type: string): Promise<SearchSuggestion[]>`
- `saveSearch(userId: string, query: SearchQuery): Promise<void>`
- `getSavedSearches(userId: string): Promise<SearchQuery[]>`
- `createSearchAlert(userId: string, query: SearchQuery): Promise<void>`

**Search Ranking Algorithm**:
```
relevance_score = 
  (text_match_score * 0.3) +
  (rating_score * 0.25) +
  (distance_score * 0.2) +
  (review_count_score * 0.15) +
  (response_time_score * 0.1)
```

**Database Optimization**:
- Full-text search index on detailer business names and specialties
- GiST index on location coordinates for spatial queries
- Composite index on (rating, review_count) for sorting


### Phase 5: Testing & Quality (Weeks 11-12)

#### 5.1 Testing Infrastructure

**Test Framework Stack**:
- Unit Tests: Vitest
- Integration Tests: Vitest + Supabase local instance
- E2E Tests: Playwright
- Component Tests: React Testing Library
- API Tests: Supertest

**Test Coverage Targets**:
- Services: 90%+
- Components: 80%+
- Edge Functions: 95%+
- Overall: 85%+

**Test Organization**:
```
tests/
├── unit/
│   ├── services/
│   ├── utils/
│   └── hooks/
├── integration/
│   ├── auth-flow.test.ts
│   ├── lead-purchase.test.ts
│   ├── payment-flow.test.ts
│   └── messaging.test.ts
├── e2e/
│   ├── client-journey.spec.ts
│   ├── detailer-journey.spec.ts
│   └── admin-journey.spec.ts
└── fixtures/
    ├── users.ts
    ├── orders.ts
    └── detailers.ts
```

#### 5.2 Error Monitoring

**Component**: Error tracking and monitoring setup

**Tools**:
- Sentry for error tracking
- LogRocket for session replay
- Supabase logs for database queries
- Custom analytics for business metrics

**Error Boundaries**:
```typescript
interface ErrorBoundaryProps {
  fallback: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  children: React.ReactNode;
}
```

**Monitoring Dashboards**:
- Error rate by component
- API response times
- Database query performance
- User flow completion rates
- Payment success rates

### Phase 6: Production Readiness (Weeks 13-16)

#### 6.1 Performance Optimization

**Optimization Strategies**:

1. **Code Splitting**:
```typescript
// Lazy load routes
const ClientDashboard = lazy(() => import('./components/ClientDashboard'));
const DetailerDashboard = lazy(() => import('./components/DetailerDashboard'));
const MarketplaceSearch = lazy(() => import('./components/MarketplaceSearch'));
```

2. **Image Optimization**:
- Convert to WebP format
- Generate multiple sizes (thumbnail, medium, large)
- Lazy load images below the fold
- Use CDN for delivery

3. **Database Optimization**:
- Add missing indexes
- Optimize N+1 queries
- Implement query result caching
- Use database connection pooling

4. **Bundle Optimization**:
- Tree shaking
- Minification
- Compression (Brotli)
- Remove unused dependencies

**Performance Targets**:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

#### 6.2 Security Hardening

**Security Measures**:

1. **Row Level Security (RLS) Policies**:
```sql
-- Example: Users can only see their own wallet transactions
CREATE POLICY "Users can view own transactions"
ON wallet_transactions FOR SELECT
USING (auth.uid() = user_id);

-- Detailers can only update their own profiles
CREATE POLICY "Detailers can update own profile"
ON dealer_profiles FOR UPDATE
USING (auth.uid() = user_id);
```

2. **Rate Limiting**:
- Authentication: 5 attempts per 15 minutes
- API calls: 100 requests per minute per user
- File uploads: 10 per hour per user
- Message sending: 60 per hour per user

3. **Input Validation**:
- Server-side validation for all inputs
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitize user content)
- CSRF protection (tokens)

4. **File Upload Security**:
- Virus scanning (ClamAV)
- File type validation (magic numbers, not just extension)
- Size limits enforced server-side
- Separate storage buckets with restricted access

