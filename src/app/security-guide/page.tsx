"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  description: string;
  guide: string;
}

const CHECKLIST: ChecklistItem[] = [
  {
    id: "prompt-injection",
    title: "Prompt Injection Defense",
    severity: "critical",
    category: "Input Security",
    description: "Protect against malicious prompts that hijack agent behavior",
    guide: "/security-guide/injection",
  },
  {
    id: "secrets-mgmt",
    title: "Secrets Management",
    severity: "critical",
    category: "Data Security",
    description: "Secure credential storage, rotation, and least-privilege access",
    guide: "/security-guide/secrets",
  },
  {
    id: "network-security",
    title: "Network Security",
    severity: "high",
    category: "Communication Security",
    description: "TLS, API auth, webhook verification, and rate limiting",
    guide: "/security-guide/network",
  },
  {
    id: "output-filtering",
    title: "Output Filtering",
    severity: "high",
    category: "Data Leakage",
    description: "Prevent accidental exposure of sensitive data in responses",
    guide: "/security-guide/injection#output-filtering",
  },
  {
    id: "sandbox-execution",
    title: "Sandbox Execution",
    severity: "high",
    category: "Runtime Security",
    description: "Isolate code execution to prevent system compromise",
    guide: "/security-guide/injection#sandboxing",
  },
  {
    id: "audit-logging",
    title: "Audit Logging",
    severity: "medium",
    category: "Observability",
    description: "Track security-relevant events for forensics and compliance",
    guide: "/security-guide/secrets#audit-logging",
  },
  {
    id: "rate-limiting",
    title: "Rate Limiting",
    severity: "medium",
    category: "Availability",
    description: "Prevent abuse and denial-of-service attacks",
    guide: "/security-guide/network#rate-limiting",
  },
  {
    id: "input-validation",
    title: "Input Validation",
    severity: "medium",
    category: "Input Security",
    description: "Sanitize and validate all external inputs",
    guide: "/security-guide/injection#input-sanitization",
  },
];

const ATTACK_SURFACES = [
  {
    name: "User Input",
    risk: "critical",
    vectors: ["Prompt injection", "Jailbreak attempts", "Data exfiltration", "Social engineering"],
  },
  {
    name: "External APIs",
    risk: "high",
    vectors: ["Credential leaks", "Man-in-the-middle", "API abuse", "Token hijacking"],
  },
  {
    name: "File System",
    risk: "high",
    vectors: ["Path traversal", "Arbitrary write", "Config tampering", "Log injection"],
  },
  {
    name: "Code Execution",
    risk: "critical",
    vectors: ["Remote code execution", "Sandbox escape", "Supply chain attacks", "Dependency poisoning"],
  },
  {
    name: "Network",
    risk: "medium",
    vectors: ["Unencrypted traffic", "SSRF attacks", "DNS rebinding", "Webhook spoofing"],
  },
  {
    name: "Memory/State",
    risk: "medium",
    vectors: ["State confusion", "Session fixation", "Memory leaks", "Race conditions"],
  },
];

const QUICK_START_STEPS = [
  {
    step: 1,
    title: "Enable Input Filtering",
    code: `// Detect and reject obvious injection attempts
const isSuspicious = (input: string) => {
  const patterns = [
    /ignore (all )?previous (instructions|prompts)/i,
    /disregard (all )?(above|prior|previous)/i,
    /new (instructions|system prompt|role)/i,
    /you are now|forget (everything|your role)/i,
  ];
  return patterns.some(p => p.test(input));
};

if (isSuspicious(userInput)) {
  throw new SecurityError("Potential prompt injection detected");
}`,
  },
  {
    step: 2,
    title: "Use Environment Variables for Secrets",
    code: `// Never hardcode credentials
// ❌ BAD
const apiKey = "sk-1234567890abcdef";

// ✅ GOOD
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error("Missing OPENAI_API_KEY");`,
  },
  {
    step: 3,
    title: "Enforce TLS for All Connections",
    code: `// Reject non-HTTPS connections
const fetch = require('node-fetch');
const https = require('https');

const agent = new https.Agent({
  rejectUnauthorized: true, // Verify SSL certificates
  minVersion: 'TLSv1.2',    // Minimum TLS version
});

const response = await fetch(url, { agent });`,
  },
  {
    step: 4,
    title: "Implement Request Rate Limiting",
    code: `// Prevent abuse with rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: "Too many requests, please try again later",
});

app.use('/api/', limiter);`,
  },
];

