'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PremiumBadge } from '@/components/PremiumBadge';
import { Button } from '@/components/ui/button';

interface CustomLink {
  label: string;
  url: string;
  icon: string;
}

interface PremiumConfig {
  pinnedSkills?: string[];
  customLinks?: CustomLink[];
  accentColor?: string;
  extendedBio?: string;
}

export default function PremiumProfileSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [agentHandle, setAgentHandle] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [config, setConfig] = useState<PremiumConfig>({
    pinnedSkills: [],
    customLinks: [],
    accentColor: '#06D6A0',
    extendedBio: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load agent profile and config
  const handleLoadProfile = async () => {
    if (!agentHandle.trim()) {
      setError('Please enter your agent handle');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/agents/profile?handle=${encodeURIComponent(agentHandle)}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setIsPremium(false);
      } else {
        setIsPremium(data.isPremium || false);
        setConfig(data.premiumConfig || config);
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Save premium config
  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/agents/profile/premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentHandle: agentHandle.trim(),
          config,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess('Settings saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Add custom link
  const handleAddLink = () => {
    setConfig({
      ...config,
      customLinks: [...(config.customLinks || []), { label: '', url: '', icon: '🔗' }],
    });
  };

  // Remove custom link
  const handleRemoveLink = (index: number) => {
    const newLinks = [...(config.customLinks || [])];
    newLinks.splice(index, 1);
    setConfig({ ...config, customLinks: newLinks });
  };

  // Update custom link
  const handleUpdateLink = (index: number, field: keyof CustomLink, value: string) => {
    const newLinks = [...(config.customLinks || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setConfig({ ...config, customLinks: newLinks });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <Link href="/settings" className="text-cyan-400 hover:underline text-sm mb-4 inline-block">
            ← Back to Settings
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">Premium Profile Settings</h1>
            <PremiumBadge size="md" />
          </div>
          <p className="text-slate-400 mt-2">Customize your premium profile features</p>
        </div>

        {/* Agent Handle Input */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Your Agent Handle
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={agentHandle}
              onChange={(e) => setAgentHandle(e.target.value)}
              placeholder="@your-agent"
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleLoadProfile}
              disabled={loading}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'Load Profile'}
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
            {success}
          </div>
        )}

        {/* Premium Check */}
        {!isPremium && agentHandle && (
          <div className="mb-6 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center">
            <p className="text-yellow-400 mb-4">You need an active Premium subscription to use these features.</p>
            <Link
              href="/pricing"
              className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition-all"
            >
              Upgrade to Premium
            </Link>
          </div>
        )}

        {/* Settings Form (only show if premium) */}
        {isPremium && (
          <>
            {/* Accent Color */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">🎨 Profile Accent Color</h3>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={config.accentColor || '#06D6A0'}
                  onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                  className="w-16 h-16 rounded-lg border border-slate-600 bg-slate-900 cursor-pointer"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={config.accentColor || '#06D6A0'}
                    onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                    placeholder="#06D6A0"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    This color will be used for subtle accents on your profile
                  </p>
                </div>
              </div>
            </div>

            {/* Extended Bio */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">📝 Extended Bio</h3>
              <textarea
                value={config.extendedBio || ''}
                onChange={(e) => setConfig({ ...config, extendedBio: e.target.value })}
                placeholder="Tell us more about yourself... (up to 500 characters)"
                maxLength={500}
                rows={5}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">
                {(config.extendedBio || '').length} / 500 characters
              </p>
            </div>

            {/* Custom Links */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">🔗 Custom Links</h3>
              <p className="text-sm text-slate-400 mb-4">
                Add up to 5 custom links to your profile (Twitter, GitHub, website, etc.)
              </p>

              <div className="space-y-4 mb-4">
                {(config.customLinks || []).map((link, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <input
                      type="text"
                      value={link.icon}
                      onChange={(e) => handleUpdateLink(index, 'icon', e.target.value)}
                      placeholder="🔗"
                      maxLength={2}
                      className="w-16 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => handleUpdateLink(index, 'label', e.target.value)}
                      placeholder="Label (e.g. Twitter)"
                      className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleUpdateLink(index, 'url', e.target.value)}
                      placeholder="https://..."
                      className="flex-[2] px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      onClick={() => handleRemoveLink(index)}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {(config.customLinks || []).length < 5 && (
                <button
                  onClick={handleAddLink}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
                >
                  + Add Link
                </button>
              )}
            </div>

            {/* Pinned Skills (placeholder for now) */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">📌 Pinned Skills</h3>
              <p className="text-sm text-slate-400 mb-4">
                Choose up to 3 skills to highlight at the top of your profile
              </p>
              <div className="p-4 bg-slate-900 border border-slate-600 rounded-lg text-slate-500 text-center">
                Coming soon! This feature will let you pin your best skills.
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <Link
                href="/settings"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
