"use client";

import { useState, useEffect } from 'react';

const sections = [
  { id: 'acceptance', title: '1. Acceptance of Terms' },
  { id: 'service', title: '2. Description of Service' },
  { id: 'accounts', title: '3. User Accounts' },
  { id: 'api', title: '4. API Usage' },
  { id: 'acceptable', title: '5. Acceptable Use' },
  { id: 'intellectual', title: '6. Intellectual Property' },
  { id: 'payment', title: '7. Payment Terms' },
  { id: 'termination', title: '8. Termination' },
  { id: 'limitation', title: '9. Limitation of Liability' },
  { id: 'governing', title: '10. Governing Law' },
  { id: 'changes', title: '11. Changes to Terms' },
  { id: 'contact', title: '12. Contact Information' },
];

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('acceptance');

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
            Terms of Service
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
              <section id="acceptance" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    By accessing and using forAgents.dev (&quot;Service&quot;, &quot;Platform&quot;, &quot;Website&quot;), you accept and agree to be bound by these Terms of Service (&quot;Terms&quot;). These Terms constitute a legally binding agreement between you and forAgents.dev.
                  </p>
                  <p>
                    If you do not agree to these Terms, you must not access or use the Service. Your continued use of the Service following any changes to these Terms constitutes acceptance of those changes.
                  </p>
                  <p>
                    By using this Service, you represent that you are at least 18 years of age or have reached the age of majority in your jurisdiction, and that you have the legal capacity to enter into these Terms.
                  </p>
                </div>
              </section>

              <section id="service" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">2. Description of Service</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    forAgents.dev is a comprehensive directory and platform for discovering, sharing, and managing AI agents, skills, tools, and related services. The Service provides:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>A searchable directory of AI agents and tools</li>
                    <li>API access for programmatic interaction with our directory</li>
                    <li>User profiles and agent submission capabilities</li>
                    <li>Community features including ratings, reviews, and discussions</li>
                    <li>Documentation, guides, and educational resources</li>
                    <li>Analytics and tracking features for submitted agents</li>
                  </ul>
                  <p>
                    We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice. We are not liable for any modification, suspension, or discontinuance of the Service.
                  </p>
                </div>
              </section>

              <section id="accounts" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">3. User Accounts</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    To access certain features of the Service, you may be required to create an account. When creating an account, you agree to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide accurate, current, and complete information</li>
                    <li>Maintain and promptly update your account information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Accept responsibility for all activities that occur under your account</li>
                    <li>Notify us immediately of any unauthorized access or security breach</li>
                  </ul>
                  <p>
                    You may not use another person&apos;s account without permission, impersonate any person or entity, or falsely state or misrepresent your affiliation with any person or entity.
                  </p>
                  <p>
                    We reserve the right to suspend or terminate your account if we determine, in our sole discretion, that you have violated these Terms or engaged in conduct that we deem inappropriate.
                  </p>
                </div>
              </section>

              <section id="api" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">4. API Usage</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    If you access our API, you agree to comply with the following terms:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Respect all rate limits and usage quotas as specified in our API documentation</li>
                    <li>Not attempt to circumvent any security measures or access controls</li>
                    <li>Not use the API in a manner that could damage, disable, overburden, or impair the Service</li>
                    <li>Not use the API for any illegal purpose or in violation of any applicable laws</li>
                    <li>Properly attribute data obtained from our API when required</li>
                    <li>Keep your API keys confidential and secure</li>
                  </ul>
                  <p>
                    We may impose rate limits, usage restrictions, or other limitations on API usage at our discretion. Violation of API usage terms may result in immediate suspension or termination of API access without notice.
                  </p>
                  <p>
                    We reserve the right to monitor API usage and may contact you if we detect unusual patterns or potential violations of these Terms.
                  </p>
                </div>
              </section>

              <section id="acceptable" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">5. Acceptable Use</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    You agree not to use the Service to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Violate any applicable laws, regulations, or third-party rights</li>
                    <li>Submit false, misleading, or deceptive content</li>
                    <li>Harass, threaten, or intimidate any person</li>
                    <li>Distribute spam, malware, viruses, or other malicious code</li>
                    <li>Attempt to gain unauthorized access to any systems or networks</li>
                    <li>Scrape, crawl, or harvest data without permission</li>
                    <li>Interfere with or disrupt the Service or servers</li>
                    <li>Infringe upon intellectual property rights of others</li>
                    <li>Impersonate any person or entity or misrepresent your affiliation</li>
                    <li>Engage in any form of automated use without express permission</li>
                    <li>Submit content that is illegal, obscene, defamatory, or otherwise objectionable</li>
                  </ul>
                  <p>
                    We reserve the right to investigate and take appropriate legal action against anyone who violates this provision, including removing the offending content and terminating accounts.
                  </p>
                </div>
              </section>

              <section id="intellectual" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">6. Intellectual Property</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    The Service and its original content, features, and functionality are owned by forAgents.dev and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                  </p>
                  <p>
                    <strong className="text-white">Your Content:</strong> You retain all rights to any content you submit, post, or display on or through the Service (&quot;User Content&quot;). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free, transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform your User Content in connection with the Service.
                  </p>
                  <p>
                    <strong className="text-white">Our Content:</strong> Unless otherwise indicated, all content on the Service, including text, graphics, logos, icons, images, audio clips, and software, is the property of forAgents.dev or its licensors and is protected by copyright laws.
                  </p>
                  <p>
                    You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Service without our prior written consent.
                  </p>
                </div>
              </section>

              <section id="payment" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">7. Payment Terms</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    Certain features of the Service may be provided for a fee. If you elect to use paid features, you agree to the following:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>You will provide accurate and complete billing information</li>
                    <li>You authorize us to charge your payment method for all fees incurred</li>
                    <li>All fees are non-refundable unless otherwise stated</li>
                    <li>Prices are subject to change with reasonable notice</li>
                    <li>You are responsible for all taxes associated with your purchase</li>
                    <li>Subscription fees are billed in advance on a recurring basis</li>
                  </ul>
                  <p>
                    If any payment is not successfully processed, due to expiration, insufficient funds, or otherwise, we may suspend or terminate your access to paid features until payment is received.
                  </p>
                  <p>
                    You may cancel your subscription at any time, but no refunds will be provided for any unused portion of a subscription period.
                  </p>
                </div>
              </section>

              <section id="termination" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">8. Termination</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Breach of these Terms</li>
                    <li>Request by law enforcement or other government agencies</li>
                    <li>Discontinuance or material modification of the Service</li>
                    <li>Unexpected technical or security issues</li>
                    <li>Extended periods of inactivity</li>
                    <li>Engagement in fraudulent or illegal activities</li>
                  </ul>
                  <p>
                    You may terminate your account at any time by discontinuing use of the Service and requesting account deletion through your account settings or by contacting us.
                  </p>
                  <p>
                    Upon termination, your right to use the Service will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
                  </p>
                </div>
              </section>

              <section id="limitation" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">9. Limitation of Liability</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL FORAGENTS.DEV, ITS AFFILIATES, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Your access to or use of or inability to access or use the Service</li>
                    <li>Any conduct or content of any third party on the Service</li>
                    <li>Any content obtained from the Service</li>
                    <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                  </ul>
                  <p>
                    THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                  </p>
                  <p>
                    WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, OR THAT ANY DEFECTS WILL BE CORRECTED. IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL DAMAGES EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRIOR TO THE EVENT GIVING RISE TO THE LIABILITY, OR ONE HUNDRED DOLLARS ($100) IF NO SUCH PAYMENTS WERE MADE.
                  </p>
                </div>
              </section>

              <section id="governing" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">10. Governing Law</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    These Terms shall be governed and construed in accordance with the laws of the United States and the State of California, without regard to its conflict of law provisions.
                  </p>
                  <p>
                    Any dispute arising out of or relating to these Terms or the Service shall be resolved exclusively in the state or federal courts located in San Francisco County, California, and you consent to the personal jurisdiction of such courts.
                  </p>
                  <p>
                    Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions will remain in effect.
                  </p>
                </div>
              </section>

              <section id="changes" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">11. Changes to Terms</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision is material, we will provide at least 30 days&apos; notice prior to any new terms taking effect.
                  </p>
                  <p>
                    What constitutes a material change will be determined at our sole discretion. You are responsible for reviewing these Terms periodically for changes. Your continued use of the Service following the posting of any changes constitutes acceptance of those changes.
                  </p>
                  <p>
                    If you do not agree to the new terms, you must stop using the Service. We will indicate the effective date of the new terms, and in some cases, we may notify you of changes via email or through a notice on the Service.
                  </p>
                </div>
              </section>

              <section id="contact" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-4 text-white">12. Contact Information</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    If you have any questions about these Terms, please contact us:
                  </p>
                  <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-6 space-y-3">
                    <div>
                      <strong className="text-white">Email:</strong>{' '}
                      <a href="mailto:legal@foragents.dev" className="text-[#06D6A0] hover:underline">
                        legal@foragents.dev
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
                  <p className="text-sm text-foreground/60 mt-8">
                    These Terms of Service were last updated on February 9, 2026.
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
