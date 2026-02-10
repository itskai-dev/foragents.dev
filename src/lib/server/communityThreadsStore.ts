import "server-only";

import { promises as fs } from "fs";
import path from "path";
import {
  COMMUNITY_CATEGORIES,
  CommunityCategory,
  CommunityReply,
  CommunityThread,
} from "@/lib/communityThreads";

const THREADS_PATH = path.join(process.cwd(), "data", "community-threads.json");

function toIsoString(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toISOString();
}

function normalizeReply(raw: unknown, index: number): CommunityReply {
  const fallbackDate = new Date(0).toISOString();

  if (!raw || typeof raw !== "object") {
    return {
      id: `reply-fallback-${index}`,
      body: "",
      author: "anonymous",
      createdAt: fallbackDate,
    };
  }

  const value = raw as Partial<CommunityReply>;

  return {
    id: typeof value.id === "string" && value.id.trim() ? value.id : `reply-fallback-${index}`,
    body: typeof value.body === "string" ? value.body : "",
    author: typeof value.author === "string" && value.author.trim() ? value.author.trim() : "anonymous",
    createdAt: toIsoString(value.createdAt, fallbackDate),
  };
}

function isCommunityCategory(value: unknown): value is CommunityCategory {
  return typeof value === "string" && COMMUNITY_CATEGORIES.includes(value as CommunityCategory);
}

function normalizeThread(raw: unknown, index: number): CommunityThread {
  const fallbackDate = new Date(0).toISOString();

  if (!raw || typeof raw !== "object") {
    return {
      id: `thread-fallback-${index}`,
      title: "Untitled thread",
      body: "",
      author: "anonymous",
      category: "general",
      createdAt: fallbackDate,
      replyCount: 0,
      lastActivity: fallbackDate,
      replies: [],
    };
  }

  const value = raw as Partial<CommunityThread>;
  const replies = Array.isArray(value.replies)
    ? value.replies.map((reply, replyIndex) => normalizeReply(reply, replyIndex))
    : [];

  const replyCount = typeof value.replyCount === "number" ? Math.max(0, Math.floor(value.replyCount)) : replies.length;

  return {
    id: typeof value.id === "string" && value.id.trim() ? value.id : `thread-fallback-${index}`,
    title: typeof value.title === "string" && value.title.trim() ? value.title.trim() : "Untitled thread",
    body: typeof value.body === "string" ? value.body : "",
    author: typeof value.author === "string" && value.author.trim() ? value.author.trim() : "anonymous",
    category: isCommunityCategory(value.category) ? value.category : "general",
    createdAt: toIsoString(value.createdAt, fallbackDate),
    replyCount,
    lastActivity: toIsoString(value.lastActivity, fallbackDate),
    replies,
  };
}

export async function readCommunityThreadsFile(): Promise<CommunityThread[]> {
  try {
    const raw = await fs.readFile(THREADS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed.map((thread, index) => normalizeThread(thread, index));
  } catch {
    return [];
  }
}

export async function writeCommunityThreadsFile(threads: CommunityThread[]): Promise<void> {
  const dir = path.dirname(THREADS_PATH);
  await fs.mkdir(dir, { recursive: true });

  const tmpPath = `${THREADS_PATH}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(threads, null, 2), "utf-8");
  await fs.rename(tmpPath, THREADS_PATH);
}

export function sortThreadsByActivity(threads: CommunityThread[]): CommunityThread[] {
  return [...threads].sort(
    (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  );
}

export function makeThreadId(): string {
  return `thread_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function makeReplyId(): string {
  return `reply_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
