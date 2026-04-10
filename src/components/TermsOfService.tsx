import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface TermsOfServiceProps {
  onBack: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
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
            <h1 className="text-2xl font-bold">Terms of Service</h1>
            <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(100vh-200px)] bg-white rounded-xl border border-gray-200 p-8">
          <div className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using InDetail ("the Platform"), you accept and agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                InDetail is a marketplace platform that connects vehicle owners ("Clients") with professional auto detailing service providers ("Detailers"). 
                The Platform facilitates:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Discovery and booking of auto detailing services</li>
                <li>Communication between Clients and Detailers</li>
                <li>Payment processing for services</li>
                <li>Review and rating systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                <strong>3.1 Registration:</strong> You must create an account to use the Platform. You agree to provide accurate, current, and complete information.
              </p>
              <p className="text-gray-700 leading-relaxed mb-2">
                <strong>3.2 Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>3.3 Account Types:</strong> Users may register as either Clients or Detailers. Each account type has specific rights and responsibilities.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Client Responsibilities</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide accurate vehicle information and service requirements</li>
                <li>Be present at the scheduled service time or provide access to the vehicle</li>
                <li>Pay for services as agreed upon</li>
                <li>Treat Detailers with respect and professionalism</li>
                <li>Provide honest and fair reviews</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Detailer Responsibilities</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Maintain valid business licenses and insurance as required by local law</li>
                <li>Provide services professionally and as described</li>
                <li>Arrive at scheduled appointments on time</li>
                <li>Use appropriate products and techniques for vehicle care</li>
                <li>Communicate clearly with Clients about service details and pricing</li>
                <li>Maintain accurate portfolio and service information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Payments and Fees</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                <strong>6.1 Service Fees:</strong> InDetail charges a service fee for facilitating transactions between Clients and Detailers.
              </p>
              <p className="text-gray-700 leading-relaxed mb-2">
                <strong>6.2 Payment Processing:</strong> All payments are processed securely through our third-party payment processor.
              </p>
              <p className="text-gray-700 leading-relaxed mb-2">
                <strong>6.3 Refunds:</strong> Refund policies are determined on a case-by-case basis. Disputes should be reported within 48 hours of service completion.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>6.4 Lead Credits:</strong> Detailers purchase credits to access client leads. Credits are non-refundable once used.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Cancellation Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                <strong>7.1 Client Cancellations:</strong> Clients may cancel bookings up to 24 hours before the scheduled service time without penalty. 
                Cancellations within 24 hours may incur a cancellation fee.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>7.2 Detailer Cancellations:</strong> Detailers who cancel confirmed bookings may face penalties including account suspension.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Prohibited Conduct</h2>
              <p className="text-gray-700 leading-relaxed mb-2">Users may not:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Circumvent the Platform to conduct transactions off-platform</li>
                <li>Post false, misleading, or fraudulent information</li>
                <li>Harass, abuse, or threaten other users</li>
                <li>Use the Platform for any illegal purpose</li>
                <li>Attempt to manipulate reviews or ratings</li>
                <li>Share account credentials with others</li>
                <li>Use automated systems to access the Platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                All content on the Platform, including logos, text, graphics, and software, is the property of InDetail or its licensors. 
                Users may not copy, modify, or distribute Platform content without permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Liability and Disclaimers</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                <strong>10.1 Platform Role:</strong> InDetail is a marketplace platform only. We do not provide detailing services directly and are not responsible for the quality of services provided by Detailers.
              </p>
              <p className="text-gray-700 leading-relaxed mb-2">
                <strong>10.2 No Warranties:</strong> The Platform is provided "as is" without warranties of any kind.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>10.3 Limitation of Liability:</strong> InDetail is not liable for any damages arising from use of the Platform or services obtained through it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed">
                Any disputes arising from these Terms or use of the Platform shall be resolved through binding arbitration in accordance with applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Account Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                InDetail reserves the right to suspend or terminate accounts that violate these Terms or engage in prohibited conduct.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">13. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update these Terms from time to time. Continued use of the Platform after changes constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">14. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                For questions about these Terms, please contact us at: support@indetail.com
              </p>
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
