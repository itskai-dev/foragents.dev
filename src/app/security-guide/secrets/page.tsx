"use client";

import { useState } from "react";
import Link from "next/link";
import { Key, Lock, AlertCircle, CheckCircle } from "lucide-react";

const SECRET_TYPES = [
  {
    type: "API Keys",
    examples: ["OpenAI API key", "Stripe secret key", "AWS access key"],
    risk: "critical",
    rotationFrequency: "90 days",
  },
  {
    type: "Database Credentials",
    examples: ["PostgreSQL password", "MongoDB connection string", "Redis auth token"],
    risk: "critical",
    rotationFrequency: "60 days",
  },
  {
    type: "OAuth Tokens",
    examples: ["GitHub access token", "Google OAuth client secret", "Discord bot token"],
    risk: "high",
    rotationFrequency: "30 days or on compromise",
  },
  {
    type: "Encryption Keys",
    examples: ["JWT signing key", "AES encryption key", "TLS private key"],
    risk: "critical",
    rotationFrequency: "180 days",
  },
  {
    type: "Webhook Secrets",
    examples: ["Stripe webhook secret", "GitHub webhook secret", "Slack signing secret"],
    risk: "medium",
    rotationFrequency: "90 days",
  },
];

const CODE_EXAMPLES = {
  envVars: `// ✅ GOOD: Environment variables with validation
import { z } from 'zod';

const EnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

// Validate on startup
const env = EnvSchema.parse(process.env);

export const config = {
  openai: {
    apiKey: env.OPENAI_API_KEY,
  },
  database: {
    url: env.DATABASE_URL,
  },
  jwt: {
    secret: env.JWT_SECRET,
  },
} as const;

// ❌ BAD: Hardcoded secrets
const apiKey = "sk-1234567890abcdef"; // Never do this!
const dbPassword = "mysecretpassword"; // Never do this!`,

  vaultIntegration: `// HashiCorp Vault integration
import vault from 'node-vault';

class SecretManager {
  private client: vault.client;
  private cache: Map<string, { value: string; expires: number }>;

  constructor() {
    this.client = vault({
      apiVersion: 'v1',
      endpoint: process.env.VAULT_ADDR,
      token: process.env.VAULT_TOKEN,
    });
    this.cache = new Map();
  }

  async getSecret(path: string, ttl = 300): Promise<string> {
    // Check cache first
    const cached = this.cache.get(path);
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }

    // Fetch from Vault
    const result = await this.client.read(path);
    const value = result.data.value;

    // Cache with TTL
    this.cache.set(path, {
      value,
      expires: Date.now() + ttl * 1000,
    });

    return value;
  }

  async rotateSecret(path: string, newValue: string): Promise<void> {
    await this.client.write(path, { value: newValue });
    this.cache.delete(path); // Invalidate cache
    
    // Log rotation event
    await this.auditLog({
      action: 'SECRET_ROTATED',
      path,
      timestamp: new Date().toISOString(),
    });
  }

  private async auditLog(event: Record<string, unknown>): Promise<void> {
    // Send to audit system
    console.log('[AUDIT]', JSON.stringify(event));
  }
}

export const secretManager = new SecretManager();

// Usage
const apiKey = await secretManager.getSecret('secret/data/openai/api-key');`,

  autoRotation: `// Automatic secret rotation
import crypto from 'crypto';

interface RotationPolicy {
  secretPath: string;
  rotationIntervalDays: number;
  lastRotated: Date;
  generator: () => Promise<string>;
  onRotate: (newSecret: string) => Promise<void>;
}

class SecretRotationManager {
  private policies: RotationPolicy[] = [];

  registerPolicy(policy: RotationPolicy): void {
    this.policies.push(policy);
  }

  async checkAndRotate(): Promise<void> {
    const now = new Date();

    for (const policy of this.policies) {
      const daysSinceRotation = 
        (now.getTime() - policy.lastRotated.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceRotation >= policy.rotationIntervalDays) {
        await this.rotateSecret(policy);
      }
    }
  }

  private async rotateSecret(policy: RotationPolicy): Promise<void> {
    try {
      // Generate new secret
      const newSecret = await policy.generator();

      // Update in vault
      await secretManager.rotateSecret(policy.secretPath, newSecret);

      // Execute custom rotation logic (e.g., update database)
      await policy.onRotate(newSecret);

      // Update last rotated timestamp
      policy.lastRotated = new Date();

      console.log(\`[ROTATION] Successfully rotated \${policy.secretPath}\`);
    } catch (error) {
      console.error(\`[ROTATION] Failed to rotate \${policy.secretPath}\`, error);
      // Alert security team
      await this.alertSecurityTeam(policy.secretPath, error);
    }
  }

  private async alertSecurityTeam(path: string, error: unknown): Promise<void> {
    // Send alert via email/Slack/PagerDuty
  }
}

// Example: Auto-rotate JWT signing key
const rotationManager = new SecretRotationManager();

rotationManager.registerPolicy({
  secretPath: 'secret/data/jwt/signing-key',
  rotationIntervalDays: 90,
  lastRotated: new Date('2025-01-01'),
  generator: async () => {
    return crypto.randomBytes(32).toString('hex');
  },
  onRotate: async (newKey) => {
    // Update application config
    config.jwt.secret = newKey;
    // Invalidate old tokens (optional, depends on grace period)
  },
});

// Run daily check (e.g., via cron)
setInterval(() => rotationManager.checkAndRotate(), 24 * 60 * 60 * 1000);`,

  leastPrivilege: `// Least-privilege access patterns
interface Permission {
  resource: string;
  actions: ('read' | 'write' | 'delete')[];
}

interface ServiceAccount {
  name: string;
  permissions: Permission[];
}

// Define minimal permissions per service
const serviceAccounts: ServiceAccount[] = [
  {
    name: 'email-service',
    permissions: [
      { resource: 'smtp-credentials', actions: ['read'] },
      { resource: 'email-templates', actions: ['read'] },
    ],
  },
  {
    name: 'billing-service',
    permissions: [
      { resource: 'stripe-api-key', actions: ['read'] },
      { resource: 'customer-data', actions: ['read', 'write'] },
      { resource: 'invoices', actions: ['read', 'write', 'delete'] },
    ],
  },
  {
    name: 'analytics-service',
    permissions: [
      { resource: 'analytics-db', actions: ['read', 'write'] },
      // No access to payment data or credentials
    ],
  },
];

// Enforce least-privilege at runtime
class AccessControl {
  private serviceAccount: ServiceAccount;

  constructor(serviceName: string) {
    const account = serviceAccounts.find(sa => sa.name === serviceName);
    if (!account) throw new Error(\`Unknown service: \${serviceName}\`);
    this.serviceAccount = account;
  }

  async getSecret(resource: string): Promise<string> {
    // Check permissions
    const permission = this.serviceAccount.permissions.find(
      p => p.resource === resource
    );

    if (!permission || !permission.actions.includes('read')) {
      throw new Error(
        \`Access denied: \${this.serviceAccount.name} cannot read \${resource}\`
      );
    }

    // Fetch secret with auditing
    await this.auditAccess('read', resource);
    return secretManager.getSecret(\`secret/data/\${resource}\`);
  }

  private async auditAccess(action: string, resource: string): Promise<void> {
    console.log('[ACCESS]', {
      service: this.serviceAccount.name,
      action,
      resource,
      timestamp: new Date().toISOString(),
    });
  }
}

// Usage in services
const emailService = new AccessControl('email-service');
const smtpCreds = await emailService.getSecret('smtp-credentials'); // ✅ Allowed
// await emailService.getSecret('stripe-api-key'); // ❌ Throws error`,

  auditLogging: `// Comprehensive audit logging for secrets
interface AuditEvent {
  timestamp: string;
  action: 'ACCESS' | 'ROTATE' | 'CREATE' | 'DELETE' | 'FAILED_ACCESS';
  secretPath: string;
  service: string;
  userId?: string;
  ip?: string;
  success: boolean;
  metadata?: Record<string, unknown>;
}

class SecretAuditor {
  private events: AuditEvent[] = [];

  logAccess(event: Omit<AuditEvent, 'timestamp'>): void {
    this.events.push({
      timestamp: new Date().toISOString(),
      ...event,
    });

    // Persist to audit log storage
    this.persist(event);

    // Real-time alerting for suspicious activity
    if (event.action === 'FAILED_ACCESS') {
      this.checkForAnomalies(event);
    }
  }

  private async persist(event: Omit<AuditEvent, 'timestamp'>): Promise<void> {
    // Write to immutable audit log (e.g., S3, CloudWatch Logs)
    // Use append-only storage to prevent tampering
  }

  private async checkForAnomalies(event: Omit<AuditEvent, 'timestamp'>): Promise<void> {
    // Count failed attempts in last 5 minutes
    const recentFailures = this.events.filter(
      e =>
        e.action === 'FAILED_ACCESS' &&
        e.service === event.service &&
        Date.now() - new Date(e.timestamp).getTime() < 5 * 60 * 1000
    );

    if (recentFailures.length >= 5) {
      await this.alertSecurityTeam({
        severity: 'HIGH',
        message: \`Multiple failed secret access attempts from \${event.service}\`,
        details: recentFailures,
      });
    }
  }

  private async alertSecurityTeam(alert: Record<string, unknown>): Promise<void> {
    // Send to incident response system
    console.error('[SECURITY ALERT]', alert);
  }

  // Generate compliance reports
  async generateReport(startDate: Date, endDate: Date): Promise<string> {
    const filtered = this.events.filter(e => {
      const ts = new Date(e.timestamp);
      return ts >= startDate && ts <= endDate;
    });

    return JSON.stringify({
      period: { start: startDate, end: endDate },
      totalAccess: filtered.length,
      failedAccess: filtered.filter(e => !e.success).length,
      byService: this.groupByService(filtered),
    }, null, 2);
  }

  private groupByService(events: AuditEvent[]): Record<string, number> {
    return events.reduce((acc, e) => {
      acc[e.service] = (acc[e.service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

export const auditor = new SecretAuditor();

// Usage in SecretManager
class AuditedSecretManager extends SecretManager {
  async getSecret(path: string, ttl = 300): Promise<string> {
    try {
      const value = await super.getSecret(path, ttl);
      auditor.logAccess({
        action: 'ACCESS',
        secretPath: path,
        service: process.env.SERVICE_NAME || 'unknown',
        success: true,
      });
      return value;
    } catch (error) {
      auditor.logAccess({
        action: 'FAILED_ACCESS',
        secretPath: path,
        service: process.env.SERVICE_NAME || 'unknown',
        success: false,
        metadata: { error: String(error) },
      });
      throw error;
    }
  }
}`,
};

