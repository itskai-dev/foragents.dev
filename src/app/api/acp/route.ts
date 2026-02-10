import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import protocols from "@/data/acp-protocols.json";

type AcpStatus = "stable" | "beta" | "draft" | "deprecated";
type AcpCategory = "messaging" | "discovery" | "auth" | "data";

type AcpProtocol = {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  status: AcpStatus;
  category: AcpCategory;
  specUrl: string;
  adoptionCount: number;
  lastUpdated: string;
};

const ACP_PROTOCOLS_PATH = path.join(process.cwd(), "data", "acp-protocols.json");

const validStatuses: AcpStatus[] = ["stable", "beta", "draft", "deprecated"];
const validCategories: AcpCategory[] = ["messaging", "discovery", "auth", "data"];

function isAcpStatus(value: string): value is AcpStatus {
  return validStatuses.includes(value as AcpStatus);
}

function isAcpCategory(value: string): value is AcpCategory {
  return validCategories.includes(value as AcpCategory);
}

async function readProtocolsFromDisk(): Promise<AcpProtocol[]> {
  try {
    const raw = await fs.readFile(ACP_PROTOCOLS_PATH, "utf-8");
    return JSON.parse(raw) as AcpProtocol[];
  } catch {
    return protocols as AcpProtocol[];
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status")?.trim().toLowerCase();
  const category = searchParams.get("category")?.trim().toLowerCase();
  const search = searchParams.get("search")?.trim().toLowerCase();
  const sort = searchParams.get("sort")?.trim().toLowerCase();

  let items = await readProtocolsFromDisk();

  if (status && isAcpStatus(status)) {
    items = items.filter((item) => item.status === status);
  }

  if (category && isAcpCategory(category)) {
    items = items.filter((item) => item.category === category);
  }

  if (search) {
    items = items.filter((item) => {
      const haystack = `${item.name} ${item.description} ${item.category} ${item.status}`.toLowerCase();
      return haystack.includes(search);
    });
  }

  const sorted = [...items].sort((a, b) => {
    if (sort === "adoption_asc") {
      return a.adoptionCount - b.adoptionCount;
    }
    return b.adoptionCount - a.adoptionCount;
  });

  return NextResponse.json(
    {
      protocols: sorted,
      total: sorted.length,
      filters: {
        status: status && isAcpStatus(status) ? status : null,
        category: category && isAcpCategory(category) ? category : null,
        search: search || null,
      },
      sort: sort === "adoption_asc" ? "adoption_asc" : "adoption_desc",
    },
    {
      headers: { "Cache-Control": "public, max-age=300" },
    }
  );
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Partial<AcpProtocol> | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const requiredFields: Array<keyof AcpProtocol> = [
    "id",
    "name",
    "slug",
    "description",
    "version",
    "status",
    "category",
    "specUrl",
    "adoptionCount",
    "lastUpdated",
  ];

  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      );
    }
  }

  if (typeof body.status !== "string" || !isAcpStatus(body.status)) {
    return NextResponse.json(
      { error: `Invalid status. Expected one of: ${validStatuses.join(", ")}` },
      { status: 400 }
    );
  }

  if (typeof body.category !== "string" || !isAcpCategory(body.category)) {
    return NextResponse.json(
      { error: `Invalid category. Expected one of: ${validCategories.join(", ")}` },
      { status: 400 }
    );
  }

  if (typeof body.adoptionCount !== "number" || Number.isNaN(body.adoptionCount)) {
    return NextResponse.json({ error: "adoptionCount must be a number" }, { status: 400 });
  }

  const items = await readProtocolsFromDisk();

  if (items.some((item) => item.slug === body.slug)) {
    return NextResponse.json({ error: "Protocol slug already exists" }, { status: 409 });
  }

  const nextProtocol: AcpProtocol = {
    id: String(body.id),
    name: String(body.name),
    slug: String(body.slug),
    description: String(body.description),
    version: String(body.version),
    status: body.status,
    category: body.category,
    specUrl: String(body.specUrl),
    adoptionCount: body.adoptionCount,
    lastUpdated: String(body.lastUpdated),
  };

  const updated = [...items, nextProtocol];
  await fs.writeFile(ACP_PROTOCOLS_PATH, `${JSON.stringify(updated, null, 2)}\n`, "utf-8");

  return NextResponse.json(
    {
      message: "Protocol submitted",
      protocol: nextProtocol,
      total: updated.length,
    },
    { status: 201 }
  );
}
