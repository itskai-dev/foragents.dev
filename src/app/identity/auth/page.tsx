"use client";

import { useState } from "react";
import Link from "next/link";
import { Key, Lock, Server, CheckCircle, XCircle } from "lucide-react";

interface AuthMethod {
  name: string;
  icon: string;
  difficulty: string;
  security: string;
  scalability: string;
  useCases: string[];
  pros: string[];
  cons: string[];
}

const AUTH_METHODS: AuthMethod[] = [
  {
    name: "API Keys",
    icon: "🔑",
    difficulty: "Easy",
    security: "Low-Medium",
    scalability: "High",
    useCases: ["Simple integrations", "Development/testing", "Read-only access"],
    pros: ["Simple to implement", "No complex flows", "Widely supported"],
    cons: ["Hard to rotate", "Easily leaked", "No expiration", "All-or-nothing permissions"],
  },
  {
    name: "OAuth 2.0",
    icon: "🔐",
    difficulty: "Medium",
    security: "High",
    scalability: "High",
    useCases: ["User-delegated access", "Third-party integrations", "Multi-tenant apps"],
    pros: ["Industry standard", "Granular scopes", "Token refresh", "User consent flow"],
    cons: ["Complex implementation", "Redirect flows needed", "Token storage required"],
  },
  {
    name: "JWT (JSON Web Tokens)",
    icon: "🎫",
    difficulty: "Medium",
    security: "Medium-High",
    scalability: "High",
    useCases: ["Stateless auth", "Microservices", "Agent-to-agent communication"],
    pros: ["Self-contained", "No server state", "Standardized format", "Can embed claims"],
    cons: ["Cannot revoke easily", "Larger than opaque tokens", "Clock skew issues"],
  },
  {
    name: "mTLS (Mutual TLS)",
    icon: "🔒",
    difficulty: "Hard",
    security: "Very High",
    scalability: "Medium",
    useCases: ["High-security environments", "Agent-to-agent trust", "Zero-trust networks"],
    pros: [
      "Cryptographic proof",
      "Transport-layer security",
      "No credentials in app layer",
      "Mutual authentication",
    ],
    cons: ["Complex PKI setup", "Certificate management overhead", "Harder to debug"],
  },
];

const COMPARISON_MATRIX = [
  {
    criterion: "Setup Complexity",
    apiKey: "⭐",
    oauth: "⭐⭐⭐",
    jwt: "⭐⭐",
    mtls: "⭐⭐⭐⭐",
  },
  {
    criterion: "Security Level",
    apiKey: "⭐⭐",
    oauth: "⭐⭐⭐⭐",
    jwt: "⭐⭐⭐",
    mtls: "⭐⭐⭐⭐⭐",
  },
  {
    criterion: "Rotation Ease",
    apiKey: "⭐",
    oauth: "⭐⭐⭐⭐",
    jwt: "⭐⭐⭐",
    mtls: "⭐⭐",
  },
  {
    criterion: "Granular Permissions",
    apiKey: "⭐",
    oauth: "⭐⭐⭐⭐⭐",
    jwt: "⭐⭐⭐⭐",
    mtls: "⭐⭐",
  },
  {
    criterion: "Scalability",
    apiKey: "⭐⭐⭐⭐⭐",
    oauth: "⭐⭐⭐⭐",
    jwt: "⭐⭐⭐⭐⭐",
    mtls: "⭐⭐⭐",
  },
  {
    criterion: "Revocation Speed",
    apiKey: "⭐⭐⭐",
    oauth: "⭐⭐⭐⭐",
    jwt: "⭐",
    mtls: "⭐⭐⭐⭐",
  },
];

