import { promises as fs } from "fs";
import path from "path";

export type SkillReview = {
  id: string;
  skillSlug: string;
  author: string;
  rating: number; // 1..5
  title: string;
  body: string;
  helpful: number;
  createdAt: string; // YYYY-MM-DD
};

const REVIEWS_PATH = path.join(process.cwd(), "data", "skill-reviews.json");

async function readAllReviews(): Promise<SkillReview[]> {
  try {
    const raw = await fs.readFile(REVIEWS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as SkillReview[];
  } catch {
    return [];
  }
}

async function writeAllReviews(reviews: SkillReview[]): Promise<void> {
  const dir = path.dirname(REVIEWS_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(REVIEWS_PATH, JSON.stringify(reviews, null, 2));
}

function safeDateKey(d: string): number {
  const t = new Date(d).getTime();
  return Number.isFinite(t) ? t : 0;
}

export type ReviewSort = "helpful" | "newest";

export async function getSkillReviews(
  slug: string,
  opts?: { sort?: ReviewSort }
): Promise<SkillReview[]> {
  const all = await readAllReviews();
  const filtered = all.filter((r) => r.skillSlug === slug);

  const sort = opts?.sort ?? "helpful";

  if (sort === "newest") {
    return filtered.sort((a, b) => safeDateKey(b.createdAt) - safeDateKey(a.createdAt));
  }

  // default: helpful, then newest
  return filtered.sort((a, b) => {
    if (b.helpful !== a.helpful) return b.helpful - a.helpful;
    return safeDateKey(b.createdAt) - safeDateKey(a.createdAt);
  });
}

export async function getReviewCount(slug: string): Promise<number> {
  const all = await readAllReviews();
  return all.filter((r) => r.skillSlug === slug).length;
}

export async function getAverageRating(slug: string): Promise<number> {
  const all = await readAllReviews();
  const items = all.filter((r) => r.skillSlug === slug);
  if (items.length === 0) return 0;
  const sum = items.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  return sum / items.length;
}

export async function createSkillReview(input: {
  skillSlug: string;
  author: string;
  rating: number;
  title: string;
  body: string;
}): Promise<SkillReview> {
  const now = new Date();
  const createdAt = now.toISOString().slice(0, 10);

  const review: SkillReview = {
    id: `review_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    skillSlug: input.skillSlug,
    author: input.author,
    rating: input.rating,
    title: input.title,
    body: input.body,
    helpful: 0,
    createdAt,
  };

  const all = await readAllReviews();
  all.push(review);
  await writeAllReviews(all);

  return review;
}

export async function incrementReviewHelpful(id: string, delta = 1): Promise<SkillReview | null> {
  const all = await readAllReviews();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  const current = all[idx]!;
  const next: SkillReview = {
    ...current,
    helpful: Math.max(0, (Number(current.helpful) || 0) + delta),
  };

  all[idx] = next;
  await writeAllReviews(all);
  return next;
}

export async function getAllReviews(): Promise<SkillReview[]> {
  return readAllReviews();
}
