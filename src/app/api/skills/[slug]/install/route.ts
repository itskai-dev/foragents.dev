import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/requestLimits";
import { getSkillBySlug } from "@/lib/data";
import { getSkillInstalls, incrementSkillInstalls } from "@/lib/server/skillInstalls";

const ONE_HOUR_MS = 60 * 60 * 1000;
const installRateLimit = new Map<string, number>();

function buildRateKey(slug: string, ip: string): string {
  return `${slug}:${ip}`;
}

function getRetryAfterSeconds(lastInstallAt: number, now: number): number {
  const retryMs = Math.max(1, ONE_HOUR_MS - (now - lastInstallAt));
  return Math.ceil(retryMs / 1000);
}

function pruneExpired(now: number): void {
  for (const [key, timestamp] of installRateLimit.entries()) {
    if (now - timestamp >= ONE_HOUR_MS) {
      installRateLimit.delete(key);
    }
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const skill = getSkillBySlug(slug);

  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  const now = Date.now();
  pruneExpired(now);

  const ip = getClientIp(request);
  const rateKey = buildRateKey(slug, ip);
  const lastInstallAt = installRateLimit.get(rateKey);

  if (typeof lastInstallAt === "number" && now - lastInstallAt < ONE_HOUR_MS) {
    const installs = await getSkillInstalls(slug);
    const retryAfter = getRetryAfterSeconds(lastInstallAt, now);

    return NextResponse.json(
      { error: "Install already tracked recently", slug, installs },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
        },
      }
    );
  }

  const installs = await incrementSkillInstalls(slug);
  installRateLimit.set(rateKey, now);

  return NextResponse.json({ slug, installs }, { status: 200 });
}
