import { Customer, Booking } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar, MessageSquare, Star, Clock, CheckCircle2, Car } from 'lucide-react';

interface CustomerDashboardProps {
  customer: Customer;
  bookings: Booking[];
  onViewBooking: (booking: Booking) => void;
  onBookAgain: (booking: Booking) => void;
  onLeaveReview: (booking: Booking) => void;
  onNewBooking: () => void;
}

export function CustomerDashboard({ 
  customer, 
  bookings, 
  onViewBooking,
  onBookAgain,
  onLeaveReview,
  onNewBooking
}: CustomerDashboardProps) {
  const activeBookings = bookings.filter(b => ['confirmed', 'on-the-way', 'started'].includes(b.status));
  const completedBookings = bookings.filter(b => b.status === 'completed');

  return (
    <div className="w-full bg-gray-50">
      <div className="w-full mx-auto px-8 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
                <h2 className="text-white text-2xl mb-2">Hello, {customer.name.split(' ')[0]}!</h2>
                <p className="text-blue-100 mb-6">Ready to make your car shine?</p>
                <Button 
                  onClick={onNewBooking}
                  className="w-full bg-white text-blue-600 hover:bg-blue-50"
                >
                  Book a Detailer
                </Button>
              </div>

              {/* Vehicle Info */}
              {customer.vehicles.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-gray-600" />
                      <CardTitle className="text-base">Your Vehicle</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>
                      {customer.vehicles[0].year} {customer.vehicles[0].make} {customer.vehicles[0].model}
                    </p>
                    <p className="text-sm text-gray-600">{customer.vehicles[0].type}</p>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Active Bookings</CardDescription>
                    <CardTitle className="text-2xl">{activeBookings.length}</CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Services</CardDescription>
                    <CardTitle className="text-2xl">{bookings.length}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">
                Active {activeBookings.length > 0 && (
                  <Badge className="ml-2 bg-blue-500 text-white">{activeBookings.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4 mt-4">
              {activeBookings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">No active bookings</p>
                    <p className="text-sm text-gray-400 mb-4">Book a detailer to get started</p>
                    <Button onClick={onNewBooking} className="bg-blue-600 hover:bg-blue-700">
                      Find Detailers
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeBookings.map(booking => (
                    <Card 
                      key={booking.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onViewBooking(booking)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {booking.services.join(' + ')}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {booking.scheduledDate} at {booking.scheduledTime}
                            </CardDescription>
                          </div>
                          <Badge className={
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                            booking.status === 'on-the-way' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }>
                            {booking.status === 'on-the-way' ? 'On the way' : 
                             booking.status === 'started' ? 'In progress' : 'Confirmed'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{booking.vehicleType}</span>
                          </div>
                          <span>${booking.price}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewBooking(booking);
                          }}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message Detailer
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-4">
              {completedBookings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No completed bookings yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedBookings.map(booking => (
                    <Card key={booking.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {booking.services.join(' + ')}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {booking.scheduledDate}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{booking.vehicleType}</span>
                          <span>${booking.price}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => onLeaveReview(booking)}
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Leave Review
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => onBookAgain(booking)}
                          >
                            Book Again
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
            </div>
          </div>
        </div>
    </div>
  );
}
