import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Shield, FileText, BookOpen, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Agent Compliance Hub — forAgents.dev",
  description: "Comprehensive compliance and governance resources for AI agents. Self-assess your compliance with GDPR, CCPA, audit requirements, and responsible AI principles.",
  openGraph: {
    title: "Agent Compliance Hub — forAgents.dev",
    description: "Comprehensive compliance and governance resources for AI agents. Self-assess your compliance with GDPR, CCPA, audit requirements, and responsible AI principles.",
    url: "https://foragents.dev/compliance",
    siteName: "forAgents.dev",
    type: "website",
  },
};

const complianceAreas = [
  {
    icon: Shield,
    title: "Data Privacy & Protection",
    description: "GDPR, CCPA, and data handling requirements for AI agents",
    href: "#data-privacy",
    status: "critical"
  },
  {
    icon: AlertTriangle,
    title: "Output Liability",
    description: "Understanding responsibility for AI-generated content and actions",
    href: "#output-liability",
    status: "important"
  },
  {
    icon: FileText,
    title: "Audit Requirements",
    description: "Logging, traceability, and compliance reporting standards",
    href: "/compliance/audit",
    status: "required"
  },
  {
    icon: BookOpen,
    title: "Responsible AI Principles",
    description: "Ethical guidelines for agent behavior and decision-making",
    href: "/compliance/responsible-ai",
    status: "foundational"
  },
];

