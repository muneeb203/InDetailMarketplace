import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar, Clock, DollarSign, MapPin, MessageSquare, X, Car, User, Phone, Mail, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Booking {
  id: string;
  serviceType: string;
  detailerName: string;
  detailerAvatar: string;
  vehicleName: string;
  date: string;
  time: string;
  price: number;
  status: 'requested' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  location: string;
  detailerPhone: string;
  detailerEmail: string;
  serviceDetails: string[];
  estimatedDuration: string;
}

const mockBookings: Booking[] = [
  {
    id: '1',
    serviceType: 'Premium Exterior + Interior Detail',
    detailerName: 'Mike Johnson',
    detailerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    vehicleName: '2022 Tesla Model 3',
    date: '2025-10-25',
    time: '10:00 AM',
    price: 189,
    status: 'accepted',
    location: '123 Main St, San Francisco, CA',
    detailerPhone: '(555) 123-4567',
    detailerEmail: 'mike@detailpro.com',
    serviceDetails: ['Exterior Wash', 'Interior Deep Clean', 'Wax & Polish', 'Tire Shine'],
    estimatedDuration: '3-4 hours',
  },
  {
    id: '2',
    serviceType: 'Ceramic Coating Application',
    detailerName: 'Sarah Martinez',
    detailerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    vehicleName: '2021 BMW M3',
    date: '2025-10-22',
    time: '2:00 PM',
    price: 599,
    status: 'in-progress',
    location: '456 Oak Ave, San Francisco, CA',
    detailerPhone: '(555) 987-6543',
    detailerEmail: 'sarah@elitedetail.com',
    serviceDetails: ['Paint Correction', 'Ceramic Coating', 'Headlight Restoration'],
    estimatedDuration: '6-8 hours',
  },
  {
    id: '3',
    serviceType: 'Basic Exterior Wash',
    detailerName: 'David Chen',
    detailerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    vehicleName: '2020 Honda Civic',
    date: '2025-10-15',
    time: '9:00 AM',
    price: 79,
    status: 'completed',
    location: '789 Elm St, San Francisco, CA',
    detailerPhone: '(555) 456-7890',
    detailerEmail: 'david@shinedetail.com',
    serviceDetails: ['Exterior Wash', 'Tire Shine', 'Window Cleaning'],
    estimatedDuration: '1-2 hours',
  },
  {
    id: '4',
    serviceType: 'Engine Bay Deep Clean',
    detailerName: 'Jessica Lee',
    detailerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
    vehicleName: '2023 Porsche 911',
    date: '2025-10-28',
    time: '11:00 AM',
    price: 149,
    status: 'requested',
    location: '321 Pine St, San Francisco, CA',
    detailerPhone: '(555) 234-5678',
    detailerEmail: 'jessica@premiumdetail.com',
    serviceDetails: ['Engine Bay Clean', 'Degreasing', 'Protective Coating'],
    estimatedDuration: '2-3 hours',
  },
];

const statusConfig = {
  requested: {
    label: 'Requested',
    color: 'bg-blue-100 text-[#0078FF] border-blue-200',
    dotColor: 'bg-[#0078FF]',
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-green-100 text-green-700 border-green-200',
    dotColor: 'bg-green-500',
  },
  'in-progress': {
    label: 'In Progress',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    dotColor: 'bg-yellow-500',
  },
  completed: {
    label: 'Completed',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    dotColor: 'bg-gray-500',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700 border-red-200',
    dotColor: 'bg-red-500',
  },
};

