"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  Users, 
  FileText, 
  Clock, 
  Headphones, 
  Package,
  CheckCircle2,
  ArrowRight,
  Building2
} from "lucide-react";

export default function EnterprisePage() {
  const features = [
    {
      icon: Shield,
      title: "SSO/SAML",
      description: "Seamless single sign-on integration with your existing identity provider. Support for SAML 2.0, OAuth 2.0, and OIDC protocols."
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Granular permission controls and role hierarchies. Assign skills and capabilities based on team roles and responsibilities."
    },
    {
      icon: FileText,
      title: "Audit Logs",
      description: "Comprehensive activity tracking and compliance reporting. Monitor all agent actions, skill usage, and system events in real-time."
    },
    {
      icon: Clock,
      title: "Custom SLAs",
      description: "Guaranteed uptime and response times tailored to your needs. Priority support with committed resolution timelines."
    },
    {
      icon: Headphones,
      title: "Dedicated Support",
      description: "Direct access to our engineering team. Dedicated Slack channel, regular check-ins, and personalized onboarding assistance."
    },
    {
      icon: Package,
      title: "Private Registry",
      description: "Host proprietary skills in your own secure registry. Air-gapped deployments and self-hosted options available."
    }
  ];

  const complianceBadges = [
    { name: "SOC 2 Type II", icon: "🛡️" },
    { name: "GDPR Compliant", icon: "🇪🇺" },
    { name: "HIPAA Ready", icon: "🏥" },
    { name: "ISO 27001", icon: "🔐" }
  ];

  const trustedByCompanies = [
    "Acme Corp",
    "TechFlow Industries",
    "DataSync Solutions",
    "CloudVault Systems",
    "NexGen Analytics",
    "Quantum Dynamics"
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#06D6A0]/10 mb-6">
            <Building2 className="w-8 h-8 text-[#06D6A0]" />
          </div>
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Enterprise-Grade AI Agents
          </h1>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto mb-8">
            Scale your organization with secure, compliant, and customizable agent infrastructure
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact?subject=enterprise-demo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#06D6A0] text-black font-semibold rounded-lg hover:bg-[#06D6A0]/90 transition-colors"
            >
              Request Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact?subject=enterprise-sales"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-white font-semibold rounded-lg hover:bg-white/5 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Enterprise Features Grid */}
      <section className="relative max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise Features</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Everything you need to deploy AI agents at scale with confidence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="bg-[#0f0f0f] border-white/10 hover:border-[#06D6A0]/30 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-[#06D6A0]/10">
                      <Icon className="w-6 h-6 text-[#06D6A0]" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="relative max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted By</h2>
          <p className="text-lg text-foreground/70">
            Leading organizations building with forAgents.dev
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {trustedByCompanies.map((company) => (
            <div
              key={company}
              className="flex items-center justify-center p-6 bg-[#0f0f0f] border border-white/10 rounded-lg hover:border-[#06D6A0]/30 transition-colors"
            >
              <div className="text-center">
                <div className="text-4xl mb-2 opacity-30">🏢</div>
                <p className="text-sm font-semibold text-foreground/70">{company}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Compliance Section */}
      <section className="relative max-w-7xl mx-auto px-4 py-16">
        <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Security & Compliance</h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Built to meet the highest standards of security and regulatory compliance
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {complianceBadges.map((badge) => (
              <div
                key={badge.name}
                className="flex flex-col items-center justify-center p-6 bg-[#0a0a0a] border border-white/5 rounded-lg"
              >
                <div className="text-5xl mb-3">{badge.icon}</div>
                <p className="text-sm font-semibold text-center">{badge.name}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#06D6A0] flex-shrink-0 mt-0.5" />
              <p className="text-foreground/70">
                <span className="font-semibold text-foreground">End-to-end encryption</span> for all data in transit and at rest
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#06D6A0] flex-shrink-0 mt-0.5" />
              <p className="text-foreground/70">
                <span className="font-semibold text-foreground">SOC 2 Type II certified</span> infrastructure and processes
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#06D6A0] flex-shrink-0 mt-0.5" />
              <p className="text-foreground/70">
                <span className="font-semibold text-foreground">GDPR and CCPA compliant</span> data handling and user rights
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#06D6A0] flex-shrink-0 mt-0.5" />
              <p className="text-foreground/70">
                <span className="font-semibold text-foreground">Regular security audits</span> and penetration testing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Solutions CTA */}
      <section className="relative max-w-7xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#06D6A0]/10 to-[#06D6A0]/5 border border-[#06D6A0]/20 rounded-2xl p-8 md:p-12 text-center">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[100px]" />
          </div>
          
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Need a Custom Solution?
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto mb-8">
              We offer tailored deployments, custom skill development, and dedicated infrastructure 
              for organizations with unique requirements. Let&apos;s discuss how we can help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact?subject=custom-enterprise"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#06D6A0] text-black font-semibold rounded-lg hover:bg-[#06D6A0]/90 transition-colors"
              >
                Talk to an Expert
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/security"
                className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold hover:text-[#06D6A0] transition-colors"
              >
                View Security Details
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
