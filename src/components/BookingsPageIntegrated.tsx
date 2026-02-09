import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar, Clock, DollarSign, MapPin, MessageSquare, Car, User, Phone, Mail, Sparkles } from 'lucide-react';
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

export function BookingsPageIntegrated({ 
  onNavigateToMessages,
  onViewStatus 
}: { 
  onNavigateToMessages?: (detailerId: string) => void;
  onViewStatus?: (bookingId: string) => void;
}) {
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
    <div className="h-full flex flex-col bg-gradient-to-b from-[#EAF5FF] to-white overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl">Bookings</h1>
            <div className="w-8 h-8 bg-gradient-to-br from-[#0078FF] to-[#0056CC] rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Track requests and appointments from first quote to a flawless finish.
          </p>
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 space-y-4">
          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3 h-10 bg-white rounded-xl p-1 shadow-sm">
              <TabsTrigger value="upcoming" className="rounded-lg text-xs data-[state=active]:bg-[#0078FF] data-[state=active]:text-white">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="completed" className="rounded-lg text-xs data-[state=active]:bg-[#0078FF] data-[state=active]:text-white">
                Completed
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="rounded-lg text-xs data-[state=active]:bg-[#0078FF] data-[state=active]:text-white">
                Cancelled
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Bookings List */}
          <AnimatePresence mode="wait">
            {filteredBookings.length > 0 ? (
              <motion.div
                key={selectedTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {filteredBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-4 hover:shadow-md transition-all duration-300 border hover:border-[#0078FF]/30 cursor-pointer">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <Badge className={`${statusConfig[booking.status].color} border px-2 py-0.5 mb-2 text-xs`}>
                              <div className="flex items-center gap-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${statusConfig[booking.status].dotColor} animate-pulse`} />
                                {statusConfig[booking.status].label}
                              </div>
                            </Badge>
                            <h3 className="text-sm mb-1 truncate">{booking.serviceType}</h3>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Car className="w-3 h-3" />
                              {booking.vehicleName}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg text-[#0078FF]">${booking.price}</p>
                          </div>
                        </div>

                        {/* Detailer Info */}
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <img
                            src={booking.detailerAvatar}
                            alt={booking.detailerName}
                            className="w-8 h-8 rounded-full border border-white shadow-sm"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">Detailer</p>
                            <p className="text-xs truncate">{booking.detailerName}</p>
                          </div>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <Calendar className="w-3 h-3 text-[#0078FF]" />
                            {new Date(booking.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <Clock className="w-3 h-3 text-[#0078FF]" />
                            {booking.time}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-1">
                          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                            <Button
                              onClick={() => onViewStatus?.(booking.id)}
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 text-xs border-[#0078FF] text-[#0078FF] hover:bg-[#0078FF] hover:text-white"
                            >
                              View Status
                            </Button>
                          )}
                          <Button
                            onClick={() => setSelectedBooking(booking)}
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs"
                          >
                            Details
                          </Button>
                          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                            <Button
                              onClick={() => onNavigateToMessages?.(booking.id)}
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 text-xs"
                            >
                              <MessageSquare className="w-3 h-3 mr-1" />
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-sm mb-1">No {selectedTab} bookings</h3>
                <p className="text-xs text-gray-600 mb-4">
                  {selectedTab === 'upcoming' 
                    ? "No bookings yet. Try requesting your first detail!"
                    : `You don't have any ${selectedTab} bookings.`
                  }
                </p>
                {selectedTab === 'upcoming' && (
                  <Button size="sm" className="bg-[#0078FF] hover:bg-[#0056CC] text-white h-8 text-xs">
                    Request Quote
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Booking Details Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
          {selectedBooking && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-lg">Booking Details</DialogTitle>
                <DialogDescription className="sr-only">
                  View detailed information about this booking
                </DialogDescription>
              </DialogHeader>

              {/* Status Badge */}
              <div className="flex justify-center">
                <Badge className={`${statusConfig[selectedBooking.status].color} border px-3 py-1.5 text-xs`}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${statusConfig[selectedBooking.status].dotColor} animate-pulse`} />
                    {statusConfig[selectedBooking.status].label}
                  </div>
                </Badge>
              </div>

              {/* Service Info */}
              <div className="space-y-2">
                <h3 className="text-sm">{selectedBooking.serviceType}</h3>
                <div className="p-3 bg-gray-50 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Car className="w-3 h-3 text-[#0078FF]" />
                    <span className="text-gray-700">{selectedBooking.vehicleName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-[#0078FF]" />
                    <span className="text-gray-700">{selectedBooking.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-[#0078FF]" />
                    <span className="text-gray-700">
                      {new Date(selectedBooking.date).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-[#0078FF]" />
                    <span className="text-gray-700">{selectedBooking.time} • {selectedBooking.estimatedDuration}</span>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <p className="text-xs mb-2">Services Included:</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedBooking.serviceDetails.map((service, idx) => (
                    <Badge key={idx} variant="outline" className="bg-blue-50 text-[#0078FF] border-blue-200 text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Detailer Info */}
              <div className="p-3 bg-gradient-to-br from-[#0078FF]/5 to-blue-50 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <img
                    src={selectedBooking.detailerAvatar}
                    alt={selectedBooking.detailerName}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                  />
                  <div>
                    <p className="text-xs text-gray-600">Your Detailer</p>
                    <p className="text-sm">{selectedBooking.detailerName}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-3 h-3 text-[#0078FF]" />
                    {selectedBooking.detailerPhone}
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-3 h-3 text-[#0078FF]" />
                    {selectedBooking.detailerEmail}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-xs">Total Price</span>
                <span className="text-xl text-[#0078FF]">${selectedBooking.price}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
                  <>
                    <Button
                      onClick={() => onNavigateToMessages?.(selectedBooking.id)}
                      size="sm"
                      className="flex-1 bg-[#0078FF] hover:bg-[#0056CC] text-white h-9 text-xs"
                    >
                      <MessageSquare className="w-3 h-3 mr-1.5" />
                      Message Detailer
                    </Button>
                    <Button
                      onClick={() => {
                        setBookingToCancel(selectedBooking);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-600 hover:bg-red-50 h-9 text-xs"
                    >
                      Cancel
                    </Button>
                  </>
                )}
                {selectedBooking.status === 'completed' && (
                  <Button size="sm" className="flex-1 bg-[#0078FF] hover:bg-[#0056CC] text-white h-9 text-xs">
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
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to cancel this booking? This action cannot be undone and you may be charged a cancellation fee.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bookingToCancel && handleCancelBooking(bookingToCancel.id)}
              className="bg-red-600 hover:bg-red-700 text-xs"
            >
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
