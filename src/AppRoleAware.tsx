import { useState } from "react";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { SignInScreen } from "./components/SignInScreen";
import { SignUpScreen } from "./components/SignUpScreen";
import { ClientOnboarding } from "./components/ClientOnboarding";
import { DetailerOnboarding } from "./components/DetailerOnboarding";
import { MarketplaceSearchEnhanced } from "./components/MarketplaceSearchEnhanced";
import { DetailerDashboardEnhanced } from "./components/DetailerDashboardEnhanced";
import { StatusDemoPage } from "./components/StatusDemoPage";
import { RoleGuard } from "./components/RoleGuard";
import { BottomNavigation } from "./components/BottomNavigation";
import { BookingsPageIntegrated } from "./components/BookingsPageIntegrated";
import { MessagesPageIntegrated } from "./components/MessagesPageIntegrated";
import { ProfileRoleAware } from "./components/ProfileRoleAware";
import { ClientJobStatusPage } from "./components/ClientJobStatusPage";
import { DetailerJobStatusPage } from "./components/DetailerJobStatusPage";
import { StatusCenter } from "./components/StatusCenter";
import { BookingRequestForm } from "./components/BookingRequestForm";
import { DetailerProfile } from "./components/DetailerProfile";
import { DetailerProfileEnhancedPublic } from "./components/DetailerProfileEnhancedPublic";
import { OrderPlacementModal } from "./components/OrderPlacementModal";
import { ClientOrdersPage } from "./components/ClientOrdersPage";
import { ProDashboard } from "./components/detailer/ProDashboard";
import { ProPublicProfile } from "./components/detailer/ProPublicProfile";
import { ProLeadInbox } from "./components/detailer/ProLeadInbox";
import { DealerOrdersQueue } from "./components/detailer/DealerOrdersQueue";
import { DealerSettings } from "./components/detailer/DealerSettings/DealerSettings";
import { ClientSettings } from "./components/ClientSettings";
import { DetailerProfileHome } from "./components/detailer/DetailerProfileHome";
import { WebLayout } from "./components/WebLayout";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { Customer, Detailer, Lead, Booking } from "./types";
import { mockDetailers } from "./data/mockData";
import { useDetailers } from "./hooks/useDetailers";
import { signUpAuthOnly, createClientProfile, createDealerProfile, signInAndLoadProfile } from "./services/supabaseAuth";
import { supabase } from "./lib/supabaseClient";
import { getLeadCost } from "./services/stripeService";
import { FileText, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "./components/ui/button";
import { DebugDataSource } from "./components/DebugDataSource";
import { useAuth } from "./context/AuthContext";
import { useDealerProfile } from "./hooks/useDealerProfile";
import { useUnreadMessages } from "./hooks/useUnreadMessages";

type View =
  | "welcome"
  | "signin"
  | "signup"
  | "onboarding-client"
  | "onboarding-detailer"
  | "marketplace"
  | "dashboard"
  | "messages"
  | "bookings"
  | "my-orders"
  | "profile"
  | "status-demo"
  | "job-status"
  | "status"
  | "request-quote"
  | "detailer-profile"
  | "pro-dashboard"
  | "pro-profile-editor"
  | "pro-public-profile"
  | "pro-lead-inbox"
  | "orders-queue"
  | "quotes"
  | "alerts"
  | "settings";

type AuthFlow = "signin" | "signup";

export default function AppRoleAware() {
  const { currentUser, setCurrentUser, clearUser } = useAuth();
  const [currentView, setCurrentView] = useState<View>("welcome");
  const [selectedRole, setSelectedRole] = useState<"client" | "detailer" | null>(null);
  const [authFlow, setAuthFlow] = useState<AuthFlow>("signin");
  const [tempUserData, setTempUserData] = useState<{
    userId: string;
    name: string;
    email: string;
    phone: string;
    role: "client" | "detailer";
  } | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<
    string | null
  >(null);
  const [selectedDetailerId, setSelectedDetailerId] = useState<
    string | null
  >(null);
  const [dealerIdToOpen, setDealerIdToOpen] = useState<string | null>(null);
  const [viewingConversationId, setViewingConversationId] = useState<string | null>(null);
  const [proNavParams, setProNavParams] = useState<any>({});
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  
  // Fetch real detailers from Supabase
  const { detailers, loading: detailersLoading, error: detailersError } = useDetailers();
  const { data: dealerProfile } = useDealerProfile(
    currentUser?.role === 'detailer' ? currentUser.id : undefined
  );
  const { unreadCount, markAsRead } = useUnreadMessages(
    currentUser?.id,
    currentUser?.role ?? 'client',
    viewingConversationId
  );
  
  // Log what we got from Supabase
  console.log('📊 Detailers from Supabase:', detailers.length, 'detailers');
  console.log('⏳ Loading:', detailersLoading);
  console.log('❌ Error:', detailersError);
  
  // Fallback to mock data if Supabase fails or is empty
  const displayDetailers = detailers.length > 0 ? detailers : mockDetailers;
  console.log('🎯 Displaying:', displayDetailers.length, 'detailers', displayDetailers.length === detailers.length ? '(from Supabase)' : '(from mock data)');
  
  // Show a toast notification about data source
  if (detailers.length > 0 && currentView === 'marketplace') {
    console.log('✅ Using REAL data from Supabase!');
  } else if (currentView === 'marketplace') {
    console.log('⚠️ Using MOCK data (Supabase returned 0 detailers)');
  }
  
  // Mock leads and bookings for demo
  const [mockLeads, setMockLeads] = useState<Lead[]>([
    {
      id: 'lead-1',
      requestId: 'req-1',
      detailerId: 'd1',
      customerId: 'c1',
      status: 'pending',
      cost: getLeadCost(false, false),
      sentAt: new Date(),
    }
  ]);
  
  const [mockBookings, setMockBookings] = useState<Booking[]>([
    {
      id: 'booking-1',
      requestId: 'req-2',
      customerId: 'c1',
      detailerId: 'd1',
      services: ['Full Detail', 'Ceramic Coating'],
      vehicleType: '2022 Tesla Model 3',
      location: 'Downtown',
      scheduledDate: 'Dec 28, 2024',
      scheduledTime: '10:00 AM',
      price: 299,
      status: 'confirmed',
      createdAt: new Date(),
    },
    {
      id: 'booking-2',
      requestId: 'req-3',
      customerId: 'c2',
      detailerId: 'd1',
      services: ['Exterior Wash', 'Interior Detail'],
      vehicleType: '2021 BMW X5',
      location: 'Midtown',
      scheduledDate: 'Dec 30, 2024',
      scheduledTime: '2:00 PM',
      price: 180,
      status: 'on-the-way',
      createdAt: new Date(),
    },
  ]);

  // Handle role selection from welcome screen (Continue button clicked)
  const handleContinueFromWelcome = (
    role: "client" | "detailer",
  ) => {
    setSelectedRole(role);
    setCurrentView("signin");
    setAuthFlow("signin");

    // Analytics anchor
    console.log("Analytics: sign_in_role_selected", { role });
  };

  // Handle role change from sign-in/sign-up screens
  const handleChangeRole = () => {
    setCurrentView("welcome");
    setSelectedRole(null);
  };

  // Handle sign in
  const handleSignIn = async (
    email: string,
    password: string,
    _role: "client" | "detailer",
  ) => {
    try {
      const result = await signInAndLoadProfile(email, password);

      if (result.appRole === "client") {
        const clientUser: Customer & { role: "client" } = {
          id: result.profile.id,
          role: "client",
          email: result.profile.email,
          phone: result.profile.phone ?? "",
          name: result.profile.name,
          location: result.clientProfile?.base_location ?? "Unknown",
          createdAt: new Date(result.profile.created_at ?? new Date()),
          vehicles: result.clientProfile?.vehicle_make
            ? [
                {
                  id: "1",
                  make: result.clientProfile.vehicle_make,
                  model: result.clientProfile.vehicle_model ?? "",
                  year: result.clientProfile.vehicle_year ?? new Date().getFullYear(),
                  type: "Sedan",
                  isDefault: true,
                },
              ]
            : [],
        };
        setCurrentUser(clientUser);
        setCurrentView("marketplace");
        toast.success("Signed in as client");
      } else if (result.appRole === "detailer") {
        const dealer = result.dealerProfile;
        const detailerUser: Detailer & { role: "detailer" } = {
          id: result.profile.id,
          role: "detailer",
          email: result.profile.email,
          phone: result.profile.phone ?? "",
          name: result.profile.name,
          businessName: dealer?.business_name ?? "My Detailing Business",
          bio: `Welcome to ${dealer?.business_name ?? "our detailing business"}! We offer premium auto detailing services.`,
          avatar:
            result.profile.avatar_url ??
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
          location: dealer?.base_location ?? "Unknown",
          serviceRadius:
            (dealer?.services_offered as any)?.serviceRadius ?? 15,
          priceRange: dealer?.price_range ?? "$$",
          rating: 0,
          photos: [],
          services:
            ((dealer?.services_offered as any)?.specialties as string[]) ?? [],
          specialties:
            ((dealer?.services_offered as any)?.specialties as string[]) ?? [],
          isPro: false,
          wallet: 0,
          completedJobs: 0,
          createdAt: new Date(result.profile.created_at ?? new Date()),
        };
        setCurrentUser(detailerUser);
        setCurrentView("pro-dashboard");
        toast.success("Signed in as detailer");
      } else {
        toast.error("Unsupported role");
      }
    } catch (error: any) {
      toast.error("Sign-in failed", {
        description: error?.message ?? "Please check your credentials.",
      });
      throw error;
    }
  };

  // Handle sign up
  const handleSignUp = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: "client" | "detailer";
  }) => {
    try {
      const user = await signUpAuthOnly(data.email, data.password);

      setTempUserData({
        userId: user.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
      });

      toast.success("Account created successfully!");

      if (data.role === "client") {
        setCurrentView("onboarding-client");
      } else {
        setCurrentView("onboarding-detailer");
      }
    } catch (error: any) {
      toast.error("Sign-up failed", {
        description: error?.message ?? "Please try again.",
      });
      throw error;
    }
  };

  // Handle client onboarding completion
  const handleClientOnboardingComplete = async (data: {
    location: string;
    location_lat: number | null;
    location_lng: number | null;
    vehicle?: { make: string; model: string; year: number };
    notifications: boolean;
  }) => {
    if (!tempUserData) return;
    try {
      await createClientProfile({
        userId: tempUserData.userId,
        name: tempUserData.name,
        email: tempUserData.email,
        phone: tempUserData.phone,
        location_lat: data.location_lat,
        location_lng: data.location_lng,
        vehicle: data.vehicle,
      });

      const user: Customer & { role: "client" } = {
        id: tempUserData.userId,
        role: "client",
        email: tempUserData.email,
        phone: tempUserData.phone,
        name: tempUserData.name,
        location: data.location,
        createdAt: new Date(),
        vehicles: data.vehicle
          ? [
              {
                id: "1",
                make: data.vehicle.make,
                model: data.vehicle.model,
                year: data.vehicle.year,
                type: "Sedan",
                isDefault: true,
              },
            ]
          : [],
      };

      setCurrentUser(user);
      setCurrentView("marketplace");
      toast.success(`Welcome to InDetail, ${user.name}!`, {
        description: "Your account is ready to use.",
      });

      console.log("Analytics: onboarding_completed", {
        role: "client",
      });
    } catch (error: any) {
      toast.error("Could not complete client onboarding", {
        description: error?.message ?? "Please try again.",
      });
    }
  };

  // Handle detailer onboarding completion
  const handleDetailerOnboardingComplete = async (data: {
    businessName: string;
    serviceRadius: number;
    location: string;
    locationLat: number;
    locationLng: number;
    specialties: string[];
    priceRange: string;
    portfolioImages?: string[];
    logoUrl?: string;
  }) => {
    if (!tempUserData) return;

    try {
      await createDealerProfile({
        userId: tempUserData.userId,
        name: tempUserData.name,
        email: tempUserData.email,
        phone: tempUserData.phone,
        businessName: data.businessName,
        baseLocation: data.location,
        locationLat: data.locationLat,
        locationLng: data.locationLng,
        serviceRadius: data.serviceRadius,
        priceRange: data.priceRange,
        specialties: data.specialties,
        portfolioImages: data.portfolioImages,
        logoUrl: data.logoUrl,
      });

      const user: Detailer & { role: "detailer" } = {
        id: tempUserData.userId,
        role: "detailer",
        email: tempUserData.email,
        phone: tempUserData.phone,
        name: tempUserData.name,
        businessName: data.businessName,
        bio: `Welcome to ${data.businessName}! We offer premium auto detailing services.`,
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
        location: data.location,
        serviceRadius: data.serviceRadius,
        priceRange: data.priceRange,
        rating: 0,
        photos: data.portfolioImages ?? [],
        services: data.specialties,
        specialties: data.specialties,
        isPro: false,
        wallet: 5,
        completedJobs: 0,
        createdAt: new Date(),
      };

      setCurrentUser(user);
      setCurrentView("pro-dashboard");
      toast.success(`Welcome to InDetail, ${user.name}!`, {
        description: "Your business profile is ready.",
      });

      console.log("Analytics: onboarding_completed", {
        role: "detailer",
      });
    } catch (error: any) {
      toast.error("Could not complete detailer onboarding", {
        description: error?.message ?? "Please try again.",
      });
    }
  };

  // Handle Pro navigation
  const handleProNavigate = (view: string, params?: any) => {
    if (view === 'settings') {
      setCurrentView('settings');
      setProNavParams(params || {});
      return;
    }
    const viewMap: Record<string, View> = {
      'pro-dashboard': 'pro-dashboard',
      'dashboard': 'pro-dashboard',
      'pro-profile-editor': 'settings',
      'profile-editor': 'settings',
      'pro-public-profile': 'pro-public-profile',
      'public-profile': 'pro-public-profile',
      'pro-lead-inbox': 'pro-lead-inbox',
      'lead-inbox': 'pro-lead-inbox',
      'orders-queue': 'orders-queue',
    };

    const mappedView = viewMap[view] || 'pro-dashboard';
    setCurrentView(mappedView as View);
    setProNavParams(params || {});
  };
  
  // Handle accept lead
  const handleAcceptLead = (leadId: string) => {
    if (!currentUser || currentUser.role !== 'detailer') return;
    
    const lead = mockLeads.find(l => l.id === leadId);
    if (!lead) return;
    
    const detailer = currentUser as Detailer;
    
    // Check if detailer has enough credits
    if (detailer.wallet < lead.cost) {
      toast.error('Insufficient credits', {
        description: 'Please add more credits to accept this lead.',
      });
      return;
    }
    
    // Deduct credits from wallet
    setCurrentUser({
      ...detailer,
      wallet: detailer.wallet - lead.cost,
    });
    
    // Update lead status
    setMockLeads(prev => prev.map(l => 
      l.id === leadId ? { ...l, status: 'accepted' as const } : l
    ));
    
    toast.success('Lead accepted!', {
      description: `$${lead.cost} deducted from your wallet.`,
    });
    
    // Navigate to messages to start conversation
    setTimeout(() => {
      setCurrentView('messages');
    }, 1500);
  };
  
  // Handle decline lead
  const handleDeclineLead = (leadId: string) => {
    setMockLeads(prev => prev.map(l => 
      l.id === leadId ? { ...l, status: 'declined' as const } : l
    ));
    
    toast.info('Lead declined');
  };
  
  // Handle add credits
  const handleAddCredits = (credits: number) => {
    if (!currentUser || currentUser.role !== 'detailer') return;
    
    const detailer = currentUser as Detailer;
    setCurrentUser({
      ...detailer,
      wallet: detailer.wallet + credits,
    });
    
    toast.success(`Added $${credits} to your wallet!`);
  };
  
  // Handle upgrade to Pro
  const handleUpgradeToPro = () => {
    if (!currentUser || currentUser.role !== 'detailer') return;
    
    const detailer = currentUser as Detailer;
    setCurrentUser({
      ...detailer,
      isPro: true,
    });
    
    toast.success('Upgraded to Pro!', {
      description: 'You now get priority placement and cheaper leads.',
    });
  };
  
  // Handle view booking
  const handleViewBooking = (booking: Booking) => {
    setSelectedBookingId(booking.id);
    setCurrentView('job-status');
  };

  // Handle navigation
  const handleNavigate = (view: string) => {
    if (view !== "messages") setViewingConversationId(null);
    switch (view) {
      case "home":
        setCurrentView(
          currentUser?.role === "detailer"
            ? "pro-dashboard" // Use Pro Dashboard for detailers
            : "marketplace",
        );
        break;
      case "messages":
        setCurrentView("messages");
        break;
      case "bookings":
        setCurrentView("bookings");
        break;
      case "my-orders":
        setCurrentView("my-orders");
        break;
      case "status":
        setCurrentView("status");
        break;
      case "profile":
        setCurrentView("profile");
        break;
      case "pro-public-profile":
        setCurrentView("pro-public-profile");
        break;
      case "quotes":
        setCurrentView("quotes");
        break;
      case "alerts":
        setCurrentView("alerts");
        break;
      case "settings":
        setCurrentView("settings");
        break;
    }
  };

  // Handle view job status
  const handleViewStatus = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setCurrentView("job-status");
  };

  // Handle back from job status
  const handleBackFromStatus = () => {
    setSelectedBookingId(null);
    setCurrentView("bookings");
  };

  const handleBackToWelcome = () => {
    setCurrentView("welcome");
    setSelectedRole(null);
  };

  const handleSwitchAuthFlow = () => {
    setAuthFlow(authFlow === "signin" ? "signup" : "signin");
    setCurrentView(authFlow === "signin" ? "signup" : "signin");
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      clearUser();
      setCurrentView("welcome");
      setSelectedRole(null);
      toast.success("You have been signed out.");
    } catch {
      clearUser();
      setCurrentView("welcome");
      setSelectedRole(null);
      toast.success("You have been signed out.");
    }
  };

  // Welcome screen
  if (currentView === "welcome") {
    return (
      <>
        <Toaster position="top-center" richColors />
        <WelcomeScreen onContinue={handleContinueFromWelcome} />
      </>
    );
  }

  // Sign in screen
  if (currentView === "signin" && selectedRole) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <SignInScreen
          role={selectedRole}
          onBack={handleBackToWelcome}
          onSignIn={handleSignIn}
          onSwitchToSignUp={handleSwitchAuthFlow}
          onChangeRole={handleChangeRole}
        />
      </>
    );
  }

  // Sign up screen
  if (currentView === "signup" && selectedRole) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <SignUpScreen
          role={selectedRole}
          onBack={handleBackToWelcome}
          onSignUp={handleSignUp}
          onSwitchToSignIn={handleSwitchAuthFlow}
          onChangeRole={handleChangeRole}
        />
      </>
    );
  }

  // Client onboarding
  if (currentView === "onboarding-client" && tempUserData) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <ClientOnboarding
          userName={tempUserData.name}
          onComplete={handleClientOnboardingComplete}
        />
      </>
    );
  }

  // Detailer onboarding
  if (currentView === "onboarding-detailer" && tempUserData) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <DetailerOnboarding
          userName={tempUserData.name}
          userId={tempUserData.userId}
          onComplete={handleDetailerOnboardingComplete}
        />
      </>
    );
  }

  // Main app (after authentication)
  if (!currentUser) {
    // Shouldn't reach here, but redirect to welcome if no user
    setCurrentView("welcome");
    return null;
  }

  // Views that should NOT have the web layout (full screen views)
  const fullScreenViews = [
    "job-status",
    "detailer-profile", 
    "request-quote",
    "pro-public-profile",
    "pro-lead-inbox",
    "orders-queue"
  ];

  const shouldUseWebLayout = !fullScreenViews.includes(currentView);

  // Determine if we should show profile sidebar (only for clients in marketplace/home)
  const shouldShowProfileSidebar = currentUser.role === "client" && 
    (currentView === "marketplace" || currentView === "home");

  const mainContent = (
    <>
      {/* Marketplace (Client Home) */}
      {currentView === "marketplace" &&
        currentUser.role === "client" && (
          <>
            <MarketplaceSearchEnhanced
              detailers={displayDetailers}
              onSelectDetailer={(detailer) => {
                setSelectedDetailerId(detailer.id);
                setCurrentView("detailer-profile");
              }}
              onRequestQuote={(detailer) => {
                setSelectedDetailerId(detailer.id);
                if (currentUser.role === "client") {
                  setOrderModalOpen(true);
                } else {
                  setCurrentView("request-quote");
                }
              }}
            />
            <DebugDataSource 
              detailersCount={displayDetailers.length}
              isFromSupabase={detailers.length > 0}
            />
          </>
        )}

      {/* Dashboard (Detailer Home) */}
      {currentView === "dashboard" &&
        currentUser.role === "detailer" && (
          <DetailerDashboardEnhanced
            detailer={currentUser as Detailer}
            leads={mockLeads}
            bookings={mockBookings}
            onAcceptLead={handleAcceptLead}
            onDeclineLead={handleDeclineLead}
            onUpgradeToPro={handleUpgradeToPro}
            onViewBooking={handleViewBooking}
            onCreditsAdded={handleAddCredits}
            onNavigateToDemo={() =>
              setCurrentView("status-demo")
            }
          />
        )}

      {/* PRO Dashboard (New Brand Growth Features) */}
      {currentView === "pro-dashboard" &&
        currentUser.role === "detailer" && (
          <ProDashboard onNavigate={handleProNavigate} />
        )}

      {/* PRO Public Profile (Preview for detailer) */}
      {currentView === "pro-public-profile" && (
          <div className="h-full flex flex-col min-h-0">
            <ProPublicProfile onNavigate={handleProNavigate} />
          </div>
        )}

      {/* PRO Lead Inbox */}
      {currentView === "pro-lead-inbox" &&
        currentUser.role === "detailer" && (
          <div className="h-full overflow-hidden">
            <ProLeadInbox />
          </div>
        )}

      {/* Status Demo (Detailer Only) */}
      {currentView === "status-demo" && (
        <RoleGuard
          allowedRole="detailer"
          currentRole={
            currentUser.role === "detailer"
              ? "detailer"
              : "client"
          }
          onRedirect={() =>
            setCurrentView(
              currentUser.role === "detailer"
                ? "dashboard"
                : "marketplace",
            )
          }
        >
          <StatusDemoPage
            onBack={() => setCurrentView("dashboard")}
          />
        </RoleGuard>
      )}

      {/* Messages */}
      {currentView === "messages" && (
        <div className="h-full overflow-hidden">
          <MessagesPageIntegrated
            userId={currentUser.id}
            userRole={currentUser.role}
            dealerIdToOpen={dealerIdToOpen}
            onViewingConversation={setViewingConversationId}
            onMarkAsRead={markAsRead}
          />
        </div>
      )}

      {/* Bookings */}
      {currentView === "bookings" && (
        <div className="h-full overflow-y-auto">
          {currentUser.role === "client" ? (
            <BookingsPageIntegrated
              clientId={currentUser.id}
              onNavigateToMessages={({ dealerId }) => {
                setDealerIdToOpen(dealerId);
                setCurrentView("messages");
                toast.info("Opening conversation...");
              }}
              onViewStatus={handleViewStatus}
              onRequestQuote={() => setCurrentView("marketplace")}
            />
          ) : (
            <div className="max-w-4xl mx-auto p-6">
              <DealerOrdersQueue dealerId={currentUser.id} onNavigate={(v) => setCurrentView(v as View)} />
            </div>
          )}
        </div>
      )}

      {/* Job Status */}
      {currentView === "job-status" && selectedBookingId && (
        <div className="h-full overflow-hidden">
          {currentUser.role === "client" ? (
            <ClientJobStatusPage
              bookingId={selectedBookingId}
              onBack={handleBackFromStatus}
              onNavigateToMessages={() => {
                setDealerIdToOpen(undefined);
                setCurrentView("messages");
                toast.info("Opening conversation...");
              }}
            />
          ) : (
            <DetailerJobStatusPage
              bookingId={selectedBookingId}
              onBack={handleBackFromStatus}
              onNavigateToMessages={() => {
                setCurrentView("messages");
                toast.info("Opening conversation...");
              }}
            />
          )}
        </div>
      )}

      {/* Status Center */}
      {currentView === "status" && (
        <div className="h-full overflow-hidden">
          <StatusCenter
            role={currentUser.role}
            userId={currentUser.id}
            onNavigateToMessages={(params) => {
              setDealerIdToOpen(params?.dealerId ?? null);
              setCurrentView("messages");
              toast.info("Opening conversation...");
            }}
          />
        </div>
      )}

      {/* Profile */}
      {currentView === "profile" && (
        <div className="h-full overflow-hidden">
          <ProfileRoleAware role={currentUser.role} onNavigate={handleProNavigate} />
        </div>
      )}

      {/* Quotes Page */}
      {currentView === "quotes" && (
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Quotes</h1>
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No quotes yet</p>
              <p className="text-sm text-gray-400">Your quote requests will appear here</p>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Page */}
      {currentView === "alerts" && (
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Elev Alerts</h1>
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No alerts</p>
              <p className="text-sm text-gray-400">Important notifications will appear here</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Page */}
      {currentView === "settings" && (
        <div className="h-full overflow-auto">
          {currentUser.role === "detailer" ? (
            <DealerSettings
              onNavigate={(v) => setCurrentView(v as View)}
              initialTab={proNavParams?.tab}
            />
          ) : (
            <ClientSettings />
          )}
        </div>
      )}

      {/* Detailer Profile (Public - Enhanced) */}
      {currentView === "detailer-profile" && selectedDetailerId && (
        <DetailerProfileEnhancedPublic
          detailer={displayDetailers.find(d => d.id === selectedDetailerId) || displayDetailers[0]}
          onBack={() => setCurrentView("marketplace")}
          onRequestQuote={() => {
            if (currentUser.role === "client") {
              setOrderModalOpen(true);
            } else {
              setCurrentView("request-quote");
              toast.info("Request a quote from this detailer");
            }
          }}
          onMessage={() => {
            setDealerIdToOpen(selectedDetailerId);
            setCurrentView("messages");
            toast.info("Opening conversation...");
          }}
        />
      )}

      {/* Order Placement Modal (Client) */}
      {currentUser.role === "client" && selectedDetailerId && (
        <OrderPlacementModal
          open={orderModalOpen}
          onOpenChange={setOrderModalOpen}
          detailer={displayDetailers.find(d => d.id === selectedDetailerId) || displayDetailers[0]}
          clientId={currentUser.id}
          onSuccess={() => {
            toast.success("Order placed successfully!");
            setCurrentView("my-orders");
          }}
          onError={(msg) => toast.error(msg)}
        />
      )}

      {/* Request Quote Form (legacy / non-order flow) */}
      {currentView === "request-quote" && selectedDetailerId && currentUser.role === "client" && (
        <BookingRequestForm
          detailer={displayDetailers.find(d => d.id === selectedDetailerId) || displayDetailers[0]}
          onBack={() => setCurrentView("marketplace")}
          onSubmit={(data) => {
            console.log("Quote request submitted:", data);
            toast.success("Quote request sent!");
            setCurrentView("bookings");
          }}
        />
      )}

      {/* My Orders (Client) */}
      {currentView === "my-orders" && currentUser.role === "client" && (
        <ClientOrdersPage clientId={currentUser.id} />
      )}

      {/* Orders Queue (Dealer) */}
      {currentView === "orders-queue" && currentUser.role === "detailer" && (
        <div className="h-full overflow-auto">
          <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setCurrentView("pro-dashboard")}>
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back
            </Button>
          </div>
          <div className="p-6">
            <DealerOrdersQueue dealerId={currentUser.id} onNavigate={(v) => setCurrentView(v as View)} />
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <Toaster position="top-center" richColors />
      
      {shouldUseWebLayout ? (
        <WebLayout
          currentView={currentView}
          onNavigate={handleNavigate}
          userName={currentUser.name}
          businessName={currentUser.role === 'detailer' ? (currentUser as Detailer).businessName : undefined}
          userEmail={currentUser.email}
          userPhone={currentUser.phone}
          userRole={currentUser.role}
          clientId={currentUser.role === 'client' ? currentUser.id : undefined}
          dealerLogoUrl={currentUser.role === 'detailer' ? dealerProfile?.logo_url : undefined}
          vehicles={currentUser.role === 'client' ? (currentUser as Customer).vehicles ?? [] : []}
          showProfileSidebar={shouldShowProfileSidebar}
          onLogout={handleLogout}
          unreadMessages={unreadCount}
        >
          {mainContent}
        </WebLayout>
      ) : (
        <div className="h-screen w-full bg-white relative">
          {mainContent}
        </div>
      )}
    </>
  );
}