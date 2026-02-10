import { NextRequest, NextResponse } from "next/server";
import {
  createNotification,
  filterNotifications,
  isNotificationType,
  markNotificationsRead,
  NotificationItem,
  NotificationType,
  readNotifications,
  writeNotifications,
} from "@/lib/notifications";

type CreateNotificationRequest = {
  title?: unknown;
  message?: unknown;
  type?: unknown;
  userId?: unknown;
  read?: unknown;
  link?: unknown;
};

type PatchNotificationRequest = {
  id?: unknown;
  userId?: unknown;
  read?: unknown;
  markAll?: unknown;
};

function parseReadParam(readValue: string | null): boolean | undefined {
  if (!readValue) return undefined;
  const normalized = readValue.toLowerCase();

  if (normalized === "true" || normalized === "read") return true;
  if (normalized === "false" || normalized === "unread") return false;

  return undefined;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const typeValue = searchParams.get("type");
  const readValue = parseReadParam(searchParams.get("read"));
  const userIdValue = searchParams.get("userId") ?? undefined;

  if (typeValue && !isNotificationType(typeValue)) {
    return NextResponse.json({ error: "Invalid type filter" }, { status: 400 });
  }

  const notifications = await readNotifications();
  const filtered = filterNotifications(notifications, {
    type: typeValue as NotificationType | undefined,
    read: readValue,
    userId: userIdValue,
  });

  return NextResponse.json(
    {
      notifications: filtered,
      count: filtered.length,
      updatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  let payload: CreateNotificationRequest;

  try {
    payload = (await request.json()) as CreateNotificationRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  const userId = typeof payload.userId === "string" ? payload.userId.trim() : "";
  const link = typeof payload.link === "string" ? payload.link.trim() : undefined;

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  if (!isNotificationType(payload.type)) {
    return NextResponse.json({ error: "type is invalid" }, { status: 400 });
  }

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const notifications = await readNotifications();
  const next = createNotification({
    title,
    message,
    type: payload.type,
    userId,
    read: typeof payload.read === "boolean" ? payload.read : false,
    link,
  });

  const nextNotifications = [next, ...notifications];
  await writeNotifications(nextNotifications);

  return NextResponse.json(
    {
      notification: next,
    },
    { status: 201 }
  );
}

export async function PATCH(request: NextRequest) {
  let payload: PatchNotificationRequest;

  try {
    payload = (await request.json()) as PatchNotificationRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const id = typeof payload.id === "string" ? payload.id.trim() : "";
  const userId = typeof payload.userId === "string" ? payload.userId.trim() : "";
  const markAll = payload.markAll === true;
  const read = typeof payload.read === "boolean" ? payload.read : true;

  if (!markAll && !id) {
    return NextResponse.json({ error: "id is required when markAll is false" }, { status: 400 });
  }

  if (markAll && !userId) {
    return NextResponse.json({ error: "userId is required when markAll is true" }, { status: 400 });
  }

  const notifications = await readNotifications();
  const { notifications: nextNotifications, updated } = markNotificationsRead(notifications, {
    id: id || undefined,
    userId: userId || undefined,
    read,
    markAll,
  });

  if (!markAll && updated.length === 0) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }

  await writeNotifications(nextNotifications);

  return NextResponse.json({
    success: true,
    updated,
  });
}
