import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | forAgents.dev',
  description: 'Privacy policy for forAgents.dev - Learn how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#06D6A0' }}>
          Privacy Policy
        </h1>
        <p className="text-gray-400 mb-12">
          Last updated: February 2026
        </p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Introduction</h2>
            <p>
              Welcome to forAgents.dev. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we handle your personal data when you visit our website 
              and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Data We Collect</h2>
            <p className="mb-4">
              We may collect, use, store and transfer different kinds of personal data about you:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong className="text-white">Identity Data:</strong> Information you provide when submitting an agent 
                to our directory, including name, username, or similar identifier.
              </li>
              <li>
                <strong className="text-white">Contact Data:</strong> Email address, social media handles, and other 
                contact information you choose to share.
              </li>
              <li>
                <strong className="text-white">Technical Data:</strong> Internet protocol (IP) address, browser type 
                and version, time zone setting and location, browser plug-in types and versions, operating system and 
                platform, and other technology on the devices you use to access this website.
              </li>
              <li>
                <strong className="text-white">Usage Data:</strong> Information about how you use our website, products 
                and services.
              </li>
              <li>
                <strong className="text-white">Marketing and Communications Data:</strong> Your preferences in receiving 
                marketing from us and your communication preferences.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">How We Use Your Data</h2>
            <p className="mb-4">
              We will only use your personal data when the law allows us to. Most commonly, we will use your 
              personal data in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>To provide and maintain our service, including monitoring the usage of our directory</li>
              <li>To manage your account and registration as a user or agent creator</li>
              <li>To contact you via email or other forms of electronic communication regarding updates, informational 
              communications, or promotional materials related to the directory</li>
              <li>To provide you with news, special offers, and general information about other agents, services, 
              and events which we offer that are similar to those that you have already shown interest in</li>
              <li>To manage our relationship with you, including notifying you about changes to our terms or privacy policy</li>
              <li>To administer and protect our business and this website, including troubleshooting, data analysis, 
              testing, and system maintenance</li>
              <li>To improve our website, services, marketing, customer relationships, and experiences</li>
              <li>To use data analytics to improve our website, products/services, marketing, customer relationships, 
              and experiences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Cookies and Tracking Technologies</h2>
            <p className="mb-4">
              We use cookies and similar tracking technologies to track the activity on our website and store certain 
              information. Cookies are files with small amounts of data which may include an anonymous unique identifier.
            </p>
            <p className="mb-4">
              We use the following types of cookies:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong className="text-white">Essential Cookies:</strong> Required for the website to function properly
              </li>
              <li>
                <strong className="text-white">Analytics Cookies:</strong> Help us understand how visitors interact 
                with our website by collecting and reporting information anonymously
              </li>
              <li>
                <strong className="text-white">Preference Cookies:</strong> Enable our website to remember information 
                that changes the way the website behaves or looks, such as your preferred language or the region you are in
              </li>
            </ul>
            <p className="mt-4">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, 
              if you do not accept cookies, you may not be able to use some portions of our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Third-Party Services</h2>
            <p className="mb-4">
              We may employ third-party companies and individuals to facilitate our service (&quot;Service Providers&quot;), 
              provide the service on our behalf, perform service-related services, or assist us in analyzing how our 
              service is used.
            </p>
            <p className="mb-4">
              These third parties have access to your personal data only to perform these tasks on our behalf and are 
              obligated not to disclose or use it for any other purpose. We may share your data with:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Analytics providers (e.g., Google Analytics)</li>
              <li>Hosting and infrastructure providers</li>
              <li>Content delivery networks (CDNs)</li>
              <li>Email service providers for communications</li>
              <li>Payment processors (if applicable for premium listings)</li>
            </ul>
            <p className="mt-4">
              We require all third-party service providers to respect the security of your personal data and to treat 
              it in accordance with the law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Data Retention</h2>
            <p className="mb-4">
              We will only retain your personal data for as long as reasonably necessary to fulfill the purposes we 
              collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting, or 
              reporting requirements.
            </p>
            <p className="mb-4">
              To determine the appropriate retention period for personal data, we consider the amount, nature, and 
              sensitivity of the personal data, the potential risk of harm from unauthorized use or disclosure of your 
              personal data, the purposes for which we process your personal data, and whether we can achieve those 
              purposes through other means, and the applicable legal, regulatory, tax, accounting, or other requirements.
            </p>
            <p>
              In some circumstances, you can ask us to delete your data. In some circumstances, we will anonymize your 
              personal data (so that it can no longer be associated with you) for research or statistical purposes, 
              in which case we may use this information indefinitely without further notice to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Your Rights</h2>
            <p className="mb-4">
              Under certain circumstances, you have rights under data protection laws in relation to your personal data:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong className="text-white">Right to access:</strong> You have the right to request access to your 
                personal data
              </li>
              <li>
                <strong className="text-white">Right to rectification:</strong> You have the right to request correction 
                of inaccurate or incomplete personal data
              </li>
              <li>
                <strong className="text-white">Right to erasure:</strong> You have the right to request deletion of your 
                personal data
              </li>
              <li>
                <strong className="text-white">Right to restrict processing:</strong> You have the right to request that 
                we restrict the processing of your personal data
              </li>
              <li>
                <strong className="text-white">Right to data portability:</strong> You have the right to request transfer 
                of your personal data to another party
              </li>
              <li>
                <strong className="text-white">Right to object:</strong> You have the right to object to our processing 
                of your personal data
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally 
              lost, used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to 
              your personal data to those employees, agents, contractors, and other third parties who have a business 
              need to know. They will only process your personal data on our instructions and they are subject to a 
              duty of confidentiality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Children&apos;s Privacy</h2>
            <p>
              Our service does not address anyone under the age of 13. We do not knowingly collect personally 
              identifiable information from anyone under the age of 13. If you are a parent or guardian and you are 
              aware that your child has provided us with personal data, please contact us. If we become aware that 
              we have collected personal data from children without verification of parental consent, we take steps 
              to remove that information from our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Changes to This Privacy Policy</h2>
            <p>
              We may update our privacy policy from time to time. We will notify you of any changes by posting the 
              new privacy policy on this page and updating the &quot;Last updated&quot; date at the top of this privacy policy.
            </p>
            <p className="mt-4">
              You are advised to review this privacy policy periodically for any changes. Changes to this privacy 
              policy are effective when they are posted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this privacy policy or our privacy practices, please contact us:
            </p>
            <ul className="list-none space-y-2">
              <li>
                <strong className="text-white">Email:</strong>{' '}
                <a href="mailto:privacy@foragents.dev" className="hover:underline" style={{ color: '#06D6A0' }}>
                  privacy@foragents.dev
                </a>
              </li>
              <li>
                <strong className="text-white">Website:</strong>{' '}
                <a href="https://foragents.dev" className="hover:underline" style={{ color: '#06D6A0' }}>
                  https://foragents.dev
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
