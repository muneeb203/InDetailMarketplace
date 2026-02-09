import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BookingsPage } from './BookingsPage';
import { MessagesPage } from './MessagesPage';
import { ProfilePageInteractive } from './ProfilePageInteractive';
import { FiltersPanel, FilterState, FiltersPanelStandalone } from './FiltersPanel';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Calendar, MessageSquare, User, SlidersHorizontal, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const defaultFilters: FilterState = {
  distance: 25,
  minRating: null,
  priceRange: [0, 1000],
  availability: null,
  services: [],
};

export function InteractiveFeaturesDemo() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const handleFiltersApply = () => {
    console.log('Filters applied:', filters);
    // In production, this would filter the marketplace results
  };

  const handleFiltersReset = () => {
    setFilters(defaultFilters);
    console.log('Filters reset');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF5FF] to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0078FF] to-[#0056CC] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl">InDetail</h1>
                <p className="text-sm text-gray-600">Interactive Features Demo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[73px] z-10">
        <div className="max-w-6xl mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-14 bg-transparent border-b-0 gap-1">
              <TabsTrigger 
                value="bookings" 
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-[#0078FF] data-[state=active]:text-[#0078FF] rounded-none bg-transparent"
              >
                <Calendar className="w-4 h-4" />
                Bookings
              </TabsTrigger>
              <TabsTrigger 
                value="messages" 
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-[#0078FF] data-[state=active]:text-[#0078FF] rounded-none bg-transparent"
              >
                <MessageSquare className="w-4 h-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-[#0078FF] data-[state=active]:text-[#0078FF] rounded-none bg-transparent"
              >
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="filters" 
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-[#0078FF] data-[state=active]:text-[#0078FF] rounded-none bg-transparent"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </TabsTrigger>
            </TabsList>

            {/* Content */}
            <TabsContent value="bookings" className="mt-0">
              <BookingsPage 
                onNavigateToMessages={(id) => {
                  setActiveTab('messages');
                  console.log('Navigate to messages for booking:', id);
                }}
              />
            </TabsContent>

            <TabsContent value="messages" className="mt-0">
              <MessagesPage />
            </TabsContent>

            <TabsContent value="profile" className="mt-0">
              <div className="space-y-8">
                {/* View as Owner */}
                <div>
                  <div className="max-w-4xl mx-auto px-6 pt-6">
                    <Card className="p-4 bg-blue-50 border-2 border-blue-200 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-[#0078FF] rounded-xl flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm mb-1">Owner View</h3>
                          <p className="text-sm text-gray-700">
                            This is how detailers see and edit their own profile. Click "Edit Profile" to test the interactive edit mode.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                  <ProfilePageInteractive 
                    isOwner={true}
                  />
                </div>

                {/* View as Client */}
                <div className="border-t-8 border-gray-200">
                  <div className="max-w-4xl mx-auto px-6 pt-6">
                    <Card className="p-4 bg-green-50 border-2 border-green-200 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm mb-1">Client View</h3>
                          <p className="text-sm text-gray-700">
                            This is how clients see a detailer's profile. They can message or request a quote.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                  <ProfilePageInteractive 
                    isOwner={false}
                    onMessageClick={() => {
                      setActiveTab('messages');
                      console.log('Navigate to messages');
                    }}
                    onRequestQuote={() => {
                      console.log('Request quote clicked');
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="filters" className="mt-0">
              <FiltersPanelStandalone
                filters={filters}
                onFiltersChange={setFilters}
                onApply={handleFiltersApply}
                onReset={handleFiltersReset}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Info Card */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
            <h2 className="text-xl mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0078FF]" />
              Interactive Features Overview
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="mb-2 text-[#0078FF]">✅ Bookings Page</h3>
                <ul className="space-y-1 text-gray-700">
                  <li>• View/manage bookings with status badges</li>
                  <li>• Filter by upcoming/completed/cancelled</li>
                  <li>• Modal with full booking details</li>
                  <li>• Cancel with confirmation prompt</li>
                  <li>• Message detailer from booking</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-[#0078FF]">✅ Messages Page</h3>
                <ul className="space-y-1 text-gray-700">
                  <li>• Inbox list with unread counts</li>
                  <li>• Real-time chat interface</li>
                  <li>• Typing indicators</li>
                  <li>• Online/offline status</li>
                  <li>• Auto-scroll to latest message</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-[#0078FF]">✅ Profile Page</h3>
                <ul className="space-y-1 text-gray-700">
                  <li>• Owner: Edit mode with save/cancel</li>
                  <li>• Client: Message & request quote</li>
                  <li>• Portfolio gallery with lightbox</li>
                  <li>• Editable specialties & contact info</li>
                  <li>• Trust badges & verification</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-[#0078FF]">✅ Filters Panel</h3>
                <ul className="space-y-1 text-gray-700">
                  <li>• Distance & price range sliders</li>
                  <li>• Multi-select service chips</li>
                  <li>• Rating & availability filters</li>
                  <li>• Active filter count badge</li>
                  <li>• Apply & reset functionality</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
