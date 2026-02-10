import { NextRequest, NextResponse } from "next/server";
import {
  type GovernanceCategory,
  type GovernancePolicy,
  isGovernanceCategory,
  isGovernanceStatus,
  readGovernancePolicies,
  writeGovernancePolicies,
  slugifyPolicyId,
} from "@/lib/governance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function addDays(base: Date, days: number): string {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  try {
    const categoryParam = request.nextUrl.searchParams.get("category")?.trim().toLowerCase();
    const statusParam = request.nextUrl.searchParams.get("status")?.trim().toLowerCase();
    const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase();

    const category =
      categoryParam && isGovernanceCategory(categoryParam) ? (categoryParam as GovernanceCategory) : null;
    const status = statusParam && isGovernanceStatus(statusParam) ? statusParam : null;

    const policies = await readGovernancePolicies();

    const filtered = policies.filter((policy) => {
      if (category && policy.category !== category) return false;
      if (status && policy.status !== status) return false;

      if (!search) return true;

      return [
        policy.id,
        policy.title,
        policy.description,
        policy.category,
        policy.status,
        policy.version,
        policy.approvedBy,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search);
    });

    return NextResponse.json(
      {
        policies: filtered,
        total: filtered.length,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Failed to load governance policies", error);
    return NextResponse.json({ error: "Failed to load governance policies" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim().toLowerCase() : "";
    const requestedId = typeof body.id === "string" ? body.id.trim() : "";
    const version = typeof body.version === "string" && body.version.trim() ? body.version.trim() : "1.0.0";
    const approvedBy =
      typeof body.approvedBy === "string" && body.approvedBy.trim() ? body.approvedBy.trim() : "Pending Review";
    const effectiveDate =
      typeof body.effectiveDate === "string" && body.effectiveDate.trim()
        ? body.effectiveDate.trim()
        : new Date().toISOString().slice(0, 10);
    const reviewDate =
      typeof body.reviewDate === "string" && body.reviewDate.trim()
        ? body.reviewDate.trim()
        : addDays(new Date(), 30);

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "title, description, and category are required" },
        { status: 400 }
      );
    }

    if (!isGovernanceCategory(category)) {
      return NextResponse.json(
        {
          error: "category must be one of data-handling, access-control, monitoring, ethics",
        },
        { status: 400 }
      );
    }

    const policies = await readGovernancePolicies();
    const lookupId = requestedId.toLowerCase();
    const existingIndex = lookupId ? policies.findIndex((policy) => policy.id.toLowerCase() === lookupId) : -1;

    let policy: GovernancePolicy;

    if (existingIndex >= 0) {
      const existing = policies[existingIndex];
      policy = {
        ...existing,
        title,
        description,
        category,
        status: "review",
        version,
        approvedBy,
        effectiveDate,
        reviewDate,
      };
      policies[existingIndex] = policy;
    } else {
      const id = requestedId || slugifyPolicyId(title);
      policy = {
        id,
        title,
        description,
        category,
        status: "review",
        version,
        approvedBy,
        effectiveDate,
        reviewDate,
      };
      policies.push(policy);
    }

    await writeGovernancePolicies(policies);

    return NextResponse.json(
      {
        message: "Policy submitted for review",
        policy,
      },
      { status: existingIndex >= 0 ? 200 : 201 }
    );
  } catch (error) {
    console.error("Failed to submit governance policy", error);
    return NextResponse.json({ error: "Failed to submit governance policy" }, { status: 500 });
  }
}
