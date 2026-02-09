import { useEffect, useState } from 'react';
import { OnboardingFlowEnhanced } from './components/OnboardingFlowEnhanced';
import { OnboardingFlowV2 } from './components/OnboardingFlowV2';
import { MarketplaceSearchEnhanced } from './components/MarketplaceSearchEnhanced';
import { MarketplaceV2 } from './components/MarketplaceV2';
import { DetailerProfile } from './components/DetailerProfile';
import { BookingRequestForm } from './components/BookingRequestForm';
import { MessagingInterfaceEnhanced } from './components/MessagingInterfaceEnhanced';
import { DetailerDashboardEnhanced } from './components/DetailerDashboardEnhanced';
import { CustomerDashboard } from './components/CustomerDashboard';
import { ServiceStatusTracker } from './components/ServiceStatusTracker';
import { BottomNavigation } from './components/BottomNavigation';
import { ProfileVehicleDemo } from './components/ProfileVehicleDemo';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { useStore } from './store/useStore';
import { Customer, Detailer, ServiceRequest, Booking, Message, Lead } from './types';
import { mockDetailers, mockBookings, mockMessages, mockLeads } from './data/mockData';
import { getLeadCost } from './services/stripeService';
import { simulateDetailerResponse } from './services/messagingService';

type View =
  | 'onboarding'
  | 'home'
  | 'marketplace'
  | 'detailer-profile'
  | 'booking-form'
  | 'messages'
  | 'message-thread'
  | 'bookings'
  | 'booking-detail'
  | 'profile'
  | 'profile-demo';