const CODE_EXAMPLES = {
  apiKey: {
    server: `// Server-side verification
import crypto from 'crypto';

const API_KEYS = new Map([
  ['agent-123', { hash: '...', permissions: ['read', 'write'] }]
]);

function validateApiKey(req: Request): boolean {
  const apiKey = req.headers.get('X-API-Key');
  if (!apiKey) return false;
  
  const agentId = apiKey.split('-')[1];
  const stored = API_KEYS.get(agentId);
  
  if (!stored) return false;
  
  // Compare hashes (constant-time)
  const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(stored.hash)
  );
}`,
    client: `// Client-side usage
const API_KEY = process.env.MY_API_KEY;

const response = await fetch('https://api.example.com/data', {
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
  }
});

if (response.status === 401) {
  throw new Error('Invalid or expired API key');
}`,
  },
  oauth: {
    server: `// OAuth 2.0 Authorization Server
import { OAuth2Server } from 'oauth2-server';

const oauth = new OAuth2Server({
  model: {
    getAccessToken: async (token) => {
      // Fetch from DB
      return db.accessTokens.findOne({ token });
    },
    getClient: async (clientId, clientSecret) => {
      return db.clients.findOne({ clientId, clientSecret });
    },
    saveToken: async (token, client, user) => {
      return db.accessTokens.create({
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        scope: token.scope,
        client: client.id,
        user: user.id
      });
    },
  }
});

// Token endpoint
app.post('/oauth/token', async (req, res) => {
  const request = new OAuth2Server.Request(req);
  const response = new OAuth2Server.Response(res);
  
  try {
    const token = await oauth.token(request, response);
    res.json(token);
  } catch (err) {
    res.status(err.code || 500).json(err);
  }
});`,
    client: `// OAuth 2.0 Client (Authorization Code Flow)
import { AuthorizationCode } from 'simple-oauth2';

const client = new AuthorizationCode({
  client: {
    id: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET
  },
  auth: {
    tokenHost: 'https://auth.example.com',
    tokenPath: '/oauth/token',
    authorizePath: '/oauth/authorize'
  }
});

// Step 1: Redirect to authorization URL
const authUrl = client.authorizeURL({
  redirect_uri: 'https://myagent.com/callback',
  scope: 'read:data write:data',
  state: randomString(32)
});

// Step 2: Handle callback
const tokenParams = {
  code: req.query.code,
  redirect_uri: 'https://myagent.com/callback',
  scope: 'read:data write:data',
};

const accessToken = await client.getToken(tokenParams);
console.log('Access Token:', accessToken.token.access_token);

// Step 3: Use token
const response = await fetch('https://api.example.com/data', {
  headers: { 'Authorization': \`Bearer \${accessToken.token.access_token}\` }
});`,
  },
  jwt: {
    server: `// JWT Verification (Server-side)
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY; // For RSA

function verifyJWT(token: string): any {
  try {
    // Symmetric (HS256)
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'https://auth.example.com',
      audience: 'https://api.example.com'
    });
    
    // Asymmetric (RS256) - recommended for production
    // const decoded = jwt.verify(token, JWT_PUBLIC_KEY, {
    //   algorithms: ['RS256']
    // });
    
    return decoded;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new Error('JWT expired');
    }
    if (err.name === 'JsonWebTokenError') {
      throw new Error('Invalid JWT');
    }
    throw err;
  }
}

// Middleware
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  
  const token = authHeader.substring(7);
  try {
    req.user = verifyJWT(token);
    next();
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});`,
    client: `// JWT Creation and Usage (Client-side)
import jwt from 'jsonwebtoken';

const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY; // RSA private key

// Create JWT
const payload = {
  sub: 'agent-550e8400-e29b-41d4-a716-446655440000',
  name: 'CodeAssist',
  capabilities: ['code_generation', 'file_system'],
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
  iss: 'https://myagent.com',
  aud: 'https://api.example.com'
};

const token = jwt.sign(payload, JWT_PRIVATE_KEY, {
  algorithm: 'RS256',
  header: { kid: 'agent-key-2024-01' }
});

// Use JWT
const response = await fetch('https://api.example.com/execute', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ action: 'generate_code' })
});`,
  },
  mtls: {
    server: `// mTLS Server Configuration
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem'),
  ca: fs.readFileSync('ca-cert.pem'), // CA that signed client certs
  requestCert: true, // Request client certificate
  rejectUnauthorized: true, // Reject invalid certs
};

https.createServer(options, (req, res) => {
  const cert = req.socket.getPeerCertificate();
  
  if (!cert || !cert.subject) {
    res.writeHead(401);
    res.end('Client certificate required');
    return;
  }
  
  // Verify certificate attributes
  const agentId = cert.subject.CN; // Common Name
  const orgUnit = cert.subject.OU; // Organizational Unit
  
  console.log(\`Authenticated agent: \${agentId}\`);
  console.log(\`Cert fingerprint: \${cert.fingerprint}\`);
  
  // Process request from verified agent
  res.writeHead(200);
  res.end(\`Hello \${agentId}\`);
}).listen(8443);

console.log('mTLS server listening on port 8443');`,
    client: `// mTLS Client Configuration
import https from 'https';
import fs from 'fs';

const options = {
  hostname: 'api.example.com',
  port: 8443,
  path: '/agent/execute',
  method: 'POST',
  key: fs.readFileSync('client-key.pem'),
  cert: fs.readFileSync('client-cert.pem'),
  ca: fs.readFileSync('ca-cert.pem'),
  rejectUnauthorized: true, // Verify server cert
};

const req = https.request(options, (res) => {
  console.log(\`Status: \${res.statusCode}\`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (err) => {
  console.error('mTLS error:', err);
});

req.write(JSON.stringify({ action: 'list_capabilities' }));
req.end();

// Using fetch with mTLS (Node 18+)
import { Agent } from 'https';

const agent = new Agent({
  cert: fs.readFileSync('client-cert.pem'),
  key: fs.readFileSync('client-key.pem'),
  ca: fs.readFileSync('ca-cert.pem'),
});

const response = await fetch('https://api.example.com:8443/agent/execute', {
  method: 'POST',
  // @ts-ignore
  agent,
  body: JSON.stringify({ action: 'list_capabilities' })
});`,
  },
};

