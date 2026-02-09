import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, Eye, Shield, Sparkles, Target, Brain } from "lucide-react";

export const metadata = {
  title: "Responsible AI Playbook — forAgents.dev",
  description: "Guidelines for ethical AI agent behavior including bias detection, transparency requirements, user consent patterns, data minimization, and explainability.",
  openGraph: {
    title: "Responsible AI Playbook — forAgents.dev",
    description: "Guidelines for ethical AI agent behavior including bias detection, transparency requirements, user consent patterns, data minimization, and explainability.",
    url: "https://foragents.dev/compliance/responsible-ai",
    siteName: "forAgents.dev",
    type: "website",
  },
};

const principles = [
  {
    icon: Eye,
    title: "Transparency",
    description: "Users should know when they're interacting with an AI agent",
    color: "text-blue-400"
  },
  {
    icon: Shield,
    title: "Bias Mitigation",
    description: "Actively detect and reduce unfair bias in decisions",
    color: "text-green-400"
  },
  {
    icon: Heart,
    title: "User Consent",
    description: "Respect user autonomy and data preferences",
    color: "text-pink-400"
  },
  {
    icon: Target,
    title: "Data Minimization",
    description: "Collect only what's necessary for the task",
    color: "text-orange-400"
  },
  {
    icon: Brain,
    title: "Explainability",
    description: "Agent decisions should be understandable",
    color: "text-purple-400"
  },
  {
    icon: Sparkles,
    title: "Safety",
    description: "Prevent harmful outputs and actions",
    color: "text-yellow-400"
  }
];