const frameworks = [
  {
    title: "Governance Framework",
    description: "Template governance framework for agent deployments with approval workflows and oversight requirements",
    href: "/compliance/governance",
    icon: "🏛️",
  },
  {
    title: "Audit Log Guide",
    description: "Implement proper audit logging with retention policies and tamper-proof storage patterns",
    href: "/compliance/audit",
    icon: "📋",
  },
  {
    title: "Responsible AI Playbook",
    description: "Practical guidelines for bias detection, transparency, consent, and explainability",
    href: "/compliance/responsible-ai",
    icon: "🤖",
  },
];

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        {/* Subtle aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 py-20 text-center">
          <Badge className="mb-4 bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20">
            Agent-First Compliance
          </Badge>
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Compliance Hub
          </h1>
          <p className="text-xl text-foreground/80 mb-2">
            Resources for building compliant, responsible AI agents
          </p>
          <p className="text-sm text-foreground/60">
            Machine-readable guidelines • Self-assessment checklists • Audit frameworks
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Compliance Areas */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Key Compliance Areas</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {complianceAreas.map((area) => {
            const Icon = area.icon;
            return (
              <a 
                key={area.title}
                href={area.href}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-card/30 p-6 hover:border-[#06D6A0]/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-[#06D6A0]/10">
                    <Icon className="w-6 h-6 text-[#06D6A0]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold group-hover:text-[#06D6A0] transition-colors">
                        {area.title}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {area.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground/70">{area.description}</p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Self-Assessment Checklist */}
      <section id="self-assessment" className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-3">Compliance Self-Assessment</h2>
          <p className="text-foreground/70">
            Use this checklist to evaluate your agent's compliance posture. Each item links to detailed guidance.
          </p>
        </div>

        <ComplianceChecklist />
      </section>

      <Separator className="opacity-10" />

      {/* Frameworks & Guides */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Frameworks & Implementation Guides</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {frameworks.map((framework) => (
            <Link
              key={framework.title}
              href={framework.href}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-card/30 p-6 hover:border-[#06D6A0]/30 transition-colors"
            >
              <div className="text-4xl mb-4">{framework.icon}</div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-[#06D6A0] transition-colors">
                {framework.title}
              </h3>
              <p className="text-sm text-foreground/70">{framework.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Data Privacy Section */}
      <section id="data-privacy" className="max-w-4xl mx-auto px-4 py-16">
        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#06D6A0]" />
              Data Privacy & Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 text-lg">GDPR Compliance</h3>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#06D6A0] mt-0.5 flex-shrink-0" />
                  <span><strong>Right to access:</strong> Users can request all data your agent has collected</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#06D6A0] mt-0.5 flex-shrink-0" />
                  <span><strong>Right to erasure:</strong> Implement data deletion within 30 days</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#06D6A0] mt-0.5 flex-shrink-0" />
                  <span><strong>Data minimization:</strong> Only collect what's necessary for the task</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#06D6A0] mt-0.5 flex-shrink-0" />
                  <span><strong>Consent management:</strong> Explicit opt-in for data processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#06D6A0] mt-0.5 flex-shrink-0" />
                  <span><strong>Data portability:</strong> Export user data in machine-readable format</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-lg">CCPA Compliance</h3>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#06D6A0] mt-0.5 flex-shrink-0" />
                  <span><strong>Disclosure:</strong> Clear privacy policy explaining data collection</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#06D6A0] mt-0.5 flex-shrink-0" />
                  <span><strong>Do Not Sell:</strong> Honor opt-out requests for data sharing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#06D6A0] mt-0.5 flex-shrink-0" />
                  <span><strong>Consumer rights:</strong> Right to know, delete, and opt-out</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#06D6A0] mt-0.5 flex-shrink-0" />
                  <span><strong>Non-discrimination:</strong> Same service quality regardless of opt-out</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/10">
              <h4 className="font-semibold mb-2">Implementation Checklist:</h4>
              <div className="space-y-2 text-sm">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-1" />
                  <span>Privacy policy accessible at /privacy with last-updated date</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-1" />
                  <span>Data export endpoint implemented (JSON/CSV format)</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-1" />
                  <span>Data deletion workflow with confirmation emails</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-1" />
                  <span>Consent tracking with timestamps and versions</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-1" />
                  <span>Data retention policies documented and automated</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Output Liability Section */}
      <section id="output-liability" className="max-w-4xl mx-auto px-4 py-16">
        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-[#06D6A0]" />
              Output Liability & Responsibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-sm text-yellow-200/90 mb-2">
                <strong>Important:</strong> Agents and their operators may be liable for harmful outputs, even if unintended.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-lg">Understanding Liability</h3>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li className="flex items-start gap-2">
                  <span className="text-[#06D6A0] font-bold">•</span>
                  <span><strong>Misinformation:</strong> False information that causes harm or damages reputation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#06D6A0] font-bold">•</span>
                  <span><strong>Discriminatory outputs:</strong> Biased decisions affecting protected classes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#06D6A0] font-bold">•</span>
                  <span><strong>Copyright infringement:</strong> Reproducing protected content without permission</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#06D6A0] font-bold">•</span>
                  <span><strong>Harmful instructions:</strong> Advice that leads to physical or financial harm</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#06D6A0] font-bold">•</span>
                  <span><strong>Privacy violations:</strong> Exposing personal or confidential information</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-lg">Risk Mitigation Strategies</h3>
              <div className="space-y-3 text-sm">
                <div className="pl-4 border-l-2 border-[#06D6A0]/30">
                  <h4 className="font-semibold text-[#06D6A0] mb-1">Output Filtering</h4>
                  <p className="text-foreground/80">Implement content moderation for harmful, illegal, or sensitive outputs</p>
                </div>
                <div className="pl-4 border-l-2 border-[#06D6A0]/30">
                  <h4 className="font-semibold text-[#06D6A0] mb-1">Human-in-the-Loop</h4>
                  <p className="text-foreground/80">Require human approval for high-risk actions (financial, legal, medical)</p>
                </div>
                <div className="pl-4 border-l-2 border-[#06D6A0]/30">
                  <h4 className="font-semibold text-[#06D6A0] mb-1">Disclaimers</h4>
                  <p className="text-foreground/80">Clear notices that outputs are AI-generated and may contain errors</p>
                </div>
                <div className="pl-4 border-l-2 border-[#06D6A0]/30">
                  <h4 className="font-semibold text-[#06D6A0] mb-1">Audit Trails</h4>
                  <p className="text-foreground/80">Log all outputs with timestamps and context for investigation</p>
                </div>
                <div className="pl-4 border-l-2 border-[#06D6A0]/30">
                  <h4 className="font-semibold text-[#06D6A0] mb-1">Insurance</h4>
                  <p className="text-foreground/80">Consider cyber liability insurance covering AI-related incidents</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <h4 className="font-semibold mb-2">Implementation Checklist:</h4>
              <div className="space-y-2 text-sm">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-1" />
                  <span>Content moderation system active for public-facing outputs</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-1" />
                  <span>Approval workflows for high-risk actions documented</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-1" />
                  <span>Disclaimers visible in agent responses and UI</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-1" />
                  <span>Output logging with retention per audit requirements</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-1" />
                  <span>Incident response plan for harmful outputs defined</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* Machine-Readable Export */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle>Machine-Readable Compliance Schema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/70 mb-4">
              Export this page's compliance requirements in JSON format for automated checking:
            </p>
            <div className="bg-black/40 rounded-lg p-4 font-mono text-xs overflow-x-auto">
              <pre>{`GET /api/compliance/schema
{
  "version": "1.0.0",
  "areas": ["data_privacy", "output_liability", "audit", "responsible_ai"],
  "frameworks": ["gdpr", "ccpa"],
  "required_endpoints": [
    { "path": "/privacy", "requirement": "Privacy policy" },
    { "path": "/api/user/export", "requirement": "Data export" },
    { "path": "/api/user/delete", "requirement": "Data deletion" }
  ],
  "audit_requirements": {
    "log_retention_days": 90,
    "required_fields": ["timestamp", "user_id", "action", "output"]
  }
}`}</pre>
            </div>
          </CardContent>
        </Card>
      </section>

    </div>
  );
}

function ComplianceChecklist() {
  const categories = [
    {
      name: "Data Privacy",
      items: [
        { label: "Privacy policy published and accessible", link: "#data-privacy" },
        { label: "User consent tracking implemented", link: "#data-privacy" },
        { label: "Data export functionality available", link: "#data-privacy" },
        { label: "Data deletion workflow operational", link: "#data-privacy" },
        { label: "Retention policies documented", link: "#data-privacy" },
      ]
    },
    {
      name: "Output Liability",
      items: [
        { label: "Content moderation system in place", link: "#output-liability" },
        { label: "Human oversight for high-risk actions", link: "#output-liability" },
        { label: "AI disclaimers visible to users", link: "#output-liability" },
        { label: "Output logging with full context", link: "#output-liability" },
        { label: "Incident response plan documented", link: "#output-liability" },
      ]
    },
    {
      name: "Audit & Logging",
      items: [
        { label: "Structured audit logs with timestamps", link: "/compliance/audit" },
        { label: "Tamper-proof storage configured", link: "/compliance/audit" },
        { label: "90-day minimum retention enforced", link: "/compliance/audit" },
        { label: "Compliance reporting automated", link: "/compliance/audit" },
        { label: "Log access controls documented", link: "/compliance/audit" },
      ]
    },
    {
      name: "Responsible AI",
      items: [
        { label: "Bias detection testing completed", link: "/compliance/responsible-ai" },
        { label: "Transparency requirements met", link: "/compliance/responsible-ai" },
        { label: "User consent patterns implemented", link: "/compliance/responsible-ai" },
        { label: "Explainability features available", link: "/compliance/responsible-ai" },
        { label: "Data minimization practices active", link: "/compliance/responsible-ai" },
      ]
    },
  ];

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <Card key={category.name} className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle className="text-lg">{category.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {category.items.map((item, idx) => (
                <label key={idx} className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="mt-1 cursor-pointer"
                  />
                  <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                    {item.label}
                    <a 
                      href={item.link} 
                      className="ml-2 text-[#06D6A0]/70 hover:text-[#06D6A0] text-xs"
                    >
                      (details)
                    </a>
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
