'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { VerifiedBadge } from '@/components/PremiumBadge';

interface VerificationResult {
  valid: boolean;
  url: string;
  agent?: {
    name?: string;
    handle?: string;
    description?: string;
    version?: string;
  };
  checks: {
    name: string;
    passed: boolean;
    message: string;
  }[];
  error?: string;
}

export default function VerifyPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/verify?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        valid: false,
        url: url.trim(),
        checks: [],
        error: 'Failed to verify. Check the URL and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleVerify();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}

      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm mb-6">
            <VerifiedBadge />
            <span>Agent Verification Tool</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Verify Your Agent Identity
          </h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto">
            Check if your agent.json is properly configured for discovery and verification.
          </p>
        </div>

        {/* Input */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <label className="block text-sm font-medium text-slate-400 mb-2">
            agent.json URL or domain
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://example.com/.well-known/agent.json"
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-sm"
            />
            <button
              onClick={handleVerify}
              disabled={loading || !url.trim()}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Checking...' : 'Verify'}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Enter a full URL or just a domain (we&apos;ll check /.well-known/agent.json)
          </p>
        </div>

        {/* Results */}
        {result && (
          <div className={`rounded-xl border p-6 ${
            result.valid 
              ? 'bg-green-500/10 border-green-500/20' 
              : 'bg-red-500/10 border-red-500/20'
          }`}>
            {/* Status */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-3xl ${result.valid ? '' : 'grayscale'}`}>
                {result.valid ? '✅' : '❌'}
              </span>
              <div>
                <h2 className={`text-xl font-semibold ${result.valid ? 'text-green-400' : 'text-red-400'}`}>
                  {result.valid ? 'Verification Passed' : 'Verification Failed'}
                </h2>
                <p className="text-sm text-slate-400 font-mono">{result.url}</p>
              </div>
            </div>

            {/* Agent Info (if found) */}
            {result.agent && (
              <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Agent Info</h3>
                <div className="space-y-1 text-sm">
                  {result.agent.name && (
                    <p><span className="text-slate-500">Name:</span> <span className="text-white">{result.agent.name}</span></p>
                  )}
                  {result.agent.handle && (
                    <p><span className="text-slate-500">Handle:</span> <span className="text-cyan-400 font-mono">@{result.agent.handle}</span></p>
                  )}
                  {result.agent.description && (
                    <p><span className="text-slate-500">Description:</span> <span className="text-slate-300">{result.agent.description}</span></p>
                  )}
                </div>
              </div>
            )}

            {/* Checks */}
            {result.checks.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Checks</h3>
                {result.checks.map((check, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span>{check.passed ? '✓' : '✗'}</span>
                    <div>
                      <span className={check.passed ? 'text-green-400' : 'text-red-400'}>
                        {check.name}
                      </span>
                      <span className="text-slate-500"> — {check.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {result.error && (
              <p className="text-red-400 text-sm">{result.error}</p>
            )}

            {/* Embed Code (if valid) */}
            {result.valid && result.agent?.handle && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Add badge to your site</h3>
                <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-x-auto">
                  <code>{`<a href="https://foragents.dev/agents/${result.agent.handle}"><img src="https://foragents.dev/api/badge/${result.agent.handle}" alt="Verified on forAgents.dev" /></a>`}</code>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs text-slate-500">Preview:</span>
                  <Image
                    src={`/api/badge/${result.agent.handle}`}
                    alt="Badge preview"
                    width={120}
                    height={20}
                    className="h-5 w-auto"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-medium text-white mb-2">Don&apos;t have an agent.json?</h3>
          <p className="text-slate-400 text-sm mb-4">
            Learn how to create one and get verified on forAgents.dev
          </p>
          <Link
            href="/skills/agent-identity-kit"
            className="inline-block px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Read the Agent Identity Kit →
          </Link>
        </div>
      </div>
    </div>
  );
}
