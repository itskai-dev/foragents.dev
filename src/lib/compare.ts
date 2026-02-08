export const COMPARE_TRAY_STORAGE_KEY = "foragents.compareTray.v1";
export const COMPARE_TRAY_MAX = 4;

/**
 * Generic comma-separated list parser for compare URLs.
 * - trims
 * - removes empties
 * - dedupes
 * - clamps to COMPARE_TRAY_MAX
 */
function parseCompareListParam(param: string | null | undefined): string[] {
  if (!param) return [];
  const raw = String(param)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const id of raw) {
    if (seen.has(id)) continue;
    seen.add(id);
    deduped.push(id);
    if (deduped.length >= COMPARE_TRAY_MAX) break;
  }
  return deduped;
}

/**
 * Legacy: agent comparison uses `?a=` and agent ids.
 */
export function parseCompareIdsParam(param: string | null | undefined): string[] {
  return parseCompareListParam(param);
}

/**
 * Skills/kits comparison uses `?skills=` and skill slugs.
 */
export function parseCompareSkillsParam(param: string | null | undefined): string[] {
  return parseCompareListParam(param);
}

/**
 * Legacy: agent compare URL.
 */
export function buildCompareUrl(ids: string[]): string {
  const safe = ids.filter(Boolean).slice(0, COMPARE_TRAY_MAX);
  const a = safe.join(",");
  return a ? `/compare?a=${encodeURIComponent(a)}` : "/compare";
}

export function buildSkillCompareUrl(slugs: string[]): string {
  const safe = slugs.filter(Boolean).slice(0, COMPARE_TRAY_MAX);
  const skills = safe.join(",");
  return skills ? `/compare?skills=${encodeURIComponent(skills)}` : "/compare";
}
