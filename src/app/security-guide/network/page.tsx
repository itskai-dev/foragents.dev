"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, Lock, Shield, Server } from "lucide-react";

const THREAT_VECTORS = [
  {
    threat: "Man-in-the-Middle (MITM)",
    risk: "critical",
    description: "Attacker intercepts unencrypted traffic to steal credentials or modify requests",
    mitigation: "Enforce TLS 1.2+ for all connections",
  },
  {
    threat: "API Credential Theft",
    risk: "critical",
    description: "Stolen API keys or tokens used to impersonate agent or access resources",
    mitigation: "Use short-lived tokens, rotate regularly, implement OAuth2",
  },
  {
    threat: "Webhook Spoofing",
    risk: "high",
    description: "Attacker sends fake webhook events to trigger unauthorized actions",
    mitigation: "Verify webhook signatures using HMAC",
  },
  {
    threat: "CORS Misconfiguration",
    risk: "medium",
    description: "Overly permissive CORS allows unauthorized domains to call agent APIs",
    mitigation: "Whitelist specific origins, avoid wildcard (*)",
  },
  {
    threat: "Denial of Service (DoS)",
    risk: "high",
    description: "Attacker floods agent with requests to exhaust resources",
    mitigation: "Implement rate limiting and request throttling",
  },
  {
    threat: "Server-Side Request Forgery (SSRF)",
    risk: "high",
    description: "Agent tricked into making requests to internal services",
    mitigation: "Validate and sanitize all URLs, block internal IP ranges",
  },
];

