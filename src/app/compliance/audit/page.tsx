import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Database, Lock, BarChart3, Clock } from "lucide-react";

export const metadata = {
  title: "Audit Log Guide — forAgents.dev",
  description: "Implement proper audit logging for AI agents with retention policies, tamper-proof storage patterns, and compliance reporting. Code examples for structured logging.",
  openGraph: {
    title: "Audit Log Guide — forAgents.dev",
    description: "Implement proper audit logging for AI agents with retention policies, tamper-proof storage patterns, and compliance reporting. Code examples for structured logging.",
    url: "https://foragents.dev/compliance/audit",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function AuditLogPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[300px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-16">
          <Link 
            href="/compliance" 
            className="text-sm text-foreground/60 hover:text-[#06D6A0] transition-colors mb-4 inline-block"
          >
            ← Back to Compliance Hub
          </Link>
          <Badge className="mb-4 bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20">
            Implementation Guide
          </Badge>
          <h1 className="text-[40px] md:text-[48px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Audit Log Guide
          </h1>
          <p className="text-xl text-foreground/80">
            Build comprehensive, tamper-proof audit trails for AI agents
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Why Audit Logs Matter */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-[#06D6A0]/5 border border-[#06D6A0]/20 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#06D6A0]" />
            Why Audit Logs Are Critical
          </h2>
          <p className="text-foreground/80 mb-4">
            Audit logs are the black box for AI agents. They provide accountability, enable debugging, 
            meet regulatory requirements, and support forensic investigations when incidents occur.
          </p>
          <div className="grid md:grid-cols-4 gap-4 mt-6">
            <div className="text-sm">
              <div className="font-semibold text-[#06D6A0] mb-1">Compliance</div>
              <p className="text-foreground/70 text-xs">GDPR, HIPAA, SOX require detailed audit trails</p>
            </div>
            <div className="text-sm">
              <div className="font-semibold text-[#06D6A0] mb-1">Debugging</div>
              <p className="text-foreground/70 text-xs">Trace decisions and identify failure points</p>
            </div>
            <div className="text-sm">
              <div className="font-semibold text-[#06D6A0] mb-1">Security</div>
              <p className="text-foreground/70 text-xs">Detect unauthorized access and anomalies</p>
            </div>
            <div className="text-sm">
              <div className="font-semibold text-[#06D6A0] mb-1">Trust</div>
              <p className="text-foreground/70 text-xs">Demonstrate transparency to users and auditors</p>
            </div>
          </div>
        </div>
      </section>

      {/* What to Log */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-6 h-6 text-[#06D6A0]" />
              What to Log
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-foreground/70">
              Comprehensive logging captures the full context of agent actions for auditability and debugging.
            </p>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-[#06D6A0]">Core Fields (Required)</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <code className="bg-black/40 px-2 py-1 rounded text-xs">timestamp</code>
                    <p className="text-foreground/70 text-xs mt-1">ISO 8601 format with timezone</p>
                  </div>
                  <div>
                    <code className="bg-black/40 px-2 py-1 rounded text-xs">event_id</code>
                    <p className="text-foreground/70 text-xs mt-1">Unique identifier (UUID)</p>
                  </div>
                  <div>
                    <code className="bg-black/40 px-2 py-1 rounded text-xs">agent_id</code>
                    <p className="text-foreground/70 text-xs mt-1">Which agent performed the action</p>
                  </div>
                  <div>
                    <code className="bg-black/40 px-2 py-1 rounded text-xs">user_id</code>
                    <p className="text-foreground/70 text-xs mt-1">User who triggered the action</p>
                  </div>
                  <div>
                    <code className="bg-black/40 px-2 py-1 rounded text-xs">action</code>
                    <p className="text-foreground/70 text-xs mt-1">What the agent did (verb)</p>
                  </div>
                  <div>
                    <code className="bg-black/40 px-2 py-1 rounded text-xs">resource</code>
                    <p className="text-foreground/70 text-xs mt-1">What was acted upon</p>
                  </div>
                  <div>
                    <code className="bg-black/40 px-2 py-1 rounded text-xs">status</code>
                    <p className="text-foreground/70 text-xs mt-1">success | failure | pending</p>
                  </div>
                  <div>
                    <code className="bg-black/40 px-2 py-1 rounded text-xs">risk_level</code>
                    <p className="text-foreground/70 text-xs mt-1">low | medium | high</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-[#06D6A0]">Context Fields (Recommended)</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <code className="bg-black/40 px-2 py-1 rounded text-xs">input</code>
                    <p className="text-foreground/70 text-xs mt-1">User request or trigger data</p>
                  </div>
                  <div>
                    <code className="bg-black/40 px-2 py-1 rounded text-xs">output</code>
                    <p className="text-foreground/70 text-xs mt-1">Agent response (truncate if large)</p>
                  </div>
                  <div>
                    <code className="bg-black/40 px-2 py-1 rounded text-xs">session_id</code>
                    <p className="text-foreground/70 text-xs mt-1">Conversation or workflow session</p>
                  </div>
                  <div>
                    <code className="bg-black/40 px-2 py-1 rounded text-xs">ip_address</code>
                    <p className="text-foreground/70 text-xs mt-1">Client IP (anonymize per GDPR)</p>
                  </div>
                  <div>
                    <code className="bg-black/40 px-2 py-1 rounded text-xs">duration_ms</code>
                    <p className="text-foreground/70 text-xs mt-1">How long the action took</p>
                  </div>
                  <div>
                    <code className="bg-black/40 px-2 py-1 rounded text-xs">model_version</code>
                    <p className="text-foreground/70 text-xs mt-1">AI model used (e.g., gpt-4)</p>
                  </div>
                  <div>
                    <code className="bg-black/40 px-2 py-1 rounded text-xs">approval_status</code>
                    <p className="text-foreground/70 text-xs mt-1">approved | rejected | auto</p>
                  </div>
                  <div>
                    <code className="bg-black/40 px-2 py-1 rounded text-xs">approver_id</code>
                    <p className="text-foreground/70 text-xs mt-1">Who approved (if applicable)</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-[#06D6A0]">Error Fields (When Applicable)</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <code className="bg-black/40 px-2 py-1 rounded text-xs">error_code</code>
                    <p className="text-foreground/70 text-xs mt-1">Machine-readable error code</p>
                  </div>
                  <div>
                    <code className="bg-black/40 px-2 py-1 rounded text-xs">error_message</code>
                    <p className="text-foreground/70 text-xs mt-1">Human-readable error description</p>
                  </div>
                  <div>
                    <code className="bg-black/40 px-2 py-1 rounded text-xs">stack_trace</code>
                    <p className="text-foreground/70 text-xs mt-1">Full stack trace (debug builds)</p>
                  </div>
                  <div>
                    <code className="bg-black/40 px-2 py-1 rounded text-xs">retry_count</code>
                    <p className="text-foreground/70 text-xs mt-1">Number of retry attempts</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <h4 className="font-semibold mb-3">Example Log Entry (JSON):</h4>
              <div className="bg-black/60 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <pre>{`{
  "timestamp": "2026-02-09T11:30:45.123Z",
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "agent_id": "agent-kai-prod-01",
  "user_id": "user_abc123",
  "session_id": "sess_xyz789",
  "action": "send_email",
  "resource": "email:newsletter@example.com",
  "status": "success",
  "risk_level": "medium",
  "approval_status": "approved",
  "approver_id": "supervisor_alice",
  "input": {
    "recipient": "newsletter@example.com",
    "subject": "Weekly Update",
    "body_length": 1024
  },
  "output": {
    "message_id": "msg_001",
    "sent_at": "2026-02-09T11:30:46.456Z"
  },
  "duration_ms": 1234,
  "model_version": "claude-sonnet-4",
  "ip_address": "192.168.1.0/24",
  "metadata": {
    "campaign_id": "camp_winter_2026",
    "tags": ["newsletter", "automated"]
  }
}`}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Retention Policies */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-[#06D6A0]" />
              Retention Policies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-foreground/70">
              Balance compliance requirements, storage costs, and operational needs with tiered retention policies.
            </p>

            <div className="space-y-4">
              <div className="border-l-4 border-green-500 bg-green-500/10 pl-4 p-3 rounded-r">
                <h3 className="font-semibold text-green-400 mb-2">Standard Logs — 90 Days</h3>
                <p className="text-sm text-foreground/80 mb-2">
                  Routine agent actions with low risk (information retrieval, scheduling, notifications)
                </p>
                <ul className="text-xs space-y-1 text-foreground/70">
                  <li>• Sufficient for GDPR/CCPA compliance (30-day deletion window + buffer)</li>
                  <li>• Enables debugging of recent issues</li>
                  <li>• Archive to cold storage after 90 days</li>
                </ul>
              </div>

              <div className="border-l-4 border-yellow-500 bg-yellow-500/10 pl-4 p-3 rounded-r">
                <h3 className="font-semibold text-yellow-400 mb-2">Sensitive Actions — 7 Years</h3>
                <p className="text-sm text-foreground/80 mb-2">
                  High-risk actions (data modifications, external communications, approvals)
                </p>
                <ul className="text-xs space-y-1 text-foreground/70">
                  <li>• Meets regulatory audit requirements (SOX, HIPAA)</li>
                  <li>• Supports legal discovery and investigations</li>
                  <li>• Store in compressed, encrypted format</li>
                </ul>
              </div>

              <div className="border-l-4 border-red-500 bg-red-500/10 pl-4 p-3 rounded-r">
                <h3 className="font-semibold text-red-400 mb-2">Financial Transactions — 10 Years</h3>
                <p className="text-sm text-foreground/80 mb-2">
                  Any action involving money (purchases, refunds, invoices, payments)
                </p>
                <ul className="text-xs space-y-1 text-foreground/70">
                  <li>• Tax and audit compliance (IRS requires 7 years, some jurisdictions 10)</li>
                  <li>• Fraud investigation support</li>
                  <li>• Immutable, tamper-proof storage required</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-500 bg-purple-500/10 pl-4 p-3 rounded-r">
                <h3 className="font-semibold text-purple-400 mb-2">Security Incidents — Indefinite</h3>
                <p className="text-sm text-foreground/80 mb-2">
                  Breach attempts, unauthorized access, policy violations, anomalies
                </p>
                <ul className="text-xs space-y-1 text-foreground/70">
                  <li>• Permanent record for forensics and pattern detection</li>
                  <li>• May be required for legal proceedings</li>
                  <li>• Highest level of access control and encryption</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <h4 className="font-semibold mb-3">Automated Retention Policy (SQL Example):</h4>
              <div className="bg-black/60 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <pre>{`-- Partition logs by retention tier
CREATE TABLE audit_logs (
  event_id UUID PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  agent_id VARCHAR(50),
  action VARCHAR(100),
  retention_tier VARCHAR(20) DEFAULT 'standard',
  -- ... other fields
  created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Auto-archive to cold storage after 90 days
CREATE OR REPLACE FUNCTION archive_old_logs()
RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs_archive
  SELECT * FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND retention_tier = 'standard';
  
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND retention_tier = 'standard';
END;
$$ LANGUAGE plpgsql;

-- Schedule daily
SELECT cron.schedule('archive-logs', '0 2 * * *', 'SELECT archive_old_logs()');`}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Tamper-Proof Storage */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-6 h-6 text-[#06D6A0]" />
              Tamper-Proof Storage Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-foreground/70">
              Audit logs must be immutable and verifiable to meet compliance standards and support investigations.
            </p>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#06D6A0]/10 to-transparent border-l-4 border-[#06D6A0] p-4 rounded-r">
                <h3 className="font-semibold mb-2">1. Append-Only Storage</h3>
                <p className="text-sm text-foreground/80 mb-3">
                  Once written, logs cannot be modified or deleted. Use database constraints or specialized services.
                </p>
                <div className="bg-black/60 rounded p-3 font-mono text-xs overflow-x-auto">
                  <pre>{`-- PostgreSQL: Deny updates and deletes
CREATE POLICY append_only ON audit_logs
  FOR ALL USING (FALSE);

CREATE POLICY allow_insert ON audit_logs
  FOR INSERT WITH CHECK (TRUE);

-- S3: Object Lock (WORM)
aws s3api put-object-lock-configuration \\
  --bucket audit-logs \\
  --object-lock-configuration '{
    "ObjectLockEnabled": "Enabled",
    "Rule": {
      "DefaultRetention": {
        "Mode": "COMPLIANCE",
        "Years": 7
      }
    }
  }'`}</pre>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#06D6A0]/10 to-transparent border-l-4 border-[#06D6A0] p-4 rounded-r">
                <h3 className="font-semibold mb-2">2. Cryptographic Hashing</h3>
                <p className="text-sm text-foreground/80 mb-3">
                  Hash each log entry and chain them (blockchain-style) to detect tampering.
                </p>
                <div className="bg-black/60 rounded p-3 font-mono text-xs overflow-x-auto">
                  <pre>{`// TypeScript: Log chaining with SHA-256
import crypto from 'crypto';

interface AuditLog {
  event_id: string;
  timestamp: string;
  data: Record<string, any>;
  previous_hash: string;
  hash: string;
}

function hashLog(log: Omit<AuditLog, 'hash'>): string {
  const data = JSON.stringify({
    event_id: log.event_id,
    timestamp: log.timestamp,
    data: log.data,
    previous_hash: log.previous_hash
  });
  return crypto.createHash('sha256').update(data).digest('hex');
}

function appendLog(data: Record<string, any>, previousHash: string): AuditLog {
  const log = {
    event_id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    data,
    previous_hash: previousHash,
    hash: ''
  };
  log.hash = hashLog(log);
  return log as AuditLog;
}

// Verify chain integrity
function verifyChain(logs: AuditLog[]): boolean {
  for (let i = 1; i < logs.length; i++) {
    if (logs[i].previous_hash !== logs[i - 1].hash) {
      return false; // Chain broken
    }
    if (logs[i].hash !== hashLog(logs[i])) {
      return false; // Log tampered
    }
  }
  return true;
}`}</pre>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#06D6A0]/10 to-transparent border-l-4 border-[#06D6A0] p-4 rounded-r">
                <h3 className="font-semibold mb-2">3. Dedicated Logging Services</h3>
                <p className="text-sm text-foreground/80 mb-3">
                  Use managed services designed for tamper-proof audit logs.
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#06D6A0]">•</span>
                    <div>
                      <strong>AWS CloudWatch Logs:</strong> Encrypted, retention policies, IAM controls
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#06D6A0]">•</span>
                    <div>
                      <strong>Google Cloud Logging:</strong> Audit logs with integrity verification
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#06D6A0]">•</span>
                    <div>
                      <strong>Azure Monitor:</strong> Immutable storage with legal hold
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#06D6A0]">•</span>
                    <div>
                      <strong>Datadog / Splunk:</strong> SIEM with compliance reporting
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-[#06D6A0]/10 to-transparent border-l-4 border-[#06D6A0] p-4 rounded-r">
                <h3 className="font-semibold mb-2">4. Access Controls</h3>
                <p className="text-sm text-foreground/80 mb-3">
                  Restrict who can read logs and audit all access.
                </p>
                <ul className="text-xs space-y-1 text-foreground/70">
                  <li>✓ Role-based access control (RBAC): compliance, security, debug roles</li>
                  <li>✓ Log all log access: who, when, what query (meta-auditing)</li>
                  <li>✓ Require multi-factor authentication for log access</li>
                  <li>✓ Separate log storage from application database</li>
                  <li>✓ Encrypt at rest (AES-256) and in transit (TLS 1.3)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Compliance Reporting */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#06D6A0]" />
              Compliance Reporting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-foreground/70">
              Transform audit logs into actionable reports for auditors, regulators, and stakeholders.
            </p>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Standard Reports</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-[#06D6A0]">📊</span>
                    <div>
                      <strong>Activity Summary:</strong> Total actions by agent, risk level, status (daily/weekly/monthly)
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#06D6A0]">⚠️</span>
                    <div>
                      <strong>High-Risk Actions:</strong> All medium/high risk actions with approval status
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#06D6A0]">❌</span>
                    <div>
                      <strong>Failures & Errors:</strong> Failed actions grouped by error type
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#06D6A0]">👤</span>
                    <div>
                      <strong>User Access:</strong> Actions per user with anomaly detection
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#06D6A0]">🔒</span>
                    <div>
                      <strong>Security Events:</strong> Unauthorized access attempts, policy violations
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#06D6A0]">📈</span>
                    <div>
                      <strong>Compliance Score:</strong> % of actions following governance policies
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Automated Report Generation</h3>
                <div className="bg-black/60 rounded p-3 font-mono text-xs overflow-x-auto">
                  <pre>{`// Python: Generate weekly compliance report
import pandas as pd
from datetime import datetime, timedelta

def generate_weekly_report(start_date, end_date):
    logs = fetch_logs(start_date, end_date)
    
    report = {
        "period": f"{start_date} to {end_date}",
        "total_actions": len(logs),
        "by_risk_level": logs.groupby('risk_level').size().to_dict(),
        "high_risk_actions": logs[logs['risk_level'] == 'high'].to_dict('records'),
        "approval_rate": (logs['approval_status'] == 'approved').mean(),
        "error_rate": (logs['status'] == 'failure').mean(),
        "top_agents": logs['agent_id'].value_counts().head(10).to_dict(),
        "anomalies": detect_anomalies(logs)
    }
    
    # Export as PDF for auditors
    generate_pdf(report, f"compliance_report_{start_date}.pdf")
    
    # Send to compliance team
    send_email(
        to="compliance@company.com",
        subject=f"Weekly Compliance Report: {start_date}",
        attachments=[f"compliance_report_{start_date}.pdf"]
    )
    
    return report

# Schedule weekly
schedule.every().monday.at("09:00").do(
    lambda: generate_weekly_report(
        datetime.now() - timedelta(days=7),
        datetime.now()
    )
)`}</pre>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Query Examples (SQL)</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-[#06D6A0] mb-1">Find all high-risk actions last 30 days:</div>
                    <div className="bg-black/60 rounded p-2 font-mono text-xs overflow-x-auto">
                      <pre>{`SELECT * FROM audit_logs
WHERE risk_level = 'high'
  AND timestamp > NOW() - INTERVAL '30 days'
ORDER BY timestamp DESC;`}</pre>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#06D6A0] mb-1">Actions by a specific user:</div>
                    <div className="bg-black/60 rounded p-2 font-mono text-xs overflow-x-auto">
                      <pre>{`SELECT action, status, timestamp
FROM audit_logs
WHERE user_id = 'user_abc123'
ORDER BY timestamp DESC;`}</pre>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#06D6A0] mb-1">Approval rate by risk level:</div>
                    <div className="bg-black/60 rounded p-2 font-mono text-xs overflow-x-auto">
                      <pre>{`SELECT
  risk_level,
  COUNT(*) as total_actions,
  SUM(CASE WHEN approval_status = 'approved' THEN 1 ELSE 0 END) as approved,
  ROUND(100.0 * SUM(CASE WHEN approval_status = 'approved' THEN 1 ELSE 0 END) / COUNT(*), 2) as approval_rate
FROM audit_logs
WHERE approval_status IS NOT NULL
GROUP BY risk_level;`}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Code Examples */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle>Complete Implementation Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span>🐍</span> Python (FastAPI + PostgreSQL)
                </h3>
                <div className="bg-black/60 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                  <pre>{`from fastapi import FastAPI, Depends
from sqlalchemy import create_engine, Column, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
from datetime import datetime

Base = declarative_base()

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    event_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    agent_id = Column(String(50), nullable=False)
    user_id = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    resource = Column(String(200))
    status = Column(String(20), nullable=False)
    risk_level = Column(String(20), nullable=False)
    input = Column(JSONB)
    output = Column(JSONB)
    metadata = Column(JSONB)

app = FastAPI()

async def log_action(
    agent_id: str,
    user_id: str,
    action: str,
    resource: str,
    status: str,
    risk_level: str,
    input_data: dict = None,
    output_data: dict = None,
    metadata: dict = None
):
    """Create an audit log entry"""
    log = AuditLog(
        agent_id=agent_id,
        user_id=user_id,
        action=action,
        resource=resource,
        status=status,
        risk_level=risk_level,
        input=input_data,
        output=output_data,
        metadata=metadata
    )
    session.add(log)
    session.commit()
    return log

# Usage in agent action
@app.post("/agent/send-email")
async def send_email(recipient: str, subject: str, body: str, user_id: str):
    try:
        # Perform action
        result = send_email_internal(recipient, subject, body)
        
        # Log success
        await log_action(
            agent_id="agent-kai-01",
            user_id=user_id,
            action="send_email",
            resource=f"email:{recipient}",
            status="success",
            risk_level="medium",
            input_data={"recipient": recipient, "subject": subject},
            output_data={"message_id": result.message_id}
        )
        
        return {"status": "sent", "message_id": result.message_id}
    
    except Exception as e:
        # Log failure
        await log_action(
            agent_id="agent-kai-01",
            user_id=user_id,
            action="send_email",
            resource=f"email:{recipient}",
            status="failure",
            risk_level="medium",
            input_data={"recipient": recipient, "subject": subject},
            metadata={"error": str(e)}
        )
        raise`}</pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span>📘</span> TypeScript (Node.js + MongoDB)
                </h3>
                <div className="bg-black/60 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                  <pre>{`import { MongoClient } from 'mongodb';

interface AuditLogEntry {
  event_id: string;
  timestamp: Date;
  agent_id: string;
  user_id: string;
  action: string;
  resource?: string;
  status: 'success' | 'failure' | 'pending';
  risk_level: 'low' | 'medium' | 'high';
  input?: Record<string, any>;
  output?: Record<string, any>;
  metadata?: Record<string, any>;
}

class AuditLogger {
  private db: MongoClient;
  
  constructor(mongoUrl: string) {
    this.db = new MongoClient(mongoUrl);
  }
  
  async log(entry: Omit<AuditLogEntry, 'event_id' | 'timestamp'>): Promise<void> {
    const logEntry: AuditLogEntry = {
      event_id: crypto.randomUUID(),
      timestamp: new Date(),
      ...entry
    };
    
    await this.db
      .db('compliance')
      .collection('audit_logs')
      .insertOne(logEntry);
    
    console.log(\`[AUDIT] \${entry.action} by \${entry.agent_id} - \${entry.status}\`);
  }
  
  async query(filters: Partial<AuditLogEntry>, limit = 100): Promise<AuditLogEntry[]> {
    return this.db
      .db('compliance')
      .collection<AuditLogEntry>('audit_logs')
      .find(filters)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }
}

// Usage
const logger = new AuditLogger(process.env.MONGO_URL);

async function performAgentAction(userId: string, action: string) {
  try {
    const result = await doSomething();
    
    await logger.log({
      agent_id: 'agent-link-01',
      user_id: userId,
      action: action,
      status: 'success',
      risk_level: 'low',
      output: { result }
    });
    
  } catch (error) {
    await logger.log({
      agent_id: 'agent-link-01',
      user_id: userId,
      action: action,
      status: 'failure',
      risk_level: 'low',
      metadata: { error: error.message }
    });
    throw error;
  }
}`}</pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Navigation */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex gap-4 justify-between">
          <Link 
            href="/compliance" 
            className="text-sm text-foreground/60 hover:text-[#06D6A0] transition-colors"
          >
            ← Back to Compliance Hub
          </Link>
          <div className="flex gap-4">
            <Link 
              href="/compliance/governance" 
              className="text-sm text-[#06D6A0] hover:underline"
            >
              Governance Framework →
            </Link>
            <Link 
              href="/compliance/responsible-ai" 
              className="text-sm text-[#06D6A0] hover:underline"
            >
              Responsible AI →
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
