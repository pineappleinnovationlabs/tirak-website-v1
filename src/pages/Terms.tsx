import SEO from '@/components/SEO';
import Footer from '@/components/Footer';

const Terms = () => {
  return (
    <>
      <SEO 
        title="Terms & Conditions - Tirak Travel Companion Service"
        description="Read Tirak's terms and conditions for using our travel companion marketplace. User agreements, service guidelines, and legal terms for travelers and guides."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface/20 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-12">
            
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-2xl mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-inter bg-gradient-to-r from-contrast to-contrast-secondary bg-clip-text text-transparent mb-4">
                Terms of Service
              </h1>
              <p className="text-xl text-contrast-secondary max-w-2xl mx-auto leading-relaxed">
                Please read these terms carefully before using our service
              </p>
              <p className="text-sm text-contrast-secondary/70 mt-4">
                Last Updated: January 15, 2025
              </p>
            </div>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">1. Acceptance of Terms</h2>
                <p className="text-contrast-secondary leading-relaxed">
                  By accessing and using Tirak ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">2. Description of Service</h2>
                <p className="text-contrast-secondary leading-relaxed mb-4">
                  Tirak is a platform that connects travelers with local companions for authentic travel experiences. Our service includes:
                </p>
                <ul className="list-disc pl-6 text-contrast-secondary space-y-2">
                  <li>Matching travelers with verified local companions</li>
                  <li>Secure booking and payment processing</li>
                  <li>Communication tools and trip planning features</li>
                  <li>Safety and verification systems</li>
                  <li>Customer support and dispute resolution</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">3. User Accounts and Registration</h2>
                <p className="text-contrast-secondary leading-relaxed mb-4">
                  To use certain features of our Service, you must register for an account. You agree to:
                </p>
                <ul className="list-disc pl-6 text-contrast-secondary space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your account information</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">4. User Conduct and Responsibilities</h2>
                <p className="text-contrast-secondary leading-relaxed mb-4">You agree not to:</p>
                <ul className="list-disc pl-6 text-contrast-secondary space-y-2">
                  <li>Use the Service for any unlawful purpose or activity</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Post false, misleading, or inappropriate content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with the proper functioning of the Service</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">5. Booking and Payment Terms</h2>
                <p className="text-contrast-secondary leading-relaxed mb-4">
                  When you book a travel experience through Tirak:
                </p>
                <ul className="list-disc pl-6 text-contrast-secondary space-y-2">
                  <li>You enter into a contract with the local companion, not Tirak</li>
                  <li>Payment is processed securely through our platform</li>
                  <li>Cancellation policies vary by experience and companion</li>
                  <li>Refunds are subject to our refund policy</li>
                  <li>You are responsible for any additional costs during the experience</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">6. Safety and Verification</h2>
                <p className="text-contrast-secondary leading-relaxed">
                  While we implement verification processes and safety measures, you acknowledge that travel involves inherent risks. You are responsible for your own safety and should exercise reasonable caution when meeting and traveling with companions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">7. Intellectual Property</h2>
                <p className="text-contrast-secondary leading-relaxed">
                  The Service and its original content, features, and functionality are owned by Tirak and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">8. Privacy Policy</h2>
                <p className="text-contrast-secondary leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">9. Disclaimers and Limitation of Liability</h2>
                <p className="text-contrast-secondary leading-relaxed mb-4">
                  The Service is provided "as is" without warranties of any kind. To the fullest extent permitted by law, Tirak disclaims all warranties and shall not be liable for any damages arising from your use of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">10. Indemnification</h2>
                <p className="text-contrast-secondary leading-relaxed">
                  You agree to indemnify and hold Tirak harmless from any claims, damages, or expenses arising from your use of the Service or violation of these terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">11. Termination</h2>
                <p className="text-contrast-secondary leading-relaxed">
                  We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">12. Changes to Terms</h2>
                <p className="text-contrast-secondary leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify users of any material changes. Your continued use of the Service after such modifications constitutes acceptance of the updated terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">13. Governing Law</h2>
                <p className="text-contrast-secondary leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Tirak operates, without regard to conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">14. Contact Information</h2>
                <p className="text-contrast-secondary leading-relaxed mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-surface/50 p-4 rounded-lg">
                  <p className="text-contrast-secondary"><strong>Legal Inquiries:</strong> <a href="mailto:legal@tirak.app" className="text-primary hover:text-primary-hover transition-colors">legal@tirak.app</a></p>
                  <p className="text-contrast-secondary mt-2"><strong>General Support:</strong> <a href="mailto:contact@tirak.app" className="text-primary hover:text-primary-hover transition-colors">contact@tirak.app</a></p>
                  <p className="text-contrast-secondary mt-2"><strong>Technical Support:</strong> <a href="mailto:support@tirak.app" className="text-primary hover:text-primary-hover transition-colors">support@tirak.app</a></p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Terms;