export default function AppEnhanced() {
  const {
    currentUser,
    setCurrentUser,
    detailers,
    setDetailers,
    bookings,
    setBookings,
    messages,
    setMessages,
    leads,
    setLeads,
    addBooking,
    addMessage,
    addLead,
    updateLead,
    updateBooking,
    updateDetailer,
  } = useStore();

  const [currentView, setCurrentView] = useState<View>('profile-demo');
  const [selectedDetailer, setSelectedDetailer] = useState<Detailer | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Initialize data
  useEffect(() => {
    setDetailers(mockDetailers);
    setBookings(mockBookings);
    setMessages(mockMessages);
    setLeads(mockLeads);
  }, [setDetailers, setBookings, setMessages, setLeads]);

  // Restore user session
  useEffect(() => {
    if (currentUser) {
      setCurrentView('home');
    }
  }, [currentUser]);

  const handleOnboardingComplete = (user: Customer | Detailer) => {
    setCurrentUser(user);
    setCurrentView('home');
    toast.success(`Welcome to InDetail, ${user.name}!`, {
      description: 'Your account is ready to use.',
    });
  };

  const handleNavigate = (view: string) => {
    switch (view) {
      case 'home':
        setCurrentView('home');
        break;
      case 'messages':
        setCurrentView('messages');
        break;
      case 'bookings':
        setCurrentView('bookings');
        break;
      case 'profile':
        setCurrentView('profile');
        break;
    }
  };

  const handleSelectDetailer = (detailer: Detailer) => {
    setSelectedDetailer(detailer);
    setCurrentView('detailer-profile');
  };

  const handleRequestQuote = (detailer: Detailer) => {
    setSelectedDetailer(detailer);
    setCurrentView('booking-form');
  };

  const handleSubmitRequest = (request: Partial<ServiceRequest>) => {
    if (!currentUser) return;

    const newRequest: ServiceRequest = {
      id: `r${Date.now()}`,
      customerId: currentUser.id,
      vehicleType: request.vehicleType!,
      services: request.services!,
      preferredDate: request.preferredDate!,
      preferredTime: request.preferredTime!,
      location: request.location!,
      notes: request.notes || '',
      status: 'pending',
      createdAt: new Date(),
      detailerId: selectedDetailer?.id,
      price: 150 + (request.services?.length || 0) * 30,
    };

    if (selectedDetailer) {
      const newLead: Lead = {
        id: `l${Date.now()}`,
        requestId: newRequest.id,
        detailerId: selectedDetailer.id,
        customerId: currentUser.id,
        status: 'pending',
        cost: getLeadCost(selectedDetailer.isPro, false),
        sentAt: new Date(),
      };
      addLead(newLead);

      // Simulate detailer auto-response after a delay
      setTimeout(() => {
        const autoResponse = simulateDetailerResponse(
          currentUser.id,
          selectedDetailer.id,
          newRequest.id
        );
        addMessage(autoResponse);
      }, 3000);
    }

    setCurrentView('home');
    toast.success('Request sent!', {
      description: "You'll be notified when the detailer responds.",
    });
  };

  const handleAcceptLead = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || !currentUser || currentUser.role !== 'detailer') return;

    const detailer = currentUser as Detailer;

    if (detailer.wallet < lead.cost) {
      toast.error('Insufficient balance', {
        description: 'Please add credits to accept leads.',
      });
      return;
    }

    updateLead(leadId, { status: 'accepted' });
    updateDetailer(detailer.id, {
      wallet: detailer.wallet - lead.cost,
    });

    const newBooking: Booking = {
      id: `b${Date.now()}`,
      requestId: lead.requestId,
      customerId: lead.customerId,
      detailerId: detailer.id,
      services: ['Full Detail'],
      vehicleType: 'Sedan',
      location: 'Customer Location',
      scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      scheduledTime: '10:00 AM',
      price: 180,
      status: 'confirmed',
      createdAt: new Date(),
    };
    addBooking(newBooking);

    toast.success(`Lead accepted!`, {
      description: `$${lead.cost.toFixed(2)} deducted from wallet.`,
    });
  };

  const handleDeclineLead = (leadId: string) => {
    updateLead(leadId, { status: 'declined' });
    toast.info('Lead declined');
  };

  const handleUpgradeToPro = () => {
    if (!currentUser || currentUser.role !== 'detailer') return;

    updateDetailer(currentUser.id, { isPro: true });
    toast.success('Upgraded to Pro!', {
      description: 'You now get priority placement and cheaper leads.',
    });
  };

  const handleSendMessage = (text: string) => {
    if (!currentUser || !selectedDetailer) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: currentUser.id,
      receiverId: selectedDetailer.id,
      requestId: 'general',
      text,
      timestamp: new Date(),
      read: false,
    };

    addMessage(newMessage);

    // Simulate read receipt after a delay
    setTimeout(() => {
      const updatedMessages = messages.map((m) =>
        m.id === newMessage.id ? { ...m, read: true } : m
      );
      setMessages(updatedMessages);
    }, 2000);
  };

  const handleMessageDetailer = () => {
    setCurrentView('message-thread');
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setCurrentView('booking-detail');
  };

  const handleBookAgain = (booking: Booking) => {
    const detailer = detailers.find((d) => d.id === booking.detailerId);
    if (detailer) {
      handleRequestQuote(detailer);
    }
  };

  const handleLeaveReview = (booking: Booking) => {
    toast.success('Leave Review - Feature coming soon!');
  };

  const handleUpdateBookingStatus = (status: Booking['status']) => {
    if (!selectedBooking) return;

    updateBooking(selectedBooking.id, { status });
    setSelectedBooking({ ...selectedBooking, status });

    toast.success('Status updated successfully');
  };

  const handleCreditsAdded = (credits: number) => {
    if (!currentUser || currentUser.role !== 'detailer') return;

    const detailer = currentUser as Detailer;
    const leadCost = getLeadCost(detailer.isPro, false);
    const amount = credits * leadCost;

    updateDetailer(detailer.id, {
      wallet: detailer.wallet + amount,
    });
  };

  const getUserBookings = () => {
    if (!currentUser) return [];
    return bookings.filter((b) =>
      currentUser.role === 'customer'
        ? b.customerId === currentUser.id
        : b.detailerId === currentUser.id
    );
  };

  const getUserLeads = () => {
    if (!currentUser || currentUser.role !== 'detailer') return [];
    return leads.filter((l) => l.detailerId === currentUser.id);
  };

  const getUserMessages = () => {
    if (!currentUser || !selectedDetailer) return [];
    return messages.filter(
      (m) =>
        (m.senderId === currentUser.id && m.receiverId === selectedDetailer.id) ||
        (m.senderId === selectedDetailer.id && m.receiverId === currentUser.id)
    );
  };

  if (currentView === 'profile-demo') {
    return (
      <>
        <Toaster position="top-center" richColors />
        <ProfileVehicleDemo />
      </>
    );
  }

  if (currentView === 'onboarding') {
    // Use OnboardingFlowV2 for the enhanced experience with service radius, branding, etc.
    return <OnboardingFlowV2 onComplete={handleOnboardingComplete} />;
  }

  if (!currentUser) {
    return <OnboardingFlowEnhanced onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="h-screen max-w-md mx-auto bg-white relative overflow-hidden">
      <Toaster position="top-center" richColors />

      {currentView === 'home' && (
        <>
          {currentUser.role === 'customer' ? (
            <MarketplaceV2
              detailers={detailers}
              onSelectDetailer={handleSelectDetailer}
              onRequestQuote={handleRequestQuote}
            />
          ) : (
            <DetailerDashboardEnhanced
              detailer={currentUser as Detailer}
              leads={getUserLeads()}
              bookings={getUserBookings()}
              onAcceptLead={handleAcceptLead}
              onDeclineLead={handleDeclineLead}
              onUpgradeToPro={handleUpgradeToPro}
              onViewBooking={handleViewBooking}
              onCreditsAdded={handleCreditsAdded}
            />
          )}
          <BottomNavigation currentView="home" onNavigate={handleNavigate} />
        </>
      )}

      {currentView === 'detailer-profile' && selectedDetailer && (
        <DetailerProfile
          detailer={selectedDetailer}
          onBack={() => setCurrentView('home')}
          onRequestQuote={() => handleRequestQuote(selectedDetailer)}
          onMessage={handleMessageDetailer}
        />
      )}

      {currentView === 'booking-form' && (
        <BookingRequestForm
          detailer={selectedDetailer || undefined}
          onBack={() => setCurrentView(selectedDetailer ? 'detailer-profile' : 'home')}
          onSubmit={handleSubmitRequest}
        />
      )}

      {currentView === 'messages' && (
        <>
          <div className="h-full bg-gray-50 pb-16">
            <div className="bg-white border-b p-4 shadow-sm">
              <h2>Messages</h2>
            </div>
            <div className="p-4">
              {getUserBookings().length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-1">No messages yet</p>
                  <p className="text-sm text-gray-400">
                    Messages with detailers will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {getUserBookings().map((booking) => {
                    const detailer = detailers.find((d) => d.id === booking.detailerId);
                    if (!detailer) return null;

                    return (
                      <div
                        key={booking.id}
                        onClick={() => {
                          setSelectedDetailer(detailer);
                          setSelectedBooking(booking);
                          setCurrentView('message-thread');
                        }}
                        className="bg-white p-4 rounded-xl border border-gray-200 cursor-pointer hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base">{detailer.businessName}</h3>
                            <p className="text-sm text-gray-600">{booking.scheduledDate}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <BottomNavigation currentView="messages" onNavigate={handleNavigate} />
        </>
      )}

      {currentView === 'message-thread' && selectedDetailer && (
        <MessagingInterfaceEnhanced
          currentUserId={currentUser.id}
          otherUser={selectedDetailer}
          messages={getUserMessages()}
          onBack={() => setCurrentView('messages')}
          onSendMessage={handleSendMessage}
        />
      )}

      {currentView === 'bookings' && (
        <>
          {currentUser.role === 'customer' ? (
            <CustomerDashboard
              customer={currentUser as Customer}
              bookings={getUserBookings()}
              onViewBooking={handleViewBooking}
              onBookAgain={handleBookAgain}
              onLeaveReview={handleLeaveReview}
              onNewBooking={() => setCurrentView('home')}
            />
          ) : (
            <DetailerDashboardEnhanced
              detailer={currentUser as Detailer}
              leads={getUserLeads()}
              bookings={getUserBookings()}
              onAcceptLead={handleAcceptLead}
              onDeclineLead={handleDeclineLead}
              onUpgradeToPro={handleUpgradeToPro}
              onViewBooking={handleViewBooking}
              onCreditsAdded={handleCreditsAdded}
            />
          )}
          <BottomNavigation currentView="bookings" onNavigate={handleNavigate} />
        </>
      )}

      {currentView === 'booking-detail' && selectedBooking && (
        <ServiceStatusTracker
          booking={selectedBooking}
          detailer={detailers.find((d) => d.id === selectedBooking.detailerId)!}
          onBack={() => setCurrentView('bookings')}
          onMessage={() => {
            setSelectedDetailer(
              detailers.find((d) => d.id === selectedBooking.detailerId)!
            );
            setCurrentView('message-thread');
          }}
          onUpdateStatus={handleUpdateBookingStatus}
          isDetailer={currentUser.role === 'detailer'}
        />
      )}

      {currentView === 'profile' && (
        <>
          <div className="h-full bg-gray-50 pb-16">
            <div className="bg-white border-b p-4 shadow-sm">
              <h2>Profile</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="mb-4">Account Information</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Name</p>
                    <p>{currentUser.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p>{currentUser.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p>{currentUser.phone}</p>
                  </div>
                  {currentUser.role === 'detailer' && (
                    <>
                      <div>
                        <p className="text-gray-600">Business Name</p>
                        <p>{(currentUser as Detailer).businessName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Service Area</p>
                        <p>{(currentUser as Detailer).serviceArea}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <BottomNavigation currentView="profile" onNavigate={handleNavigate} />
        </>
      )}
    </div>
  );
}