export default function SecretsManagementPage() {
  const [selectedExample, setSelectedExample] = useState<keyof typeof CODE_EXAMPLES>("envVars");

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/security-guide" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Security Guide
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-10 h-10 text-green-600" />
          <h1 className="text-4xl font-bold">Secrets Management</h1>
        </div>
        <p className="text-lg text-gray-600">
          Best practices for handling credentials, API keys, and sensitive configuration in AI agents.
        </p>
      </div>

      {/* Overview */}
      <section className="mb-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-2">Why Secrets Management Matters</h3>
              <p className="text-gray-700 mb-2">
                Exposed credentials are the #1 cause of agent security incidents. A single leaked API key can lead to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Unauthorized access to systems and data</li>
                <li>Financial loss (e.g., unexpected cloud bills, fraudulent charges)</li>
                <li>Data breaches and regulatory violations</li>
                <li>Reputational damage and loss of user trust</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Secret Types */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Types of Secrets & Rotation Policies</h2>
        <div className="space-y-4">
          {SECRET_TYPES.map((secret) => (
            <div
              key={secret.type}
              className={`border rounded-lg p-4 ${
                secret.risk === "critical"
                  ? "border-red-300 bg-red-50"
                  : secret.risk === "high"
                    ? "border-orange-300 bg-orange-50"
                    : "border-yellow-300 bg-yellow-50"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg">{secret.type}</h3>
                <span
                  className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
                    secret.risk === "critical"
                      ? "bg-red-600 text-white"
                      : secret.risk === "high"
                        ? "bg-orange-600 text-white"
                        : "bg-yellow-600 text-white"
                  }`}
                >
                  {secret.risk}
                </span>
              </div>
              <div className="text-sm text-gray-700 mb-2">
                <strong>Examples:</strong> {secret.examples.join(", ")}
              </div>
              <div className="text-sm text-gray-700">
                <strong>Rotation Frequency:</strong> {secret.rotationFrequency}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Code Examples */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Implementation Patterns</h2>

        {/* Example Selector */}
        <div className="border border-gray-300 rounded-lg p-6">
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setSelectedExample("envVars")}
              className={`px-3 py-2 rounded text-sm ${
                selectedExample === "envVars" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Environment Variables
            </button>
            <button
              onClick={() => setSelectedExample("vaultIntegration")}
              className={`px-3 py-2 rounded text-sm ${
                selectedExample === "vaultIntegration" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Vault Integration
            </button>
            <button
              onClick={() => setSelectedExample("autoRotation")}
              className={`px-3 py-2 rounded text-sm ${
                selectedExample === "autoRotation" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Auto Rotation
            </button>
            <button
              onClick={() => setSelectedExample("leastPrivilege")}
              className={`px-3 py-2 rounded text-sm ${
                selectedExample === "leastPrivilege" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Least Privilege
            </button>
            <button
              onClick={() => setSelectedExample("auditLogging")}
              className={`px-3 py-2 rounded text-sm ${
                selectedExample === "auditLogging" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Audit Logging
            </button>
          </div>

          <pre className="bg-gray-900 text-gray-100 p-6 rounded overflow-x-auto text-sm">
            <code>{CODE_EXAMPLES[selectedExample]}</code>
          </pre>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Best Practices</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-green-300 bg-green-50 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <h3 className="font-bold text-lg">DO</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Use environment variables or secret vaults (never hardcode)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Rotate secrets regularly (90 days for critical secrets)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Validate secrets on application startup</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Apply least-privilege access (services only get what they need)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Log all secret access events for audit trails</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Use short-lived tokens when possible (OAuth, JWT)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Encrypt secrets at rest and in transit</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Scan git history for accidentally committed secrets</span>
              </li>
            </ul>
          </div>

          <div className="border border-red-300 bg-red-50 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <h3 className="font-bold text-lg">DON&apos;T</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Hardcode secrets in source code</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Commit .env files to version control</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Share secrets via email, Slack, or chat</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Use the same secret across multiple environments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Log secrets to console or error tracking systems</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Store secrets in client-side code or browser storage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Give all services access to all secrets</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>Ignore secret rotation (set it and forget it)</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Incident Response */}
      <section className="mb-12" id="audit-logging">
        <h2 className="text-2xl font-bold mb-6">Incident Response: Secret Compromise</h2>
        <div className="border border-orange-300 bg-orange-50 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <Lock className="w-6 h-6 text-orange-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-2">If a Secret is Compromised</h3>
              <p className="text-gray-700 mb-3">Follow this checklist immediately:</p>
            </div>
          </div>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="font-bold text-orange-600 flex-shrink-0">1.</span>
              <div>
                <strong>Revoke the compromised secret immediately</strong>
                <p className="text-sm">Disable the API key, reset password, or invalidate token across all systems.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-orange-600 flex-shrink-0">2.</span>
              <div>
                <strong>Generate and deploy a new secret</strong>
                <p className="text-sm">Use rotation tools to generate a strong replacement and update all services.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-orange-600 flex-shrink-0">3.</span>
              <div>
                <strong>Audit access logs</strong>
                <p className="text-sm">Check for unauthorized access using the compromised secret.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-orange-600 flex-shrink-0">4.</span>
              <div>
                <strong>Assess impact and notify affected parties</strong>
                <p className="text-sm">
                  If user data was accessed, notify users and regulatory bodies per compliance requirements (GDPR, etc.).
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-orange-600 flex-shrink-0">5.</span>
              <div>
                <strong>Improve security posture</strong>
                <p className="text-sm">Identify how the secret was leaked and implement preventive measures.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Tools & Resources */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Recommended Tools</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="font-bold mb-2">HashiCorp Vault</h3>
            <p className="text-sm text-gray-600 mb-2">
              Industry-standard secret management with encryption, access control, and audit logging.
            </p>
            <a
              href="https://www.vaultproject.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm hover:underline"
            >
              vaultproject.io →
            </a>
          </div>
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="font-bold mb-2">AWS Secrets Manager</h3>
            <p className="text-sm text-gray-600 mb-2">
              Managed service for rotating, managing, and retrieving secrets in AWS.
            </p>
            <a
              href="https://aws.amazon.com/secrets-manager/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm hover:underline"
            >
              aws.amazon.com →
            </a>
          </div>
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="font-bold mb-2">Doppler</h3>
            <p className="text-sm text-gray-600 mb-2">
              Modern secret management for teams with environment sync and audit trails.
            </p>
            <a
              href="https://www.doppler.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm hover:underline"
            >
              doppler.com →
            </a>
          </div>
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="font-bold mb-2">git-secrets</h3>
            <p className="text-sm text-gray-600 mb-2">
              Prevents committing secrets to git repositories through pre-commit hooks.
            </p>
            <a
              href="https://github.com/awslabs/git-secrets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm hover:underline"
            >
              github.com →
            </a>
          </div>
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="font-bold mb-2">dotenv</h3>
            <p className="text-sm text-gray-600 mb-2">
              Simple environment variable loader for development (not for production secrets).
            </p>
            <a
              href="https://github.com/motdotla/dotenv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm hover:underline"
            >
              github.com →
            </a>
          </div>
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="font-bold mb-2">truffleHog</h3>
            <p className="text-sm text-gray-600 mb-2">
              Scans git history and filesystems for accidentally committed secrets.
            </p>
            <a
              href="https://github.com/trufflesecurity/trufflehog"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm hover:underline"
            >
              github.com →
            </a>
          </div>
        </div>
      </section>

      {/* Related Guides */}
      <div className="mt-12 pt-8 border-t border-gray-300">
        <h3 className="font-bold text-xl mb-4">Related Security Guides</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/security-guide/injection"
            className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:shadow transition"
          >
            <h4 className="font-bold mb-2">🛡️ Prompt Injection Defense</h4>
            <p className="text-sm text-gray-600">Detect and prevent malicious prompt injection attacks</p>
          </Link>
          <Link
            href="/security-guide/network"
            className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:shadow transition"
          >
            <h4 className="font-bold mb-2">🌐 Network Security</h4>
            <p className="text-sm text-gray-600">TLS, API authentication, and webhook verification</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
