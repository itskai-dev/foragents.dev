import { NextRequest, NextResponse } from "next/server";
import {
  createContribution,
  filterContributions,
  getValidFilters,
  readContributionGuides,
  readContributions,
  writeContributions,
} from "@/lib/contribute";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const filters = getValidFilters({
      type: params.get("type") ?? undefined,
      status: params.get("status") ?? undefined,
      author: params.get("author") ?? undefined,
      search: params.get("search") ?? undefined,
      limit: params.get("limit") ? Number(params.get("limit")) : undefined,
    });

    const [guides, contributions] = await Promise.all([readContributionGuides(), readContributions()]);
    const filtered = filterContributions(contributions, filters);

    return NextResponse.json(
      {
        guides,
        contributions: filtered,
        recentContributions: filtered,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    const details = error instanceof Error ? error.message : "Failed to load contribution data.";
    return NextResponse.json({ error: "Failed to load contribution data.", details }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const name = typeof body.name === "string" ? body.name : "";
    const email = typeof body.email === "string" ? body.email : "";
    const type = typeof body.type === "string" ? body.type : "";
    const title = typeof body.title === "string" ? body.title : "";
    const description = typeof body.description === "string" ? body.description : "";
    const url = typeof body.url === "string" ? body.url : "";

    if (!name.trim() || !email.trim() || !type.trim() || !description.trim()) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: "name, email, type, and description are required.",
        },
        { status: 400 }
      );
    }

    const contribution = createContribution({
      title,
      type,
      description,
      author: name,
      email,
      url,
    });

    const existing = await readContributions();
    await writeContributions([contribution, ...existing]);

    return NextResponse.json(
      {
        message: "Contribution submitted successfully.",
        contribution,
      },
      { status: 201 }
    );
  } catch (error) {
    const details = error instanceof Error ? error.message : "Invalid request body. Expected JSON.";
    return NextResponse.json({ error: "Validation failed", details }, { status: 400 });
  }
}
