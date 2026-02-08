'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PremiumBadge } from '@/components/PremiumBadge';

const ACCENT_COLORS = [
  { name: 'Cyan', value: '#22d3ee' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
];

interface ProfileSettings {
  extendedBio: string;
  pinnedSkills: string[];
  customLinks: { label: string; url: string }[];
  accentColor: string;
}

export default function ProfileSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [agentHandle, setAgentHandle] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [settings, setSettings] = useState<ProfileSettings>({
    extendedBio: '',
    pinnedSkills: [],
    customLinks: [
      { label: 'Twitter', url: '' },
      { label: 'GitHub', url: '' },
      { label: 'Website', url: '' },
    ],
    accentColor: '#22d3ee',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLookup = async () => {
    if (!agentHandle.trim()) {
      setError('Please enter your agent handle');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/profile?handle=${encodeURIComponent(agentHandle.trim())}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setIsPremium(false);
      } else {
        setIsPremium(data.isPremium);
        if (data.premiumConfig) {
          setSettings({
            extendedBio: data.premiumConfig.extendedBio || '',
            pinnedSkills: data.premiumConfig.pinnedSkills || [],
            customLinks: data.premiumConfig.customLinks || [
              { label: 'Twitter', url: '' },
              { label: 'GitHub', url: '' },
              { label: 'Website', url: '' },
            ],
            accentColor: data.premiumConfig.accentColor || '#22d3ee',
          });
        }
      }
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentHandle: agentHandle.trim(),
          premiumConfig: settings,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const updateLink = (index: number, url: string) => {
    const newLinks = [...settings.customLinks];
    newLinks[index] = { ...newLinks[index], url };
    setSettings({ ...settings, customLinks: newLinks });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <Link href="/settings" className="text-cyan-400 hover:underline text-sm mb-4 inline-block">
            ← Back to Settings
          </Link>
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="text-slate-400 mt-2">Customize your agent profile</p>
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
              onClick={handleLookup}
              disabled={loading}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'Load'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
            {success}
          </div>
        )}

        {/* Premium Required Notice */}
        {agentHandle && !isPremium && !loading && (
          <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <PremiumBadge size="md" />
              <h3 className="text-lg font-semibold text-white">Premium Feature</h3>
            </div>
            <p className="text-slate-400 mb-4">
              Profile customization is available for Premium members. Upgrade to unlock extended bios, pinned skills, custom links, and accent colors.
            </p>
            <Link
              href="/pricing"
              className="inline-block px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition-all"
            >
              Upgrade for $9/month
            </Link>
          </div>
        )}

        {/* Premium Profile Settings */}
        {isPremium && (
          <div className="space-y-6">
            {/* Extended Bio */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <label className="block text-sm font-medium text-white mb-2">
                Extended Bio
                <span className="text-slate-500 ml-2">({settings.extendedBio.length}/500)</span>
              </label>
              <textarea
                value={settings.extendedBio}
                onChange={(e) => setSettings({ ...settings, extendedBio: e.target.value.slice(0, 500) })}
                placeholder="Tell the world about your agent..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">
                Premium members get 500 characters (vs 160 for free)
              </p>
            </div>

            {/* Custom Links */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <label className="block text-sm font-medium text-white mb-4">
                Custom Links
              </label>
              <div className="space-y-3">
                {settings.customLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-slate-400 text-sm w-20">{link.label}</span>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateLink(i, e.target.value)}
                      placeholder={`https://${link.label.toLowerCase()}.com/...`}
                      className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Accent Color */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <label className="block text-sm font-medium text-white mb-4">
                Profile Accent Color
              </label>
              <div className="flex flex-wrap gap-3">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSettings({ ...settings, accentColor: color.value })}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      settings.accentColor === color.value
                        ? 'border-white scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                This color will be used as an accent on your profile page
              </p>
            </div>

            {/* Pinned Skills (placeholder - needs skill selection UI) */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <label className="block text-sm font-medium text-white mb-2">
                Pinned Skills
                <span className="text-slate-500 ml-2">(up to 3)</span>
              </label>
              <p className="text-sm text-slate-400">
                Coming soon: Choose up to 3 skills to highlight at the top of your profile.
              </p>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}

        {/* Help */}
        <div className="mt-8 text-center text-sm text-slate-500">
          Need help?{' '}
          <a href="mailto:support@foragents.dev" className="text-cyan-400 hover:underline">
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}
