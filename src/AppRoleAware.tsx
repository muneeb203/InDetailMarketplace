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
import { ProDashboard } from "./components/detailer/ProDashboard";
import { ProProfileEditor } from "./components/detailer/ProProfileEditor";
import { ProPublicProfile } from "./components/detailer/ProPublicProfile";
import { ProLeadInbox } from "./components/detailer/ProLeadInbox";
import { DetailerProfileHome } from "./components/detailer/DetailerProfileHome";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { Customer, Detailer, Lead, Booking } from "./types";
import { mockDetailers } from "./data/mockData";
import { getLeadCost } from "./services/stripeService";

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
  | "profile"
  | "status-demo"
  | "job-status"
  | "status"
  | "request-quote"
  | "detailer-profile"
  | "pro-dashboard"
  | "pro-profile-editor"
  | "pro-public-profile"
  | "pro-lead-inbox";

type AuthFlow = "signin" | "signup";

export default function AppRoleAware() {
  const [currentView, setCurrentView] =
    useState<View>("welcome");
  const [selectedRole, setSelectedRole] = useState<
    "client" | "detailer" | null
  >(null);
  const [authFlow, setAuthFlow] = useState<AuthFlow>("signin");
  const [currentUser, setCurrentUser] = useState<
    | ((Customer | Detailer) & { role: "client" | "detailer" })
    | null
  >(null);
  const [tempUserData, setTempUserData] = useState<{
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
  const [proNavParams, setProNavParams] = useState<any>({});
  
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
  const handleSignIn = (
    email: string,
    password: string,
    role: "client" | "detailer",
  ) => {
    // Mock authentication - in production, this would call your auth service
    toast.success("Signed in successfully!");

    // Create mock user and go to onboarding
    setTempUserData({
      name: "John Doe",
      email,
      phone: "555-0123",
      role,
    });

    if (role === "client") {
      setCurrentView("onboarding-client");
    } else {
      setCurrentView("onboarding-detailer");
    }
  };

  // Handle sign up
  const handleSignUp = (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: "client" | "detailer";
  }) => {
    toast.success("Account created successfully!");

    setTempUserData({
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
    });

    if (data.role === "client") {
      setCurrentView("onboarding-client");
    } else {
      setCurrentView("onboarding-detailer");
    }
  };

  // Handle client onboarding completion
  const handleClientOnboardingComplete = (data: {
    location: string;
    vehicle?: { make: string; model: string; year: number };
    notifications: boolean;
  }) => {
    if (!tempUserData) return;

    const user: Customer & { role: "client" } = {
      id: Date.now().toString(),
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

    // Analytics anchor
    console.log("Analytics: onboarding_completed", {
      role: "client",
    });
  };

  // Handle detailer onboarding completion
  const handleDetailerOnboardingComplete = (data: {
    businessName: string;
    serviceRadius: number;
    location: string;
    specialties: string[];
    priceRange: string;
  }) => {
    if (!tempUserData) return;

    const user: Detailer & { role: "detailer" } = {
      id: Date.now().toString(),
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
      photos: [],
      services: data.specialties,
      specialties: data.specialties,
      isPro: false,
      wallet: 5, // Give 5 free credits to start
      completedJobs: 0,
      createdAt: new Date(),
    };

    setCurrentUser(user);
    setCurrentView("pro-dashboard"); // Start with Pro Dashboard instead of legacy dashboard
    toast.success(`Welcome to InDetail, ${user.name}!`, {
      description: "Your business profile is ready.",
    });

    // Analytics anchor
    console.log("Analytics: onboarding_completed", {
      role: "detailer",
    });
  };

  // Handle Pro navigation
  const handleProNavigate = (view: string, params?: any) => {
    const viewMap: Record<string, View> = {
      'pro-dashboard': 'pro-dashboard',
      'dashboard': 'pro-dashboard',
      'pro-profile-editor': 'pro-profile-editor',
      'profile-editor': 'pro-profile-editor',
      'pro-public-profile': 'pro-public-profile',
      'public-profile': 'pro-public-profile',
      'pro-lead-inbox': 'pro-lead-inbox',
      'lead-inbox': 'pro-lead-inbox',
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
      case "status":
        setCurrentView("status");
        break;
      case "profile":
        setCurrentView("profile");
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

  return (
    <div className="h-screen max-w-md mx-auto bg-white relative">
      <Toaster position="top-center" richColors />

      {/* Marketplace (Client Home) */}
      {currentView === "marketplace" &&
        currentUser.role === "client" && (
          <MarketplaceSearchEnhanced
            detailers={mockDetailers}
            onSelectDetailer={(detailer) => {
              setSelectedDetailerId(detailer.id);
              setCurrentView("detailer-profile");
            }}
            onRequestQuote={(detailer) => {
              setSelectedDetailerId(detailer.id);
              setCurrentView("request-quote");
            }}
          />
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

      {/* PRO Profile Editor */}
      {currentView === "pro-profile-editor" &&
        currentUser.role === "detailer" && (
          <div className="h-full overflow-hidden">
            <ProProfileEditor onNavigate={handleProNavigate} />
          </div>
        )}

      {/* PRO Public Profile (Preview for detailer) */}
      {currentView === "pro-public-profile" && (
          <div className="h-full overflow-hidden">
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
        <div className="h-full pb-16 overflow-hidden">
          <MessagesPageIntegrated
            onViewStatus={handleViewStatus}
          />
        </div>
      )}

      {/* Bookings */}
      {currentView === "bookings" && (
        <div className="h-full pb-16 overflow-hidden">
          <BookingsPageIntegrated
            onNavigateToMessages={(bookingId) => {
              setCurrentView("messages");
              toast.info("Opening conversation...");
            }}
            onViewStatus={handleViewStatus}
          />
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
        <div className="h-full pb-16 overflow-hidden">
          <StatusCenter
            role={currentUser.role}
            onNavigateToMessages={() => {
              setCurrentView("messages");
              toast.info("Opening conversation...");
            }}
          />
        </div>
      )}

      {/* Profile */}
      {currentView === "profile" && (
        <div className="h-full pb-16 overflow-hidden">
          <ProfileRoleAware role={currentUser.role} onNavigate={handleProNavigate} />
        </div>
      )}

      {/* Detailer Profile (Public - Enhanced) */}
      {currentView === "detailer-profile" && selectedDetailerId && (
        <DetailerProfileEnhancedPublic
          detailer={mockDetailers.find(d => d.id === selectedDetailerId) || mockDetailers[0]}
          onBack={() => setCurrentView("marketplace")}
          onRequestQuote={() => {
            setCurrentView("request-quote");
            toast.info("Request a quote from this detailer");
          }}
          onMessage={() => {
            setCurrentView("messages");
            toast.info("Opening conversation...");
          }}
        />
      )}

      {/* Request Quote Form */}
      {currentView === "request-quote" && selectedDetailerId && currentUser.role === "client" && (
        <BookingRequestForm
          detailer={mockDetailers.find(d => d.id === selectedDetailerId) || mockDetailers[0]}
          onBack={() => setCurrentView("marketplace")}
          onSubmit={(data) => {
            console.log("Quote request submitted:", data);
            toast.success("Quote request sent!");
            setCurrentView("bookings");
          }}
        />
      )}

      {/* Bottom Navigation - Hide on specific views */}
      {currentView !== "job-status" && 
       currentView !== "detailer-profile" && 
       currentView !== "request-quote" &&
       currentView !== "pro-profile-editor" &&
       currentView !== "pro-public-profile" &&
       currentView !== "pro-lead-inbox" && (
        <BottomNavigation
          currentView={
            currentView === "marketplace" ||
            currentView === "dashboard" ||
            currentView === "pro-dashboard"
              ? "home"
              : currentView === "status-demo"
                ? "status"
                : currentView
          }
          onNavigate={handleNavigate}
          userRole={currentUser.role}
        />
      )}
    </div>
  );
}