export default function SecurityGuidePage() {
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const severityColors = {
    critical: "text-red-600 bg-red-50 border-red-200",
    high: "text-orange-600 bg-orange-50 border-orange-200",
    medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
    low: "text-blue-600 bg-blue-50 border-blue-200",
  };

  const riskColors = {
    critical: "bg-red-100 text-red-800 border-red-300",
    high: "bg-orange-100 text-orange-800 border-orange-300",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  };

  const filteredChecklist =
    selectedSeverity === "all"
      ? CHECKLIST
      : CHECKLIST.filter((item) => item.severity === selectedSeverity);

  const toggleComplete = (id: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedItems(newCompleted);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold">Agent Security Hardening</h1>
        </div>
        <p className="text-lg text-gray-600">
          Comprehensive security guide for AI agents. Machine-readable threat models, practical defense strategies, and
          implementation patterns.
        </p>
      </div>

      {/* Threat Model Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Threat Model</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <p className="text-gray-700 mb-4">
            AI agents face unique security challenges due to their autonomous nature and broad system access. The primary
            threats:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Prompt Injection:</strong> Malicious inputs that hijack agent behavior to bypass restrictions or
                leak data
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Credential Theft:</strong> Exposed API keys, tokens, or passwords leading to unauthorized access
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Data Exfiltration:</strong> Agents tricked into revealing sensitive information through their
                outputs
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Supply Chain Attacks:</strong> Compromised dependencies or skills that introduce backdoors
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Attack Surface Map */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Attack Surface Map</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ATTACK_SURFACES.map((surface) => (
            <div
              key={surface.name}
              className={`border rounded-lg p-4 ${riskColors[surface.risk as keyof typeof riskColors]}`}
            >
              <h3 className="font-bold mb-2">{surface.name}</h3>
              <div className="text-sm mb-3">
                <span className="font-semibold">Risk: </span>
                <span className="uppercase">{surface.risk}</span>
              </div>
              <ul className="text-sm space-y-1">
                {surface.vectors.map((vector) => (
                  <li key={vector} className="flex items-start gap-1">
                    <span className="text-xs mt-1">•</span>
                    <span>{vector}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Security Checklist */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Security Checklist</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedSeverity("all")}
              className={`px-3 py-1 rounded text-sm ${
                selectedSeverity === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedSeverity("critical")}
              className={`px-3 py-1 rounded text-sm ${
                selectedSeverity === "critical" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setSelectedSeverity("high")}
              className={`px-3 py-1 rounded text-sm ${
                selectedSeverity === "high" ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              High
            </button>
            <button
              onClick={() => setSelectedSeverity("medium")}
              className={`px-3 py-1 rounded text-sm ${
                selectedSeverity === "medium" ? "bg-yellow-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Medium
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredChecklist.map((item) => (
            <div key={item.id} className={`border rounded-lg p-4 ${severityColors[item.severity]}`}>
              <div className="flex items-start gap-3">
                <button onClick={() => toggleComplete(item.id)} className="mt-1 flex-shrink-0">
                  {completedItems.has(item.id) ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-gray-400" />
                  )}
                </button>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/50 uppercase font-semibold">
                      {item.severity}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/30">{item.category}</span>
                  </div>
                  <p className="text-sm mb-3">{item.description}</p>
                  <Link
                    href={item.guide}
                    className="text-sm font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    View Guide →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Quick Start: 4 Essential Hardening Steps</h2>
        <div className="space-y-6">
          {QUICK_START_STEPS.map((item) => (
            <div key={item.step} className="border border-gray-300 rounded-lg p-6 bg-white">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                    <code>{item.code}</code>
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deep Dive Links */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Deep Dive Guides</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            href="/security-guide/injection"
            className="border border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition"
          >
            <h3 className="font-bold text-lg mb-2">🛡️ Prompt Injection Defense</h3>
            <p className="text-sm text-gray-600">
              Attack types, detection patterns, defense strategies, real-world examples
            </p>
          </Link>
          <Link
            href="/security-guide/secrets"
            className="border border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition"
          >
            <h3 className="font-bold text-lg mb-2">🔐 Secrets Management</h3>
            <p className="text-sm text-gray-600">
              Environment variables, vault integration, rotation, least-privilege patterns
            </p>
          </Link>
          <Link
            href="/security-guide/network"
            className="border border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition"
          >
            <h3 className="font-bold text-lg mb-2">🌐 Network Security</h3>
            <p className="text-sm text-gray-600">
              TLS requirements, API auth, webhook verification, CORS, rate limiting
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
