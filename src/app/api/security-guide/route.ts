import { NextRequest, NextResponse } from "next/server";
import {
  filterSecurityGuides,
  normalizeGuideCategory,
  normalizeGuideSeverity,
  readSecurityGuides,
  type SecurityGuide,
  type SecurityGuideCategory,
  type SecurityGuideSeverity,
  writeSecurityGuides,
} from "@/lib/security-guides";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function createGuideId(): string {
  const suffix = Math.random().toString(36).slice(2, 10);
  return `guide-${Date.now()}-${suffix}`;
}

export async function GET(request: NextRequest) {
  try {
    const categoryParam = request.nextUrl.searchParams.get("category");
    const severityParam = request.nextUrl.searchParams.get("severity");
    const search = request.nextUrl.searchParams.get("search");

    if (categoryParam && !normalizeGuideCategory(categoryParam)) {
      return NextResponse.json(
        { error: "Invalid category. Use injection, network, secrets, or general." },
        { status: 400 }
      );
    }

    if (severityParam && !normalizeGuideSeverity(severityParam)) {
      return NextResponse.json(
        { error: "Invalid severity. Use critical, high, medium, or low." },
        { status: 400 }
      );
    }

    const guides = await readSecurityGuides();
    const filteredGuides = filterSecurityGuides(guides, {
      category: categoryParam,
      severity: severityParam,
      search,
    });

    return NextResponse.json(
      {
        guides: filteredGuides,
        total: filteredGuides.length,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Failed to load security guides", error);
    return NextResponse.json({ error: "Failed to load security guides" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const categoryRaw = typeof body.category === "string" ? body.category : "";
    const severityRaw = typeof body.severity === "string" ? body.severity : "";
    const tags = Array.isArray(body.tags)
      ? body.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
      : [];

    const category = normalizeGuideCategory(categoryRaw) as SecurityGuideCategory | null;
    const severity = normalizeGuideSeverity(severityRaw) as SecurityGuideSeverity | null;

    if (!title || !content || !category || !severity) {
      return NextResponse.json(
        {
          error:
            "title, content, category (injection|network|secrets|general), and severity (critical|high|medium|low) are required",
        },
        { status: 400 }
      );
    }

    const guides = await readSecurityGuides();

    const newGuide: SecurityGuide = {
      id: createGuideId(),
      title,
      content,
      category,
      severity,
      tags,
      updatedAt: new Date().toISOString(),
    };

    const updatedGuides = [...guides, newGuide];
    await writeSecurityGuides(updatedGuides);

    return NextResponse.json({ guide: newGuide }, { status: 201 });
  } catch (error) {
    console.error("Failed to create security guide", error);
    return NextResponse.json({ error: "Failed to create security guide" }, { status: 500 });
  }
}
