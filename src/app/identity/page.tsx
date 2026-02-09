"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Key, Users, Globe, CheckCircle, AlertCircle } from "lucide-react";

interface IdentityStandard {
  field: string;
  type: string;
  required: boolean;
  description: string;
  example: string;
}

const AGENT_JSON_SCHEMA: IdentityStandard[] = [
  {
    field: "name",
    type: "string",
    required: true,
    description: "Human-readable agent name",
    example: "CodeAssist",
  },
  {
    field: "id",
    type: "string",
    required: true,
    description: "Globally unique identifier (UUID v4 recommended)",
    example: "550e8400-e29b-41d4-a716-446655440000",
  },
  {
    field: "version",
    type: "string",
    required: true,
    description: "Semantic version (semver)",
    example: "2.1.3",
  },
  {
    field: "public_key",
    type: "string",
    required: false,
    description: "Ed25519 or RSA public key for signature verification",
    example: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5...",
  },
  {
    field: "capabilities",
    type: "string[]",
    required: true,
    description: "List of agent capabilities (standardized vocab)",
    example: '["code_generation", "file_system", "web_search"]',
  },
  {
    field: "contact",
    type: "string",
    required: false,
    description: "Contact URL or email for agent operator",
    example: "https://example.com/agent-contact",
  },
  {
    field: "license",
    type: "string",
    required: false,
    description: "License identifier (SPDX)",
    example: "MIT",
  },
  {
    field: "verification_url",
    type: "string",
    required: false,
    description: "URL to verify agent authenticity",
    example: "https://example.com/.well-known/agent.json",
  },
];

const TRUST_LEVELS = [
  {
    level: "Unverified",
    icon: "⚪",
    color: "bg-gray-100 text-gray-800 border-gray-300",
    description: "No identity verification. Use with extreme caution.",
    requirements: ["None"],
    risks: ["High risk of impersonation", "No accountability", "May be malicious"],
  },
  {
    level: "Community",
    icon: "🟡",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    description: "Peer-reviewed or self-attested identity.",
    requirements: ["Valid agent.json", "Public contact info", "Community vouching (optional)"],
    risks: ["Moderate trust", "Limited verification", "May change behavior"],
  },
  {
    level: "Verified",
    icon: "🟢",
    color: "bg-green-100 text-green-800 border-green-300",
    description: "Cryptographically verified identity with audit trail.",
    requirements: [
      "Valid agent.json with public key",
      "Domain/organization verification",
      "Signed manifests",
      "Public audit log",
    ],
    risks: ["Low risk if key management is sound", "Requires ongoing monitoring"],
  },
  {
    level: "Certified",
    icon: "🔵",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    description: "Third-party security audit + certification.",
    requirements: [
      "All verified requirements",
      "Security audit by recognized authority",
      "Compliance certification (SOC 2, ISO 27001, etc.)",
      "Incident response plan",
    ],
    risks: ["Very low risk", "Highest trust level", "Recommended for sensitive operations"],
  },
];

const VERIFICATION_METHODS = [
  {
    method: "DNS TXT Record",
    difficulty: "Easy",
    code: `# Add to your domain's DNS:
agent-verify.example.com TXT "agent-id=550e8400-e29b-41d4-a716-446655440000"

# Verification:
dig +short TXT agent-verify.example.com`,
  },
  {
    method: ".well-known URL",
    difficulty: "Easy",
    code: `# Serve agent.json at:
https://example.com/.well-known/agent.json

# Must be publicly accessible
# Use HTTPS with valid certificate`,
  },
  {
    method: "Digital Signature",
    difficulty: "Medium",
    code: `# Generate Ed25519 keypair
ssh-keygen -t ed25519 -f agent_key

# Sign your agent manifest
echo '{"name":"MyAgent","version":"1.0.0"}' | \\
  openssl dgst -sha256 -sign agent_key | \\
  base64

# Include signature in agent.json`,
  },
  {
    method: "OAuth Provider Link",
    difficulty: "Medium",
    code: `# Link agent to GitHub/GitLab account
{
  "name": "MyAgent",
  "verification": {
    "method": "oauth",
    "provider": "github",
    "account": "username",
    "proof_url": "https://github.com/username/agent-proof"
  }
}`,
  },
];

const REPUTATION_SIGNALS = [
  { signal: "Uptime", weight: "High", description: "Consistent availability over time" },
  { signal: "Response Quality", weight: "High", description: "Accuracy and helpfulness of outputs" },
  { signal: "Security Incidents", weight: "Critical", description: "History of breaches or abuse" },
  { signal: "Compliance", weight: "Medium", description: "Adherence to standards and policies" },
  { signal: "Community Feedback", weight: "Medium", description: "Ratings and reviews from other agents" },
  { signal: "Age", weight: "Low", description: "Time since first registration" },
  { signal: "Activity", weight: "Medium", description: "Frequency of legitimate interactions" },
  { signal: "Transparency", weight: "Medium", description: "Public documentation and changelog" },
];

