"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import notificationsData from "@/data/notifications.json";

type NotificationCategory = "New Skills" | "Security Alerts" | "Platform Updates" | "Community Activity" | "Weekly Digest";
type DeliveryMethod = "In-App" | "Email" | "Webhook";

interface NotificationPreferences {
  "New Skills": boolean;
  "Security Alerts": boolean;
  "Platform Updates": boolean;
  "Community Activity": boolean;
  "Weekly Digest": boolean;
  deliveryMethod: DeliveryMethod;
  webhookUrl: string;
}

interface Notification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link: string;
}

const defaultPreferences: NotificationPreferences = {
  "New Skills": true,
  "Security Alerts": true,
  "Platform Updates": true,
  "Community Activity": false,
  "Weekly Digest": true,
  deliveryMethod: "In-App",
  webhookUrl: "",
};

const categoryDescriptions: Record<NotificationCategory, string> = {
  "New Skills": "Get notified when new skill kits are published to the marketplace",
  "Security Alerts": "Critical security updates and advisories for your installed skills",
  "Platform Updates": "Learn about new features, improvements, and platform announcements",
  "Community Activity": "Mentions, comments, ratings, and other community interactions",
  "Weekly Digest": "Receive a weekly summary of activity and trending content",
};

const categoryIcons: Record<NotificationCategory, string> = {
  "New Skills": "🆕",
  "Security Alerts": "🔒",
  "Platform Updates": "📢",
  "Community Activity": "💬",
  "Weekly Digest": "📊",
};

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return iso;
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function NotificationsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [notifications, setNotifications] = useState<Notification[]>(notificationsData as Notification[]);
  const [showToast, setShowToast] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (isMounted) return;
    
    setIsMounted(true);
    
    // Load preferences after mount to avoid hydration issues
    setTimeout(() => {
      const stored = localStorage.getItem("notificationPreferences");
      if (stored) {
        try {
          setPreferences(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse notification preferences:", e);
        }
      }
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    localStorage.setItem("notificationPreferences", JSON.stringify(preferences));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const toggleNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: !notif.read } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isMounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <Link href="/" className="text-[#06D6A0] hover:underline text-sm mb-4 inline-block">
            ← Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">🔔 Notifications</h1>
              <p className="text-slate-400 mt-2">Manage your notification preferences and view recent updates</p>
            </div>
            {unreadCount > 0 && (
              <Badge variant="outline" className="bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30 text-sm px-3 py-1">
                {unreadCount} unread
              </Badge>
            )}
          </div>
        </div>

        <Separator className="my-6 opacity-10" />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Preferences Panel */}
          <div className="space-y-6">
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white">Notification Categories</CardTitle>
                <CardDescription className="text-slate-400">
                  Choose which types of notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(Object.keys(categoryDescriptions) as NotificationCategory[]).map((category) => (
                  <div key={category} className="flex items-start justify-between gap-4 py-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{categoryIcons[category]}</span>
                        <Label htmlFor={`toggle-${category}`} className="text-white font-medium cursor-pointer">
                          {category}
                        </Label>
                      </div>
                      <p className="text-sm text-slate-400">{categoryDescriptions[category]}</p>
                    </div>
                    <Switch
                      id={`toggle-${category}`}
                      checked={preferences[category]}
                      onCheckedChange={(checked) => updatePreference(category, checked)}
                      className="data-[state=checked]:bg-[#06D6A0]"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white">Delivery Method</CardTitle>
                <CardDescription className="text-slate-400">
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery-method" className="text-white">
                    Delivery Channel
                  </Label>
                  <Select
                    value={preferences.deliveryMethod}
                    onValueChange={(value: DeliveryMethod) => updatePreference("deliveryMethod", value)}
                  >
                    <SelectTrigger id="delivery-method" className="bg-slate-800/70 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="In-App" className="text-white hover:bg-slate-700">
                        📱 In-App Only
                      </SelectItem>
                      <SelectItem value="Email" className="text-white hover:bg-slate-700">
                        📧 Email
                      </SelectItem>
                      <SelectItem value="Webhook" className="text-white hover:bg-slate-700">
                        🔗 Webhook
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {preferences.deliveryMethod === "Webhook" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label htmlFor="webhook-url" className="text-white">
                      Webhook URL
                    </Label>
                    <Input
                      id="webhook-url"
                      type="url"
                      placeholder="https://your-domain.com/webhook"
                      value={preferences.webhookUrl}
                      onChange={(e) => updatePreference("webhookUrl", e.target.value)}
                      className="bg-slate-800/70 border-slate-700 text-white placeholder:text-slate-500"
                    />
                    <p className="text-xs text-slate-500">
                      Notifications will be sent as POST requests to this URL
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleSave}
                  className="w-full bg-[#06D6A0] hover:bg-[#05c291] text-white font-semibold"
                >
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Notifications Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Recent Notifications</h2>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Mark all as read
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.link}
                  onClick={() => !notif.read && toggleNotificationRead(notif.id)}
                  className={`block rounded-lg border p-4 transition-all ${
                    notif.read
                      ? "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
                      : "bg-slate-800/70 border-[#06D6A0]/30 hover:border-[#06D6A0]/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{categoryIcons[notif.category]}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          notif.read
                            ? "bg-slate-700/30 text-slate-400 border-slate-600"
                            : "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30"
                        }`}
                      >
                        {notif.category}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-500">{formatTimestamp(notif.timestamp)}</span>
                  </div>
                  <h3 className={`font-semibold mb-1 ${notif.read ? "text-slate-300" : "text-white"}`}>
                    {notif.title}
                  </h3>
                  <p className={`text-sm ${notif.read ? "text-slate-500" : "text-slate-400"}`}>
                    {notif.message}
                  </p>
                  {!notif.read && (
                    <div className="mt-2">
                      <div className="w-2 h-2 rounded-full bg-[#06D6A0] inline-block" />
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {notifications.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <span className="text-4xl mb-2 block">📭</span>
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Success Toast */}
        {showToast && (
          <div className="fixed bottom-8 right-8 bg-slate-800 border border-[#06D6A0] rounded-lg px-6 py-4 shadow-xl animate-in fade-in slide-in-from-bottom-4 z-50">
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
