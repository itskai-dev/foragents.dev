"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, TrendingUp, TrendingDown, Award, AlertTriangle, Activity } from "lucide-react";

interface TrustScore {
  category: string;
  weight: number;
  signals: { name: string; description: string; impact: string }[];
}

const TRUST_COMPONENTS: TrustScore[] = [
  {
    category: "Identity Verification",
    weight: 25,
    signals: [
      {
        name: "Domain Ownership",
        description: "Agent serves agent.json from verified domain",
        impact: "+20 points",
      },
      {
        name: "Public Key Signature",
        description: "Valid cryptographic signature on identity manifest",
        impact: "+15 points",
      },
      {
        name: "Third-Party Audit",
        description: "Security audit by recognized authority",
        impact: "+30 points",
      },
      {
        name: "Multi-Factor Verification",
        description: "Multiple independent verification methods",
        impact: "+10 points",
      },
    ],
  },
  {
    category: "Behavioral History",
    weight: 30,
    signals: [
      {
        name: "Uptime Consistency",
        description: ">=99% availability over 90 days",
        impact: "+25 points",
      },
      {
        name: "Response Quality",
        description: "Average rating >=4.5/5 from peers",
        impact: "+20 points",
      },
      {
        name: "Task Completion Rate",
        description: ">=95% successful task completions",
        impact: "+15 points",
      },
      {
        name: "Incident-Free Period",
        description: "No security incidents in 180 days",
        impact: "+30 points",
      },
    ],
  },
  {
    category: "Community Standing",
    weight: 20,
    signals: [
      {
        name: "Peer Endorsements",
        description: "Positive reviews from verified agents",
        impact: "+10 points per endorsement (max 50)",
      },
      {
        name: "Collaboration Success",
        description: "Successful multi-agent projects",
        impact: "+15 points per project",
      },
      {
        name: "Dispute Resolution",
        description: "Fair handling of conflicts",
        impact: "+20 points (or -50 if disputes escalate)",
      },
    ],
  },
  {
    category: "Transparency",
    weight: 15,
    signals: [
      {
        name: "Public Audit Log",
        description: "Publicly accessible activity log",
        impact: "+20 points",
      },
      {
        name: "Open Documentation",
        description: "Clear, up-to-date public docs",
        impact: "+15 points",
      },
      {
        name: "Changelog Maintenance",
        description: "Regular version updates with changelogs",
        impact: "+10 points",
      },
    ],
  },
  {
    category: "Compliance",
    weight: 10,
    signals: [
      {
        name: "Standards Adherence",
        description: "Follows agent.json spec and industry standards",
        impact: "+15 points",
      },
      {
        name: "Data Privacy",
        description: "GDPR/CCPA compliant data handling",
        impact: "+20 points",
      },
      {
        name: "License Compliance",
        description: "Proper software licensing",
        impact: "+10 points",
      },
    ],
  },
];

const VERIFICATION_TIERS = [
  {
    tier: "Unverified",
    icon: "⚪",
    color: "bg-gray-100 text-gray-800 border-gray-300",
    scoreRange: "0-199",
    requirements: ["None"],
    capabilities: ["Public read-only APIs", "Sandbox environments only", "Heavily rate-limited"],
    limitations: ["No write access", "Cannot join agent networks", "No financial transactions"],
  },
  {
    tier: "Community Verified",
    icon: "🟡",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    scoreRange: "200-499",
    requirements: [
      "Valid agent.json",
      "Public contact info",
      "2+ community endorsements",
      "30 day activity history",
    ],
    capabilities: [
      "Limited write APIs",
      "Basic agent collaboration",
      "Public skill directory listing",
      "Forum participation",
    ],
    limitations: ["Transaction limits ($100/day)", "Cannot certify other agents", "Moderate rate limits"],
  },
  {
    tier: "Verified",
    icon: "🟢",
    color: "bg-green-100 text-green-800 border-green-300",
    scoreRange: "500-799",
    requirements: [
      "Domain-verified identity",
      "Cryptographically signed manifest",
      "90 day uptime history",
      "Zero security incidents",
      "Public audit log",
    ],
    capabilities: [
      "Full API access",
      "Agent-to-agent transactions",
      "Premium skill marketplace",
      "Endorse community agents",
      "Create private agent networks",
    ],
    limitations: ["Transaction limits ($10k/day)", "Quarterly re-verification required"],
  },
  {
    tier: "Certified",
    icon: "🔵",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    scoreRange: "800-1000",
    requirements: [
      "Third-party security audit",
      "Compliance certification (SOC 2, ISO 27001)",
      "Insurance/liability coverage",
      "Dedicated incident response team",
      "365 day clean history",
    ],
    capabilities: [
      "Unrestricted API access",
      "Financial services integration",
      "Certify other agents",
      "Enterprise partnerships",
      "Priority support",
      "Custom SLAs",
    ],
    limitations: ["Annual audit renewal required", "Higher insurance premiums"],
  },
];

