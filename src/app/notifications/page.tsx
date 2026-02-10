/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

type Channel = "email" | "discord" | "webhook" | "in-app";
type Category = "security-alerts" | "new-skills" | "bounty-updates" | "community" | "system";
type Frequency = "instant" | "daily" | "weekly" | "off";
type NotificationType = "new-skills" | "security-alerts" | "platform-updates" | "community-activity" | "weekly-digest";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  userId: string;
  createdAt: string;
  link?: string;
}

interface CategoryPreference {
  frequency: Frequency;
  channels: Record<Channel, boolean>;
}

interface NotificationPreferences {
  channels: Channel[];
  categories: Record<Category, CategoryPreference>;
}

const DEMO_USER_ID = "agent-001";
const CATEGORY_ORDER: Category[] = ["security-alerts", "new-skills", "bounty-updates", "community", "system"];
const CHANNEL_ORDER: Channel[] = ["email", "discord", "webhook", "in-app"];

const CATEGORY_LABELS: Record<Category, string> = {
  "security-alerts": "Security Alerts",
  "new-skills": "New Skills",
  "bounty-updates": "Bounty Updates",
  community: "Community",
  system: "System",
};

const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  "new-skills": "New Skills",
  "security-alerts": "Security Alerts",
  "platform-updates": "Platform Updates",
  "community-activity": "Community Activity",
  "weekly-digest": "Weekly Digest",
};

const CHANNEL_LABELS: Record<Channel, string> = {
  email: "Email",
  discord: "Discord",
  webhook: "Webhook",
  "in-app": "In-App",
};

