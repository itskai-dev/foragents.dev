import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { readJsonWithLimit } from "@/lib/requestLimits";

export const runtime = "nodejs";

const SPONSORS_PATH = path.join(process.cwd(), "data", "sponsors.json");
const MAX_BODY_BYTES = 16_000;

type SponsorTier = {
  name: string;
  price: number;
  perks: string[];
  sponsorCount: number;
};

type CurrentSponsor = {
  name: string;
  tier: string;
  amount: number;
  since: string;
  message?: string;
};

type SponsorshipPledge = {
  id: string;
  name: string;
  email: string;
  tier: string;
  amount: number;
  message?: string;
  submittedAt: string;
};

type SponsorsFile = {
  tiers: SponsorTier[];
  currentSponsors: CurrentSponsor[];
  pledges: SponsorshipPledge[];
};

type PledgePayload = {
  name?: string;
  email?: string;
  tier?: string;
  amount?: number;
  message?: string;
};

async function readSponsorsData(): Promise<SponsorsFile> {
  try {
    const raw = await fs.readFile(SPONSORS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { tiers: [], currentSponsors: [], pledges: [] };
    }

    const data = parsed as Partial<SponsorsFile>;

    return {
      tiers: Array.isArray(data.tiers) ? data.tiers : [],
      currentSponsors: Array.isArray(data.currentSponsors) ? data.currentSponsors : [],
      pledges: Array.isArray(data.pledges) ? data.pledges : [],
    };
  } catch {
    return { tiers: [], currentSponsors: [], pledges: [] };
  }
}

async function writeSponsorsData(data: SponsorsFile): Promise<void> {
  await fs.writeFile(SPONSORS_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

function normalizePledge(payload: PledgePayload) {
  return {
    name: payload.name?.trim() ?? "",
    email: payload.email?.trim().toLowerCase() ?? "",
    tier: payload.tier?.trim().toLowerCase() ?? "",
    amount: typeof payload.amount === "number" ? payload.amount : Number(payload.amount),
    message: payload.message?.trim() ?? "",
  };
}

function validatePledge(
  payload: ReturnType<typeof normalizePledge>,
  tiers: SponsorTier[]
): string[] {
  const errors: string[] = [];

  if (!payload.name) {
    errors.push("name is required");
  }

  if (!payload.email) {
    errors.push("email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.push("email must be valid");
  }

  const matchingTier = tiers.find((tier) => tier.name.toLowerCase() === payload.tier);
  if (!matchingTier) {
    errors.push("tier must be one of the available sponsor tiers");
  }

  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    errors.push("amount must be a positive number");
  } else if (matchingTier && payload.amount < matchingTier.price) {
    errors.push(`amount must be at least ${matchingTier.price} for the selected tier`);
  }

  return errors;
}

export async function GET() {
  const data = await readSponsorsData();

  return NextResponse.json(
    {
      tiers: data.tiers,
      currentSponsors: data.currentSponsors,
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
    const body = await readJsonWithLimit<PledgePayload & Record<string, unknown>>(
      request,
      MAX_BODY_BYTES
    );
    const data = await readSponsorsData();
    const payload = normalizePledge(body);
    const errors = validatePledge(payload, data.tiers);

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const pledge: SponsorshipPledge = {
      id: `sp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: payload.name,
      email: payload.email,
      tier: payload.tier,
      amount: payload.amount,
      message: payload.message || undefined,
      submittedAt: new Date().toISOString(),
    };

    data.pledges.push(pledge);
    await writeSponsorsData(data);

    return NextResponse.json(
      {
        success: true,
        message: "Thanks for your pledge! We'll reach out shortly.",
        pledge: {
          id: pledge.id,
          tier: pledge.tier,
          amount: pledge.amount,
          submittedAt: pledge.submittedAt,
        },
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
