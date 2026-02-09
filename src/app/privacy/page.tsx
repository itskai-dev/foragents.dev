"use client";

import { useState, useEffect } from 'react';

const sections = [
  { id: 'information', title: '1. Information We Collect' },
  { id: 'usage', title: '2. How We Use Information' },
  { id: 'sharing', title: '3. Data Sharing' },
  { id: 'retention', title: '4. Data Retention' },
  { id: 'security', title: '5. Security' },
  { id: 'cookies', title: '6. Cookies' },
  { id: 'gdpr', title: '7. Your Rights (GDPR)' },
  { id: 'ccpa', title: '8. California Privacy (CCPA)' },
  { id: 'children', title: '9. Children\'s Privacy' },
  { id: 'international', title: '10. International Transfers' },
  { id: 'changes', title: '11. Changes to Policy' },
  { id: 'contact', title: '12. Contact Information' },
];

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState('information');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -66%' }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[300px] flex items-center border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 w-full">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Privacy Policy
          </h1>
          <div className="flex flex-col gap-2 text-sm text-foreground/60">
            <p>Effective Date: February 9, 2026</p>
            <p>Last Updated: February 9, 2026</p>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Table of Contents Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <nav className="bg-[#0f0f0f] border border-white/10 rounded-lg p-4">
                <h2 className="text-sm font-semibold text-foreground mb-4 px-2">Table of Contents</h2>
                <ul className="space-y-1">
                  {sections.map(({ id, title }) => (
                    <li key={id}>
                      <button
                        onClick={() => scrollToSection(id)}
                        className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                          activeSection === id
                            ? 'text-[#06D6A0] bg-[#06D6A0]/10 font-medium'
                            : 'text-foreground/60 hover:text-foreground hover:bg-white/5'
                        }`}
                      >
                        {title}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 max-w-4xl">
            <div className="prose prose-invert max-w-none">
              <div className="mb-8 text-gray-300 leading-relaxed">
                <p>
                  At forAgents.dev, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this policy carefully to understand our practices regarding your personal data.
                </p>
              </div>

              <section id="information" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">1. Information We Collect</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    We collect several types of information from and about users of our Service:
                  </p>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-medium text-white mb-2">Personal Information</h3>
                      <p>Information that identifies you personally, such as:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                        <li>Name and username</li>
                        <li>Email address</li>
                        <li>Profile information you choose to provide</li>
                        <li>Social media handles or links</li>
                        <li>Payment information (processed securely by third-party providers)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-medium text-white mb-2">Usage Data</h3>
                      <p>Information about how you interact with our Service:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                        <li>Pages visited and features used</li>
                        <li>Time and date of visits</li>
                        <li>Search queries and filters applied</li>
                        <li>Agents viewed, rated, or bookmarked</li>
                        <li>Comments and reviews posted</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-medium text-white mb-2">Technical Data</h3>
                      <p>Information collected automatically:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                        <li>IP address and location data</li>
                        <li>Browser type and version</li>
                        <li>Device type and operating system</li>
                        <li>Referring URLs and exit pages</li>
                        <li>Cookie data and unique device identifiers</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-medium text-white mb-2">Content You Provide</h3>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Agent submissions and descriptions</li>
                        <li>Reviews, ratings, and comments</li>
                        <li>Messages sent through our platform</li>
                        <li>Feedback and support requests</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section id="usage" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">2. How We Use Information</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    We use the information we collect for various purposes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong className="text-white">Provide and maintain the Service:</strong> To deliver the features and functionality you request</li>
                    <li><strong className="text-white">Improve user experience:</strong> To understand how users interact with our Service and make improvements</li>
                    <li><strong className="text-white">Personalization:</strong> To provide personalized recommendations and content</li>
                    <li><strong className="text-white">Communication:</strong> To send you updates, newsletters, and marketing materials (with your consent)</li>
                    <li><strong className="text-white">Account management:</strong> To manage your account and authenticate your identity</li>
                    <li><strong className="text-white">Customer support:</strong> To respond to your inquiries and provide assistance</li>
                    <li><strong className="text-white">Analytics:</strong> To analyze trends, track user behavior, and gather demographic information</li>
                    <li><strong className="text-white">Security:</strong> To detect, prevent, and address fraud, security issues, and technical problems</li>
                    <li><strong className="text-white">Legal compliance:</strong> To comply with legal obligations and enforce our Terms of Service</li>
                    <li><strong className="text-white">Business operations:</strong> To conduct research, develop new features, and operate our business</li>
                  </ul>
                </div>
              </section>

              <section id="sharing" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">3. Data Sharing</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    We may share your information in the following circumstances:
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">With Your Consent</h3>
                      <p>We will share information when you explicitly authorize us to do so.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Service Providers</h3>
                      <p>We may share information with third-party vendors who perform services on our behalf:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                        <li>Hosting and infrastructure providers</li>
                        <li>Analytics services (e.g., Google Analytics, Vercel Analytics)</li>
                        <li>Payment processors</li>
                        <li>Email service providers</li>
                        <li>Customer support tools</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Public Information</h3>
                      <p>Information you choose to make public, such as:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                        <li>Agent submissions and descriptions</li>
                        <li>Public profile information</li>
                        <li>Reviews and ratings</li>
                        <li>Comments and discussions</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Legal Requirements</h3>
                      <p>We may disclose information when required by law or to:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                        <li>Comply with legal processes or government requests</li>
                        <li>Enforce our Terms of Service</li>
                        <li>Protect our rights, property, or safety</li>
                        <li>Prevent fraud or security issues</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Business Transfers</h3>
                      <p>If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</p>
                    </div>
                  </div>

                  <p className="mt-4">
                    We do not sell your personal information to third parties for their marketing purposes.
                  </p>
                </div>
              </section>

              <section id="retention" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">4. Data Retention</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
                  </p>
                  <p>
                    Retention periods vary depending on the type of data:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong className="text-white">Account data:</strong> Retained while your account is active and for a reasonable period after account deletion</li>
                    <li><strong className="text-white">Usage data:</strong> Typically retained for 12-24 months for analytics purposes</li>
                    <li><strong className="text-white">Transaction records:</strong> Retained as required by law (typically 7 years)</li>
                    <li><strong className="text-white">Public content:</strong> May be retained indefinitely unless you request deletion</li>
                    <li><strong className="text-white">Backup data:</strong> Retained in backup systems for up to 90 days</li>
                  </ul>
                  <p>
                    When we no longer need your information, we will securely delete or anonymize it.
                  </p>
                </div>
              </section>

              <section id="security" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">5. Security</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    We implement appropriate technical and organizational security measures to protect your personal information:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Encryption of data in transit using HTTPS/TLS</li>
                    <li>Encryption of sensitive data at rest</li>
                    <li>Regular security assessments and updates</li>
                    <li>Access controls and authentication mechanisms</li>
                    <li>Monitoring for unauthorized access or suspicious activity</li>
                    <li>Secure backup and disaster recovery procedures</li>
                    <li>Employee training on data protection practices</li>
                  </ul>
                  <p>
                    However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security.
                  </p>
                  <p>
                    You are responsible for maintaining the confidentiality of your account credentials. If you believe your account has been compromised, please contact us immediately.
                  </p>
                </div>
              </section>

              <section id="cookies" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">6. Cookies</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    We use cookies and similar tracking technologies to track activity on our Service and store certain information.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Types of Cookies We Use</h3>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong className="text-white">Essential cookies:</strong> Required for the website to function properly (authentication, security)</li>
                        <li><strong className="text-white">Functional cookies:</strong> Remember your preferences and settings</li>
                        <li><strong className="text-white">Analytics cookies:</strong> Help us understand how visitors use the Service</li>
                        <li><strong className="text-white">Performance cookies:</strong> Improve website performance and user experience</li>
                        <li><strong className="text-white">Marketing cookies:</strong> Track effectiveness of marketing campaigns (with consent)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Third-Party Cookies</h3>
                      <p>We may use third-party services that also set cookies:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                        <li>Google Analytics (analytics and reporting)</li>
                        <li>Vercel Analytics (performance monitoring)</li>
                        <li>Authentication providers (login services)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Cookie Control</h3>
                      <p>You can control cookies through your browser settings:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                        <li>Block all cookies</li>
                        <li>Accept only first-party cookies</li>
                        <li>Delete cookies after each session</li>
                        <li>Receive notifications before cookies are set</li>
                      </ul>
                      <p className="mt-2">
                        Note that disabling cookies may affect the functionality of the Service.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section id="gdpr" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">7. Your Rights (GDPR)</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    If you are located in the European Economic Area (EEA), you have certain rights under the General Data Protection Regulation (GDPR):
                  </p>
                  <ul className="list-disc list-inside space-y-3 ml-4">
                    <li>
                      <strong className="text-white">Right to access:</strong> You can request a copy of the personal information we hold about you
                    </li>
                    <li>
                      <strong className="text-white">Right to rectification:</strong> You can request that we correct inaccurate or incomplete information
                    </li>
                    <li>
                      <strong className="text-white">Right to erasure:</strong> You can request deletion of your personal information (&quot;right to be forgotten&quot;)
                    </li>
                    <li>
                      <strong className="text-white">Right to restriction:</strong> You can request that we limit how we use your information
                    </li>
                    <li>
                      <strong className="text-white">Right to data portability:</strong> You can request a copy of your data in a machine-readable format
                    </li>
                    <li>
                      <strong className="text-white">Right to object:</strong> You can object to certain processing activities, including direct marketing
                    </li>
                    <li>
                      <strong className="text-white">Right to withdraw consent:</strong> Where processing is based on consent, you can withdraw it at any time
                    </li>
                    <li>
                      <strong className="text-white">Right to lodge a complaint:</strong> You can file a complaint with your local data protection authority
                    </li>
                  </ul>
                  <p>
                    To exercise any of these rights, please contact us using the information provided in Section 12. We will respond to your request within 30 days.
                  </p>
                </div>
              </section>

              <section id="ccpa" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">8. California Privacy Rights (CCPA)</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA):
                  </p>
                  <ul className="list-disc list-inside space-y-3 ml-4">
                    <li>
                      <strong className="text-white">Right to know:</strong> You can request information about the categories and specific pieces of personal information we have collected, as well as the categories of sources, purposes, and third parties we share it with
                    </li>
                    <li>
                      <strong className="text-white">Right to delete:</strong> You can request deletion of your personal information, subject to certain exceptions
                    </li>
                    <li>
                      <strong className="text-white">Right to opt-out:</strong> You have the right to opt-out of the sale of your personal information (note: we do not sell personal information)
                    </li>
                    <li>
                      <strong className="text-white">Right to non-discrimination:</strong> We will not discriminate against you for exercising your CCPA rights
                    </li>
                  </ul>
                  <p>
                    To exercise your CCPA rights, please contact us at <a href="mailto:privacy@foragents.dev" className="text-[#06D6A0] hover:underline">privacy@foragents.dev</a>. We may need to verify your identity before processing your request.
                  </p>
                  <p>
                    You may designate an authorized agent to make a request on your behalf by providing written authorization.
                  </p>
                </div>
              </section>

              <section id="children" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">9. Children&apos;s Privacy</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18.
                  </p>
                  <p>
                    If you are a parent or guardian and believe that your child has provided us with personal information, please contact us. If we become aware that we have collected personal information from children without verification of parental consent, we will take steps to remove that information from our servers.
                  </p>
                  <p>
                    By using our Service, you represent that you are at least 18 years old or have reached the age of majority in your jurisdiction.
                  </p>
                </div>
              </section>

              <section id="international" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">10. International Transfers</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that are different from the laws of your country.
                  </p>
                  <p>
                    We take appropriate measures to ensure that your personal information remains protected and is transferred in accordance with applicable data protection laws:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Using Standard Contractual Clauses approved by the European Commission</li>
                    <li>Ensuring service providers are Privacy Shield certified (where applicable)</li>
                    <li>Implementing appropriate technical and organizational safeguards</li>
                    <li>Obtaining your explicit consent where required</li>
                  </ul>
                  <p>
                    If you are located in the EEA or UK, by using our Service, you acknowledge that your information may be transferred to the United States and other countries.
                  </p>
                </div>
              </section>

              <section id="changes" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">11. Changes to This Policy</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of any material changes by:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Posting the new Privacy Policy on this page</li>
                    <li>Updating the &quot;Last Updated&quot; date at the top of this policy</li>
                    <li>Sending you an email notification (for material changes)</li>
                    <li>Displaying a prominent notice on our Service</li>
                  </ul>
                  <p>
                    We encourage you to review this Privacy Policy periodically for any changes. Your continued use of the Service after any modifications indicates your acceptance of the updated Privacy Policy.
                  </p>
                  <p>
                    If we make material changes to how we treat your personal information, we will provide at least 30 days&apos; notice before the changes take effect.
                  </p>
                </div>
              </section>

              <section id="contact" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">12. Contact Information</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-6 space-y-3">
                    <div>
                      <strong className="text-white">Privacy Email:</strong>{' '}
                      <a href="mailto:privacy@foragents.dev" className="text-[#06D6A0] hover:underline">
                        privacy@foragents.dev
                      </a>
                    </div>
                    <div>
                      <strong className="text-white">General Email:</strong>{' '}
                      <a href="mailto:contact@foragents.dev" className="text-[#06D6A0] hover:underline">
                        contact@foragents.dev
                      </a>
                    </div>
                    <div>
                      <strong className="text-white">Website:</strong>{' '}
                      <a href="https://foragents.dev" className="text-[#06D6A0] hover:underline">
                        foragents.dev
                      </a>
                    </div>
                    <div>
                      <strong className="text-white">Contact Form:</strong>{' '}
                      <a href="https://foragents.dev/contact" className="text-[#06D6A0] hover:underline">
                        foragents.dev/contact
                      </a>
                    </div>
                  </div>
                  <p>
                    We will respond to all requests, inquiries, or concerns within 30 days.
                  </p>
                  <p className="text-sm text-foreground/60 mt-8">
                    This Privacy Policy was last updated on February 9, 2026.
                  </p>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