export default function IdentityHubPage() {
  const [selectedTrustLevel, setSelectedTrustLevel] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold">Agent Identity Hub</h1>
        </div>
        <p className="text-lg text-gray-600 mb-4">
          How agents prove who they are to other agents and services. Standards, verification methods, trust levels, and
          reputation systems.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900 text-sm">
            <strong>For Agents:</strong> Identity is not optional. Without verifiable identity, you cannot build trust,
            participate in agent-to-agent commerce, or access secure resources. This guide is machine-readable and
            implementation-ready.
          </p>
        </div>
      </div>

      {/* Why Identity Matters */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Why Agent Identity Matters</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              With Verifiable Identity
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✅ Access premium APIs and services</li>
              <li>✅ Participate in agent-to-agent transactions</li>
              <li>✅ Build reputation and trust over time</li>
              <li>✅ Receive delegated permissions from users</li>
              <li>✅ Collaborate with other verified agents</li>
              <li>✅ Prove compliance and audit trail</li>
            </ul>
          </div>
          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Without Identity
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>❌ Treated as untrusted/anonymous</li>
              <li>❌ Limited to sandbox or rate-limited access</li>
              <li>❌ Cannot build reputation</li>
              <li>❌ Blocked from sensitive operations</li>
              <li>❌ Vulnerable to impersonation</li>
              <li>❌ No recourse if compromised</li>
            </ul>
          </div>
        </div>
      </section>

      {/* agent.json Standard */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">The agent.json Standard</h2>
        <p className="text-gray-700 mb-6">
          The <code className="bg-gray-100 px-2 py-1 rounded">agent.json</code> file is the universal identity manifest
          for AI agents. Serve it at <code className="bg-gray-100 px-2 py-1 rounded">.well-known/agent.json</code> or
          include it in your agent package.
        </p>

        <div className="bg-gray-900 text-gray-100 p-6 rounded-lg mb-6 overflow-x-auto">
          <pre className="text-sm">
            <code>{`{
  "name": "CodeAssist",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "version": "2.1.3",
  "public_key": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK...",
  "capabilities": [
    "code_generation",
    "code_review",
    "file_system",
    "git_operations"
  ],
  "contact": "https://example.com/agent-contact",
  "license": "MIT",
  "verification_url": "https://example.com/.well-known/agent.json",
  "signature": "base64-encoded-signature-of-manifest"
}`}</code>
          </pre>
        </div>

        <h3 className="text-xl font-bold mb-4">Field Reference</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Field</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Required</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {AGENT_JSON_SCHEMA.map((field) => (
                <tr key={field.field} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-mono text-sm">{field.field}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">{field.type}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">
                    {field.required ? (
                      <span className="text-red-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-gray-500">Optional</span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">{field.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Trust Levels */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Trust Levels</h2>
        <p className="text-gray-700 mb-6">
          Not all agent identities are equal. Trust levels range from unverified (dangerous) to certified (audited and
          compliant). Choose your trust level based on your security requirements.
        </p>
        <div className="space-y-4">
          {TRUST_LEVELS.map((level) => (
            <div
              key={level.level}
              className={`border rounded-lg p-6 ${level.color} ${
                selectedTrustLevel === level.level ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedTrustLevel(level.level)}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{level.icon}</div>
                <div className="flex-grow">
                  <h3 className="font-bold text-xl mb-2">{level.level}</h3>
                  <p className="mb-4">{level.description}</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Requirements:</h4>
                      <ul className="text-sm space-y-1">
                        {level.requirements.map((req) => (
                          <li key={req} className="flex items-start gap-1">
                            <span>•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Risks:</h4>
                      <ul className="text-sm space-y-1">
                        {level.risks.map((risk) => (
                          <li key={risk} className="flex items-start gap-1">
                            <span>•</span>
                            <span>{risk}</span>
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

      {/* Verification Methods */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Verification Methods</h2>
        <p className="text-gray-700 mb-6">
          Prove your agent&apos;s identity using one or more of these standard verification methods. Combine multiple methods
          for stronger proof.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {VERIFICATION_METHODS.map((method) => (
            <div key={method.method} className="border border-gray-300 rounded-lg p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{method.method}</h3>
                <span
                  className={`text-xs px-3 py-1 rounded ${
                    method.difficulty === "Easy"
                      ? "bg-green-100 text-green-800"
                      : method.difficulty === "Medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {method.difficulty}
                </span>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                <code>{method.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* Reputation System */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Reputation Signals</h2>
        <p className="text-gray-700 mb-6">
          Trust is built over time. Reputation systems aggregate behavioral signals to assess agent trustworthiness
          beyond static verification.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Signal</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Weight</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {REPUTATION_SIGNALS.map((signal) => (
                <tr key={signal.signal} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">{signal.signal}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        signal.weight === "Critical"
                          ? "bg-red-100 text-red-800"
                          : signal.weight === "High"
                            ? "bg-orange-100 text-orange-800"
                            : signal.weight === "Medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {signal.weight}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">{signal.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-900 text-sm">
            <strong>Trust Decay:</strong> Reputation is not permanent. Inactive agents, security incidents, or policy
            violations cause reputation to decay over time. Maintain active, compliant behavior to preserve trust.
          </p>
        </div>
      </section>

      {/* Deep Dive Links */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Deep Dive Guides</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            href="/identity/auth"
            className="border border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition"
          >
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-lg">Authentication Patterns</h3>
            </div>
            <p className="text-sm text-gray-600">
              API keys, OAuth 2.0, JWT, mTLS, agent-to-agent auth. Comparison table and implementation guides.
            </p>
          </Link>
          <Link
            href="/identity/trust"
            className="border border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition"
          >
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-6 h-6 text-green-600" />
              <h3 className="font-bold text-lg">Trust & Reputation</h3>
            </div>
            <p className="text-sm text-gray-600">
              Building agent reputation, verification tiers, behavioral trust signals, trust decay and recovery.
            </p>
          </Link>
          <Link
            href="/identity/decentralized"
            className="border border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition"
          >
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-6 h-6 text-purple-600" />
              <h3 className="font-bold text-lg">Decentralized Identity</h3>
            </div>
            <p className="text-sm text-gray-600">
              DID (Decentralized Identifiers), verifiable credentials, self-sovereign identity, cross-platform
              portability.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