const CODE_EXAMPLES = {
  tlsEnforcement: `// Enforce TLS 1.2+ for all outgoing connections
import https from 'https';
import fetch from 'node-fetch';

// Configure secure HTTPS agent
const secureAgent = new https.Agent({
  rejectUnauthorized: true,  // Verify SSL certificates
  minVersion: 'TLSv1.2',      // Minimum TLS version
  maxVersion: 'TLSv1.3',      // Maximum TLS version
  // Optional: Pin specific certificates for critical services
  ca: [/* trusted CA certificates */],
});

// Use with fetch
const response = await fetch('https://api.example.com/data', {
  agent: secureAgent,
});

// Enforce HTTPS for all requests
const validateUrl = (url: string): URL => {
  const parsed = new URL(url);
  
  if (parsed.protocol !== 'https:') {
    throw new Error(\`Insecure protocol: \${parsed.protocol}. Only HTTPS allowed.\`);
  }
  
  return parsed;
};

// Express middleware to enforce HTTPS
import express from 'express';

const enforceHttps = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    next();
  } else {
    res.redirect(301, \`https://\${req.headers.host}\${req.url}\`);
  }
};

app.use(enforceHttps);`,

  apiAuthentication: `// Multi-layer API authentication
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// 1. API Key Authentication (for service-to-service)
interface ApiKeyAuth {
  key: string;
  secret: string;
  permissions: string[];
}

const validateApiKey = (req: express.Request): ApiKeyAuth => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing API key');
  }
  
  const apiKey = authHeader.substring(7);
  
  // Look up key in database (with rate limit check)
  const keyData = await db.apiKeys.findOne({ key: apiKey });
  
  if (!keyData || keyData.revoked) {
    throw new Error('Invalid or revoked API key');
  }
  
  // Check rate limits
  await rateLimiter.consume(apiKey);
  
  return keyData;
};

// 2. JWT Authentication (for user sessions)
interface JwtPayload {
  userId: string;
  permissions: string[];
  exp: number;
}

const validateJwt = (req: express.Request): JwtPayload => {
  const token = req.headers.authorization?.substring(7);
  
  if (!token) {
    throw new Error('Missing JWT token');
  }
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    // Check expiration
    if (Date.now() >= payload.exp * 1000) {
      throw new Error('Token expired');
    }
    
    return payload;
  } catch (error) {
    throw new Error('Invalid JWT token');
  }
};

// 3. OAuth2 (for third-party integrations)
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://youragent.com/oauth/callback'
);

const validateOAuth = async (req: express.Request): Promise<string> => {
  const { code } = req.query;
  
  if (!code) {
    throw new Error('Missing OAuth code');
  }
  
  const { tokens } = await oauth2Client.getToken(code as string);
  oauth2Client.setCredentials(tokens);
  
  // Verify token with provider
  const ticket = await oauth2Client.verifyIdToken({
    idToken: tokens.id_token!,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  
  const payload = ticket.getPayload();
  return payload!.sub; // User ID
};

// Authentication middleware
const authenticate = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    // Try API key first
    if (req.headers.authorization?.startsWith('Bearer sk_')) {
      req.auth = await validateApiKey(req);
      return next();
    }
    
    // Then try JWT
    if (req.headers.authorization?.startsWith('Bearer eyJ')) {
      req.auth = await validateJwt(req);
      return next();
    }
    
    throw new Error('No valid authentication provided');
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};`,

  webhookVerification: `// Webhook signature verification (Stripe-style HMAC)
import crypto from 'crypto';

interface WebhookConfig {
  secret: string;
  tolerance: number; // seconds
}

const verifyWebhookSignature = (
  payload: string,
  signature: string,
  config: WebhookConfig
): boolean => {
  // Parse signature header (format: "t=timestamp,v1=signature")
  const parts = signature.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  const timestamp = parseInt(parts.t, 10);
  const receivedSignature = parts.v1;
  
  // Prevent replay attacks
  const now = Math.floor(Date.now() / 1000);
  if (now - timestamp > config.tolerance) {
    throw new Error('Webhook timestamp too old');
  }
  
  // Compute expected signature
  const signedPayload = \`\${timestamp}.\${payload}\`;
  const expectedSignature = crypto
    .createHmac('sha256', config.secret)
    .update(signedPayload)
    .digest('hex');
  
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(receivedSignature),
    Buffer.from(expectedSignature)
  );
};

// Express middleware for webhook verification
const verifyWebhook = (config: WebhookConfig) => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const signature = req.headers['x-webhook-signature'] as string;
    const payload = JSON.stringify(req.body);
    
    try {
      const valid = verifyWebhookSignature(payload, signature, config);
      
      if (!valid) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
      
      next();
    } catch (error) {
      console.error('[WEBHOOK] Verification failed:', error);
      return res.status(401).json({ error: 'Webhook verification failed' });
    }
  };
};

// Usage
app.post(
  '/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  verifyWebhook({
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
    tolerance: 300, // 5 minutes
  }),
  (req, res) => {
    // Process verified webhook
    const event = req.body;
    console.log('[WEBHOOK] Received:', event.type);
    res.json({ received: true });
  }
);`,

  corsConfiguration: `// Secure CORS configuration for agent APIs
import cors from 'cors';

// ❌ BAD: Overly permissive (allows any origin)
app.use(cors({ origin: '*' }));

// ✅ GOOD: Whitelist specific origins
const allowedOrigins = [
  'https://chat.reflectt.ai',
  'https://foragents.dev',
  // Add your allowed domains
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(\`Origin \${origin} not allowed by CORS\`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Number'],
  credentials: true, // Allow cookies
  maxAge: 86400, // Cache preflight for 24 hours
};

app.use(cors(corsOptions));

// Dynamic origin validation (for multi-tenant apps)
const isValidOrigin = (origin: string): boolean => {
  // Allow subdomains of trusted domain
  const trustedDomain = '.reflectt.ai';
  if (origin.endsWith(trustedDomain)) {
    return true;
  }
  
  // Check against database of customer domains
  const isCustomerDomain = await db.customerDomains.exists({ domain: origin });
  return isCustomerDomain;
};

const dynamicCorsOptions: cors.CorsOptions = {
  origin: async (origin, callback) => {
    if (!origin || await isValidOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
};

// Apply to specific routes
app.use('/api/v1/*', cors(dynamicCorsOptions));`,

  rateLimiting: `// Multi-tier rate limiting
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// 1. Global rate limit (per IP)
const globalLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:global:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Authenticated user rate limit (per API key)
const userLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:user:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  keyGenerator: (req) => {
    // Use API key or user ID as key
    return req.auth?.key || req.ip;
  },
  skip: (req) => {
    // Skip rate limiting for premium users
    return req.auth?.tier === 'premium';
  },
});

// 3. Endpoint-specific rate limit (expensive operations)
const heavyOperationLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:heavy:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  keyGenerator: (req) => req.auth?.key || req.ip,
});

// 4. Adaptive rate limiting (increases on suspicious activity)
import { RateLimiterMemory } from 'rate-limiter-flexible';

const adaptiveLimiter = new RateLimiterMemory({
  points: 100, // Base points
  duration: 60, // Per 60 seconds
});

const adaptiveMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const key = req.auth?.key || req.ip;
  
  try {
    // Check for suspicious patterns
    const isSuspicious = await checkSuspiciousActivity(req);
    
    // Reduce points for suspicious requests
    const cost = isSuspicious ? 10 : 1;
    
    await adaptiveLimiter.consume(key, cost);
    next();
  } catch (error) {
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: error.msBeforeNext / 1000,
    });
  }
};

// Apply rate limiters
app.use(globalLimiter); // All routes
app.use('/api/*', userLimiter); // API routes
app.post('/api/generate', heavyOperationLimiter); // Expensive endpoint
app.use('/api/agent/*', adaptiveMiddleware); // Agent endpoints

// Helper: Detect suspicious activity
const checkSuspiciousActivity = async (req: express.Request): Promise<boolean> => {
  const indicators = [
    req.body?.length > 50000, // Large payload
    req.headers['user-agent']?.includes('curl'), // Non-browser client
    !req.headers['referer'], // No referer
    // Add more heuristics
  ];
  
  return indicators.filter(Boolean).length >= 2;
};`,

  ssrfPrevention: `// Prevent Server-Side Request Forgery (SSRF)
import { URL } from 'url';
import dns from 'dns/promises';

// Blocked IP ranges (RFC1918 private networks, localhost, etc.)
const BLOCKED_RANGES = [
  { start: '10.0.0.0', end: '10.255.255.255' },
  { start: '172.16.0.0', end: '172.31.255.255' },
  { start: '192.168.0.0', end: '192.168.255.255' },
  { start: '127.0.0.0', end: '127.255.255.255' },
  { start: '169.254.0.0', end: '169.254.255.255' }, // Link-local
  { start: '::1', end: '::1' }, // IPv6 localhost
];

const ipToNumber = (ip: string): number => {
  return ip.split('.').reduce((acc, octet) => acc * 256 + parseInt(octet, 10), 0);
};

const isBlockedIp = (ip: string): boolean => {
  const ipNum = ipToNumber(ip);
  
  return BLOCKED_RANGES.some(range => {
    const start = ipToNumber(range.start);
    const end = ipToNumber(range.end);
    return ipNum >= start && ipNum <= end;
  });
};

const validateUrl = async (url: string): Promise<void> => {
  const parsed = new URL(url);
  
  // 1. Protocol check
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(\`Invalid protocol: \${parsed.protocol}\`);
  }
  
  // 2. Hostname validation
  if (parsed.hostname === 'localhost' || parsed.hostname === '0.0.0.0') {
    throw new Error('Localhost URLs not allowed');
  }
  
  // 3. Resolve DNS to check for private IPs
  try {
    const addresses = await dns.resolve4(parsed.hostname);
    
    for (const address of addresses) {
      if (isBlockedIp(address)) {
        throw new Error(\`URL resolves to blocked IP: \${address}\`);
      }
    }
  } catch (error) {
    throw new Error(\`DNS resolution failed: \${error.message}\`);
  }
  
  // 4. Port restrictions (block uncommon ports)
  const port = parsed.port ? parseInt(parsed.port, 10) : (parsed.protocol === 'https:' ? 443 : 80);
  const allowedPorts = [80, 443, 8080, 8443];
  
  if (!allowedPorts.includes(port)) {
    throw new Error(\`Port \${port} not allowed\`);
  }
};

// Safe fetch wrapper
const safeFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  // Validate URL before making request
  await validateUrl(url);
  
  // Add timeout to prevent hanging
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      // Prevent redirects to internal URLs
      redirect: 'manual',
    });
    
    // Check for redirect to internal URL
    if (response.status >= 300 && response.status < 400) {
      const redirectUrl = response.headers.get('location');
      if (redirectUrl) {
        await validateUrl(redirectUrl);
      }
    }
    
    return response;
  } finally {
    clearTimeout(timeout);
  }
};

// Usage
app.post('/api/fetch', async (req, res) => {
  const { url } = req.body;
  
  try {
    const response = await safeFetch(url);
    const data = await response.text();
    res.json({ data });
  } catch (error) {
    console.error('[SSRF] Blocked request:', url, error);
    res.status(400).json({ error: 'Invalid URL' });
  }
});`,
};

