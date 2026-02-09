import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GitBranch, Users, AlertCircle, FileText, Shield, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Governance Framework — forAgents.dev",
  description: "Template governance framework for AI agent deployments including approval workflows, escalation paths, human oversight requirements, logging standards, and incident response.",
  openGraph: {
    title: "Governance Framework — forAgents.dev",
    description: "Template governance framework for AI agent deployments including approval workflows, escalation paths, human oversight requirements, logging standards, and incident response.",
    url: "https://foragents.dev/compliance/governance",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function GovernanceFrameworkPage() {
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
            Template Framework
          </Badge>
          <h1 className="text-[40px] md:text-[48px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Governance Framework
          </h1>
          <p className="text-xl text-foreground/80">
            Production-ready governance templates for agent deployments
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Overview */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-[#06D6A0]/5 border border-[#06D6A0]/20 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#06D6A0]" />
            Why Governance Matters
          </h2>
          <p className="text-foreground/80 mb-4">
            AI agents make autonomous decisions that can impact users, data, and business operations. 
            A governance framework ensures accountability, reduces risk, and maintains trust.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="text-sm">
              <div className="font-semibold text-[#06D6A0] mb-1">Risk Management</div>
              <p className="text-foreground/70">Identify and mitigate potential harms before they occur</p>
            </div>
            <div className="text-sm">
              <div className="font-semibold text-[#06D6A0] mb-1">Compliance</div>
              <p className="text-foreground/70">Meet regulatory requirements and audit standards</p>
            </div>
            <div className="text-sm">
              <div className="font-semibold text-[#06D6A0] mb-1">Trust</div>
              <p className="text-foreground/70">Build user confidence through transparency and oversight</p>
            </div>
          </div>
        </div>
      </section>

      {/* Approval Workflows */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-6 h-6 text-[#06D6A0]" />
              Approval Workflows
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-foreground/70">
              Define clear approval processes based on action risk level. High-risk actions require human oversight; low-risk can be automated.
            </p>

            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-green-400 mb-2">Low Risk (Automated)</h3>
                <ul className="text-sm text-foreground/80 space-y-1">
                  <li>• Information retrieval (read-only queries)</li>
                  <li>• Routine scheduling and reminders</li>
                  <li>• Standard data formatting and exports</li>
                  <li>• Internal notifications and alerts</li>
                </ul>
                <div className="mt-3 text-xs font-mono bg-black/40 rounded p-2">
                  approval_required: false
                </div>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-semibold text-yellow-400 mb-2">Medium Risk (Review Required)</h3>
                <ul className="text-sm text-foreground/80 space-y-1">
                  <li>• Sending external communications (email, messages)</li>
                  <li>• Creating or modifying data records</li>
                  <li>• Publishing content to public channels</li>
                  <li>• Automated purchases under threshold ($100)</li>
                </ul>
                <div className="mt-3 text-xs font-mono bg-black/40 rounded p-2">
                  approval_required: true, review_window: "2h", auto_approve_threshold: 2
                </div>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-red-400 mb-2">High Risk (Manual Approval)</h3>
                <ul className="text-sm text-foreground/80 space-y-1">
                  <li>• Financial transactions over threshold</li>
                  <li>• Deleting or modifying critical data</li>
                  <li>• Legal, medical, or safety-critical advice</li>
                  <li>• API integrations with external services</li>
                  <li>• Access permission changes</li>
                </ul>
                <div className="mt-3 text-xs font-mono bg-black/40 rounded p-2">
                  approval_required: true, require_human: true, timeout: "24h"
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <h4 className="font-semibold mb-3">Implementation Template:</h4>
              <div className="bg-black/60 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <pre>{`// governance/workflows.json
{
  "approval_matrix": {
    "send_email": {
      "risk_level": "medium",
      "approval_required": true,
      "approvers": ["team_lead", "compliance_officer"],
      "timeout_hours": 4,
      "auto_approve_conditions": {
        "recipient_whitelist": true,
        "content_moderation_passed": true
      }
    },
    "execute_payment": {
      "risk_level": "high",
      "approval_required": true,
      "require_human": true,
      "approvers": ["finance_manager"],
      "multi_signature": true,
      "timeout_hours": 24,
      "audit_log": true
    }
  }
}`}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Escalation Paths */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-[#06D6A0]" />
              Escalation Paths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-foreground/70">
              Define clear escalation procedures when agents encounter uncertainty, errors, or policy violations.
            </p>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="text-2xl">1️⃣</span>
                  Level 1: Automated Recovery
                </h3>
                <ul className="text-sm text-foreground/80 space-y-1 ml-8">
                  <li>• Retry with exponential backoff (API failures)</li>
                  <li>• Fallback to cached data or default responses</li>
                  <li>• Log warning and continue operation</li>
                </ul>
                <div className="mt-2 text-xs text-foreground/60">
                  Trigger: Transient errors, rate limits, network timeouts
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="text-2xl">2️⃣</span>
                  Level 2: Supervisor Review
                </h3>
                <ul className="text-sm text-foreground/80 space-y-1 ml-8">
                  <li>• Notify on-call agent supervisor via Slack/PagerDuty</li>
                  <li>• Pause operation pending human review</li>
                  <li>• Provide context and suggested actions</li>
                </ul>
                <div className="mt-2 text-xs text-foreground/60">
                  Trigger: Ambiguous user requests, policy edge cases, confidence score &lt; 0.7
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="text-2xl">3️⃣</span>
                  Level 3: Incident Response
                </h3>
                <ul className="text-sm text-foreground/80 space-y-1 ml-8">
                  <li>• Trigger full incident response procedure</li>
                  <li>• Notify compliance and legal teams immediately</li>
                  <li>• Freeze agent capabilities pending investigation</li>
                  <li>• Preserve all logs and audit trails</li>
                </ul>
                <div className="mt-2 text-xs text-foreground/60">
                  Trigger: Data breaches, harmful outputs, regulatory violations, security incidents
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <h4 className="font-semibold mb-3">Escalation Decision Tree:</h4>
              <div className="bg-black/60 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <pre>{`// governance/escalation.yml
escalation_rules:
  - condition: error.type == "api_timeout"
    level: 1
    action: retry_with_backoff
    max_retries: 3
    
  - condition: confidence_score < 0.7
    level: 2
    action: request_human_review
    notify: ["supervisor@company.com"]
    
  - condition: content_moderation.risk == "high"
    level: 3
    action: trigger_incident
    freeze_agent: true
    notify: ["security@company.com", "legal@company.com"]
    preserve_evidence: true`}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Human Oversight */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-[#06D6A0]" />
              Human Oversight Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-foreground/70">
              Determine when and how humans must be involved in agent operations. Balance autonomy with accountability.
            </p>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#06D6A0]/10 to-transparent border-l-4 border-[#06D6A0] p-4 rounded-r">
                <h3 className="font-semibold mb-2">Continuous Monitoring</h3>
                <p className="text-sm text-foreground/80 mb-3">
                  Human supervisors should have real-time visibility into agent activities.
                </p>
                <ul className="text-sm space-y-1">
                  <li>✓ Live dashboard showing active agent tasks</li>
                  <li>✓ Alert thresholds for unusual behavior patterns</li>
                  <li>✓ Weekly summary reports to stakeholders</li>
                  <li>✓ Audit trail accessible to authorized personnel</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-[#06D6A0]/10 to-transparent border-l-4 border-[#06D6A0] p-4 rounded-r">
                <h3 className="font-semibold mb-2">Intervention Rights</h3>
                <p className="text-sm text-foreground/80 mb-3">
                  Humans must retain the ability to override, pause, or terminate agent actions.
                </p>
                <ul className="text-sm space-y-1">
                  <li>✓ Emergency stop button accessible to operators</li>
                  <li>✓ Manual override capability for all automated actions</li>
                  <li>✓ Rollback procedures for completed actions</li>
                  <li>✓ Clear chain of command for decision authority</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-[#06D6A0]/10 to-transparent border-l-4 border-[#06D6A0] p-4 rounded-r">
                <h3 className="font-semibold mb-2">Periodic Review</h3>
                <p className="text-sm text-foreground/80 mb-3">
                  Regular reviews ensure agents remain aligned with organizational goals and values.
                </p>
                <ul className="text-sm space-y-1">
                  <li>✓ Monthly review of agent performance metrics</li>
                  <li>✓ Quarterly governance policy updates</li>
                  <li>✓ Annual third-party audit of agent systems</li>
                  <li>✓ Continuous training for human supervisors</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <h4 className="font-semibold mb-3">Oversight Roles & Responsibilities:</h4>
              <div className="bg-black/60 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <pre>{`// governance/roles.json
{
  "roles": {
    "agent_supervisor": {
      "responsibilities": [
        "Monitor real-time agent dashboard",
        "Respond to escalations within SLA",
        "Approve medium-risk actions"
      ],
      "on_call_rotation": true,
      "sla_response_time": "30m"
    },
    "compliance_officer": {
      "responsibilities": [
        "Review audit logs weekly",
        "Approve high-risk actions",
        "Conduct quarterly policy reviews"
      ],
      "audit_access": true
    },
    "security_team": {
      "responsibilities": [
        "Respond to security incidents",
        "Review access logs",
        "Manage agent credentials"
      ],
      "emergency_shutdown_authority": true
    }
  }
}`}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Logging Standards */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#06D6A0]" />
              Logging Standards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-foreground/70">
              Comprehensive logging is essential for compliance, debugging, and accountability. See the{" "}
              <Link href="/compliance/audit" className="text-[#06D6A0] hover:underline">
                Audit Log Guide
              </Link>{" "}
              for detailed implementation.
            </p>

            <div className="space-y-3">
              <div className="bg-white/5 rounded p-3">
                <h4 className="font-semibold text-sm mb-2">Required Log Fields:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><code className="bg-black/40 px-1 rounded">timestamp</code> — ISO 8601 format</div>
                  <div><code className="bg-black/40 px-1 rounded">agent_id</code> — Unique agent identifier</div>
                  <div><code className="bg-black/40 px-1 rounded">user_id</code> — User triggering action</div>
                  <div><code className="bg-black/40 px-1 rounded">action</code> — What the agent did</div>
                  <div><code className="bg-black/40 px-1 rounded">input</code> — User request or trigger</div>
                  <div><code className="bg-black/40 px-1 rounded">output</code> — Agent response</div>
                  <div><code className="bg-black/40 px-1 rounded">risk_level</code> — low/medium/high</div>
                  <div><code className="bg-black/40 px-1 rounded">approval_status</code> — approved/rejected/pending</div>
                </div>
              </div>

              <div className="bg-white/5 rounded p-3">
                <h4 className="font-semibold text-sm mb-2">Retention Policy:</h4>
                <ul className="text-xs space-y-1">
                  <li>• Standard logs: 90 days minimum (GDPR/CCPA compliance)</li>
                  <li>• High-risk actions: 7 years (regulatory requirements)</li>
                  <li>• Financial transactions: 10 years (tax/audit requirements)</li>
                  <li>• Security incidents: Indefinite retention</li>
                </ul>
              </div>

              <div className="bg-white/5 rounded p-3">
                <h4 className="font-semibold text-sm mb-2">Access Controls:</h4>
                <ul className="text-xs space-y-1">
                  <li>• Role-based access: Only authorized personnel can view logs</li>
                  <li>• Audit trail of log access: Log who accessed logs and when</li>
                  <li>• Encryption at rest and in transit</li>
                  <li>• Tamper-proof storage (append-only logs)</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Link 
                href="/compliance/audit" 
                className="inline-flex items-center gap-2 text-sm text-[#06D6A0] hover:underline"
              >
                View Full Audit Log Guide <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Incident Response */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-400" />
              Incident Response Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-foreground/70">
              When things go wrong, a clear incident response plan minimizes damage and speeds recovery.
            </p>

            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-red-400 mb-3">Incident Classification</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>P0 (Critical):</strong> Data breach, harmful output causing injury, complete system failure
                    <br />
                    <span className="text-xs text-foreground/60">Response time: Immediate, 24/7 escalation</span>
                  </div>
                  <div>
                    <strong>P1 (High):</strong> Policy violation, financial loss, service degradation
                    <br />
                    <span className="text-xs text-foreground/60">Response time: Within 1 hour during business hours</span>
                  </div>
                  <div>
                    <strong>P2 (Medium):</strong> Performance issues, minor policy violations, customer complaints
                    <br />
                    <span className="text-xs text-foreground/60">Response time: Within 4 hours</span>
                  </div>
                  <div>
                    <strong>P3 (Low):</strong> Edge cases, documentation issues, minor bugs
                    <br />
                    <span className="text-xs text-foreground/60">Response time: Next business day</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Response Procedure (P0/P1)</h3>
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  <li><strong>Detect & Alert:</strong> Automated monitoring triggers incident</li>
                  <li><strong>Contain:</strong> Pause/disable affected agent capabilities immediately</li>
                  <li><strong>Assess:</strong> Determine scope, impact, and root cause</li>
                  <li><strong>Notify:</strong> Alert stakeholders (users, compliance, legal, PR)</li>
                  <li><strong>Remediate:</strong> Fix the issue and validate the fix</li>
                  <li><strong>Recover:</strong> Restore service with additional safeguards</li>
                  <li><strong>Review:</strong> Post-mortem to prevent recurrence</li>
                </ol>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Communication Templates</h3>
                <div className="space-y-3 text-xs">
                  <div className="bg-black/40 rounded p-2">
                    <div className="text-[#06D6A0] font-semibold mb-1">Internal (Slack/Email):</div>
                    <pre className="text-foreground/80">{`🚨 INCIDENT: [P0] Agent data exposure
Detected: 2026-02-09 14:30 PST
Scope: ~50 users affected
Status: Contained, investigating
Owner: @security-team
Next update: In 30 minutes`}</pre>
                  </div>
                  <div className="bg-black/40 rounded p-2">
                    <div className="text-[#06D6A0] font-semibold mb-1">External (User Notification):</div>
                    <pre className="text-foreground/80">{`Subject: Security Notice - Action Required

We detected unauthorized access to your agent's data
on [date]. We have secured your account and are
investigating. Please reset your password and review
recent activity. Contact support@... for assistance.`}</pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <h4 className="font-semibold mb-3">Incident Response Playbook:</h4>
              <div className="bg-black/60 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <pre>{`// governance/incident-response.md
# Incident Response Runbook

## P0: Critical Incident
1. Execute emergency shutdown: \`./scripts/emergency-stop.sh\`
2. Page on-call: PagerDuty "P0-Agent-Incident"
3. Create incident channel: #incident-YYYY-MM-DD-HHMM
4. Notify stakeholders within 15 minutes
5. Preserve evidence: \`./scripts/preserve-logs.sh\`
6. Begin investigation with security team

## Communication Escalation
- 0-15 min: Internal team
- 15-60 min: Management + compliance
- 1-4 hours: Legal, PR (if public-facing)
- 4-24 hours: Affected users (if data breach)

## Post-Incident
- Document timeline and root cause
- Update runbooks and safeguards
- Conduct blameless retrospective
- File regulatory disclosures if required`}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Download Template */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-[#06D6A0]/30 bg-gradient-to-br from-[#06D6A0]/10 to-transparent">
          <CardHeader>
            <CardTitle>Download Complete Governance Framework</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/70 mb-4">
              Get the full governance framework as a customizable template package:
            </p>
            <ul className="text-sm space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <CheckIcon />
                <span>Approval workflow templates (JSON/YAML)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon />
                <span>Escalation decision trees</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon />
                <span>Incident response playbooks</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon />
                <span>Role definitions and responsibilities</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon />
                <span>Logging configuration examples</span>
              </li>
            </ul>
            <div className="bg-black/40 rounded-lg p-4 font-mono text-xs">
              <pre>{`# Download governance templates
curl -O https://foragents.dev/api/governance/templates.zip

# Or clone the reference implementation
git clone https://github.com/foragents/governance-framework`}</pre>
            </div>
          </CardContent>
        </Card>
      </section>

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
              href="/compliance/audit" 
              className="text-sm text-[#06D6A0] hover:underline"
            >
              Audit Log Guide →
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

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-[#06D6A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
