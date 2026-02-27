import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF5FF] to-white flex flex-col p-6">
      <div className="w-full max-w-4xl mx-auto space-y-6 flex-1">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Privacy Policy</h1>
            <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(100vh-200px)] bg-white rounded-xl border border-gray-200 p-8">
          <div className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                InDetail ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our marketplace platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li><strong>Account Information:</strong> Name, email address, phone number, password</li>
                <li><strong>Profile Information:</strong> Business name (for Detailers), vehicle information (for Clients), profile photos</li>
                <li><strong>Payment Information:</strong> Credit card details, billing address (processed securely by our payment processor)</li>
                <li><strong>Service Information:</strong> Booking details, service preferences, special requests</li>
                <li><strong>Communications:</strong> Messages sent through the Platform, reviews, and ratings</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4 mb-2">2.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent on Platform</li>
                <li><strong>Location Data:</strong> Approximate location based on IP address or precise location if you grant permission</li>
                <li><strong>Cookies:</strong> We use cookies and similar technologies to enhance your experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-2">We use your information to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Provide and maintain the Platform</li>
                <li>Process bookings and payments</li>
                <li>Facilitate communication between Clients and Detailers</li>
                <li>Send service notifications and updates</li>
                <li>Improve and personalize your experience</li>
                <li>Prevent fraud and ensure Platform security</li>
                <li>Comply with legal obligations</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Analyze Platform usage and trends</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Information Sharing and Disclosure</h2>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">4.1 With Other Users</h3>
              <p className="text-gray-700 leading-relaxed">
                When you book a service, we share relevant information (name, contact details, vehicle information) with the Detailer. 
                Detailers' business information is visible to Clients browsing the Platform.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">4.2 With Service Providers</h3>
              <p className="text-gray-700 leading-relaxed">
                We share information with third-party service providers who help us operate the Platform, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Payment processors (Stripe)</li>
                <li>Cloud hosting providers (Supabase)</li>
                <li>Email service providers</li>
                <li>Analytics providers</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4 mb-2">4.3 For Legal Reasons</h3>
              <p className="text-gray-700 leading-relaxed">
                We may disclose information if required by law, court order, or to protect our rights, property, or safety.
              </p>

              <h3 className="text-lg font-semibold mt-4 mb-2">4.4 Business Transfers</h3>
              <p className="text-gray-700 leading-relaxed">
                If InDetail is involved in a merger, acquisition, or sale of assets, your information may be transferred.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your information, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication systems</li>
                <li>Regular security audits</li>
                <li>Access controls and monitoring</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-2">
                However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Your Privacy Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-2">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Data Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Object:</strong> Object to certain processing of your information</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-2">
                To exercise these rights, contact us at privacy@indetail.com
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your information for as long as necessary to provide services and comply with legal obligations. 
                When you delete your account, we will delete or anonymize your information within 90 days, except where we must retain it for legal reasons.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                The Platform is not intended for users under 18 years of age. We do not knowingly collect information from children. 
                If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Remember your preferences and settings</li>
                <li>Understand how you use the Platform</li>
                <li>Improve Platform performance</li>
                <li>Deliver personalized content</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-2">
                You can control cookies through your browser settings, but disabling cookies may affect Platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Third-Party Links</h2>
              <p className="text-gray-700 leading-relaxed">
                The Platform may contain links to third-party websites. We are not responsible for the privacy practices of these sites. 
                We encourage you to read their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. California Privacy Rights</h2>
              <p className="text-gray-700 leading-relaxed">
                California residents have additional rights under the California Consumer Privacy Act (CCPA), including the right to know 
                what personal information is collected, sold, or disclosed, and the right to opt-out of the sale of personal information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">13. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through the Platform. 
                Your continued use after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">14. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="mt-2 text-gray-700">
                <p>Email: privacy@indetail.com</p>
                <p>Support: support@indetail.com</p>
              </div>
            </section>
          </div>
        </ScrollArea>

        {/* Footer Button */}
        <div className="flex justify-center">
          <Button onClick={onBack} className="w-full max-w-md">
            I Understand
          </Button>
        </div>
      </div>
    </div>
  );
}