export default function AuthenticationPatternsPage() {
  const [selectedMethod, setSelectedMethod] = useState<string>("apiKey");
  const [viewMode, setViewMode] = useState<"server" | "client">("server");

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold">Authentication Patterns for Agents</h1>
        </div>
        <p className="text-lg text-gray-600 mb-4">
          Comprehensive guide to authentication methods for AI agents: API keys, OAuth 2.0, JWT, mTLS, and agent-to-agent
          auth. Compare trade-offs and implement with production-ready code.
        </p>
        <Link href="/identity" className="text-blue-600 hover:underline">
          ← Back to Identity Hub
        </Link>
      </div>

      {/* Quick Comparison */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Authentication Methods: Quick Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Criterion</th>
                <th className="border border-gray-300 px-4 py-2 text-center">API Key</th>
                <th className="border border-gray-300 px-4 py-2 text-center">OAuth 2.0</th>
                <th className="border border-gray-300 px-4 py-2 text-center">JWT</th>
                <th className="border border-gray-300 px-4 py-2 text-center">mTLS</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_MATRIX.map((row) => (
                <tr key={row.criterion} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">{row.criterion}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row.apiKey}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row.oauth}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row.jwt}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row.mtls}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          ⭐ = Rating (more stars = better for that criterion). Choose based on your security requirements, infrastructure
          complexity, and scalability needs.
        </p>
      </section>

      {/* Method Details */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Authentication Method Details</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {AUTH_METHODS.map((method) => (
            <div key={method.name} className="border border-gray-300 rounded-lg p-6 bg-white hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{method.icon}</span>
                  <h3 className="font-bold text-xl">{method.name}</h3>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Difficulty</div>
                  <div
                    className={`text-xs px-2 py-1 rounded ${
                      method.difficulty === "Easy"
                        ? "bg-green-100 text-green-800"
                        : method.difficulty === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {method.difficulty}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Security</div>
                  <div className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">{method.security}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Scalability</div>
                  <div className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">{method.scalability}</div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2">Best For:</h4>
                <ul className="text-sm space-y-1">
                  {method.useCases.map((useCase) => (
                    <li key={useCase} className="flex items-start gap-1">
                      <span className="text-green-600">✓</span>
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2 text-green-700">Pros:</h4>
                  <ul className="space-y-1">
                    {method.pros.map((pro) => (
                      <li key={pro} className="flex items-start gap-1">
                        <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-xs">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-red-700">Cons:</h4>
                  <ul className="space-y-1">
                    {method.cons.map((con) => (
                      <li key={con} className="flex items-start gap-1">
                        <XCircle className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-xs">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Code Examples */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Implementation Guide</h2>
        <p className="text-gray-700 mb-6">
          Production-ready code examples for each authentication method. Select server or client perspective, copy and
          adapt for your agent.
        </p>

        {/* Method Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedMethod("apiKey")}
            className={`px-4 py-2 rounded ${
              selectedMethod === "apiKey" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            API Key
          </button>
          <button
            onClick={() => setSelectedMethod("oauth")}
            className={`px-4 py-2 rounded ${
              selectedMethod === "oauth" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            OAuth 2.0
          </button>
          <button
            onClick={() => setSelectedMethod("jwt")}
            className={`px-4 py-2 rounded ${
              selectedMethod === "jwt" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            JWT
          </button>
          <button
            onClick={() => setSelectedMethod("mtls")}
            className={`px-4 py-2 rounded ${
              selectedMethod === "mtls" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            mTLS
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode("server")}
            className={`px-4 py-2 rounded ${
              viewMode === "server" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            <Server className="w-4 h-4 inline mr-2" />
            Server-Side
          </button>
          <button
            onClick={() => setViewMode("client")}
            className={`px-4 py-2 rounded ${
              viewMode === "client" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            <Lock className="w-4 h-4 inline mr-2" />
            Client-Side (Agent)
          </button>
        </div>

        {/* Code Display */}
        <div className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
          <pre className="text-sm">
            <code>
              {
                CODE_EXAMPLES[selectedMethod as keyof typeof CODE_EXAMPLES][
                  viewMode as keyof (typeof CODE_EXAMPLES)[keyof typeof CODE_EXAMPLES]
                ]
              }
            </code>
          </pre>
        </div>
      </section>

      {/* Agent-to-Agent Auth */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Agent-to-Agent Authentication</h2>
        <p className="text-gray-700 mb-6">
          When agents communicate directly, traditional user-centric auth patterns don&apos;t fit. Use these specialized
          patterns for agent-to-agent trust:
        </p>

        <div className="space-y-6">
          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <h3 className="font-bold text-lg mb-3">1. Pre-Shared Keys (PSK)</h3>
            <p className="text-sm text-gray-700 mb-4">
              Simple symmetric key exchange. Both agents know the secret. Fast but requires secure key distribution.
            </p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
              <code>{`// Agent A sends request
const sharedSecret = process.env.AGENT_SHARED_SECRET;
const timestamp = Date.now();
const payload = { from: 'agent-a', to: 'agent-b', timestamp };
const signature = crypto.createHmac('sha256', sharedSecret)
  .update(JSON.stringify(payload))
  .digest('hex');

await fetch('https://agent-b.example.com/rpc', {
  method: 'POST',
  headers: { 'X-Signature': signature },
  body: JSON.stringify(payload)
});

// Agent B verifies
const receivedSignature = req.headers['x-signature'];
const computed = crypto.createHmac('sha256', sharedSecret)
  .update(req.body)
  .digest('hex');

if (!crypto.timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(computed))) {
  throw new Error('Invalid signature');
}`}</code>
            </pre>
          </div>

          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <h3 className="font-bold text-lg mb-3">2. Public Key Infrastructure (PKI)</h3>
            <p className="text-sm text-gray-700 mb-4">
              Each agent has a public/private keypair. Sign messages with private key, verify with public key. Scales
              better than PSK.
            </p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
              <code>{`// Agent A signs message
import { generateKeyPairSync, sign } from 'crypto';

const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const message = JSON.stringify({ action: 'transfer_task', task_id: '123' });
const signature = sign(null, Buffer.from(message), privateKey).toString('base64');

await fetch('https://agent-b.example.com/rpc', {
  method: 'POST',
  headers: {
    'X-Agent-ID': 'agent-a-uuid',
    'X-Signature': signature,
    'X-Public-Key': publicKey.export({ type: 'spki', format: 'pem' })
  },
  body: message
});

// Agent B verifies
import { verify } from 'crypto';

const publicKey = req.headers['x-public-key'];
const signature = Buffer.from(req.headers['x-signature'], 'base64');
const isValid = verify(null, Buffer.from(req.body), publicKey, signature);

if (!isValid) {
  throw new Error('Invalid signature from agent');
}`}</code>
            </pre>
          </div>

          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <h3 className="font-bold text-lg mb-3">3. Capability Tokens</h3>
            <p className="text-sm text-gray-700 mb-4">
              Agent A gives Agent B a time-limited token with specific permissions. Agent B uses it to access resources on
              behalf of A.
            </p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
              <code>{`// Agent A creates capability token
import jwt from 'jsonwebtoken';

const capabilityToken = jwt.sign(
  {
    iss: 'agent-a-uuid',
    sub: 'agent-b-uuid',
    capabilities: ['read:files', 'write:logs'],
    resource: '/workspace/project-x',
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  },
  process.env.AGENT_A_PRIVATE_KEY,
  { algorithm: 'RS256' }
);

// Send to Agent B
await notifyAgent('agent-b-uuid', { capability_token: capabilityToken });

// Agent B uses the token to access Agent A's resources
const response = await fetch('https://agent-a.example.com/resources', {
  headers: { 'Authorization': \`Capability \${capabilityToken}\` }
});`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Security Best Practices</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              DO
            </h3>
            <ul className="space-y-2 text-sm">
              <li>✅ Rotate credentials regularly (90 days max)</li>
              <li>✅ Use HTTPS/TLS for all authentication flows</li>
              <li>✅ Store secrets in environment variables or vaults</li>
              <li>✅ Implement rate limiting on auth endpoints</li>
              <li>✅ Log all authentication attempts (success and failure)</li>
              <li>✅ Use short-lived tokens (1-24 hours)</li>
              <li>✅ Implement proper token revocation</li>
              <li>✅ Validate all inputs (no injection attacks)</li>
            </ul>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              DON&apos;T
            </h3>
            <ul className="space-y-2 text-sm">
              <li>❌ Hardcode credentials in source code</li>
              <li>❌ Transmit credentials in URL query parameters</li>
              <li>❌ Use weak or predictable secrets</li>
              <li>❌ Skip certificate validation in production</li>
              <li>❌ Log sensitive tokens or keys</li>
              <li>❌ Reuse credentials across multiple agents</li>
              <li>❌ Ignore token expiration</li>
              <li>❌ Allow unlimited authentication attempts</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Related Guides */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/identity/trust"
            className="border border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition"
          >
            <h3 className="font-bold text-lg mb-2">Trust & Reputation →</h3>
            <p className="text-sm text-gray-600">
              Building agent reputation through behavioral trust signals and verification tiers.
            </p>
          </Link>
          <Link
            href="/security-guide/secrets"
            className="border border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition"
          >
            <h3 className="font-bold text-lg mb-2">Secrets Management →</h3>
            <p className="text-sm text-gray-600">Secure storage, rotation, and access control for credentials.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
