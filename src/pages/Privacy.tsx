import SEO from '@/components/SEO';
import Footer from '@/components/Footer';

const Privacy = () => {
  return (
    <>
      <SEO 
        title="Privacy Policy - Tirak Travel Companion Platform"
        description="Learn how Tirak protects your privacy and handles your personal data. Comprehensive privacy policy for our travel companion marketplace platform."
        canonical="/privacy"
      />
      
      <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="glass-card shadow-elevated rounded-2xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h1 className="text-responsive-lg font-bold font-inter text-contrast mb-4">Privacy Policy</h1>
              <p className="text-lg text-contrast-secondary font-inter">
                Last updated: January 2025
              </p>
            </div>
            
            <div className="prose prose-lg max-w-none space-y-8">

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">1. Introduction</h2>
                <p className="text-contrast-secondary leading-relaxed">
                  Welcome to Tirak ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website (collectively, the "Service").
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">2. Information We Collect</h2>
                
                <h3 className="text-lg font-medium font-inter text-contrast mb-3">2.1 Personal Information</h3>
                <p className="text-contrast-secondary leading-relaxed mb-4">We may collect the following personal information:</p>
                <ul className="list-disc pl-6 text-contrast-secondary space-y-2">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Profile information and preferences</li>
                  <li>Location data (with your consent)</li>
                  <li>Payment and billing information</li>
                  <li>Communication records and feedback</li>
                </ul>

                <h3 className="text-lg font-medium font-inter text-contrast mb-3 mt-6">2.2 Automatically Collected Information</h3>
                <ul className="list-disc pl-6 text-contrast-secondary space-y-2">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage data and analytics</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Log files and crash reports</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">3. How We Use Your Information</h2>
                <p className="text-contrast-secondary leading-relaxed mb-4">We use your information to:</p>
                <ul className="list-disc pl-6 text-contrast-secondary space-y-2">
                  <li>Provide and maintain our Service</li>
                  <li>Connect you with local travel companions</li>
                  <li>Process transactions and payments</li>
                  <li>Send you updates, notifications, and marketing communications</li>
                  <li>Improve our Service and develop new features</li>
                  <li>Ensure safety and security of our platform</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">4. Information Sharing and Disclosure</h2>
                <p className="text-contrast-secondary leading-relaxed mb-4">We may share your information in the following circumstances:</p>
                <ul className="list-disc pl-6 text-contrast-secondary space-y-2">
                  <li><strong>With Travel Companions:</strong> Profile information necessary for booking and communication</li>
                  <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our Service</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                  <li><strong>With Your Consent:</strong> Any other sharing with your explicit permission</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">5. Data Security</h2>
                <p className="text-contrast-secondary leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">6. Your Rights and Choices</h2>
                <p className="text-contrast-secondary leading-relaxed mb-4">Depending on your location, you may have the following rights:</p>
                <ul className="list-disc pl-6 text-contrast-secondary space-y-2">
                  <li>Access to your personal information</li>
                  <li>Correction of inaccurate data</li>
                  <li>Deletion of your personal information</li>
                  <li>Portability of your data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Withdraw consent for data processing</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">7. Cookies and Tracking Technologies</h2>
                <p className="text-contrast-secondary leading-relaxed">
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns, and deliver personalized content. You can control cookie preferences through your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">8. International Data Transfers</h2>
                <p className="text-contrast-secondary leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data during such transfers.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">9. Data Retention</h2>
                <p className="text-contrast-secondary leading-relaxed">
                  We retain your personal information only as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">10. Children's Privacy</h2>
                <p className="text-contrast-secondary leading-relaxed">
                  Our Service is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you become aware that a child has provided us with personal information, please contact us.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">11. Changes to This Privacy Policy</h2>
                <p className="text-contrast-secondary leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold font-inter text-contrast mb-4">12. Contact Us</h2>
                <p className="text-contrast-secondary leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
                </p>
                <div className="bg-surface/50 p-4 rounded-lg">
                  <p className="text-contrast-secondary"><strong>Email:</strong> <a href="mailto:contact@tirak.app" className="text-primary hover:text-primary-hover transition-colors">contact@tirak.app</a></p>
                  <p className="text-contrast-secondary mt-2"><strong>Subject Line:</strong> Privacy Policy Inquiry</p>
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

export default Privacy;