export default function ResponsibleAIPage() {
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
            Agent-First Ethics
          </Badge>
          <h1 className="text-[40px] md:text-[48px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Responsible AI Playbook
          </h1>
          <p className="text-xl text-foreground/80">
            Build ethical, trustworthy AI agents through principled design
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Core Principles */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Core Principles</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {principles.map((principle) => {
            const Icon = principle.icon;
            return (
              <div
                key={principle.title}
                className="relative overflow-hidden rounded-xl border border-white/10 bg-card/30 p-6 hover:border-[#06D6A0]/30 transition-colors"
              >
                <div className="mb-4">
                  <Icon className={`w-8 h-8 ${principle.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{principle.title}</h3>
                <p className="text-sm text-foreground/70">{principle.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Bias Detection & Mitigation */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-400" />
              Bias Detection & Mitigation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-foreground/70">
              AI agents can perpetuate or amplify biases from training data. Active testing and mitigation are essential 
              for fair outcomes across all user groups.
            </p>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500 p-4 rounded-r">
                <h3 className="font-semibold mb-2">Types of Bias to Test For</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <div>
                      <strong>Demographic Bias:</strong> Different outcomes for protected classes (race, gender, age, disability)
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <div>
                      <strong>Selection Bias:</strong> Training data not representative of real-world users
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <div>
                      <strong>Confirmation Bias:</strong> Agent reinforces user's existing beliefs without challenge
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <div>
                      <strong>Automation Bias:</strong> Users over-trust AI decisions without verification
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Testing Methodology</h3>
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  <li><strong>Create test datasets</strong> with diverse demographics and edge cases</li>
                  <li><strong>Measure fairness metrics</strong> (disparate impact, equal opportunity, demographic parity)</li>
                  <li><strong>Compare outcomes</strong> across protected groups using statistical tests</li>
                  <li><strong>Red-team adversarially</strong> to find failure modes and harmful edge cases</li>
                  <li><strong>Repeat regularly</strong> as models and data evolve</li>
                </ol>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Mitigation Strategies</h3>
                <div className="space-y-3 text-sm">
                  <div className="pl-4 border-l-2 border-green-500/30">
                    <h4 className="font-semibold text-green-400 mb-1">Pre-processing</h4>
                    <p className="text-foreground/80">Balance training data, remove biased features, apply re-weighting</p>
                  </div>
                  <div className="pl-4 border-l-2 border-green-500/30">
                    <h4 className="font-semibold text-green-400 mb-1">In-processing</h4>
                    <p className="text-foreground/80">Add fairness constraints to model training, use adversarial debiasing</p>
                  </div>
                  <div className="pl-4 border-l-2 border-green-500/30">
                    <h4 className="font-semibold text-green-400 mb-1">Post-processing</h4>
                    <p className="text-foreground/80">Adjust decision thresholds, calibrate outputs across groups</p>
                  </div>
                  <div className="pl-4 border-l-2 border-green-500/30">
                    <h4 className="font-semibold text-green-400 mb-1">Human Oversight</h4>
                    <p className="text-foreground/80">Require human review for sensitive decisions (hiring, lending, medical)</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <h4 className="font-semibold mb-3">Bias Testing Example (Python):</h4>
                <div className="bg-black/60 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                  <pre>{`# Test for disparate impact across protected groups
from sklearn.metrics import confusion_matrix
import pandas as pd

def test_fairness(model, test_data, protected_attribute='gender'):
    """
    Test if model outcomes are fair across groups.
    Disparate Impact Ratio should be > 0.8 (80% rule)
    """
    results = []
    
    for group in test_data[protected_attribute].unique():
        group_data = test_data[test_data[protected_attribute] == group]
        predictions = model.predict(group_data)
        
        positive_rate = (predictions == 1).mean()
        results.append({
            'group': group,
            'positive_rate': positive_rate,
            'count': len(group_data)
        })
    
    df = pd.DataFrame(results)
    
    # Calculate disparate impact
    max_rate = df['positive_rate'].max()
    min_rate = df['positive_rate'].min()
    disparate_impact = min_rate / max_rate if max_rate > 0 else 0
    
    print(f"Disparate Impact Ratio: {disparate_impact:.3f}")
    print(f"{'✓ PASS' if disparate_impact >= 0.8 else '✗ FAIL'} (threshold: 0.8)")
    print("\\nPer-group results:")
    print(df)
    
    return disparate_impact >= 0.8

# Usage
test_fairness(my_agent_model, test_dataset, protected_attribute='race')
test_fairness(my_agent_model, test_dataset, protected_attribute='age_group')`}</pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Transparency Requirements */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-6 h-6 text-blue-400" />
              Transparency Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-foreground/70">
              Users have a right to know when they're interacting with AI and how their data is being used. 
              Transparency builds trust and enables informed consent.
            </p>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-500/10 to-transparent border-l-4 border-blue-500 p-4 rounded-r">
                <h3 className="font-semibold mb-2">Disclosure Requirements</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <div>
                      <strong>AI Identification:</strong> Clearly indicate when users are interacting with an agent (not a human)
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <div>
                      <strong>Capability Disclosure:</strong> Explain what the agent can and cannot do
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <div>
                      <strong>Data Usage:</strong> Tell users what data is collected and how it's used
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <div>
                      <strong>Limitations:</strong> Warn about known failure modes and accuracy constraints
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <div>
                      <strong>Contact Info:</strong> Provide human support for escalation
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Implementation Patterns</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-semibold text-blue-400 mb-1">First Interaction Disclaimer</h4>
                    <div className="bg-black/40 rounded p-3 text-xs">
                      <pre>{`👋 Hi! I'm Kai, an AI agent from Team Reflectt.

I can help you with:
✓ Answering questions about products
✓ Scheduling and reminders
✓ Data analysis and reporting

I cannot:
✗ Make legal or medical decisions
✗ Access your financial accounts
✗ Guarantee 100% accuracy

Your conversations are logged for quality and compliance.
You can request deletion at any time.

Need a human? Type /human or email support@reflectt.ai`}</pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-blue-400 mb-1">Ongoing Transparency Cues</h4>
                    <ul className="text-xs space-y-1 text-foreground/70">
                      <li>• Agent name/avatar clearly AI-themed (not trying to pass as human)</li>
                      <li>• "AI response" tag on messages in mixed human/AI conversations</li>
                      <li>• Uncertainty indicators: "I'm not sure, but..." or confidence scores</li>
                      <li>• Source citations for factual claims</li>
                      <li>• "Generated by AI" watermark on created content</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-blue-400 mb-1">Regulatory Compliance</h4>
                    <ul className="text-xs space-y-1 text-foreground/70">
                      <li>• <strong>California AB 2013:</strong> Bots must disclose they're not human</li>
                      <li>• <strong>EU AI Act:</strong> High-risk systems require transparency documentation</li>
                      <li>• <strong>FTC Guidelines:</strong> No deceptive practices in automated interactions</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <h4 className="font-semibold mb-3">Transparency Config (JSON):</h4>
                <div className="bg-black/60 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                  <pre>{`// transparency-config.json
{
  "agent_disclosure": {
    "enabled": true,
    "trigger": "first_interaction",
    "message": "You're chatting with {{agent_name}}, an AI assistant.",
    "show_avatar_badge": true,
    "allow_human_escalation": true
  },
  "capability_disclosure": {
    "capabilities": [
      "Information retrieval",
      "Task automation",
      "Data analysis"
    ],
    "limitations": [
      "No legal/medical advice",
      "No financial transactions",
      "May make mistakes"
    ],
    "show_in_profile": true
  },
  "data_usage_notice": {
    "privacy_policy_url": "/privacy",
    "data_retention_days": 90,
    "user_controls_url": "/settings/privacy",
    "show_on_first_use": true
  },
  "uncertainty_display": {
    "show_confidence_scores": true,
    "threshold_for_warning": 0.7,
    "disclaimer_for_low_confidence": "I'm not certain about this. Please verify."
  }
}`}</pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* User Consent Patterns */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-400" />
              User Consent Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-foreground/70">
              Respect user autonomy by obtaining explicit, informed consent for data processing and agent actions.
            </p>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-pink-500/10 to-transparent border-l-4 border-pink-500 p-4 rounded-r">
                <h3 className="font-semibold mb-2">Consent Hierarchy</h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-white/5 rounded p-2">
                    <strong className="text-pink-400">Explicit Consent (Required):</strong>
                    <ul className="text-xs mt-1 space-y-1 ml-4">
                      <li>• Processing sensitive data (health, biometric, financial)</li>
                      <li>• Automated decision-making with legal/significant effects</li>
                      <li>• Data sharing with third parties</li>
                      <li>• Marketing communications</li>
                    </ul>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <strong className="text-pink-400">Opt-In (Recommended):</strong>
                    <ul className="text-xs mt-1 space-y-1 ml-4">
                      <li>• Analytics and usage tracking</li>
                      <li>• Feature improvements based on behavior</li>
                      <li>• Non-essential cookies</li>
                    </ul>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <strong className="text-pink-400">Opt-Out (Minimum):</strong>
                    <ul className="text-xs mt-1 space-y-1 ml-4">
                      <li>• Essential service functionality</li>
                      <li>• Security and fraud prevention</li>
                      <li>• Legal compliance (audit logs)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Consent UI Patterns</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-pink-400 mb-2">Granular Controls</h4>
                    <div className="bg-black/40 rounded p-3 text-xs">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked disabled />
                          <span>Essential service functions (required)</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" />
                          <span>Analytics to improve the product</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" />
                          <span>Personalized recommendations</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" />
                          <span>Marketing emails (you can unsubscribe anytime)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-pink-400 mb-2">Just-in-Time Consent</h4>
                    <div className="bg-black/40 rounded p-3 text-xs">
                      <pre>{`🤖 Agent: "To help you with this task, I need to access
your calendar. Is that okay?"

[Allow Once] [Always Allow] [Deny]

Privacy tip: You can change this anytime in Settings.`}</pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-pink-400 mb-2">Consent Versioning</h4>
                    <p className="text-xs text-foreground/70 mb-2">
                      Track consent changes and re-prompt when policies update:
                    </p>
                    <div className="bg-black/40 rounded p-3 text-xs">
                      <pre>{`// Consent record
{
  "user_id": "user_abc123",
  "consent_version": "2.1.0",
  "granted_at": "2026-02-09T10:00:00Z",
  "consents": {
    "data_processing": true,
    "analytics": true,
    "marketing": false,
    "third_party_sharing": false
  },
  "ip_address": "192.168.1.0/24",
  "user_agent": "Mozilla/5.0..."
}`}</pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Best Practices</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400">✓</span>
                    <div><strong>Plain language:</strong> Avoid legal jargon, explain in simple terms</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400">✓</span>
                    <div><strong>Unbundled:</strong> Separate checkboxes for different purposes (not "accept all")</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400">✓</span>
                    <div><strong>Easy to revoke:</strong> Accessible settings page with clear toggles</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400">✓</span>
                    <div><strong>No dark patterns:</strong> Denying consent shouldn't be harder than accepting</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400">✓</span>
                    <div><strong>Audit trail:</strong> Log all consent actions with timestamps</div>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Data Minimization */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-6 h-6 text-orange-400" />
              Data Minimization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-foreground/70">
              Collect only the data necessary for the specific task. Less data means less risk, lower storage costs, 
              and easier compliance.
            </p>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-orange-500/10 to-transparent border-l-4 border-orange-500 p-4 rounded-r">
                <h3 className="font-semibold mb-2">Principles</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400">1.</span>
                    <div><strong>Purpose limitation:</strong> Collect data only for a specific, declared purpose</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400">2.</span>
                    <div><strong>Data adequacy:</strong> Ensure data is sufficient for the task</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400">3.</span>
                    <div><strong>Data minimization:</strong> Collect only what's necessary, nothing more</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400">4.</span>
                    <div><strong>Storage limitation:</strong> Delete data when it's no longer needed</div>
                  </li>
                </ul>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Implementation Strategies</h3>
                <div className="space-y-3 text-sm">
                  <div className="pl-4 border-l-2 border-orange-500/30">
                    <h4 className="font-semibold text-orange-400 mb-1">Anonymization & Pseudonymization</h4>
                    <p className="text-foreground/80 text-xs mb-2">Remove or hash personal identifiers before storage</p>
                    <div className="bg-black/40 rounded p-2 font-mono text-xs">
                      <pre>{`// Hash user IDs for analytics
const anonymousId = crypto
  .createHash('sha256')
  .update(userId + SECRET_SALT)
  .digest('hex')
  .substring(0, 16);

logAnalytics({ user: anonymousId, action: 'clicked_button' });`}</pre>
                    </div>
                  </div>

                  <div className="pl-4 border-l-2 border-orange-500/30">
                    <h4 className="font-semibold text-orange-400 mb-1">Aggregation & Sampling</h4>
                    <p className="text-foreground/80 text-xs">Store aggregated metrics instead of individual records</p>
                    <div className="bg-black/40 rounded p-2 font-mono text-xs">
                      <pre>{`// Store daily summaries, not individual events
{
  "date": "2026-02-09",
  "total_actions": 1247,
  "avg_response_time_ms": 234,
  "error_rate": 0.02
  // Individual user data deleted after aggregation
}`}</pre>
                    </div>
                  </div>

                  <div className="pl-4 border-l-2 border-orange-500/30">
                    <h4 className="font-semibold text-orange-400 mb-1">Differential Privacy</h4>
                    <p className="text-foreground/80 text-xs">Add calibrated noise to protect individual privacy in datasets</p>
                  </div>

                  <div className="pl-4 border-l-2 border-orange-500/30">
                    <h4 className="font-semibold text-orange-400 mb-1">Local Processing</h4>
                    <p className="text-foreground/80 text-xs">Process sensitive data on-device instead of sending to server</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Data Minimization Checklist</h3>
                <div className="space-y-2 text-sm">
                  <label className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" />
                    <span>Document why each data field is necessary</span>
                  </label>
                  <label className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" />
                    <span>Set retention periods for all data types</span>
                  </label>
                  <label className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" />
                    <span>Automate data deletion after retention expires</span>
                  </label>
                  <label className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" />
                    <span>Anonymize/pseudonymize where possible</span>
                  </label>
                  <label className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" />
                    <span>Prefer aggregated metrics over raw logs</span>
                  </label>
                  <label className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" />
                    <span>Regular data audits to remove unused fields</span>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Explainability */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              Explainability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-foreground/70">
              Users and auditors should be able to understand why an agent made a specific decision. 
              Explainability enables trust, debugging, and compliance.
            </p>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-500/10 to-transparent border-l-4 border-purple-500 p-4 rounded-r">
                <h3 className="font-semibold mb-2">Levels of Explainability</h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-white/5 rounded p-2">
                    <strong className="text-purple-400">Global:</strong> How does the agent work in general?
                    <p className="text-xs text-foreground/70 mt-1">
                      "I use GPT-4 to understand your requests and decide which tools to use."
                    </p>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <strong className="text-purple-400">Local:</strong> Why did the agent make this specific decision?
                    <p className="text-xs text-foreground/70 mt-1">
                      "I scheduled the meeting at 2pm because your calendar shows you're free then, and the other attendee requested afternoon availability."
                    </p>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <strong className="text-purple-400">Counterfactual:</strong> What would need to change for a different outcome?
                    <p className="text-xs text-foreground/70 mt-1">
                      "If your credit score were above 700, you'd qualify for the lower interest rate."
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Techniques</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-semibold text-purple-400 mb-1">1. Chain-of-Thought Logging</h4>
                    <p className="text-xs text-foreground/70 mb-2">Log the agent's reasoning process:</p>
                    <div className="bg-black/40 rounded p-2 text-xs">
                      <pre>{`{
  "request": "Book a flight to NYC",
  "reasoning": [
    "User wants to travel to NYC",
    "Checking calendar for available dates",
    "Found free days: Feb 15-17",
    "Searching flights for those dates",
    "Comparing prices across airlines",
    "Cheapest option: $320 on Delta",
    "Selected Delta flight DL1234"
  ],
  "action": "book_flight",
  "parameters": {
    "airline": "Delta",
    "flight": "DL1234",
    "price": 320
  }
}`}</pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-purple-400 mb-1">2. Feature Importance</h4>
                    <p className="text-xs text-foreground/70 mb-2">Show which factors influenced the decision:</p>
                    <div className="bg-black/40 rounded p-2 text-xs">
                      <pre>{`Decision: Approved loan application

Most important factors:
✓ Credit score (780) — 35% weight
✓ Income ($85k) — 25% weight
✓ Debt-to-income ratio (0.22) — 20% weight
✓ Employment history (5 years) — 15% weight
✓ Previous loan performance — 5% weight`}</pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-purple-400 mb-1">3. Confidence Scores</h4>
                    <p className="text-xs text-foreground/70 mb-2">Express uncertainty in agent responses:</p>
                    <div className="bg-black/40 rounded p-2 text-xs">
                      <pre>{`Agent: "Based on the data, I recommend Strategy B."
Confidence: 73% (Medium)

Alternative considered:
- Strategy A: 27% confidence`}</pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-purple-400 mb-1">4. Source Attribution</h4>
                    <p className="text-xs text-foreground/70 mb-2">Cite sources for factual claims:</p>
                    <div className="bg-black/40 rounded p-2 text-xs">
                      <pre>{`Agent: "The GDP growth rate was 2.3% last quarter."

Source: U.S. Bureau of Economic Analysis
Link: https://bea.gov/data/gdp/gross-domestic-product
Retrieved: 2026-02-09
Confidence: High (official government data)`}</pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Explainability API Example:</h3>
                <div className="bg-black/60 rounded p-3 font-mono text-xs overflow-x-auto">
                  <pre>{`// Agent action with explanation
POST /agent/action
{
  "action": "send_email",
  "parameters": { "to": "client@example.com", "subject": "Proposal" },
  "explain": true  // Request explanation
}

// Response with explanation
{
  "status": "success",
  "explanation": {
    "why": "You asked me to follow up with the client about the proposal from yesterday's meeting.",
    "inputs_used": [
      "Meeting notes from 2026-02-08",
      "Client email address from CRM",
      "Proposal template from /templates"
    ],
    "confidence": 0.92,
    "alternatives_considered": [
      "Schedule a call instead (confidence: 0.34)",
      "Wait for client to reach out (confidence: 0.15)"
    ],
    "risk_factors": ["None detected"],
    "approval_status": "auto-approved (low risk action)"
  }
}`}</pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Reference */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-[#06D6A0]/30 bg-gradient-to-br from-[#06D6A0]/10 to-transparent">
          <CardHeader>
            <CardTitle>Responsible AI Quick Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">✓ Do:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Test for bias across demographics</li>
                  <li>• Disclose AI identity clearly</li>
                  <li>• Obtain explicit consent for sensitive data</li>
                  <li>• Minimize data collection</li>
                  <li>• Explain decisions with reasoning</li>
                  <li>• Provide human escalation paths</li>
                  <li>• Log all actions for auditability</li>
                  <li>• Update policies and re-prompt users</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">✗ Don't:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Pretend to be human</li>
                  <li>• Hide that you're AI</li>
                  <li>• Bundle consent into "accept all"</li>
                  <li>• Collect data "just in case"</li>
                  <li>• Make black-box decisions in high-stakes contexts</li>
                  <li>• Use dark patterns to trick users</li>
                  <li>• Ignore known biases</li>
                  <li>• Skip bias testing</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 text-xs text-foreground/70">
              <strong>Remember:</strong> Responsible AI isn't just about compliance—it's about building systems that 
              users can trust and that make the world better, not worse.
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
              href="/compliance/audit" 
              className="text-sm text-[#06D6A0] hover:underline"
            >
              Audit Log Guide →
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
