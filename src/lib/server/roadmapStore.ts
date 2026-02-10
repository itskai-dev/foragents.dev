import "server-only";

import { promises as fs } from "fs";
import path from "path";

export type RoadmapStatus = "planned" | "in-progress" | "completed" | "considering";
export type RoadmapCategory = "platform" | "tools" | "community" | "enterprise";

export type RoadmapItem = {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  category: RoadmapCategory;
  voteCount: number;
  voters: string[];
  targetDate?: string;
  completedDate?: string;
  createdAt?: string;
};

const ROADMAP_PATH = path.join(process.cwd(), "data", "roadmap.json");

const ROADMAP_STATUSES: RoadmapStatus[] = ["planned", "in-progress", "completed", "considering"];
const ROADMAP_CATEGORIES: RoadmapCategory[] = ["platform", "tools", "community", "enterprise"];

export function isRoadmapStatus(value: string | null): value is RoadmapStatus {
  return value !== null && ROADMAP_STATUSES.includes(value as RoadmapStatus);
}

export function isRoadmapCategory(value: string): value is RoadmapCategory {
  return ROADMAP_CATEGORIES.includes(value as RoadmapCategory);
}

export async function readRoadmapItems(): Promise<RoadmapItem[]> {
  const raw = await fs.readFile(ROADMAP_PATH, "utf-8");
  return JSON.parse(raw) as RoadmapItem[];
}

export async function writeRoadmapItems(items: RoadmapItem[]): Promise<void> {
  await fs.writeFile(ROADMAP_PATH, `${JSON.stringify(items, null, 2)}\n`, "utf-8");
}

export function createRoadmapId(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return `${slug || "feature-request"}-${Date.now()}`;
}

export function filterRoadmapItems(
  items: RoadmapItem[],
  options: { status?: RoadmapStatus; search?: string }
): RoadmapItem[] {
  const searchQuery = options.search?.trim().toLowerCase();

  return items.filter((item) => {
    if (options.status && item.status !== options.status) {
      return false;
    }

    if (!searchQuery) {
      return true;
    }

    const haystack = `${item.title} ${item.description} ${item.category}`.toLowerCase();
    return haystack.includes(searchQuery);
  });
}

export function getProgressForInProgressItem(item: RoadmapItem): number {
  if (item.status !== "in-progress") {
    return 0;
  }

  if (!item.targetDate) {
    return 60;
  }

  const targetTimestamp = Date.parse(item.targetDate);

  if (Number.isNaN(targetTimestamp)) {
    return 60;
  }

  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  const startTimestamp = targetTimestamp - ninetyDaysMs;
  const now = Date.now();
  const rawProgress = ((now - startTimestamp) / (targetTimestamp - startTimestamp)) * 100;

  return Math.max(10, Math.min(95, Math.round(rawProgress)));
}