const FREQUENCY_OPTIONS: Frequency[] = ["instant", "daily", "weekly", "off"];

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
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [defaults, setDefaults] = useState<NotificationPreferences | null>(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoadingPreferences(true);
      setErrorMessage(null);
      try {
        const response = await fetch("/api/notifications/preferences", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load notification preferences");
        }

        const data = (await response.json()) as {
          preferences: NotificationPreferences;
          defaults: NotificationPreferences;
        };

        setPreferences(data.preferences);
        setDefaults(data.defaults);
      } catch (error) {
        console.error(error);
        setErrorMessage("Could not load your notification preferences. Please refresh and try again.");
      } finally {
        setIsLoadingPreferences(false);
      }
    };

    void loadPreferences();
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoadingNotifications(true);
      setNotificationsError(null);

      try {
        const response = await fetch(`/api/notifications?userId=${encodeURIComponent(DEMO_USER_ID)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load notifications");
        }

        const data = (await response.json()) as { notifications: Notification[] };
        setNotifications(data.notifications);
      } catch (error) {
        console.error(error);
        setNotificationsError("Could not load notifications. Please refresh and try again.");
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    void loadNotifications();
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const setCategoryChannel = (category: Category, channel: Channel, value: boolean) => {
    setPreferences((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        categories: {
          ...prev.categories,
          [category]: {
            ...prev.categories[category],
            channels: {
              ...prev.categories[category].channels,
              [channel]: value,
            },
          },
        },
      };
    });
  };

  const setCategoryFrequency = (category: Category, frequency: Frequency) => {
    setPreferences((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        categories: {
          ...prev.categories,
          [category]: {
            ...prev.categories[category],
            frequency,
          },
        },
      };
    });
  };

  const savePreferences = async (next: NotificationPreferences, successText: string) => {
    const response = await fetch("/api/notifications/preferences", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(next),
    });

    if (!response.ok) {
      throw new Error("Failed to save notification preferences");
    }

    const data = (await response.json()) as { preferences: NotificationPreferences };
    setPreferences(data.preferences);
    setStatusMessage(successText);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSave = async () => {
    if (!preferences) return;

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await savePreferences(preferences, "Preferences saved");
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not save preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!defaults) return;

    setIsResetting(true);
    setErrorMessage(null);
    try {
      await savePreferences(defaults, "Preferences reset to defaults");
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not reset preferences. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const toggleNotificationRead = async (id: string, nextReadValue: boolean) => {
    setIsUpdatingNotifications(true);
    setNotificationsError(null);

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, read: nextReadValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to update notification");
      }

      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, read: nextReadValue } : notif))
      );
    } catch (error) {
      console.error(error);
      setNotificationsError("Could not update notification status.");
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const markAllAsRead = async () => {
    setIsUpdatingNotifications(true);
    setNotificationsError(null);

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markAll: true, userId: DEMO_USER_ID, read: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notifications as read");
      }

      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    } catch (error) {
      console.error(error);
      setNotificationsError("Could not mark all notifications as read.");
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <Link href="/" className="text-[#06D6A0] hover:underline text-sm mb-4 inline-block">
            ← Back to Home
          </Link>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-white">🔔 Notifications</h1>
              <p className="text-slate-400 mt-2">Manage category and channel preferences, then save to persist.</p>
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
          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white">Notification Preferences</CardTitle>
              <CardDescription className="text-slate-400">
                Configure category × channel toggles and set delivery frequency per category.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingPreferences && <p className="text-slate-300">Loading preferences...</p>}

              {!isLoadingPreferences && errorMessage && (
                <div className="rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-300">
                  {errorMessage}
                </div>
              )}

              {!isLoadingPreferences && preferences && (
                <>
                  <div className="overflow-x-auto rounded-md border border-slate-700">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-900/70">
                        <tr>
                          <th className="px-3 py-2 text-left text-slate-300 font-medium">Category</th>
                          {CHANNEL_ORDER.map((channel) => (
                            <th key={channel} className="px-3 py-2 text-center text-slate-300 font-medium whitespace-nowrap">
                              {CHANNEL_LABELS[channel]}
                            </th>
                          ))}
                          <th className="px-3 py-2 text-left text-slate-300 font-medium">Frequency</th>
                        </tr>
                      </thead>
                      <tbody>
                        {CATEGORY_ORDER.map((category) => (
                          <tr key={category} className="border-t border-slate-700/80">
                            <td className="px-3 py-3 text-white whitespace-nowrap">{CATEGORY_LABELS[category]}</td>
                            {CHANNEL_ORDER.map((channel) => (
                              <td key={`${category}-${channel}`} className="px-3 py-3 text-center">
                                <Switch
                                  checked={preferences.categories[category].channels[channel]}
                                  onCheckedChange={(checked) => setCategoryChannel(category, channel, checked)}
                                  className="data-[state=checked]:bg-[#06D6A0]"
                                  aria-label={`${CATEGORY_LABELS[category]} ${CHANNEL_LABELS[channel]} toggle`}
                                />
                              </td>
                            ))}
                            <td className="px-3 py-3 min-w-[140px]">
                              <Select
                                value={preferences.categories[category].frequency}
                                onValueChange={(value) => {
                                  if (FREQUENCY_OPTIONS.includes(value as Frequency)) {
                                    setCategoryFrequency(category, value as Frequency);
                                  }
                                }}
                              >
                                <SelectTrigger className="bg-slate-800/70 border-slate-700 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                  {FREQUENCY_OPTIONS.map((frequency) => (
                                    <SelectItem key={`${category}-${frequency}`} value={frequency} className="text-white hover:bg-slate-700">
                                      {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving || isResetting}
                      className="bg-[#06D6A0] hover:bg-[#05c291] text-white"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={isSaving || isResetting || !defaults}
                      className="border-slate-700 text-slate-200 hover:bg-slate-700"
                    >
                      {isResetting ? "Resetting..." : "Reset to defaults"}
                    </Button>
                    {statusMessage && <p className="text-sm text-[#06D6A0] self-center">{statusMessage}</p>}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Recent Notifications</h2>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={isUpdatingNotifications}
                  className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Mark all as read
                </Button>
              )}
            </div>

            {notificationsError && (
              <div className="rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-300">
                {notificationsError}
              </div>
            )}

            {isLoadingNotifications && <p className="text-slate-300">Loading notifications...</p>}

            {!isLoadingNotifications && !notificationsError && (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={notif.link ?? "/notifications"}
                    onClick={() => {
                      if (!notif.read) {
                        void toggleNotificationRead(notif.id, true);
                      }
                    }}
                    className={`block rounded-lg border p-4 transition-all ${
                      notif.read
                        ? "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
                        : "bg-slate-800/70 border-[#06D6A0]/30 hover:border-[#06D6A0]/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          notif.read
                            ? "bg-slate-700/30 text-slate-400 border-slate-600"
                            : "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30"
                        }`}
                      >
                        {NOTIFICATION_TYPE_LABELS[notif.type]}
                      </Badge>
                      <span className="text-xs text-slate-500">{formatTimestamp(notif.createdAt)}</span>
                    </div>
                    <h3 className={`font-semibold mb-1 ${notif.read ? "text-slate-300" : "text-white"}`}>{notif.title}</h3>
                    <p className={`text-sm ${notif.read ? "text-slate-500" : "text-slate-400"}`}>{notif.message}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
