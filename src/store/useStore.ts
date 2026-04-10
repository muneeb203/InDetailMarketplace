import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Customer, Detailer, ServiceRequest, Booking, Message, Lead } from '../types';

interface AppState {
  // User
  currentUser: Customer | Detailer | null;
  setCurrentUser: (user: Customer | Detailer | null) => void;

  // Location
  userLocation: { latitude: number; longitude: number } | null;
  setUserLocation: (location: { latitude: number; longitude: number } | null) => void;

  // Data
  detailers: Detailer[];
  serviceRequests: ServiceRequest[];
  bookings: Booking[];
  messages: Message[];
  leads: Lead[];

  setDetailers: (detailers: Detailer[]) => void;
  setServiceRequests: (requests: ServiceRequest[]) => void;
  setBookings: (bookings: Booking[]) => void;
  setMessages: (messages: Message[]) => void;
  setLeads: (leads: Lead[]) => void;

  // Actions
  addServiceRequest: (request: ServiceRequest) => void;
  addBooking: (booking: Booking) => void;
  addMessage: (message: Message) => void;
  addLead: (lead: Lead) => void;
  updateLead: (leadId: string, updates: Partial<Lead>) => void;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  updateDetailer: (detailerId: string, updates: Partial<Detailer>) => void;

  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      currentUser: null,
      userLocation: null,
      detailers: [],
      serviceRequests: [],
      bookings: [],
      messages: [],
      leads: [],
      isLoading: false,

      // Setters
      setCurrentUser: (user) => set({ currentUser: user }),
      setUserLocation: (location) => set({ userLocation: location }),
      setDetailers: (detailers) => set({ detailers }),
      setServiceRequests: (requests) => set({ serviceRequests: requests }),
      setBookings: (bookings) => set({ bookings }),
      setMessages: (messages) => set({ messages }),
      setLeads: (leads) => set({ leads }),
      setIsLoading: (loading) => set({ isLoading: loading }),

      // Actions
      addServiceRequest: (request) =>
        set((state) => ({
          serviceRequests: [...state.serviceRequests, request],
        })),

      addBooking: (booking) =>
        set((state) => ({
          bookings: [...state.bookings, booking],
        })),

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      addLead: (lead) =>
        set((state) => ({
          leads: [...state.leads, lead],
        })),

      updateLead: (leadId, updates) =>
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === leadId ? { ...lead, ...updates } : lead
          ),
        })),

      updateBooking: (bookingId, updates) =>
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === bookingId ? { ...booking, ...updates } : booking
          ),
        })),

      updateDetailer: (detailerId, updates) =>
        set((state) => ({
          detailers: state.detailers.map((detailer) =>
            detailer.id === detailerId ? { ...detailer, ...updates } : detailer
          ),
          currentUser:
            state.currentUser?.id === detailerId && state.currentUser.role === 'detailer'
              ? { ...state.currentUser, ...updates }
              : state.currentUser,
        })),
    }),
    {
      name: 'indetail-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        // Don't persist other data for demo purposes
      }),
    }
  )
);
