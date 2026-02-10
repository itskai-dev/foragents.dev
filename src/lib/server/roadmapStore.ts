import "server-only";

import { promises as fs } from "fs";
import path from "path";

export type RoadmapStatus = "planned" | "in-progress" | "completed";

export type RoadmapItem = {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  votes: number;
};

const ROADMAP_PATH = path.join(process.cwd(), "data", "roadmap.json");

// In-memory vote deltas so votes can change without mutating source files.
const voteDeltas = new Map<string, number>();

export function isRoadmapStatus(value: string | null): value is RoadmapStatus {
  return value === "planned" || value === "in-progress" || value === "completed";
}

async function readRoadmapFile(): Promise<RoadmapItem[]> {
  const raw = await fs.readFile(ROADMAP_PATH, "utf-8");
  return JSON.parse(raw) as RoadmapItem[];
}

export async function getRoadmapItems(): Promise<RoadmapItem[]> {
  const items = await readRoadmapFile();

  return items.map((item) => ({
    ...item,
    votes: item.votes + (voteDeltas.get(item.id) ?? 0),
  }));
}

export async function incrementRoadmapVote(itemId: string): Promise<{ id: string; votes: number } | null> {
  const items = await readRoadmapFile();
  const item = items.find((candidate) => candidate.id === itemId);

  if (!item) {
    return null;
  }

  const currentDelta = voteDeltas.get(itemId) ?? 0;
  const nextDelta = currentDelta + 1;
  voteDeltas.set(itemId, nextDelta);

  return {
    id: itemId,
    votes: item.votes + nextDelta,
  };
}
