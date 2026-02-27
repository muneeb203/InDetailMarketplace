import { useState } from 'react';
import { Detailer, Lead } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DollarSign, TrendingUp, Star, Crown, CheckCircle2, XCircle, Clock, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { BuyCreditsModal } from './BuyCreditsModal';
import { SubscriptionModal } from './SubscriptionModal';
import { motion } from 'motion/react';
import { getLeadCost } from '../services/stripeService';

interface DetailerDashboardEnhancedProps {
  detailer: Detailer;
  leads: Lead[];
  onAcceptLead: (leadId: string) => void;
  onDeclineLead: (leadId: string) => void;
  onUpgradeToPro?: () => void;
  onCreditsAdded?: (credits: number) => void;
  onNavigateToDemo?: () => void;
  onBuyCredits?: () => void;
}

export function DetailerDashboardEnhanced({
  detailer,
  leads,
  onAcceptLead,
  onDeclineLead,
  onUpgradeToPro,
  onCreditsAdded,
  onNavigateToDemo,
  onBuyCredits,
}: DetailerDashboardEnhancedProps) {
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);

  const pendingLeads = leads.filter((l) => l.status === 'pending');
  
  // Note: Bookings are now handled through the real orders system
  // See BookingsPageIntegrated and DealerOrdersQueue components
  const activeBookings: never[] = [];
  const completedBookings: never[] = [];

  const thisMonthEarnings = 0; // TODO: Calculate from real completed orders
  const leadCost = getLeadCost(detailer.isPro, false);
  const canAcceptLead = detailer.wallet >= leadCost;

  const handleAcceptLead = (leadId: string) => {
    if (!canAcceptLead) {
      setShowBuyCredits(true);
      return;
    }
    onAcceptLead(leadId);
  };

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white">
      <div className="px-8 py-6 space-y-6 max-w-7xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-6 text-white shadow-xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-white mb-1">Welcome back,</h2>
                <p className="text-blue-100">{detailer.businessName}</p>
              </div>
              {detailer.isPro && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-0 shadow-lg">
                  <Crown className="w-4 h-4 mr-1" />
                  Pro
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <p className="text-blue-100 text-sm mb-1">Credits</p>
                <p className="text-white text-xl">{Math.floor(detailer.wallet / leadCost)}</p>
                <p className="text-blue-200 text-xs">${detailer.wallet}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <p className="text-blue-100 text-sm mb-1">Rating</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <p className="text-white text-xl">{detailer.rating}</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <p className="text-blue-100 text-sm mb-1">Jobs</p>
                <p className="text-white text-xl">{detailer.completedJobs}</p>
              </div>
            </div>

            <Button
              onClick={() => setShowBuyCredits(true)}
              className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Buy Lead Credits
            </Button>
          </motion.div>

          {/* Low Balance Alert */}
          {!canAcceptLead && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Alert className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <p className="text-red-900 mb-1">Low balance</p>
                    <p className="text-sm text-red-700">
                      Add credits to accept new leads
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowBuyCredits(true)}
                    className="bg-red-600 hover:bg-red-700 text-white ml-2"
                  >
                    Add Credits
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Upgrade Banner */}
          {!detailer.isPro && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Alert className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                <Crown className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-900 mb-1">Upgrade to Pro</p>
                    <p className="text-sm text-yellow-700">
                      Get priority placement & cheaper leads (${getLeadCost(true, false)}/lead)
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowSubscription(true)}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white ml-2 shadow-md"
                  >
                    Upgrade
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
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
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
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
            </motion.div>
          </div>

          {/* Status Demo Card */}
          {onNavigateToDemo && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        Practice Status Updates
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Learn how to update job status for your customers
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={onNavigateToDemo}
                    variant="outline"
                    className="w-full border-blue-300 hover:bg-blue-100 hover:border-blue-400"
                  >
                    Try Status Demo
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="leads" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100">
              <TabsTrigger value="leads" className="data-[state=active]:bg-white">
                Leads
                {pendingLeads.length > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5">
                    {pendingLeads.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="bookings" className="data-[state=active]:bg-white">
                Bookings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="leads" className="space-y-3 mt-4">
              {pendingLeads.length === 0 ? (
                <Card className="border-gray-200">
                  <CardContent className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-1">No pending leads</p>
                    <p className="text-sm text-gray-400">New leads will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                pendingLeads.map((lead, index) => (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-gray-200 hover:shadow-lg transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">New Lead Opportunity</CardTitle>
                            <CardDescription>
                              {new Date(lead.sentAt).toLocaleDateString()} at{' '}
                              {new Date(lead.sentAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <DollarSign className="w-3 h-3 mr-1" />$                            {lead.cost.toFixed(2)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-gray-600">
                          A customer is requesting a quote. Accept to view details and start
                          messaging.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAcceptLead(lead.id)}
                            disabled={!canAcceptLead}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Accept (${lead.cost.toFixed(2)})
                          </Button>
                          <Button
                            onClick={() => onDeclineLead(lead.id)}
                            variant="outline"
                            className="flex-1 border-gray-300 hover:bg-gray-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>

            <TabsContent value="bookings" className="space-y-3 mt-4">
              {activeBookings.length === 0 && completedBookings.length === 0 ? (
                <Card className="border-gray-200">
                  <CardContent className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-1">No bookings yet</p>
                    <p className="text-sm text-gray-400">
                      Accept leads to start getting bookings
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {activeBookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className="border-gray-200 cursor-pointer hover:shadow-lg transition-all"
                        onClick={() => onViewBooking?.(booking)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">
                                {booking.vehicleType}
                              </CardTitle>
                              <CardDescription>
                                {booking.scheduledDate} at {booking.scheduledTime}
                              </CardDescription>
                            </div>
                            <Badge
                              className={
                                booking.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-700'
                                  : booking.status === 'on-the-way'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }
                            >
                              {booking.status === 'on-the-way'
                                ? 'On the way'
                                : booking.status === 'started'
                                ? 'In progress'
                                : 'Confirmed'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm">
                            <div className="text-gray-600">{booking.services.join(', ')}</div>
                            <div className="font-medium">${booking.price}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}

                  {completedBookings.length > 0 && (
                    <>
                      <h3 className="mt-6 mb-3 text-gray-700">Completed</h3>
                      {completedBookings.slice(0, 3).map((booking) => (
                        <Card key={booking.id} className="opacity-75 border-gray-200">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base">
                                  {booking.vehicleType}
                                </CardTitle>
                                <CardDescription>{booking.scheduledDate}</CardDescription>
                              </div>
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
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
                              <div className="font-medium">${booking.price}</div>
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

        {/* Modals */}
        <BuyCreditsModal
          open={showBuyCredits}
          onClose={() => setShowBuyCredits(false)}
          onSuccess={(credits) => {
            onCreditsAdded?.(credits);
            setShowBuyCredits(false);
          }}
          detailerId={detailer.id}
        />

        <SubscriptionModal
          open={showSubscription}
          onClose={() => setShowSubscription(false)}
          onSuccess={(tierId) => {
            onUpgradeToPro?.();
            setShowSubscription(false);
          }}
          detailerId={detailer.id}
          currentTier={detailer.isPro ? 'pro' : 'free'}
        />
      </div>
    </div>
  );
}
