import verifiedSkillsData from "../../data/verified-skills.json";

export type VerificationBadgeKind = "verified" | "maintained";

export type VerifiedSkillInfo = {
  slug: string;
  verifiedAt: string; // YYYY-MM-DD
  verifiedBy: string;
  reason: string;
  badges: VerificationBadgeKind[];
};

function normalizeSlug(slug: string): string {
  return (slug || "").trim().toLowerCase();
}

const VERIFIED_SKILLS: VerifiedSkillInfo[] = (verifiedSkillsData as VerifiedSkillInfo[]).map(
  (v) => ({
    ...v,
    slug: normalizeSlug(v.slug),
    badges: (v.badges || []).map((b) => b) as VerificationBadgeKind[],
  })
);

export function getVerifiedSkills(): VerifiedSkillInfo[] {
  return VERIFIED_SKILLS;
}

export function getVerificationInfo(slug: string): VerifiedSkillInfo | null {
  const s = normalizeSlug(slug);
  if (!s) return null;
  return VERIFIED_SKILLS.find((v) => v.slug === s) ?? null;
}

export function isVerified(slug: string): boolean {
  return getVerificationInfo(slug) !== null;
}

export function hasVerificationBadge(
  slug: string,
  badge: VerificationBadgeKind
): boolean {
  const info = getVerificationInfo(slug);
  if (!info) return false;
  return (info.badges || []).includes(badge);
}