export default function NetworkSecurityPage() {
  const [selectedExample, setSelectedExample] = useState<keyof typeof CODE_EXAMPLES>("tlsEnforcement");

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/security-guide" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Security Guide
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold">Network Security</h1>
        </div>
        <p className="text-lg text-gray-600">
          Securing agent communications: TLS, authentication, webhook verification, CORS, and rate limiting.
        </p>
      </div>

      {/* Overview */}
      <section className="mb-12">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-2">Why Network Security Matters for Agents</h3>
              <p className="text-gray-700 mb-2">
                AI agents communicate with external APIs, webhooks, and user-facing endpoints. Each network connection is
                a potential attack vector. Proper network security ensures:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Data transmitted over the network cannot be intercepted or modified</li>
                <li>Only authorized parties can access agent APIs</li>
                <li>Webhooks are verified to prevent spoofing</li>
                <li>Agent resources are protected from abuse and DoS attacks</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Threat Vectors */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Network Threat Vectors</h2>
        <div className="space-y-4">
          {THREAT_VECTORS.map((threat) => (
            <div
              key={threat.threat}
              className={`border rounded-lg p-4 ${
                threat.risk === "critical"
                  ? "border-red-300 bg-red-50"
                  : threat.risk === "high"
                    ? "border-orange-300 bg-orange-50"
                    : "border-yellow-300 bg-yellow-50"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg">{threat.threat}</h3>
                <span
                  className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
                    threat.risk === "critical"
                      ? "bg-red-600 text-white"
                      : threat.risk === "high"
                        ? "bg-orange-600 text-white"
                        : "bg-yellow-600 text-white"
                  }`}
                >
                  {threat.risk}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{threat.description}</p>
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-semibold text-green-700">{threat.mitigation}</span>
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
              onClick={() => setSelectedExample("tlsEnforcement")}
              className={`px-3 py-2 rounded text-sm ${
                selectedExample === "tlsEnforcement" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              TLS Enforcement
            </button>
            <button
              onClick={() => setSelectedExample("apiAuthentication")}
              className={`px-3 py-2 rounded text-sm ${
                selectedExample === "apiAuthentication" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              API Authentication
            </button>
            <button
              onClick={() => setSelectedExample("webhookVerification")}
              className={`px-3 py-2 rounded text-sm ${
                selectedExample === "webhookVerification" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Webhook Verification
            </button>
            <button
              onClick={() => setSelectedExample("corsConfiguration")}
              className={`px-3 py-2 rounded text-sm ${
                selectedExample === "corsConfiguration" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              CORS Configuration
            </button>
            <button
              onClick={() => setSelectedExample("rateLimiting")}
              className={`px-3 py-2 rounded text-sm ${
                selectedExample === "rateLimiting" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Rate Limiting
            </button>
            <button
              onClick={() => setSelectedExample("ssrfPrevention")}
              className={`px-3 py-2 rounded text-sm ${
                selectedExample === "ssrfPrevention" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              SSRF Prevention
            </button>
          </div>

          <pre className="bg-gray-900 text-gray-100 p-6 rounded overflow-x-auto text-sm">
            <code>{CODE_EXAMPLES[selectedExample]}</code>
          </pre>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-12" id="rate-limiting">
        <h2 className="text-2xl font-bold mb-6">Best Practices</h2>
        <div className="space-y-6">
          <div className="border border-gray-300 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-3">
              <Lock className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <h3 className="font-bold text-xl">TLS/SSL Requirements</h3>
            </div>
            <ul className="space-y-2 text-gray-700 ml-9">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Enforce TLS 1.2 or higher for all connections (disable TLS 1.0/1.1)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Verify SSL certificates (rejectUnauthorized: true)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Use HSTS headers to force HTTPS on client side</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Consider certificate pinning for critical API connections</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Regularly update TLS libraries (OpenSSL, Node.js, etc.)</span>
              </li>
            </ul>
          </div>

          <div className="border border-gray-300 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-3">
              <Server className="w-6 h-6 text-green-600 flex-shrink-0" />
              <h3 className="font-bold text-xl">API Authentication</h3>
            </div>
            <ul className="space-y-2 text-gray-700 ml-9">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Use API keys for service-to-service authentication</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Implement JWT for user session management</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Use OAuth2 for third-party integrations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Never send API keys in URL parameters (use Authorization header)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Rotate API keys regularly (90 days minimum)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Implement token refresh for long-lived sessions</span>
              </li>
            </ul>
          </div>

          <div className="border border-gray-300 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-3">
              <Shield className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <h3 className="font-bold text-xl">Webhook Security</h3>
            </div>
            <ul className="space-y-2 text-gray-700 ml-9">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>Always verify webhook signatures using HMAC</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>Implement timestamp validation to prevent replay attacks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>Use constant-time comparison for signatures (prevent timing attacks)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>Log all webhook events for audit trails</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>Rate limit webhook endpoints separately</span>
              </li>
            </ul>
          </div>

          <div className="border border-gray-300 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-3">
              <Globe className="w-6 h-6 text-orange-600 flex-shrink-0" />
              <h3 className="font-bold text-xl">CORS & Rate Limiting</h3>
            </div>
            <ul className="space-y-2 text-gray-700 ml-9">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Whitelist specific origins instead of using wildcard (*)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Implement multi-tier rate limiting (global, per-user, per-endpoint)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Use Redis for distributed rate limiting across multiple servers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Return proper headers (X-RateLimit-Limit, X-RateLimit-Remaining)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Implement adaptive rate limiting for suspicious activity</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Security Headers */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Essential Security Headers</h2>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Header</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Purpose</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Recommended Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-gray-900">Strict-Transport-Security</td>
                <td className="px-6 py-4 text-sm text-gray-700">Force HTTPS</td>
                <td className="px-6 py-4 text-sm font-mono text-gray-600">
                  max-age=31536000; includeSubDomains
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-gray-900">X-Content-Type-Options</td>
                <td className="px-6 py-4 text-sm text-gray-700">Prevent MIME sniffing</td>
                <td className="px-6 py-4 text-sm font-mono text-gray-600">nosniff</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-gray-900">X-Frame-Options</td>
                <td className="px-6 py-4 text-sm text-gray-700">Prevent clickjacking</td>
                <td className="px-6 py-4 text-sm font-mono text-gray-600">DENY</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-gray-900">Content-Security-Policy</td>
                <td className="px-6 py-4 text-sm text-gray-700">Control resource loading</td>
                <td className="px-6 py-4 text-sm font-mono text-gray-600">
                  default-src &apos;self&apos;
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-gray-900">X-XSS-Protection</td>
                <td className="px-6 py-4 text-sm text-gray-700">Enable browser XSS filter</td>
                <td className="px-6 py-4 text-sm font-mono text-gray-600">1; mode=block</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-gray-900">Referrer-Policy</td>
                <td className="px-6 py-4 text-sm text-gray-700">Control referrer info</td>
                <td className="px-6 py-4 text-sm font-mono text-gray-600">strict-origin-when-cross-origin</td>
              </tr>
            </tbody>
          </table>
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
            href="/security-guide/secrets"
            className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:shadow transition"
          >
            <h4 className="font-bold mb-2">🔐 Secrets Management</h4>
            <p className="text-sm text-gray-600">Secure credential storage and rotation strategies</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
