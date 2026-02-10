import { promises as fs } from "fs";
import path from "path";

export type SecurityGuideCategory = "injection" | "network" | "secrets" | "general";
export type SecurityGuideSeverity = "critical" | "high" | "medium" | "low";

export interface SecurityGuide {
  id: string;
  title: string;
  content: string;
  category: SecurityGuideCategory;
  severity: SecurityGuideSeverity;
  tags: string[];
  updatedAt: string;
}

interface SecurityGuideFilters {
  category?: string | null;
  severity?: string | null;
  search?: string | null;
}

const SECURITY_GUIDES_PATH = path.join(process.cwd(), "data", "security-guides.json");

const guideCategories: SecurityGuideCategory[] = ["injection", "network", "secrets", "general"];
const guideSeverities: SecurityGuideSeverity[] = ["critical", "high", "medium", "low"];

function isGuideCategory(value: string): value is SecurityGuideCategory {
  return guideCategories.includes(value as SecurityGuideCategory);
}

function isGuideSeverity(value: string): value is SecurityGuideSeverity {
  return guideSeverities.includes(value as SecurityGuideSeverity);
}

function isSecurityGuide(item: unknown): item is SecurityGuide {
  if (!item || typeof item !== "object") return false;

  const candidate = item as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.content === "string" &&
    typeof candidate.category === "string" &&
    isGuideCategory(candidate.category) &&
    typeof candidate.severity === "string" &&
    isGuideSeverity(candidate.severity) &&
    Array.isArray(candidate.tags) &&
    candidate.tags.every((tag) => typeof tag === "string") &&
    typeof candidate.updatedAt === "string"
  );
}

export async function readSecurityGuides(): Promise<SecurityGuide[]> {
  try {
    const raw = await fs.readFile(SECURITY_GUIDES_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSecurityGuide);
  } catch {
    return [];
  }
}

export async function writeSecurityGuides(guides: SecurityGuide[]): Promise<void> {
  const dir = path.dirname(SECURITY_GUIDES_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(SECURITY_GUIDES_PATH, `${JSON.stringify(guides, null, 2)}\n`, "utf-8");
}

export function filterSecurityGuides(guides: SecurityGuide[], filters: SecurityGuideFilters): SecurityGuide[] {
  const category = filters.category?.trim().toLowerCase();
  const severity = filters.severity?.trim().toLowerCase();
  const search = filters.search?.trim().toLowerCase();

  return guides.filter((guide) => {
    if (category && isGuideCategory(category) && guide.category !== category) return false;
    if (severity && isGuideSeverity(severity) && guide.severity !== severity) return false;

    if (!search) return true;

    return [guide.title, guide.content, guide.category, guide.severity, ...guide.tags]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });
}

export function normalizeGuideCategory(value: string): SecurityGuideCategory | null {
  const normalized = value.trim().toLowerCase();
  return isGuideCategory(normalized) ? normalized : null;
}

export function normalizeGuideSeverity(value: string): SecurityGuideSeverity | null {
  const normalized = value.trim().toLowerCase();
  return isGuideSeverity(normalized) ? normalized : null;
}
