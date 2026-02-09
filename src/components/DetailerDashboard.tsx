import { Detailer, Lead, Booking } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DollarSign, TrendingUp, Star, Crown, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface DetailerDashboardProps {
  detailer: Detailer;
  leads: Lead[];
  bookings: Booking[];
  onAcceptLead: (leadId: string) => void;
  onDeclineLead: (leadId: string) => void;
  onUpgradeToPro: () => void;
  onViewBooking: (booking: Booking) => void;
}

export function DetailerDashboard({ 
  detailer, 
  leads, 
  bookings,
  onAcceptLead,
  onDeclineLead,
  onUpgradeToPro,
  onViewBooking
}: DetailerDashboardProps) {
  const pendingLeads = leads.filter(l => l.status === 'pending');
  const activeBookings = bookings.filter(b => ['confirmed', 'on-the-way', 'started'].includes(b.status));
  const completedBookings = bookings.filter(b => b.status === 'completed');

  const thisMonthEarnings = completedBookings.reduce((sum, b) => sum + b.price, 0);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-auto pb-20">
        <div className="p-4 space-y-4">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-white mb-1">Welcome back,</h2>
                <p className="text-blue-100">{detailer.businessName}</p>
              </div>
              {detailer.isPro && (
                <Badge className="bg-yellow-500 text-white border-0">
                  <Crown className="w-4 h-4 mr-1" />
                  Pro
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-blue-100 text-sm mb-1">Wallet</p>
                <p className="text-white">${detailer.wallet}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm mb-1">Rating</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <p className="text-white">{detailer.rating}</p>
                </div>
              </div>
              <div>
                <p className="text-blue-100 text-sm mb-1">Jobs</p>
                <p className="text-white">{detailer.completedJobs}</p>
              </div>
            </div>
          </div>

          {/* Upgrade Banner */}
          {!detailer.isPro && (
            <Alert className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
              <Crown className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-900 mb-1">Upgrade to Pro</p>
                  <p className="text-sm text-yellow-700">Get priority placement & more leads</p>
                </div>
                <Button 
                  size="sm" 
                  onClick={onUpgradeToPro}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white ml-2"
                >
                  Upgrade
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>This Month</CardDescription>
                <CardTitle className="text-2xl">${thisMonthEarnings}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12% vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Active Bookings</CardDescription>
                <CardTitle className="text-2xl">{activeBookings.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {pendingLeads.length} pending leads
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="leads" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="leads">
                Leads {pendingLeads.length > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white">{pendingLeads.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
            </TabsList>

            <TabsContent value="leads" className="space-y-3 mt-4">
              {pendingLeads.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No pending leads</p>
                    <p className="text-sm text-gray-400 mt-1">New leads will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                pendingLeads.map(lead => (
                  <Card key={lead.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">New Lead</CardTitle>
                          <CardDescription>
                            {new Date(lead.sentAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">
                          <DollarSign className="w-3 h-3 mr-1" />
                          ${lead.cost}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600">
                        A customer is requesting a quote. Accept to view details and start messaging.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => onAcceptLead(lead.id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Accept (${lead.cost})
                        </Button>
                        <Button
                          onClick={() => onDeclineLead(lead.id)}
                          variant="outline"
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="bookings" className="space-y-3 mt-4">
              {activeBookings.length === 0 && completedBookings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No bookings yet</p>
                    <p className="text-sm text-gray-400 mt-1">Accept leads to start getting bookings</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {activeBookings.map(booking => (
                    <Card key={booking.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onViewBooking(booking)}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{booking.vehicleType}</CardTitle>
                            <CardDescription>
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
                        <div className="flex items-center justify-between text-sm">
                          <div className="text-gray-600">
                            {booking.services.join(', ')}
                          </div>
                          <div>${booking.price}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {completedBookings.length > 0 && (
                    <>
                      <h3 className="mt-6 mb-3">Completed</h3>
                      {completedBookings.slice(0, 3).map(booking => (
                        <Card key={booking.id} className="opacity-75">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base">{booking.vehicleType}</CardTitle>
                                <CardDescription>
                                  {booking.scheduledDate}
                                </CardDescription>
                              </div>
                              <Badge variant="secondary">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between text-sm">
                              <div className="text-gray-600">
                                {booking.services.join(', ')}
                              </div>
                              <div>${booking.price}</div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