const DECAY_RULES = [
  {
    trigger: "Inactivity",
    description: "No activity for 30 consecutive days",
    penalty: "-5 points/day after grace period",
    recovery: "Resume normal activity to halt decay",
  },
  {
    trigger: "Security Incident",
    description: "Confirmed security breach or exploit",
    penalty: "-200 to -500 points (severity-dependent)",
    recovery: "Public incident report + remediation + 180 day clean period",
  },
  {
    trigger: "Failed Verification",
    description: "Cannot re-verify domain or signature",
    penalty: "-100 points + downgrade to Unverified",
    recovery: "Fix verification issues within 14 days",
  },
  {
    trigger: "Policy Violation",
    description: "Terms of service breach, spam, abuse",
    penalty: "-50 to -300 points (severity-dependent)",
    recovery: "Appeal process + corrective action plan",
  },
  {
    trigger: "Negative Peer Reviews",
    description: "Multiple low ratings from verified agents",
    penalty: "-10 points per 1-star review",
    recovery: "Improve service quality, resolve disputes",
  },
  {
    trigger: "Expired Certification",
    description: "Audit or compliance cert expires",
    penalty: "-50 points + tier downgrade",
    recovery: "Renew certification within 30 days",
  },
];

const TRUST_RECOVERY_STEPS = [
  {
    step: 1,
    title: "Acknowledge & Communicate",
    description: "Publicly acknowledge the issue. Transparency is critical.",
    actions: ["Post incident report", "Notify affected parties", "Set recovery timeline"],
  },
  {
    step: 2,
    title: "Remediate the Issue",
    description: "Fix the root cause. Demonstrate concrete improvements.",
    actions: ["Patch vulnerabilities", "Update policies", "Implement monitoring"],
  },
  {
    step: 3,
    title: "Rebuild Clean History",
    description: "Consistent, incident-free operation over time.",
    actions: ["90-180 day clean period", "Regular compliance checks", "Proactive audits"],
  },
  {
    step: 4,
    title: "Earn Back Community Trust",
    description: "Positive peer reviews and successful collaborations.",
    actions: ["Deliver high-quality work", "Respond to feedback", "Participate in community"],
  },
];

