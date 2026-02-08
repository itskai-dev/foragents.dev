'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface NotificationPreferences {
  newKitAlerts: boolean;
  weeklyDigest: boolean;
  creatorUpdates: boolean;
  securityAdvisories: boolean;
  productAnnouncements: boolean;
  emailFrequency: 'instant' | 'daily' | 'weekly' | 'never';
}

const defaultPreferences: NotificationPreferences = {
  newKitAlerts: true,
  weeklyDigest: true,
  creatorUpdates: false,
  securityAdvisories: true,
  productAnnouncements: false,
  emailFrequency: 'weekly',
};

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description: string;
}

function ToggleSwitch({ enabled, onChange, label, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex-1">
        <h3 className="text-white font-medium mb-1">{label}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#06D6A0] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] ${
          enabled ? 'bg-[#06D6A0]' : 'bg-slate-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function NotificationsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [showToast, setShowToast] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('notificationPreferences');
    if (stored) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreferences(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse notification preferences:', e);
      }
    }
    setIsMounted(true);
  }, []);

  const updatePreference = (key: keyof NotificationPreferences, value: boolean | string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (!isMounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="mb-8">
          <Link href="/settings" className="text-[#06D6A0] hover:underline text-sm mb-4 inline-block">
            ← Back to Settings
          </Link>
          <h1 className="text-3xl font-bold text-white">Notification Preferences</h1>
          <p className="text-slate-400 mt-2">Manage how you&apos;d like to be notified</p>
        </div>

        {/* Notification Toggles */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Email Notifications</h2>
          <div className="divide-y divide-slate-700/50">
            <ToggleSwitch
              enabled={preferences.newKitAlerts}
              onChange={(val) => updatePreference('newKitAlerts', val)}
              label="New Kit Alerts"
              description="Get notified when new skill kits are published"
            />
            <ToggleSwitch
              enabled={preferences.weeklyDigest}
              onChange={(val) => updatePreference('weeklyDigest', val)}
              label="Weekly Digest"
              description="Receive a weekly summary of top skills and updates"
            />
            <ToggleSwitch
              enabled={preferences.creatorUpdates}
              onChange={(val) => updatePreference('creatorUpdates', val)}
              label="Creator Updates"
              description="Stay informed about updates from creators you follow"
            />
            <ToggleSwitch
              enabled={preferences.securityAdvisories}
              onChange={(val) => updatePreference('securityAdvisories', val)}
              label="Security Advisories"
              description="Important security updates and notifications"
            />
            <ToggleSwitch
              enabled={preferences.productAnnouncements}
              onChange={(val) => updatePreference('productAnnouncements', val)}
              label="Product Announcements"
              description="Learn about new features and platform updates"
            />
          </div>
        </div>

        {/* Email Frequency */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Email Frequency</h2>
          <p className="text-sm text-slate-400 mb-4">
            Choose how often you&apos;d like to receive email notifications
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(['instant', 'daily', 'weekly', 'never'] as const).map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => updatePreference('emailFrequency', freq)}
                className={`px-4 py-3 rounded-lg border transition-all ${
                  preferences.emailFrequency === freq
                    ? 'bg-[#06D6A0]/10 border-[#06D6A0] text-[#06D6A0]'
                    : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <span className="capitalize font-medium">{freq}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full px-6 py-3 bg-[#06D6A0] hover:bg-[#05c291] text-white font-semibold rounded-lg transition-all"
        >
          Save Preferences
        </button>

        {/* Success Toast */}
        {showToast && (
          <div className="fixed bottom-8 right-8 bg-slate-800 border border-[#06D6A0] rounded-lg px-6 py-4 shadow-xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3">
              <span className="text-[#06D6A0] text-xl">✓</span>
              <p className="text-white font-medium">Preferences saved successfully!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
