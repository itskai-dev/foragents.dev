import "server-only";

import { promises as fs } from "fs";
import path from "path";

export type SkillMetricStore = {
  updated_at: string;
  installs_total: Record<string, number>;
  views_total: Record<string, number>;
  installs_by_day: Record<string, Record<string, number>>; // slug -> YYYY-MM-DD -> count
  views_by_day: Record<string, Record<string, number>>;
};

const METRICS_PATH = path.join(process.cwd(), "data", "skill_metrics.json");

function emptyStore(): SkillMetricStore {
  return {
    updated_at: new Date().toISOString(),
    installs_total: {},
    views_total: {},
    installs_by_day: {},
    views_by_day: {},
  };
}

export async function readSkillMetricStore(): Promise<SkillMetricStore> {
  try {
    const raw = await fs.readFile(METRICS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<SkillMetricStore>;

    return {
      ...emptyStore(),
      ...parsed,
      installs_total: parsed.installs_total ?? {},
      views_total: parsed.views_total ?? {},
      installs_by_day: parsed.installs_by_day ?? {},
      views_by_day: parsed.views_by_day ?? {},
    };
  } catch {
    return emptyStore();
  }
}

async function writeSkillMetricStore(store: SkillMetricStore): Promise<void> {
  await fs.mkdir(path.dirname(METRICS_PATH), { recursive: true });
  await fs.writeFile(METRICS_PATH, JSON.stringify(store, null, 2), "utf-8");
}

function dayKeyUTC(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function incrementSkillMetric(input: {
  slug: string;
  metric: "install" | "view";
  at?: Date;
}): Promise<{ slug: string; metric: "install" | "view"; total: number; day: string }>
{
  const at = input.at ?? new Date();
  const day = dayKeyUTC(at);
  const store = await readSkillMetricStore();

  if (input.metric === "install") {
    store.installs_total[input.slug] = (store.installs_total[input.slug] ?? 0) + 1;
    const byDay = (store.installs_by_day[input.slug] ??= {});
    byDay[day] = (byDay[day] ?? 0) + 1;
  } else {
    store.views_total[input.slug] = (store.views_total[input.slug] ?? 0) + 1;
    const byDay = (store.views_by_day[input.slug] ??= {});
    byDay[day] = (byDay[day] ?? 0) + 1;
  }

  store.updated_at = new Date().toISOString();
  await writeSkillMetricStore(store);

  const total = input.metric === "install"
    ? (store.installs_total[input.slug] ?? 0)
    : (store.views_total[input.slug] ?? 0);

  return { slug: input.slug, metric: input.metric, total, day };
}

export async function getSkillMetricTotals(input: {
  slug: string;
}): Promise<{ slug: string; installs: number; views: number }>
{
  const store = await readSkillMetricStore();
  return {
    slug: input.slug,
    installs: store.installs_total[input.slug] ?? 0,
    views: store.views_total[input.slug] ?? 0,
  };
}
