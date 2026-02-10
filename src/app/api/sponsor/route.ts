import { NextRequest, NextResponse } from "next/server";
import { readJsonWithLimit } from "@/lib/requestLimits";
import {
  buildTierSummaries,
  createSponsorRecord,
  filterSponsors,
  readSponsorsData,
  validateCreateSponsor,
  writeSponsorsData,
  type CreateSponsorInput,
} from "@/lib/sponsor";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 16_000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tier = searchParams.get("tier") ?? "";
  const search = searchParams.get("search") ?? "";

  const data = await readSponsorsData();
  const sponsors = filterSponsors(data.sponsors, { tier, search });
  const tiers = buildTierSummaries(data.tiers, data.sponsors);

  return NextResponse.json(
    {
      tiers,
      sponsors,
      filters: {
        tier: tier || "all",
        search,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonWithLimit<CreateSponsorInput & Record<string, unknown>>(
      request,
      MAX_BODY_BYTES
    );

    const data = await readSponsorsData();
    const errors = validateCreateSponsor(body, data.tiers);

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const sponsor = createSponsorRecord(body);
    data.sponsors.push(sponsor);
    await writeSponsorsData(data);

    return NextResponse.json(
      {
        success: true,
        sponsor,
      },
      { status: 201 }
    );
  } catch (err) {
    const status =
      typeof err === "object" && err && "status" in err
        ? Number((err as { status?: unknown }).status)
        : undefined;

    if (status === 413) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    return NextResponse.json(
      { error: "Invalid request body. Expected JSON." },
      { status: 400 }
    );
  }
}
