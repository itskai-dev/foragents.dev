"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

export default function TokenVaultPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with email list service
    console.log("Email submitted:", email);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Breadcrumb */}
      <div className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/connectors" className="hover:text-foreground transition-colors">
              Connectors
            </Link>
            <span>/</span>
            <span className="text-foreground">Token Vault</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-purple/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 right-1/3 w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] bg-[#06D6A0]/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
            Coming Soon
          </Badge>
          <div className="text-6xl mb-6">🔐</div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC] mb-4">
            Token Vault
          </h1>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto mb-6">
            Secure OAuth token storage with automatic refresh, multi-agent sharing, and comprehensive audit logs
          </p>
          <p className="text-sm text-muted-foreground">
            The missing piece for production agent systems
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* The Problem */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        
        <Card className="bg-card/30 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <span className="text-red-400">⚠️</span> The OAuth Token Problem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/90">
            <p>
              Managing OAuth tokens for AI agents is <strong>surprisingly hard</strong>:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-red-400 mt-1">•</span>
                <div>
                  <strong>Tokens expire</strong> — Access tokens expire after 1 hour. Your agent needs to refresh them automatically, 
                  store the new tokens, and handle refresh failures gracefully.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-400 mt-1">•</span>
                <div>
                  <strong>Multiple agents need access</strong> — Your coding agent, monitoring agent, and deployment agent 
                  all need GitHub access. Do you authorize each one separately?
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-400 mt-1">•</span>
                <div>
                  <strong>Security is complex</strong> — Tokens must be encrypted at rest, access must be audited, 
                  and rotation policies must be enforced. Most teams get this wrong.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-400 mt-1">•</span>
                <div>
                  <strong>No visibility</strong> — When did your agent last use GitHub? Which scopes are being used? 
                  Has a token been compromised? You have no idea.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-400 mt-1">•</span>
                <div>
                  <strong>Revocation is manual</strong> — If a token leaks, you need to manually revoke it in each service, 
                  update environment variables, and restart agents. Painful and error-prone.
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* The Solution */}
        <Card className="bg-gradient-to-br from-purple/5 via-card/80 to-[#06D6A0]/5 border-[#06D6A0]/20">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <span className="text-[#06D6A0]">✓</span> Introducing Token Vault
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/90">
            <p className="text-lg">
              A <strong className="text-[#06D6A0]">hosted token management service</strong> designed specifically for AI agents:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-[#06D6A0] mt-1">✓</span>
                <div>
                  <strong>Automatic token refresh</strong> — Vault monitors token expiration and refreshes them 
                  before they expire. Your agents never see a 401.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-[#06D6A0] mt-1">✓</span>
                <div>
                  <strong>Multi-agent sharing</strong> — Authorize once, use everywhere. All your agents access 
                  the same tokens through a simple API.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-[#06D6A0] mt-1">✓</span>
                <div>
                  <strong>Enterprise-grade security</strong> — AES-256 encryption at rest, mTLS in transit, 
                  SOC 2 compliant infrastructure, automatic key rotation.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-[#06D6A0] mt-1">✓</span>
                <div>
                  <strong>Comprehensive audit logs</strong> — Every token access is logged with agent identity, 
                  timestamp, and action. Perfect for compliance and debugging.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-[#06D6A0] mt-1">✓</span>
                <div>
                  <strong>One-click revocation</strong> — Instantly revoke compromised tokens across all services 
                  from a single dashboard. No agent restarts needed.
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold border border-purple-500/30">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Connect Services via Web Dashboard</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Visit vault.foragents.dev, complete OAuth flows for GitHub, Slack, Linear, etc. 
                  All tokens stored encrypted in the vault.
                </p>
                <div className="bg-black/40 rounded p-3 font-mono text-xs">
                  <span className="text-purple-400"># You authorize once in your browser:</span><br/>
                  <span className="text-foreground/80">vault.foragents.dev → Connect GitHub → [OAuth flow] → ✓ Connected</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold border border-purple-500/30">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Configure Your Agents</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Give each agent a unique API key. They request tokens from the vault as needed.
                </p>
                <div className="bg-black/40 rounded p-3 font-mono text-xs">
                  <span className="text-purple-400"># In your agent&apos;s config:</span><br/>
                  <span className="text-foreground/80">VAULT_API_KEY=vault_sk_abc123</span><br/>
                  <span className="text-foreground/80">VAULT_URL=https://api.vault.foragents.dev</span><br/><br/>
                  <span className="text-purple-400"># Agent fetches tokens on demand:</span><br/>
                  <span className="text-foreground/80">token = await vault.getToken(&apos;github&apos;)</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold border border-purple-500/30">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Vault Handles Everything</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Token refresh, encryption, rotation, auditing — all automatic. You just use the tokens.
                </p>
                <div className="bg-black/40 rounded p-3 font-mono text-xs">
                  <span className="text-purple-400"># Vault automatically:</span><br/>
                  <span className="text-foreground/80">- Refreshes tokens before they expire</span><br/>
                  <span className="text-foreground/80">- Logs every access for audit trail</span><br/>
                  <span className="text-foreground/80">- Rotates encryption keys monthly</span><br/>
                  <span className="text-foreground/80">- Alerts on suspicious activity</span>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          
          <Card className="bg-card/30 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-2xl">🔄</span> Automatic Refresh
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Vault monitors token TTLs and proactively refreshes them. Supports rotating refresh tokens 
              (Jira, Notion) and static tokens (GitHub, Slack).
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-2xl">👥</span> Team Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Share tokens across team agents. Granular permissions: which agents can access which services. 
              Perfect for collaborative agent systems.
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-2xl">📊</span> Usage Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Visualize which agents use which services, peak usage times, and cost attribution. 
              Export logs for compliance audits.
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-2xl">🚨</span> Security Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Anomaly detection for unusual access patterns. Instant notifications via Slack, email, or webhook 
              when suspicious activity is detected.
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-2xl">⏱️</span> Expiration Warnings
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Get notified when refresh tokens are about to expire (e.g., Jira after 90 days of inactivity). 
              Avoid unexpected authorization failures.
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-2xl">🔌</span> Simple API
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              RESTful API with SDKs for Node.js, Python, Go. Works with any MCP server. 
              Drop-in replacement for environment variables.
            </CardContent>
          </Card>

        </div>

        {/* Code Example */}
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Usage Example</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black/60 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground/90">{`import { VaultClient } from '@foragents/vault';

const vault = new VaultClient({
  apiKey: process.env.VAULT_API_KEY
});

// Get a token (vault handles refresh automatically)
const githubToken = await vault.getToken('github');

// Use it with your favorite library
const octokit = new Octokit({ auth: githubToken });
const repos = await octokit.repos.listForAuthenticatedUser();

// Check token metadata
const info = await vault.getTokenInfo('github');
console.log(\`Token expires: \${info.expiresAt}\`);
console.log(\`Last refreshed: \${info.lastRefreshed}\`);
console.log(\`Scopes: \${info.scopes.join(', ')}\`);

// Revoke if compromised
await vault.revokeToken('github');`}</pre>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Preview */}
        <Card className="bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5 border-[#06D6A0]/20">
          <CardHeader>
            <CardTitle className="text-2xl">Pricing (Preview)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Free Tier */}
              <div className="p-4 rounded-lg border border-white/10 bg-card/20">
                <h3 className="font-bold text-lg mb-2">Free</h3>
                <p className="text-3xl font-bold mb-2">$0</p>
                <p className="text-sm text-muted-foreground mb-4">Perfect for individuals</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-[#06D6A0]">✓</span>
                    <span>Up to 3 services</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#06D6A0]">✓</span>
                    <span>2 agents</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#06D6A0]">✓</span>
                    <span>Automatic refresh</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#06D6A0]">✓</span>
                    <span>7-day audit logs</span>
                  </li>
                </ul>
              </div>

              {/* Pro Tier */}
              <div className="p-4 rounded-lg border-2 border-purple-500/30 bg-purple-500/5 relative">
                <Badge className="absolute -top-3 right-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
                  Popular
                </Badge>
                <h3 className="font-bold text-lg mb-2">Pro</h3>
                <p className="text-3xl font-bold mb-2">$19<span className="text-sm font-normal">/mo</span></p>
                <p className="text-sm text-muted-foreground mb-4">For power users</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-[#06D6A0]">✓</span>
                    <span>Unlimited services</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#06D6A0]">✓</span>
                    <span>10 agents</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#06D6A0]">✓</span>
                    <span>90-day audit logs</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#06D6A0]">✓</span>
                    <span>Security alerts</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#06D6A0]">✓</span>
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>

              {/* Team Tier */}
              <div className="p-4 rounded-lg border border-white/10 bg-card/20">
                <h3 className="font-bold text-lg mb-2">Team</h3>
                <p className="text-3xl font-bold mb-2">$99<span className="text-sm font-normal">/mo</span></p>
                <p className="text-sm text-muted-foreground mb-4">For organizations</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-[#06D6A0]">✓</span>
                    <span>Unlimited everything</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#06D6A0]">✓</span>
                    <span>Unlimited audit retention</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#06D6A0]">✓</span>
                    <span>Team sharing & roles</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#06D6A0]">✓</span>
                    <span>SSO / SAML</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#06D6A0]">✓</span>
                    <span>SLA & phone support</span>
                  </li>
                </ul>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Email Signup */}
        <Card className="bg-gradient-to-br from-purple/10 via-card/80 to-[#06D6A0]/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Get Early Access</CardTitle>
            <p className="text-center text-muted-foreground">
              Token Vault launches Q2 2026. Join the waitlist for beta access and launch discount.
            </p>
          </CardHeader>
          <CardContent>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/50"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold hover:brightness-110 transition-all"
                  >
                    Join Waitlist
                  </button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  No spam. Just product updates and early access invites.
                </p>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="text-5xl mb-3">✓</div>
                <p className="text-lg font-semibold text-[#06D6A0] mb-2">You&apos;re on the list!</p>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll email you when Token Vault launches.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learn More */}
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Learn More</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/connectors/oauth-guide"
              className="flex items-center justify-between p-4 rounded-lg bg-card/40 border border-white/10 hover:border-purple-500/30 transition-all group"
            >
              <div>
                <p className="font-semibold text-foreground">OAuth Guide for Agents</p>
                <p className="text-sm text-muted-foreground">
                  Understand OAuth flows for headless agents
                </p>
              </div>
              <span className="text-purple-400 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>

            <Link
              href="/connectors"
              className="flex items-center justify-between p-4 rounded-lg bg-card/40 border border-white/10 hover:border-purple-500/30 transition-all group"
            >
              <div>
                <p className="font-semibold text-foreground">Browse Connectors</p>
                <p className="text-sm text-muted-foreground">
                  Explore 12+ OAuth-ready MCP connectors
                </p>
              </div>
              <span className="text-purple-400 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>

            <Link
              href="/contact"
              className="flex items-center justify-between p-4 rounded-lg bg-card/40 border border-white/10 hover:border-purple-500/30 transition-all group"
            >
              <div>
                <p className="font-semibold text-foreground">Contact Us</p>
                <p className="text-sm text-muted-foreground">
                  Questions about Token Vault? Get in touch.
                </p>
              </div>
              <span className="text-purple-400 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
