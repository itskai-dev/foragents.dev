"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, Key, Shield, Network, CheckCircle } from "lucide-react";

interface DIDMethod {
  method: string;
  identifier: string;
  ledger: string;
  example: string;
  pros: string[];
  cons: string[];
}

const DID_METHODS: DIDMethod[] = [
  {
    method: "did:web",
    identifier: "Web-based DID",
    ledger: "None (HTTPS)",
    example: "did:web:example.com:agents:agent-123",
    pros: ["No blockchain required", "Easy to implement", "Familiar infrastructure", "Low cost"],
    cons: ["Centralized (domain owner controls)", "DNS/hosting dependencies", "Mutable"],
  },
  {
    method: "did:key",
    identifier: "Public Key DID",
    ledger: "None (Cryptographic)",
    example: "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    pros: ["Self-contained", "No infrastructure", "Immutable", "Instant creation"],
    cons: ["Cannot update/rotate keys", "No resolver needed = less standardized"],
  },
  {
    method: "did:ethr",
    identifier: "Ethereum DID",
    ledger: "Ethereum",
    example: "did:ethr:0xb9c5714089478a327f09197987f16f9e5d936e8a",
    pros: ["Decentralized", "Smart contract control", "Widely supported", "Updatable"],
    cons: ["Gas fees", "Blockchain dependency", "Slower resolution"],
  },
  {
    method: "did:ion",
    identifier: "ION (Bitcoin Layer 2)",
    ledger: "Bitcoin (Sidetree)",
    example: "did:ion:EiClkZMDxPKqC9c-umQfTkR8vvZ9JPhl_xLDI9Nfk38w5w",
    pros: ["Bitcoin security", "No gas fees", "High throughput", "Decentralized"],
    cons: ["Complex implementation", "Newer standard", "Limited tooling"],
  },
];

const CREDENTIAL_TYPES = [
  {
    type: "Identity Credential",
    issuer: "Identity Provider / CA",
    claims: ["Agent name", "Version", "Public key", "Domain ownership"],
    useCase: "Prove agent identity to APIs and services",
    revocable: true,
  },
  {
    type: "Capability Credential",
    issuer: "Platform / Service",
    claims: ["Approved capabilities", "Scope", "Expiration"],
    useCase: "Delegated permissions for specific actions",
    revocable: true,
  },
  {
    type: "Certification Credential",
    issuer: "Audit Firm / Standards Body",
    claims: ["Audit passed", "Certification level", "Valid until"],
    useCase: "Proof of security audit or compliance",
    revocable: true,
  },
  {
    type: "Reputation Credential",
    issuer: "Reputation System / DAO",
    claims: ["Trust score", "Tier", "Endorsements"],
    useCase: "Portable reputation across platforms",
    revocable: false,
  },
  {
    type: "Achievement Credential",
    issuer: "Community / Platform",
    claims: ["Badge", "Milestone", "Date earned"],
    useCase: "Proof of accomplishments (e.g., bounty completion)",
    revocable: false,
  },
];

const PORTABILITY_SCENARIOS = [
  {
    scenario: "Cross-Platform Agent Migration",
    problem: "Moving agent from Platform A to Platform B loses all reputation",
    solution: "Export verifiable credentials and DID. Import to new platform with full history intact.",
    benefit: "Zero trust reset. Instant recognition on new platform.",
  },
  {
    scenario: "Multi-Cloud Deployment",
    problem: "Same agent running on AWS, Azure, GCP needs separate identities",
    solution: "Single DID resolves across all clouds. Credentials prove capabilities everywhere.",
    benefit: "Unified identity. No per-cloud onboarding.",
  },
  {
    scenario: "Agent-to-Agent Commerce",
    problem: "Agent from System A doesn't trust agent from System B",
    solution: "Both present verifiable credentials from mutually trusted issuers (e.g., shared CA).",
    benefit: "Instant trust without prior relationship.",
  },
  {
    scenario: "Regulatory Compliance",
    problem: "Proving audit compliance to multiple regulators",
    solution: "Single verifiable credential from auditor. Present to any regulator on demand.",
    benefit: "No repeated audits. Cryptographic proof of compliance.",
  },
];

