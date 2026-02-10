import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

export const BADGE_CATEGORIES = ["contribution", "skill", "community", "milestone"] as const;

export type BadgeCategory = (typeof BADGE_CATEGORIES)[number];

export type BadgeRecord = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: BadgeCategory;
  criteria: string;
  earnerCount: number;
  earners: string[];
};

const BADGES_PATH = path.join(process.cwd(), "data", "badges.json");

function isBadgeCategory(value: unknown): value is BadgeCategory {
  return typeof value === "string" && BADGE_CATEGORIES.includes(value as BadgeCategory);
}

function normalizeBadge(raw: unknown, index: number): BadgeRecord {
  const fallbackId = `badge-${index + 1}`;

  if (!raw || typeof raw !== "object") {
    return {
      id: fallbackId,
      name: "Untitled Badge",
      description: "",
      emoji: "🏅",
      category: "contribution",
      criteria: "",
      earnerCount: 0,
      earners: [],
    };
  }

  const value = raw as Partial<BadgeRecord>;

  const normalizedEarners = Array.isArray(value.earners)
    ? Array.from(
        new Set(
          value.earners
            .filter((earner): earner is string => typeof earner === "string")
            .map((earner) => earner.trim())
            .filter(Boolean)
        )
      )
    : [];

  const earnerCount =
    typeof value.earnerCount === "number" && Number.isFinite(value.earnerCount)
      ? Math.max(normalizedEarners.length, Math.floor(value.earnerCount))
      : normalizedEarners.length;

  return {
    id: typeof value.id === "string" && value.id.trim() ? value.id.trim() : fallbackId,
    name: typeof value.name === "string" && value.name.trim() ? value.name.trim() : "Untitled Badge",
    description: typeof value.description === "string" ? value.description : "",
    emoji: typeof value.emoji === "string" && value.emoji.trim() ? value.emoji.trim() : "🏅",
    category: isBadgeCategory(value.category) ? value.category : "contribution",
    criteria: typeof value.criteria === "string" ? value.criteria : "",
    earnerCount,
    earners: normalizedEarners,
  };
}

export async function readBadgeStore(): Promise<BadgeRecord[]> {
  try {
    const raw = await fs.readFile(BADGES_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    const rows = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && Array.isArray((parsed as { badges?: unknown[] }).badges)
        ? (parsed as { badges: unknown[] }).badges
        : [];

    return rows.map((badge, index) => normalizeBadge(badge, index));
  } catch {
    return [];
  }
}

export async function writeBadgeStore(badges: BadgeRecord[]): Promise<void> {
  const dir = path.dirname(BADGES_PATH);
  await fs.mkdir(dir, { recursive: true });

  const tmpPath = `${BADGES_PATH}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(badges, null, 2), "utf-8");
  await fs.rename(tmpPath, BADGES_PATH);
}

export function findBadgeById(badges: BadgeRecord[], id: string): BadgeRecord | null {
  return badges.find((badge) => badge.id === id) ?? null;
}

export function sanitizeAgentHandle(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
}
