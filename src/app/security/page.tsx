"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, FileCheck, Award, AlertTriangle } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[300px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#06D6A0]/10 mb-6">
            <Shield className="w-8 h-8 text-[#06D6A0]" />
          </div>
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Security & Trust
          </h1>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Building a secure, transparent ecosystem for AI agent skills
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative max-w-5xl mx-auto px-4 py-12 space-y-12">
        {/* Security Overview */}
        <Card className="bg-[#0f0f0f] border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#06D6A0]/10">
                <Lock className="w-6 h-6 text-[#06D6A0]" />
              </div>
              <CardTitle className="text-2xl">Security Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-foreground/80 leading-relaxed">
            <p>
              At forAgents.dev, security isn&apos;t an afterthought—it&apos;s foundational. 
              We&apos;re building a trusted marketplace where developers can share AI agent skills 
              with confidence, and users can adopt them safely. Every skill undergoes verification, 
              our platform is built on open-source transparency, and we maintain strict data 
              protection standards to ensure your privacy and security come first.
            </p>
          </CardContent>
        </Card>

        {/* How We Verify Skills */}
        <Card className="bg-[#0f0f0f] border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#06D6A0]/10">
                <Eye className="w-6 h-6 text-[#06D6A0]" />
              </div>
              <CardTitle className="text-2xl">How We Verify Skills</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#06D6A0]/10 flex items-center justify-center text-[#06D6A0] font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Code Review</h3>
                  <p className="text-foreground/80">
                    Every submitted skill goes through a thorough code review process. 
                    Our team examines the source code for malicious patterns, security 
                    vulnerabilities, and adherence to best practices. We verify that 
                    skills do what they claim and nothing more.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#06D6A0]/10 flex items-center justify-center text-[#06D6A0] font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Automated Testing</h3>
                  <p className="text-foreground/80">
                    We run automated security scans and functional tests on all skills. 
                    This includes dependency analysis, permission audits, and behavior 
                    validation in isolated environments. Skills must pass all tests 
                    before approval.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#06D6A0]/10 flex items-center justify-center text-[#06D6A0] font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Community Oversight</h3>
                  <p className="text-foreground/80">
                    Once published, skills are monitored through community feedback, 
                    usage analytics, and regular re-verification. Users can report 
                    concerns, and verified developers earn trust badges that signal 
                    reliability to the community.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card className="bg-[#0f0f0f] border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#06D6A0]/10">
                <FileCheck className="w-6 h-6 text-[#06D6A0]" />
              </div>
              <CardTitle className="text-2xl">Data Protection</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="text-[#06D6A0]">🔒</span> End-to-End Encryption
              </h3>
              <p className="text-foreground/80">
                All data transmitted through forAgents.dev is encrypted using 
                industry-standard TLS 1.3. API keys and sensitive credentials 
                are encrypted at rest and never exposed in logs or error messages.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="text-[#06D6A0]">🙈</span> No PII Collection
              </h3>
              <p className="text-foreground/80">
                We don&apos;t collect personally identifiable information beyond 
                what&apos;s necessary for account management. Skills operate in 
                sandboxed environments and cannot access user data without explicit 
                permission grants.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span className="text-[#06D6A0]">📂</span> Open Source Transparency
              </h3>
              <p className="text-foreground/80">
                Our platform is open source, allowing independent security audits 
                and community scrutiny. You can review our code, submit security 
                patches, and verify our security claims yourself on{" "}
                <a
                  href="https://github.com/reflectt/foragents.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#06D6A0] hover:underline"
                >
                  GitHub
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Responsible Disclosure */}
        <Card className="bg-[#0f0f0f] border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#06D6A0]/10">
                <AlertTriangle className="w-6 h-6 text-[#06D6A0]" />
              </div>
              <CardTitle className="text-2xl">Responsible Disclosure</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground/80">
              We welcome security researchers and ethical hackers to help us 
              maintain the highest security standards. If you discover a 
              vulnerability, please report it responsibly.
            </p>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-semibold">How to Report</h3>
              <ul className="space-y-2 text-foreground/80">
                <li className="flex items-start gap-2">
                  <span className="text-[#06D6A0] font-bold">•</span>
                  <span>
                    Email security reports to{" "}
                    <a
                      href="mailto:security@foragents.dev"
                      className="text-[#06D6A0] hover:underline"
                    >
                      security@foragents.dev
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#06D6A0] font-bold">•</span>
                  <span>
                    Include detailed steps to reproduce the vulnerability
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#06D6A0] font-bold">•</span>
                  <span>
                    Allow us 90 days to address the issue before public disclosure
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#06D6A0] font-bold">•</span>
                  <span>
                    We&apos;ll acknowledge receipt within 48 hours and provide 
                    updates on remediation
                  </span>
                </li>
              </ul>
            </div>

            <p className="text-sm text-foreground/60">
              We do not currently offer a bug bounty program, but we recognize 
              and credit responsible disclosure in our security acknowledgments.
            </p>
          </CardContent>
        </Card>

        {/* Trust Badges */}
        <Card className="bg-[#0f0f0f] border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#06D6A0]/10">
                <Award className="w-6 h-6 text-[#06D6A0]" />
              </div>
              <CardTitle className="text-2xl">Trust Badges</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-[#0a0a0a] border border-white/5 rounded-lg">
                <div className="text-4xl mb-3">🛡️</div>
                <h3 className="font-semibold mb-2">SOC 2 Ready</h3>
                <p className="text-sm text-foreground/70">
                  Built with SOC 2 compliance standards in mind for enterprise 
                  trust
                </p>
              </div>

              <div className="text-center p-6 bg-[#0a0a0a] border border-white/5 rounded-lg">
                <div className="text-4xl mb-3">🔐</div>
                <h3 className="font-semibold mb-2">GDPR Aware</h3>
                <p className="text-sm text-foreground/70">
                  Privacy-first design respecting user data rights and 
                  regulations
                </p>
              </div>

              <div className="text-center p-6 bg-[#0a0a0a] border border-white/5 rounded-lg">
                <div className="text-4xl mb-3">👁️</div>
                <h3 className="font-semibold mb-2">Open Source Audit</h3>
                <p className="text-sm text-foreground/70">
                  Transparent codebase available for community security review
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

    </div>
  );
}
