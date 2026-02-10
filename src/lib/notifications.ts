import { promises as fs } from "fs";
import path from "path";

export const NOTIFICATION_TYPES = [
  "new-skills",
  "security-alerts",
  "platform-updates",
  "community-activity",
  "weekly-digest",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  userId: string;
  createdAt: string;
  link?: string;
};

const NOTIFICATIONS_PATH = path.join(process.cwd(), "data", "notifications.json");

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function isNotificationType(value: unknown): value is NotificationType {
  return typeof value === "string" && (NOTIFICATION_TYPES as readonly string[]).includes(value);
}

function isNotificationItem(value: unknown): value is NotificationItem {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.message === "string" &&
    isNotificationType(value.type) &&
    typeof value.read === "boolean" &&
    typeof value.userId === "string" &&
    typeof value.createdAt === "string" &&
    (typeof value.link === "undefined" || typeof value.link === "string")
  );
}

export async function readNotifications(): Promise<NotificationItem[]> {
  try {
    const raw = await fs.readFile(NOTIFICATIONS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is NotificationItem => isNotificationItem(item))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export async function writeNotifications(notifications: NotificationItem[]): Promise<void> {
  await fs.mkdir(path.dirname(NOTIFICATIONS_PATH), { recursive: true });
  await fs.writeFile(NOTIFICATIONS_PATH, `${JSON.stringify(notifications, null, 2)}\n`, "utf-8");
}

type NotificationFilters = {
  type?: NotificationType;
  read?: boolean;
  userId?: string;
};

export function filterNotifications(
  notifications: NotificationItem[],
  filters: NotificationFilters
): NotificationItem[] {
  return notifications.filter((notification) => {
    if (filters.type && notification.type !== filters.type) return false;
    if (typeof filters.read === "boolean" && notification.read !== filters.read) return false;
    if (filters.userId && notification.userId !== filters.userId) return false;
    return true;
  });
}

type CreateNotificationInput = {
  title: string;
  message: string;
  type: NotificationType;
  userId: string;
  read?: boolean;
  link?: string;
};

export function createNotification(input: CreateNotificationInput): NotificationItem {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: input.title,
    message: input.message,
    type: input.type,
    read: input.read ?? false,
    userId: input.userId,
    createdAt: new Date().toISOString(),
    link: input.link,
  };
}

export function markNotificationsRead(
  notifications: NotificationItem[],
  options: { id?: string; userId?: string; read?: boolean; markAll?: boolean }
): { notifications: NotificationItem[]; updated: NotificationItem[] } {
  const nextReadValue = options.read ?? true;
  const updated: NotificationItem[] = [];

  const nextNotifications = notifications.map((notification) => {
    const shouldUpdate = options.markAll
      ? !options.userId || notification.userId === options.userId
      : !!options.id && notification.id === options.id;

    if (!shouldUpdate) {
      return notification;
    }

    const next = {
      ...notification,
      read: nextReadValue,
    };

    updated.push(next);
    return next;
  });

  return { notifications: nextNotifications, updated };
}
