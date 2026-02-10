import { NextRequest, NextResponse } from "next/server";
import {
  brandKitTypes,
  createBrandKitEntry,
  isBrandKitType,
  queryBrandKit,
  type BrandKitType,
} from "@/lib/brandKit";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const typeParam = request.nextUrl.searchParams.get("type");
    const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";

    if (typeParam && !isBrandKitType(typeParam)) {
      return NextResponse.json(
        { error: `Invalid type. Use one of: ${brandKitTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const items = await queryBrandKit({
      type: (typeParam as BrandKitType | null) ?? undefined,
      search: search || undefined,
    });

    return NextResponse.json({
      items,
      filters: {
        type: typeParam ?? null,
        search,
        availableTypes: brandKitTypes,
      },
      total: items.length,
    });
  } catch (error) {
    console.error("Failed to load brand kit", error);
    return NextResponse.json({ error: "Failed to load brand kit" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<{
      id: string;
      name: string;
      type: BrandKitType;
      description: string;
      url: string;
      format: string;
    }>;

    if (!body.name || !body.type || !body.description || !body.url || !body.format) {
      return NextResponse.json(
        { error: "name, type, description, url, and format are required" },
        { status: 400 }
      );
    }

    if (!isBrandKitType(body.type)) {
      return NextResponse.json(
        { error: `Invalid type. Use one of: ${brandKitTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const created = await createBrandKitEntry({
      id: body.id,
      name: body.name,
      type: body.type,
      description: body.description,
      url: body.url,
      format: body.format,
    });

    return NextResponse.json({ ok: true, item: created }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create brand kit item";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