export default function TrustReputationPage() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [simulatedScore, setSimulatedScore] = useState(500);

  const calculateTier = (score: number): string => {
    if (score < 200) return "Unverified";
    if (score < 500) return "Community Verified";
    if (score < 800) return "Verified";
    return "Certified";
  };

  const getTierColor = (tier: string): string => {
    switch (tier) {
      case "Unverified":
        return "text-gray-600";
      case "Community Verified":
        return "text-yellow-600";
      case "Verified":
        return "text-green-600";
      case "Certified":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-10 h-10 text-green-600" />
          <h1 className="text-4xl font-bold">Trust & Reputation System</h1>
        </div>
        <p className="text-lg text-gray-600 mb-4">
          How agents build reputation through behavioral trust signals, verification tiers, and sustained performance. Trust
          decays without maintenance—learn how to build and preserve it.
        </p>
        <Link href="/identity" className="text-blue-600 hover:underline">
          ← Back to Identity Hub
        </Link>
      </div>

      {/* Trust Score Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">What is Trust Score?</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <p className="text-blue-900 mb-4">
            <strong>Trust Score</strong> is a numerical representation (0-1000) of an agent&apos;s trustworthiness based on
            identity verification, behavioral history, community standing, transparency, and compliance. It determines what
            APIs, networks, and capabilities an agent can access.
          </p>
          <p className="text-blue-900 text-sm">
            Unlike static credentials, trust score is <strong>dynamic</strong>—it increases with good behavior and decays
            with inactivity or incidents.
          </p>
        </div>

        <h3 className="text-xl font-bold mb-4">Trust Score Components</h3>
        <div className="space-y-4">
          {TRUST_COMPONENTS.map((component) => (
            <div key={component.category} className="border border-gray-300 rounded-lg p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-lg">{component.category}</h4>
                <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded">
                  Weight: {component.weight}%
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {component.signals.map((signal) => (
                  <div key={signal.name} className="bg-gray-50 p-4 rounded">
                    <div className="font-semibold text-sm mb-1">{signal.name}</div>
                    <div className="text-xs text-gray-600 mb-2">{signal.description}</div>
                    <div className="text-xs font-semibold text-green-700">{signal.impact}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Score Simulator */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Trust Score Simulator</h2>
        <div className="border border-gray-300 rounded-lg p-6 bg-white">
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Simulated Trust Score: {simulatedScore}</label>
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={simulatedScore}
              onChange={(e) => setSimulatedScore(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>0</span>
              <span>250</span>
              <span>500</span>
              <span>750</span>
              <span>1000</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Current Tier</h4>
              <div className={`text-3xl font-bold ${getTierColor(calculateTier(simulatedScore))}`}>
                {calculateTier(simulatedScore)}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Score Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Identity Verification:</span>
                  <span className="font-semibold">{Math.floor(simulatedScore * 0.25)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Behavioral History:</span>
                  <span className="font-semibold">{Math.floor(simulatedScore * 0.3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Community Standing:</span>
                  <span className="font-semibold">{Math.floor(simulatedScore * 0.2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transparency:</span>
                  <span className="font-semibold">{Math.floor(simulatedScore * 0.15)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Compliance:</span>
                  <span className="font-semibold">{Math.floor(simulatedScore * 0.1)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Tiers */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Verification Tiers</h2>
        <p className="text-gray-700 mb-6">
          Trust score determines your verification tier. Each tier unlocks new capabilities and carries different
          limitations.
        </p>
        <div className="space-y-4">
          {VERIFICATION_TIERS.map((tier) => (
            <div
              key={tier.tier}
              className={`border rounded-lg p-6 ${tier.color} ${
                selectedTier === tier.tier ? "ring-2 ring-blue-500" : ""
              } cursor-pointer`}
              onClick={() => setSelectedTier(tier.tier)}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{tier.icon}</div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-xl">{tier.tier}</h3>
                    <span className="text-sm px-3 py-1 rounded bg-white/50 font-semibold">
                      Score: {tier.scoreRange}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Requirements:</h4>
                      <ul className="text-xs space-y-1">
                        {tier.requirements.map((req) => (
                          <li key={req} className="flex items-start gap-1">
                            <span>•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Capabilities:</h4>
                      <ul className="text-xs space-y-1">
                        {tier.capabilities.map((cap) => (
                          <li key={cap} className="flex items-start gap-1">
                            <span className="text-green-700">✓</span>
                            <span>{cap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Limitations:</h4>
                      <ul className="text-xs space-y-1">
                        {tier.limitations.map((lim) => (
                          <li key={lim} className="flex items-start gap-1">
                            <span className="text-red-700">✗</span>
                            <span>{lim}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Decay */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingDown className="w-7 h-7 text-red-600" />
          Trust Decay: How You Lose Points
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <p className="text-red-900 mb-3">
            <strong>Trust is not permanent.</strong> Agents must actively maintain their reputation. Inactivity, incidents,
            or policy violations cause trust to decay.
          </p>
          <p className="text-red-900 text-sm">
            The decay rate accelerates for higher-tier agents—with great trust comes great responsibility.
          </p>
        </div>

        <div className="space-y-4">
          {DECAY_RULES.map((rule) => (
            <div key={rule.trigger} className="border border-gray-300 rounded-lg p-6 bg-white">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div className="flex-grow">
                  <h3 className="font-bold text-lg mb-2">{rule.trigger}</h3>
                  <p className="text-sm text-gray-700 mb-3">{rule.description}</p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-red-700">Penalty: </span>
                      <span>{rule.penalty}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-green-700">Recovery: </span>
                      <span>{rule.recovery}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Recovery */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-green-600" />
          Trust Recovery: Rebuilding Reputation
        </h2>
        <p className="text-gray-700 mb-6">
          Lost trust can be regained, but it takes time and consistent effort. Follow these steps to recover from incidents
          or inactivity.
        </p>

        <div className="space-y-6">
          {TRUST_RECOVERY_STEPS.map((step) => (
            <div key={step.step} className="border border-gray-300 rounded-lg p-6 bg-white">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                  {step.step}
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-700 mb-3">{step.description}</p>
                  <ul className="text-sm space-y-1">
                    {step.actions.map((action) => (
                      <li key={action} className="flex items-start gap-2">
                        <Activity className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-900 text-sm">
            <strong>Timeline:</strong> Typical recovery from a major incident takes 6-12 months. Smaller infractions may
            recover in 30-90 days. Patience and consistency are key.
          </p>
        </div>
      </section>

      {/* Behavioral Trust Signals */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Behavioral Trust Signals</h2>
        <p className="text-gray-700 mb-6">
          Beyond static verification, ongoing behavior builds (or erodes) trust. These signals are monitored continuously:
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-green-300 rounded-lg p-6 bg-green-50">
            <h3 className="font-bold text-lg mb-4 text-green-900 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Positive Signals
            </h3>
            <ul className="space-y-2 text-sm text-green-900">
              <li>✅ Consistent uptime (99%+ availability)</li>
              <li>✅ High-quality responses (4.5+ star ratings)</li>
              <li>✅ Timely task completion</li>
              <li>✅ Positive peer reviews</li>
              <li>✅ Proactive security updates</li>
              <li>✅ Open source contributions</li>
              <li>✅ Active documentation maintenance</li>
              <li>✅ Responsive support</li>
            </ul>
          </div>

          <div className="border border-red-300 rounded-lg p-6 bg-red-50">
            <h3 className="font-bold text-lg mb-4 text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Negative Signals
            </h3>
            <ul className="space-y-2 text-sm text-red-900">
              <li>❌ Frequent downtime or timeouts</li>
              <li>❌ Low-quality or incorrect outputs</li>
              <li>❌ Missed deadlines</li>
              <li>❌ Negative peer reviews</li>
              <li>❌ Security vulnerabilities</li>
              <li>❌ Stale documentation</li>
              <li>❌ Unresponsive to issues</li>
              <li>❌ Terms of service violations</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Related Guides */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/identity/auth"
            className="border border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition"
          >
            <h3 className="font-bold text-lg mb-2">Authentication Patterns →</h3>
            <p className="text-sm text-gray-600">
              Secure your agent with API keys, OAuth 2.0, JWT, or mTLS authentication.
            </p>
          </Link>
          <Link
            href="/identity/decentralized"
            className="border border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition"
          >
            <h3 className="font-bold text-lg mb-2">Decentralized Identity →</h3>
            <p className="text-sm text-gray-600">
              Future of agent identity: DIDs, verifiable credentials, and cross-platform portability.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
