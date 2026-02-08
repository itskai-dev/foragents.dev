import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from "@/lib/requestLimits";

const COUNTS_FILE = path.join(process.cwd(), "data", "install-counts.json");

type InstallCounts = Record<string, number>;

async function readCounts(): Promise<InstallCounts> {
  try {
    const data = await fs.readFile(COUNTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeCounts(counts: InstallCounts): Promise<void> {
  try {
    await fs.mkdir(path.dirname(COUNTS_FILE), { recursive: true });
    await fs.writeFile(COUNTS_FILE, JSON.stringify(counts, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write install counts:", error);
    throw error;
  }
}

// POST: Track an install
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`track:install:${ip}`, { windowMs: 60_000, max: 100 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    const body = await readJsonWithLimit(request, 1_000);
    const { skillSlug } = body;

    if (!skillSlug || typeof skillSlug !== "string") {
      return NextResponse.json(
        { error: "skillSlug is required and must be a string" },
        { status: 400 }
      );
    }

    const counts = await readCounts();
    counts[skillSlug] = (counts[skillSlug] || 0) + 1;
    await writeCounts(counts);

    return NextResponse.json({
      skillSlug,
      count: counts[skillSlug],
    });
  } catch (error) {
    console.error("Error tracking install:", error);
    return NextResponse.json(
      { error: "Failed to track install" },
      { status: 500 }
    );
  }
}

// GET: Retrieve install counts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skillSlug = searchParams.get("slug");

    const counts = await readCounts();

    if (skillSlug) {
      return NextResponse.json({
        skillSlug,
        count: counts[skillSlug] || 0,
      });
    }

    return NextResponse.json(counts);
  } catch (error) {
    console.error("Error retrieving install counts:", error);
    return NextResponse.json(
      { error: "Failed to retrieve install counts" },
      { status: 500 }
    );
  }
}
