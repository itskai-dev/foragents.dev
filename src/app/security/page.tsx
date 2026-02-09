import { Metadata } from 'next';
import { Shield, Lock, Users, Server, FileText, CheckCircle2 } from 'lucide-react';
import { SecurityChecklist } from '@/components/security/security-checklist';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Security Center | forAgents.dev',
  description: 'Security, compliance, and trust information for forAgents.dev - Learn about our data protection, authentication, and infrastructure security measures.',
  openGraph: {
    title: 'Security Center | forAgents.dev',
    description: 'Security, compliance, and trust information for forAgents.dev - Learn about our data protection, authentication, and infrastructure security measures.',
    url: 'https://foragents.dev/security',
    siteName: 'forAgents.dev',
    type: 'website',
  },
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Shield className="w-20 h-20" style={{ color: '#06D6A0' }} />
              <div className="absolute inset-0 bg-[#06D6A0] opacity-20 blur-xl rounded-full" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#06D6A0' }}>
            Security at forAgents.dev
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Trust and security are foundational to our platform. We implement industry-leading practices 
            to protect your data, ensure system reliability, and maintain transparency in how we handle security.
          </p>
        </div>

        {/* Security Sections Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* Data Protection */}
          <Card className="bg-[#0f0f0f] border-white/10 p-6 hover:border-[#06D6A0]/30 transition-colors">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-[#06D6A0]/10 rounded-lg">
                <Lock className="w-6 h-6" style={{ color: '#06D6A0' }} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">Data Protection</h2>
              </div>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-semibold text-white mb-2">Encryption at Rest & Transit</h3>
                <p className="text-sm">
                  All data is encrypted using AES-256 at rest and TLS 1.3 in transit. Database backups 
                  are encrypted and stored in geographically distributed locations.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Data Residency Options</h3>
                <p className="text-sm">
                  Choose where your data is stored with regional deployment options (US, EU, APAC). 
                  Data stays within your selected region for compliance requirements.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Data Retention & Deletion</h3>
                <p className="text-sm">
                  Customizable retention policies with automatic data purging. Request complete data 
                  deletion at any time with cryptographic proof of destruction.
                </p>
              </div>
            </div>
          </Card>

          {/* Authentication */}
          <Card className="bg-[#0f0f0f] border-white/10 p-6 hover:border-[#06D6A0]/30 transition-colors">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-[#06D6A0]/10 rounded-lg">
                <CheckCircle2 className="w-6 h-6" style={{ color: '#06D6A0' }} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">Authentication</h2>
              </div>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-semibold text-white mb-2">API Key Management</h3>
                <p className="text-sm">
                  Scoped API keys with granular permissions. Keys are hashed using bcrypt and never 
                  stored in plaintext. Rate limiting and IP allowlisting available.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">OAuth 2.0 Support</h3>
                <p className="text-sm">
                  Integrate with your existing identity provider. Support for GitHub, Google, and 
                  custom SAML/OIDC providers for enterprise SSO.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Token Rotation & Expiry</h3>
                <p className="text-sm">
                  Automatic token rotation with configurable expiration. Refresh tokens for long-lived 
                  sessions with automatic revocation on suspicious activity.
                </p>
              </div>
            </div>
          </Card>

          {/* Access Control */}
          <Card className="bg-[#0f0f0f] border-white/10 p-6 hover:border-[#06D6A0]/30 transition-colors">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-[#06D6A0]/10 rounded-lg">
                <Users className="w-6 h-6" style={{ color: '#06D6A0' }} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">Access Control</h2>
              </div>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-semibold text-white mb-2">Role-Based Access Control (RBAC)</h3>
                <p className="text-sm">
                  Fine-grained permissions with customizable roles. Principle of least privilege 
                  enforced across all resources with inheritance support.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Team Permissions</h3>
                <p className="text-sm">
                  Organize users into teams with shared permissions. Delegate admin rights, resource 
                  ownership, and collaboration controls at the team level.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Comprehensive Audit Trails</h3>
                <p className="text-sm">
                  Every action logged with immutable audit trails. Real-time alerts for suspicious 
                  activity with full query and export capabilities.
                </p>
              </div>
            </div>
          </Card>

          {/* Infrastructure */}
          <Card className="bg-[#0f0f0f] border-white/10 p-6 hover:border-[#06D6A0]/30 transition-colors">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-[#06D6A0]/10 rounded-lg">
                <Server className="w-6 h-6" style={{ color: '#06D6A0' }} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">Infrastructure Security</h2>
              </div>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  SOC 2 Type II Certified
                  <Badge variant="outline" className="border-[#06D6A0] text-[#06D6A0]">Certified</Badge>
                </h3>
                <p className="text-sm">
                  Annual third-party audits verify our security controls. SOC 2 Type II compliance 
                  ensures ongoing operational excellence and data protection.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">99.9% Uptime SLA</h3>
                <p className="text-sm">
                  Multi-region deployment with automatic failover. Real-time monitoring, health checks, 
                  and incident response with status page transparency.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">DDoS Protection</h3>
                <p className="text-sm">
                  Enterprise-grade DDoS mitigation with intelligent traffic filtering. WAF protection 
                  against OWASP Top 10 vulnerabilities and bot detection.
                </p>
              </div>
            </div>
          </Card>

          {/* Vulnerability Disclosure */}
          <Card className="bg-[#0f0f0f] border-white/10 p-6 hover:border-[#06D6A0]/30 transition-colors">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-[#06D6A0]/10 rounded-lg">
                <FileText className="w-6 h-6" style={{ color: '#06D6A0' }} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">Vulnerability Disclosure</h2>
              </div>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-semibold text-white mb-2">Responsible Disclosure Policy</h3>
                <p className="text-sm">
                  We welcome security researchers to report vulnerabilities. Safe harbor protections 
                  for good-faith research with coordinated disclosure timelines.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Security Contact</h3>
                <p className="text-sm">
                  Report vulnerabilities to{' '}
                  <a href="mailto:security@foragents.dev" className="hover:underline" style={{ color: '#06D6A0' }}>
                    security@foragents.dev
                  </a>
                  {' '}with PGP encryption available. Typical response time: &lt;24 hours.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Bug Bounty Program</h3>
                <p className="text-sm">
                  Rewards for qualifying vulnerabilities starting at $100 USD. Critical findings 
                  eligible for up to $10,000. Public acknowledgment with researcher consent.
                </p>
              </div>
            </div>
          </Card>

          {/* Compliance */}
          <Card className="bg-[#0f0f0f] border-white/10 p-6 hover:border-[#06D6A0]/30 transition-colors">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-[#06D6A0]/10 rounded-lg">
                <Shield className="w-6 h-6" style={{ color: '#06D6A0' }} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">Compliance & Certifications</h2>
              </div>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  GDPR Compliant
                  <Badge variant="outline" className="border-[#06D6A0] text-[#06D6A0]">Compliant</Badge>
                </h3>
                <p className="text-sm">
                  Full compliance with EU General Data Protection Regulation. Data subject rights 
                  portal, consent management, and appointed Data Protection Officer (DPO).
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  SOC 2 Type II
                  <Badge variant="outline" className="border-[#06D6A0] text-[#06D6A0]">Certified</Badge>
                </h3>
                <p className="text-sm">
                  Independent validation of security, availability, processing integrity, 
                  confidentiality, and privacy controls. Reports available under NDA.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  HIPAA Ready
                  <Badge variant="outline" className="border-[#06D6A0] text-[#06D6A0]">Available</Badge>
                </h3>
                <p className="text-sm">
                  Business Associate Agreements (BAA) available for healthcare customers. 
                  PHI encryption, audit logging, and compliance controls for regulated industries.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Security Checklist */}
        <div className="mb-16">
          <SecurityChecklist />
        </div>

        {/* Report Vulnerability CTA */}
        <div className="text-center">
          <Card className="bg-[#0f0f0f] border-white/10 p-8 inline-block">
            <h2 className="text-2xl font-semibold mb-4">Found a Security Issue?</h2>
            <p className="text-gray-400 mb-6 max-w-2xl">
              We take security seriously and appreciate responsible disclosure. Report vulnerabilities 
              directly to our security team for prompt investigation and resolution.
            </p>
            <Link href="mailto:security@foragents.dev">
              <Button 
                className="text-white font-semibold px-8 py-6 text-lg"
                style={{ backgroundColor: '#06D6A0' }}
              >
                Report a Vulnerability
              </Button>
            </Link>
          </Card>
        </div>

        {/* Last Updated */}
        <div className="text-center text-gray-500 text-sm mt-12">
          Last updated: February 9, 2026
        </div>
      </div>
    </div>
  );
}
