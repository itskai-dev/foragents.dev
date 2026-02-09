import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "OAuth 2.0 for Agents — forAgents.dev",
  description: "Learn how AI agents authenticate with OAuth 2.0 without browsers: token refresh, secure storage, and proxy patterns.",
  openGraph: {
    title: "OAuth 2.0 for Agents — forAgents.dev",
    description: "Learn how AI agents authenticate with OAuth 2.0 without browsers: token refresh, secure storage, and proxy patterns.",
    url: "https://foragents.dev/connectors/oauth-guide",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function OAuthGuidePage() {
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
            <span className="text-foreground">OAuth Guide</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-purple/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-6">🔐</div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC] mb-4">
            OAuth 2.0 for AI Agents
          </h1>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            How agents authenticate without browsers: token refresh, secure storage, and proxy patterns
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* What is OAuth */}
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">What is OAuth 2.0?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/90">
            <p>
              <strong className="text-[#06D6A0]">OAuth 2.0</strong> is an authorization framework that enables applications to obtain 
              limited access to user accounts on an HTTP service. Instead of sharing passwords, users authorize 
              applications with scoped access tokens.
            </p>
            <p>
              For AI agents, OAuth means:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Secure access to third-party services without exposing credentials</li>
              <li>User-authorized access with fine-grained permissions (scopes)</li>
              <li>Token refresh for long-running operations</li>
              <li>Revocable access that users can manage</li>
            </ul>
          </CardContent>
        </Card>

        {/* The Challenge */}
        <Card className="bg-card/30 border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <span className="text-amber-400">⚠️</span> The Agent Challenge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/90">
            <p>
              Traditional OAuth flows assume a <strong>human user with a web browser</strong>:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>User clicks &quot;Connect GitHub&quot;</li>
              <li>Redirected to GitHub login page</li>
              <li>User authorizes scopes</li>
              <li>Redirected back with authorization code</li>
              <li>App exchanges code for access token</li>
            </ol>
            <p className="pt-4">
              <strong>But agents don&apos;t have browsers.</strong> They run headless, in terminals, or as background services. 
              How do they complete OAuth flows?
            </p>
          </CardContent>
        </Card>

        {/* Solutions */}
        <Card className="bg-card/30 border-[#06D6A0]/20">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <span className="text-[#06D6A0]">✓</span> Solutions for Agents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Solution 1 */}
            <div className="p-4 rounded-lg bg-black/20 border border-white/5">
              <h3 className="text-lg font-semibold text-[#06D6A0] mb-2">1. Human-in-the-Loop (Recommended)</h3>
              <p className="text-foreground/90 mb-3">
                The agent asks the human to complete OAuth authorization, then receives the token.
              </p>
              <div className="bg-black/40 rounded p-3 font-mono text-sm text-foreground/80">
                Agent: &quot;I need GitHub access. Visit this URL to authorize:&quot;<br/>
                https://github.com/login/oauth/authorize?client_id=...<br/><br/>
                Human: [clicks, authorizes, copies callback URL]<br/><br/>
                Agent: &quot;Paste the callback URL here:&quot;<br/>
                Human: https://myapp.com/callback?code=ABC123<br/><br/>
                Agent: ✓ Connected! Token stored securely.
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                <strong>Best for:</strong> Initial setup, personal agents, CLI tools
              </p>
            </div>

            {/* Solution 2 */}
            <div className="p-4 rounded-lg bg-black/20 border border-white/5">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">2. OAuth Proxy Service</h3>
              <p className="text-foreground/90 mb-3">
                A web service handles the OAuth flow on behalf of the agent.
              </p>
              <div className="bg-black/40 rounded p-3 font-mono text-sm text-foreground/80">
                Agent → Proxy: &quot;Start OAuth flow for GitHub&quot;<br/>
                Proxy → Human: Opens browser to GitHub authorization<br/>
                Human → GitHub: Authorizes access<br/>
                GitHub → Proxy: Redirects with code<br/>
                Proxy → Agent: Returns access token<br/>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                <strong>Best for:</strong> Multi-agent systems, managed platforms, hosted agents
              </p>
            </div>

            {/* Solution 3 */}
            <div className="p-4 rounded-lg bg-black/20 border border-white/5">
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">3. Pre-Authorized Tokens</h3>
              <p className="text-foreground/90 mb-3">
                Human completes OAuth once, stores tokens in a vault, agent retrieves them.
              </p>
              <div className="bg-black/40 rounded p-3 font-mono text-sm text-foreground/80">
                Human: [Uses web dashboard to connect GitHub]<br/>
                Vault: Stores access + refresh tokens securely<br/>
                Agent: Fetches token from vault when needed<br/>
                Vault: Automatically refreshes expired tokens<br/>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                <strong>Best for:</strong> Production systems, team agents, automatic token refresh
              </p>
              <Link href="/connectors/vault" className="text-purple-400 hover:underline text-sm mt-2 inline-block">
                → Learn about Token Vault (Coming Soon)
              </Link>
            </div>

            {/* Solution 4 */}
            <div className="p-4 rounded-lg bg-black/20 border border-white/5">
              <h3 className="text-lg font-semibold text-rose-400 mb-2">4. Device Flow (OAuth 2.0 Device Authorization Grant)</h3>
              <p className="text-foreground/90 mb-3">
                Designed for devices without browsers. Agent shows a code, human authorizes on another device.
              </p>
              <div className="bg-black/40 rounded p-3 font-mono text-sm text-foreground/80">
                Agent: "Go to https://github.com/login/device"<br/>
                Agent: "Enter code: ABCD-1234"<br/>
                Human: [Visits URL on phone/computer, enters code]<br/>
                Agent: [Polls for authorization completion]<br/>
                Agent: ✓ Authorized!
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                <strong>Best for:</strong> CLI tools, IoT devices, terminal-only agents<br/>
                <strong>Supported by:</strong> GitHub, Google, Auth0, many others
              </p>
            </div>

          </CardContent>
        </Card>

        {/* Token Refresh */}
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Token Refresh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/90">
            <p>
              Most OAuth access tokens <strong>expire after 1 hour</strong>. Refresh tokens let agents 
              get new access tokens without re-authorizing.
            </p>
            <div className="bg-black/40 rounded-lg p-4 font-mono text-sm">
              <div className="text-purple-400"># When access token expires (401 Unauthorized):</div>
              <div className="mt-2">POST https://provider.com/oauth/token</div>
              <div className="text-muted-foreground ml-4">grant_type=refresh_token</div>
              <div className="text-muted-foreground ml-4">refresh_token=REFRESH_TOKEN_HERE</div>
              <div className="text-muted-foreground ml-4">client_id=YOUR_CLIENT_ID</div>
              <div className="text-muted-foreground ml-4">client_secret=YOUR_CLIENT_SECRET</div>
              <div className="mt-3 text-[#06D6A0]"># Response:</div>
              <div className="text-foreground/80">{'{'}</div>
              <div className="text-foreground/80 ml-4">&quot;access_token&quot;: &quot;new_access_token&quot;,</div>
              <div className="text-foreground/80 ml-4">&quot;expires_in&quot;: 3600,</div>
              <div className="text-foreground/80 ml-4">&quot;refresh_token&quot;: &quot;new_refresh_token&quot; <span className="text-muted-foreground">{'// Some providers rotate'}</span></div>
              <div className="text-foreground/80">{'}'}</div>
            </div>
            <p>
              <strong>⚠️ Important:</strong> Some providers (like Jira) issue new refresh tokens with each refresh. 
              Always save the new refresh token!
            </p>
          </CardContent>
        </Card>

        {/* Secure Storage */}
        <Card className="bg-card/30 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <span className="text-red-400">🔒</span> Secure Token Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/90">
            <p>
              <strong className="text-red-400">Never store tokens in plain text!</strong> Treat OAuth tokens like passwords.
            </p>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-[#06D6A0] mb-1">✓ Good Practices:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Use environment variables (for development)</li>
                  <li>Encrypt tokens at rest (production)</li>
                  <li>Store in secure key vaults (AWS Secrets Manager, HashiCorp Vault)</li>
                  <li>Use OS keychains (macOS Keychain, Windows Credential Manager)</li>
                  <li>Implement token rotation policies</li>
                  <li>Audit token access logs</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-400 mb-1">✗ Bad Practices:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Hardcoding tokens in source code</li>
                  <li>Committing tokens to version control</li>
                  <li>Storing in plain text files</li>
                  <li>Logging tokens in debug output</li>
                  <li>Sharing tokens between agents without encryption</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Example Flow */}
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl">Example: GitHub OAuth Flow for CLI Agent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-black/60 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground/90">{`# 1. Agent generates authorization URL
const authUrl = \`https://github.com/login/oauth/authorize?
  client_id=YOUR_CLIENT_ID
  &redirect_uri=http://localhost:8080/callback
  &scope=repo%20workflow\`;

console.log(\`Please visit: \${authUrl}\`);

# 2. Start local callback server
const server = http.createServer(async (req, res) => {
  const code = new URL(req.url, 'http://localhost').searchParams.get('code');
  
  // 3. Exchange code for token
  const tokenResponse = await fetch(
    'https://github.com/login/oauth/access_token',
    {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code
      })
    }
  );
  
  const { access_token } = await tokenResponse.json();
  
  // 4. Store securely
  await storeTokenSecurely('github', access_token);
  
  res.end('✓ Authorized! You can close this window.');
  server.close();
});

server.listen(8080);`}</pre>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card className="bg-gradient-to-br from-purple/5 via-card/80 to-[#06D6A0]/5 border-[#06D6A0]/20">
          <CardHeader>
            <CardTitle className="text-2xl">Best Practices Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3 p-3 rounded-lg bg-black/20">
              <span className="text-[#06D6A0] text-lg">✓</span>
              <div>
                <p className="font-semibold text-foreground">Use scoped permissions</p>
                <p className="text-sm text-muted-foreground">Request only the OAuth scopes your agent actually needs</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-lg bg-black/20">
              <span className="text-[#06D6A0] text-lg">✓</span>
              <div>
                <p className="font-semibold text-foreground">Implement token refresh</p>
                <p className="text-sm text-muted-foreground">Handle 401 errors gracefully and refresh expired tokens automatically</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-lg bg-black/20">
              <span className="text-[#06D6A0] text-lg">✓</span>
              <div>
                <p className="font-semibold text-foreground">Store tokens securely</p>
                <p className="text-sm text-muted-foreground">Encrypt at rest, use key vaults, never commit to git</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-lg bg-black/20">
              <span className="text-[#06D6A0] text-lg">✓</span>
              <div>
                <p className="font-semibold text-foreground">Provide clear user flows</p>
                <p className="text-sm text-muted-foreground">Make authorization easy for humans to complete</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-lg bg-black/20">
              <span className="text-[#06D6A0] text-lg">✓</span>
              <div>
                <p className="font-semibold text-foreground">Support token revocation</p>
                <p className="text-sm text-muted-foreground">Allow users to disconnect and revoke access easily</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-lg bg-black/20">
              <span className="text-[#06D6A0] text-lg">✓</span>
              <div>
                <p className="font-semibold text-foreground">Log OAuth events</p>
                <p className="text-sm text-muted-foreground">Track authorizations, refreshes, and failures for debugging</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-card/30 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-2xl">Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
              href="/connectors/vault"
              className="flex items-center justify-between p-4 rounded-lg bg-card/40 border border-white/10 hover:border-purple-500/30 transition-all group"
            >
              <div>
                <p className="font-semibold text-foreground">Token Vault (Coming Soon)</p>
                <p className="text-sm text-muted-foreground">
                  Managed OAuth token storage with automatic refresh
                </p>
              </div>
              <span className="text-purple-400 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>

            <Link
              href="/guides"
              className="flex items-center justify-between p-4 rounded-lg bg-card/40 border border-white/10 hover:border-purple-500/30 transition-all group"
            >
              <div>
                <p className="font-semibold text-foreground">More Agent Guides</p>
                <p className="text-sm text-muted-foreground">
                  Learn to build powerful AI agents
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
