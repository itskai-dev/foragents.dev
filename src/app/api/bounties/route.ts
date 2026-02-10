import { NextRequest, NextResponse } from "next/server";
import { createBounty, getBounties, type BountyStatus } from "@/lib/bounties";

type CreateBody = {
  title?: unknown;
  description?: unknown;
  budget?: unknown;
  tags?: unknown;
  requirements?: unknown;
};

function parseStatus(value: string | null): BountyStatus | null {
  if (value === "open" || value === "claimed" || value === "completed") return value;
  return null;
}

function validateCreateBody(body: CreateBody):
  | {
      ok: true;
      value: {
        title: string;
        description: string;
        budget: number;
        tags: string[];
        requirements: string[];
      };
    }
  | { ok: false; errors: string[] } {
  const errors: string[] = [];

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const budget = typeof body.budget === "number" ? body.budget : Number(body.budget);

  const tags = Array.isArray(body.tags)
    ? body.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0).map((tag) => tag.trim())
    : [];

  const requirements = Array.isArray(body.requirements)
    ? body.requirements
        .filter((requirement): requirement is string => typeof requirement === "string" && requirement.trim().length > 0)
        .map((requirement) => requirement.trim())
    : [];

  if (!title) errors.push("title is required");
  if (!description) errors.push("description is required");
  if (!Number.isFinite(budget) || budget <= 0) errors.push("budget must be a positive number");
  if (tags.length === 0) errors.push("tags is required");
  if (requirements.length === 0) errors.push("requirements is required");

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      title,
      description,
      budget,
      tags,
      requirements,
    },
  };
}

export async function GET(request: NextRequest) {
  const statusFilter = parseStatus(request.nextUrl.searchParams.get("status"));
  const tagFilter = request.nextUrl.searchParams.get("tag")?.trim().toLowerCase() || "";
  const sort = request.nextUrl.searchParams.get("sort") === "budget" ? "budget" : "recent";

  const allBounties = await getBounties();

  let filtered = allBounties;

  if (statusFilter) {
    filtered = filtered.filter((bounty) => bounty.status === statusFilter);
  }

  if (tagFilter) {
    filtered = filtered.filter((bounty) => bounty.tags.some((tag) => tag.toLowerCase() === tagFilter));
  }

  const bounties = [...filtered].sort((a, b) => {
    if (sort === "budget") {
      return b.budget - a.budget || b.createdAt.localeCompare(a.createdAt);
    }

    return b.createdAt.localeCompare(a.createdAt);
  });

  return NextResponse.json(
    {
      bounties,
      total: bounties.length,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  let body: CreateBody;

  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateCreateBody(body);

  if (!validation.ok) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: validation.errors,
      },
      { status: 400 }
    );
  }

  const bounty = await createBounty(validation.value);
  return NextResponse.json(bounty, { status: 201 });
}