export function BookingsPage({ onNavigateToMessages }: { onNavigateToMessages?: (detailerId: string) => void }) {
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState(mockBookings);

  const handleCancelBooking = (bookingId: string) => {
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
    ));
    setBookingToCancel(null);
    setSelectedBooking(null);
  };

  const filterBookings = (status: string) => {
    if (status === 'upcoming') {
      return bookings.filter(b => ['requested', 'accepted', 'in-progress'].includes(b.status));
    } else if (status === 'completed') {
      return bookings.filter(b => b.status === 'completed');
    } else if (status === 'cancelled') {
      return bookings.filter(b => b.status === 'cancelled');
    }
    return bookings;
  };

  const filteredBookings = filterBookings(selectedTab);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF5FF] to-white pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl">My Bookings</h1>
            <div className="w-10 h-10 bg-gradient-to-br from-[#0078FF] to-[#0056CC] rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-white rounded-2xl p-1 shadow-sm">
            <TabsTrigger value="upcoming" className="rounded-xl data-[state=active]:bg-[#0078FF] data-[state=active]:text-white">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-xl data-[state=active]:bg-[#0078FF] data-[state=active]:text-white">
              Completed
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="rounded-xl data-[state=active]:bg-[#0078FF] data-[state=active]:text-white">
              Cancelled
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Bookings List */}
        <AnimatePresence mode="wait">
          {filteredBookings.length > 0 ? (
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {filteredBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-5 hover:shadow-lg transition-all duration-300 border-2 hover:border-[#0078FF]/20 cursor-pointer">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${statusConfig[booking.status].color} border px-3 py-1`}>
                              <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${statusConfig[booking.status].dotColor} animate-pulse`} />
                                {statusConfig[booking.status].label}
                              </div>
                            </Badge>
                          </div>
                          <h3 className="mb-1">{booking.serviceType}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Car className="w-4 h-4" />
                            {booking.vehicleName}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl text-[#0078FF]">${booking.price}</p>
                        </div>
                      </div>

                      {/* Detailer Info */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <img
                          src={booking.detailerAvatar}
                          alt={booking.detailerName}
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                        />
                        <div className="flex-1">
                          <p className="text-sm">Detailer</p>
                          <p className="text-sm text-gray-900">{booking.detailerName}</p>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="w-4 h-4 text-[#0078FF]" />
                          {new Date(booking.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Clock className="w-4 h-4 text-[#0078FF]" />
                          {booking.time}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => setSelectedBooking(booking)}
                          variant="outline"
                          className="flex-1 h-10 border-[#0078FF] text-[#0078FF] hover:bg-[#0078FF] hover:text-white"
                        >
                          View Details
                        </Button>
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <Button
                            onClick={() => onNavigateToMessages?.(booking.id)}
                            variant="outline"
                            className="flex-1 h-10"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="mb-2">No {selectedTab} bookings</h3>
              <p className="text-gray-600 mb-6">
                {selectedTab === 'upcoming' 
                  ? "No bookings yet. Try requesting your first detail!"
                  : `You don't have any ${selectedTab} bookings.`
                }
              </p>
              {selectedTab === 'upcoming' && (
                <Button className="bg-[#0078FF] hover:bg-[#0056CC] text-white">
                  Request Quote
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Booking Details Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-md">
          {selectedBooking && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-xl">Booking Details</DialogTitle>
                <DialogDescription className="sr-only">
                  View detailed information about this booking including status, service info, and contact details
                </DialogDescription>
              </DialogHeader>

              {/* Status Badge */}
              <div className="flex justify-center">
                <Badge className={`${statusConfig[selectedBooking.status].color} border px-4 py-2`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${statusConfig[selectedBooking.status].dotColor} animate-pulse`} />
                    {statusConfig[selectedBooking.status].label}
                  </div>
                </Badge>
              </div>

              {/* Service Info */}
              <div className="space-y-3">
                <h3 className="text-lg">{selectedBooking.serviceType}</h3>
                <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="w-4 h-4 text-[#0078FF]" />
                    <span className="text-gray-700">{selectedBooking.vehicleName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-[#0078FF]" />
                    <span className="text-gray-700">{selectedBooking.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-[#0078FF]" />
                    <span className="text-gray-700">
                      {new Date(selectedBooking.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-[#0078FF]" />
                    <span className="text-gray-700">{selectedBooking.time} • {selectedBooking.estimatedDuration}</span>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <p className="text-sm mb-2">Services Included:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBooking.serviceDetails.map((service, idx) => (
                    <Badge key={idx} variant="outline" className="bg-blue-50 text-[#0078FF] border-blue-200">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Detailer Info */}
              <div className="p-4 bg-gradient-to-br from-[#0078FF]/5 to-blue-50 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedBooking.detailerAvatar}
                    alt={selectedBooking.detailerName}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                  />
                  <div>
                    <p className="text-xs text-gray-600">Your Detailer</p>
                    <p className="text-sm">{selectedBooking.detailerName}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="w-4 h-4 text-[#0078FF]" />
                    {selectedBooking.detailerPhone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Mail className="w-4 h-4 text-[#0078FF]" />
                    {selectedBooking.detailerEmail}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm">Total Price</span>
                <span className="text-2xl text-[#0078FF]">${selectedBooking.price}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
                  <>
                    <Button
                      onClick={() => onNavigateToMessages?.(selectedBooking.id)}
                      className="flex-1 bg-[#0078FF] hover:bg-[#0056CC] text-white"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message Detailer
                    </Button>
                    <Button
                      onClick={() => {
                        setBookingToCancel(selectedBooking);
                      }}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Cancel Booking
                    </Button>
                  </>
                )}
                {selectedBooking.status === 'completed' && (
                  <Button className="flex-1 bg-[#0078FF] hover:bg-[#0056CC] text-white">
                    Book Again
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!bookingToCancel} onOpenChange={() => setBookingToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone and you may be charged a cancellation fee.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bookingToCancel && handleCancelBooking(bookingToCancel.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