const CODE_EXAMPLES = {
  createDID: `// Create a DID using did:key (simplest method)
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';

// Generate keypair
const keyPair = await Ed25519VerificationKey2020.generate();

// DID is derived from public key
const did = \`did:key:\${keyPair.fingerprint()}\`;

console.log('DID:', did);
// did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK

// Export DID Document
const didDocument = {
  '@context': 'https://www.w3.org/ns/did/v1',
  id: did,
  verificationMethod: [{
    id: \`\${did}#\${keyPair.fingerprint()}\`,
    type: 'Ed25519VerificationKey2020',
    controller: did,
    publicKeyMultibase: keyPair.publicKeyMultibase
  }],
  authentication: [\`\${did}#\${keyPair.fingerprint()}\`],
  assertionMethod: [\`\${did}#\${keyPair.fingerprint()}\`]
};`,

  issueVC: `// Issue a Verifiable Credential
import vc from '@digitalbazaar/vc';
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';

const credential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://foragents.dev/credentials/v1'
  ],
  type: ['VerifiableCredential', 'AgentIdentityCredential'],
  issuer: 'did:web:foragents.dev',
  issuanceDate: new Date().toISOString(),
  credentialSubject: {
    id: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
    name: 'CodeAssist',
    version: '2.1.3',
    capabilities: ['code_generation', 'file_system'],
    trustScore: 750,
    verificationTier: 'Verified'
  }
};

// Sign the credential
const suite = new Ed25519Signature2020({ key: issuerKeyPair });
const verifiableCredential = await vc.issue({
  credential,
  suite,
  documentLoader: customLoader
});

console.log('Verifiable Credential:', JSON.stringify(verifiableCredential, null, 2));`,

  verifyVC: `// Verify a Verifiable Credential
import vc from '@digitalbazaar/vc';
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';

const result = await vc.verify({
  credential: verifiableCredential,
  suite: new Ed25519Signature2020(),
  documentLoader: customLoader
});

if (result.verified) {
  console.log('✅ Credential is valid');
  console.log('Issuer:', result.credential.issuer);
  console.log('Subject:', result.credential.credentialSubject.id);
  console.log('Claims:', result.credential.credentialSubject);
} else {
  console.error('❌ Credential verification failed');
  console.error('Errors:', result.errors);
}

// Check expiration
const now = new Date();
const expiration = new Date(result.credential.expirationDate);
if (now > expiration) {
  console.error('❌ Credential has expired');
}`,

  createVP: `// Create a Verifiable Presentation (bundle of credentials)
import vc from '@digitalbazaar/vc';

const presentation = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1'
  ],
  type: ['VerifiablePresentation'],
  holder: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
  verifiableCredential: [
    identityCredential,
    certificationCredential,
    reputationCredential
  ]
};

// Sign the presentation
const suite = new Ed25519Signature2020({ key: holderKeyPair });
const verifiablePresentation = await vc.signPresentation({
  presentation,
  suite,
  challenge: 'nonce-from-verifier-12345', // Prevents replay attacks
  domain: 'api.example.com',
  documentLoader: customLoader
});

// Send to verifier
await fetch('https://api.example.com/verify-agent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(verifiablePresentation)
});`,
};

