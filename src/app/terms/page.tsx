import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | forAgents.dev',
  description: 'Terms of service for forAgents.dev - Rules and guidelines for using our AI agent directory.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#06D6A0' }}>
          Terms of Service
        </h1>
        <p className="text-gray-400 mb-12">
          Last updated: February 2026
        </p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Introduction</h2>
            <p>
              Welcome to forAgents.dev. These Terms of Service (&quot;Terms&quot;, &quot;Terms of Service&quot;) govern your 
              use of our website and services. By accessing or using forAgents.dev, you agree to be bound by these 
              Terms. If you disagree with any part of the terms, then you may not access the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using forAgents.dev, you accept and agree to be bound by the terms and provision of 
              this agreement. Additionally, when using our services, you shall be subject to any posted guidelines 
              or rules applicable to such services.
            </p>
            <p className="mb-4">
              If you do not agree to these Terms, please do not use our service. We reserve the right to modify or 
              replace these Terms at any time. If a revision is material, we will try to provide at least 30 days&apos; 
              notice prior to any new terms taking effect. What constitutes a material change will be determined at 
              our sole discretion.
            </p>
            <p>
              Your continued use of the service following the posting of any changes to these Terms constitutes 
              acceptance of those changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Use of Service</h2>
            <p className="mb-4">
              forAgents.dev is a directory platform for discovering and sharing AI agents. When using our service, 
              you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate, current, and complete information about yourself and any agents you submit</li>
              <li>Maintain and promptly update your information to keep it accurate, current, and complete</li>
              <li>Use the service only for lawful purposes and in accordance with these Terms</li>
              <li>Not use the service in any way that could damage, disable, overburden, or impair the service</li>
              <li>Not attempt to gain unauthorized access to any portion of the service or any other systems or 
              networks connected to the service</li>
              <li>Not use any automated system, including robots, spiders, or scrapers, to access the service 
              without our prior written permission</li>
              <li>Not impersonate or attempt to impersonate forAgents.dev, another user, or any other person or entity</li>
              <li>Not engage in any conduct that restricts or inhibits anyone&apos;s use or enjoyment of the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">User Accounts</h2>
            <p className="mb-4">
              When you create an account with us or submit an agent to our directory, you must provide information 
              that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the 
              Terms, which may result in immediate termination of your account or listing.
            </p>
            <p className="mb-4">
              You are responsible for safeguarding any credentials used to access the service and for any activities 
              or actions under your account. You agree not to disclose your credentials to any third party. You must 
              notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
            </p>
            <p>
              We reserve the right to refuse service, terminate accounts, or remove or edit content in our sole 
              discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">User Content</h2>
            <p className="mb-4">
              Our service allows you to submit, post, and share information about AI agents, including descriptions, 
              links, images, and other content (&quot;User Content&quot;). You retain any and all of your rights to any User 
              Content you submit, post, or display on or through the service.
            </p>
            <p className="mb-4">
              By submitting, posting, or displaying User Content on or through the service, you grant us a worldwide, 
              non-exclusive, royalty-free license to use, reproduce, adapt, publish, translate, and distribute your 
              User Content in any existing or future media. This license is for the purpose of operating, promoting, 
              and improving the service.
            </p>
            <p className="mb-4">
              You represent and warrant that:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You own or have the necessary rights and permissions to use and authorize us to use all User Content</li>
              <li>Your User Content does not and will not infringe, violate, or misappropriate any third party&apos;s 
              intellectual property rights, or rights of publicity or privacy</li>
              <li>Your User Content does not contain any material that is defamatory, obscene, indecent, abusive, 
              offensive, harassing, violent, hateful, inflammatory, or otherwise objectionable</li>
              <li>Your User Content does not violate any law or regulation</li>
            </ul>
            <p className="mt-4">
              We reserve the right to remove any User Content that violates these Terms or that we deem inappropriate 
              for any reason, without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Agent Listings</h2>
            <p className="mb-4">
              When submitting an agent to our directory, you agree that:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>All information provided about the agent is accurate and truthful</li>
              <li>You have the right to list the agent on our platform</li>
              <li>The agent does not violate any laws, regulations, or third-party rights</li>
              <li>You will promptly update the listing if any information changes or becomes inaccurate</li>
              <li>You understand that we may feature, categorize, or promote certain agents at our discretion</li>
            </ul>
            <p className="mt-4">
              We reserve the right to reject, remove, or modify any agent listing that we believe violates these 
              Terms, is inaccurate, or is otherwise inappropriate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Intellectual Property</h2>
            <p className="mb-4">
              The service and its original content (excluding User Content), features, and functionality are and will 
              remain the exclusive property of forAgents.dev and its licensors. The service is protected by copyright, 
              trademark, and other laws of both the United States and foreign countries.
            </p>
            <p className="mb-4">
              Our trademarks and trade dress may not be used in connection with any product or service without the 
              prior written consent of forAgents.dev. Nothing in these Terms constitutes a transfer of any intellectual 
              property rights from us to you.
            </p>
            <p>
              You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, 
              republish, download, store, or transmit any of the material on our service, except as incidentally 
              necessary for normal web browsing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Third-Party Links and Services</h2>
            <p className="mb-4">
              Our service may contain links to third-party websites, services, or agents that are not owned or 
              controlled by forAgents.dev. We have no control over, and assume no responsibility for, the content, 
              privacy policies, or practices of any third-party websites, services, or agents.
            </p>
            <p className="mb-4">
              You acknowledge and agree that forAgents.dev shall not be responsible or liable, directly or indirectly, 
              for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance 
              on any such content, goods, or services available on or through any such third-party websites, services, 
              or agents.
            </p>
            <p>
              We strongly advise you to read the terms and conditions and privacy policies of any third-party websites, 
              services, or agents that you visit or interact with.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Disclaimers</h2>
            <p className="mb-4">
              Your use of the service is at your sole risk. The service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; 
              basis. The service is provided without warranties of any kind, whether express or implied, including, 
              but not limited to, implied warranties of merchantability, fitness for a particular purpose, 
              non-infringement, or course of performance.
            </p>
            <p className="mb-4">
              forAgents.dev, its subsidiaries, affiliates, and its licensors do not warrant that:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>The service will function uninterrupted, secure, or available at any particular time or location</li>
              <li>Any errors or defects will be corrected</li>
              <li>The service is free of viruses or other harmful components</li>
              <li>The results of using the service will meet your requirements</li>
              <li>Any agents listed on the service will perform as described or meet your expectations</li>
            </ul>
            <p className="mt-4">
              We do not endorse, warrant, or assume responsibility for any agents, products, or services advertised 
              or offered by third parties through the service or any hyperlinked website. We will not be a party to 
              or in any way be responsible for monitoring any transaction between you and third-party providers of 
              agents, products, or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Limitation of Liability</h2>
            <p className="mb-4">
              In no event shall forAgents.dev, nor its directors, employees, partners, agents, suppliers, or 
              affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, 
              including without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
              resulting from:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your access to or use of or inability to access or use the service</li>
              <li>Any conduct or content of any third party on the service</li>
              <li>Any content obtained from the service</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              <li>Any agents, products, or services obtained through the service</li>
            </ul>
            <p className="mt-4">
              This limitation of liability applies whether the alleged liability is based on contract, tort, 
              negligence, strict liability, or any other basis, even if forAgents.dev has been advised of the 
              possibility of such damage.
            </p>
            <p className="mt-4">
              Some jurisdictions do not allow the exclusion of certain warranties or the limitation or exclusion 
              of liability for incidental or consequential damages. Accordingly, some of the above limitations may 
              not apply to you. In such jurisdictions, our liability will be limited to the greatest extent permitted 
              by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless forAgents.dev and its licensors and licensees, and 
              their employees, contractors, agents, officers, and directors, from and against any and all claims, 
              damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to 
              attorney&apos;s fees), resulting from or arising out of:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Your use and access of the service</li>
              <li>Your violation of any term of these Terms</li>
              <li>Your violation of any third-party right, including without limitation any copyright, property, 
              or privacy right</li>
              <li>Any claim that your User Content caused damage to a third party</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your account and access to the service immediately, without prior notice 
              or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
            <p className="mb-4">
              Upon termination, your right to use the service will immediately cease. If you wish to terminate your 
              account, you may simply discontinue using the service or contact us to request account deletion.
            </p>
            <p>
              All provisions of the Terms which by their nature should survive termination shall survive termination, 
              including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations 
              of liability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the United States, without 
              regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms 
              will not be considered a waiver of those rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Severability</h2>
            <p>
              If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining 
              provisions of these Terms will remain in effect. These Terms constitute the entire agreement between 
              us regarding our service, and supersede and replace any prior agreements we might have between us 
              regarding the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a 
              revision is material, we will try to provide at least 30 days&apos; notice prior to any new terms taking 
              effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            <p>
              By continuing to access or use our service after those revisions become effective, you agree to be 
              bound by the revised terms. If you do not agree to the new terms, please stop using the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <ul className="list-none space-y-2">
              <li>
                <strong className="text-white">Email:</strong>{' '}
                <a href="mailto:legal@foragents.dev" className="hover:underline" style={{ color: '#06D6A0' }}>
                  legal@foragents.dev
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