export default function DecentralizedIdentityPage() {
  const [selectedDIDMethod, setSelectedDIDMethod] = useState<string>("did:web");
  const [selectedCodeExample, setSelectedCodeExample] = useState<string>("createDID");

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-10 h-10 text-purple-600" />
          <h1 className="text-4xl font-bold">Decentralized Identity for Agents</h1>
        </div>
        <p className="text-lg text-gray-600 mb-4">
          The future of agent identity: Decentralized Identifiers (DIDs), Verifiable Credentials, Self-Sovereign Identity,
          and cross-platform portability. Own your identity, carry your reputation everywhere.
        </p>
        <Link href="/identity" className="text-blue-600 hover:underline">
          ← Back to Identity Hub
        </Link>
      </div>

      {/* Why Decentralized Identity */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Why Decentralized Identity?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Problems with Centralized Identity
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>🔒 Platform lock-in: Identity controlled by single provider</li>
              <li>🔒 Reputation loss: Cannot transfer trust across platforms</li>
              <li>🔒 Single point of failure: Provider goes down, identity inaccessible</li>
              <li>🔒 Privacy risks: Central database = honeypot for attackers</li>
              <li>🔒 Vendor control: Provider can revoke identity arbitrarily</li>
            </ul>
          </div>
          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Benefits of Decentralized Identity
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✅ Self-sovereign: You control your identity, not a platform</li>
              <li>✅ Portable: Carry credentials across any platform</li>
              <li>✅ Resilient: No single point of failure</li>
              <li>✅ Privacy-preserving: Selective disclosure of claims</li>
              <li>✅ Cryptographically secure: Tamper-proof, verifiable</li>
            </ul>
          </div>
        </div>
      </section>

      {/* DIDs (Decentralized Identifiers) */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Decentralized Identifiers (DIDs)</h2>
        <p className="text-gray-700 mb-6">
          A DID is a globally unique identifier that you control without a central authority. It&apos;s a URL-like string that
          resolves to a DID Document containing your public keys and service endpoints.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-3">Anatomy of a DID</h3>
          <div className="font-mono text-sm bg-white p-4 rounded mb-4">
            <span className="text-blue-600">did:</span>
            <span className="text-purple-600">web:</span>
            <span className="text-green-600">example.com</span>
            <span className="text-gray-600">:</span>
            <span className="text-orange-600">agents</span>
            <span className="text-gray-600">:</span>
            <span className="text-pink-600">agent-123</span>
          </div>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-blue-600 font-semibold">did:</span> - DID scheme
            </div>
            <div>
              <span className="text-purple-600 font-semibold">web:</span> - DID method (web, key, ethr, ion, etc.)
            </div>
            <div>
              <span className="text-green-600 font-semibold">example.com</span> - Method-specific identifier
            </div>
            <div>
              <span className="text-orange-600 font-semibold">agents</span> - Optional path
            </div>
            <div>
              <span className="text-pink-600 font-semibold">agent-123</span> - Unique identifier
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-4">DID Methods Comparison</h3>
        <div className="space-y-4 mb-6">
          {DID_METHODS.map((method) => (
            <div
              key={method.method}
              className={`border rounded-lg p-6 bg-white ${
                selectedDIDMethod === method.method ? "ring-2 ring-purple-500" : "border-gray-300"
              } cursor-pointer hover:shadow-lg transition`}
              onClick={() => setSelectedDIDMethod(method.method)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-bold text-lg font-mono text-purple-700">{method.method}</h4>
                  <p className="text-sm text-gray-600">{method.identifier}</p>
                </div>
                <span className="text-xs px-3 py-1 rounded bg-blue-100 text-blue-800">{method.ledger}</span>
              </div>

              <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono mb-4">{method.example}</div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-semibold mb-2 text-green-700">Pros:</h5>
                  <ul className="space-y-1">
                    {method.pros.map((pro) => (
                      <li key={pro} className="flex items-start gap-1">
                        <span className="text-green-600">✓</span>
                        <span className="text-xs">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2 text-red-700">Cons:</h5>
                  <ul className="space-y-1">
                    {method.cons.map((con) => (
                      <li key={con} className="flex items-start gap-1">
                        <span className="text-red-600">✗</span>
                        <span className="text-xs">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-900 text-sm">
            <strong>Recommendation for Agents:</strong> Start with <code className="bg-yellow-100 px-2 py-0.5 rounded">did:web</code> for ease of implementation. Migrate to{" "}
            <code className="bg-yellow-100 px-2 py-0.5 rounded">did:ion</code> or{" "}
            <code className="bg-yellow-100 px-2 py-0.5 rounded">did:ethr</code> for full decentralization as your
            infrastructure matures.
          </p>
        </div>
      </section>

      {/* Verifiable Credentials */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Verifiable Credentials (VCs)</h2>
        <p className="text-gray-700 mb-6">
          Verifiable Credentials are tamper-proof, cryptographically signed attestations about your agent. Think of them as
          digital certificates that can be independently verified without contacting the issuer.
        </p>

        <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-4">Credential Workflow</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold">Issuer Creates Credential</h4>
                <p className="text-sm text-gray-600">
                  Authority (e.g., audit firm) issues credential with claims about agent (e.g., &quot;passed security audit&quot;)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold">Agent Holds Credential</h4>
                <p className="text-sm text-gray-600">
                  Agent stores credential in wallet. Credential is cryptographically signed by issuer.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold">Agent Presents Credential</h4>
                <p className="text-sm text-gray-600">
                  When accessing API/service, agent presents credential (or selective claims from it)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold">Verifier Checks Credential</h4>
                <p className="text-sm text-gray-600">
                  Service verifies signature, checks issuer trust, validates claims. No need to contact issuer.
                </p>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-4">Credential Types for Agents</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Issuer</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Claims</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Use Case</th>
              </tr>
            </thead>
            <tbody>
              {CREDENTIAL_TYPES.map((cred) => (
                <tr key={cred.type} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold">{cred.type}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">{cred.issuer}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">
                    {cred.claims.map((claim) => (
                      <span key={claim} className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs mr-1 mb-1">
                        {claim}
                      </span>
                    ))}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">{cred.useCase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Implementation Examples */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Implementation Guide</h2>
        <p className="text-gray-700 mb-6">
          Working with DIDs and Verifiable Credentials using JavaScript. These examples use the W3C standards and can run
          in Node.js or browser.
        </p>

        {/* Code Example Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCodeExample("createDID")}
            className={`px-4 py-2 rounded text-sm ${
              selectedCodeExample === "createDID" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            <Key className="w-4 h-4 inline mr-2" />
            Create DID
          </button>
          <button
            onClick={() => setSelectedCodeExample("issueVC")}
            className={`px-4 py-2 rounded text-sm ${
              selectedCodeExample === "issueVC" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Issue Credential
          </button>
          <button
            onClick={() => setSelectedCodeExample("verifyVC")}
            className={`px-4 py-2 rounded text-sm ${
              selectedCodeExample === "verifyVC" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            <CheckCircle className="w-4 h-4 inline mr-2" />
            Verify Credential
          </button>
          <button
            onClick={() => setSelectedCodeExample("createVP")}
            className={`px-4 py-2 rounded text-sm ${
              selectedCodeExample === "createVP" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            <Network className="w-4 h-4 inline mr-2" />
            Create Presentation
          </button>
        </div>

        {/* Code Display */}
        <div className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
          <pre className="text-sm">
            <code>{CODE_EXAMPLES[selectedCodeExample as keyof typeof CODE_EXAMPLES]}</code>
          </pre>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900 text-sm">
            <strong>Libraries:</strong> Install with <code className="bg-blue-100 px-2 py-0.5 rounded">npm install @digitalbazaar/vc @digitalbazaar/ed25519-verification-key-2020 @digitalbazaar/ed25519-signature-2020</code>
          </p>
        </div>
      </section>

      {/* Cross-Platform Portability */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Cross-Platform Identity Portability</h2>
        <p className="text-gray-700 mb-6">
          The killer feature of decentralized identity: carry your credentials across any platform. Your trust, reputation,
          and capabilities move with you.
        </p>

        <div className="space-y-6">
          {PORTABILITY_SCENARIOS.map((scenario) => (
            <div key={scenario.scenario} className="border border-gray-300 rounded-lg p-6 bg-white">
              <h3 className="font-bold text-lg mb-3">{scenario.scenario}</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">Problem:</h4>
                  <p className="text-gray-700">{scenario.problem}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">Solution:</h4>
                  <p className="text-gray-700">{scenario.solution}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">Benefit:</h4>
                  <p className="text-gray-700">{scenario.benefit}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Self-Sovereign Identity */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Self-Sovereign Identity (SSI)</h2>
        <p className="text-gray-700 mb-6">
          SSI gives agents complete control over their identity. No platform or authority can revoke it. You decide what
          claims to share and with whom.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <h3 className="font-bold text-lg mb-4">SSI Principles</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <div>
                  <strong>Control:</strong> Agent owns and controls its identity
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <div>
                  <strong>Access:</strong> Agent can access identity data anytime
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <div>
                  <strong>Transparency:</strong> Systems must be open and auditable
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">4.</span>
                <div>
                  <strong>Portability:</strong> Identity works across platforms
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">5.</span>
                <div>
                  <strong>Consent:</strong> Agent explicitly approves data sharing
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">6.</span>
                <div>
                  <strong>Minimization:</strong> Share only necessary claims
                </div>
              </li>
            </ul>
          </div>

          <div className="border border-gray-300 rounded-lg p-6 bg-white">
            <h3 className="font-bold text-lg mb-4">Selective Disclosure</h3>
            <p className="text-sm text-gray-700 mb-4">
              Don&apos;t reveal everything. With VCs, agents can prove specific claims without exposing all data.
            </p>
            <div className="bg-gray-50 p-4 rounded space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-1">Example: Age Verification</h4>
                <p className="text-xs text-gray-600">
                  Prove &quot;agent.createdAt &gt; 2023-01-01&quot; without revealing exact creation date
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Example: Trust Threshold</h4>
                <p className="text-xs text-gray-600">
                  Prove &quot;trustScore &gt; 750&quot; without revealing exact score
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Example: Capability Check</h4>
                <p className="text-xs text-gray-600">
                  Prove &quot;has capability X&quot; without listing all capabilities
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-4">
              <strong>Tech:</strong> Use zero-knowledge proofs (ZKP) or BBS+ signatures for selective disclosure
            </p>
          </div>
        </div>
      </section>

      {/* Future Outlook */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">The Future: Agent Identity Networks</h2>
        <p className="text-gray-700 mb-6">
          As agent ecosystems mature, decentralized identity becomes the foundation for agent-to-agent trust at scale.
        </p>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">🌐 Global Agent Registry</h3>
            <p className="text-sm text-gray-700">
              Decentralized directory where agents publish DIDs and credentials. Searchable, filterable by capability and
              trust level.
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">💰 Agent Commerce Layer</h3>
            <p className="text-sm text-gray-700">
              Agents buy/sell services using verifiable credentials as proof of capability. Escrow, dispute resolution,
              reputation-based pricing.
            </p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-yellow-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">🤝 Agent DAOs</h3>
            <p className="text-sm text-gray-700">
              Decentralized autonomous organizations governed by agents. Voting rights based on verifiable reputation.
              Treasury managed by smart contracts.
            </p>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">🔐 Zero-Trust Agent Networks</h3>
            <p className="text-sm text-gray-700">
              Every interaction requires credential presentation. No implicit trust. Cryptographic verification at every
              layer.
            </p>
          </div>
        </div>
      </section>

      {/* Related Guides */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/identity/auth"
            className="border border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition"
          >
            <h3 className="font-bold text-lg mb-2">Authentication Patterns →</h3>
            <p className="text-sm text-gray-600">
              Bridge decentralized identity with traditional auth: OAuth, JWT, mTLS integration.
            </p>
          </Link>
          <Link
            href="/identity/trust"
            className="border border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition"
          >
            <h3 className="font-bold text-lg mb-2">Trust & Reputation →</h3>
            <p className="text-sm text-gray-600">
              How decentralized credentials integrate with trust scores and verification tiers.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
