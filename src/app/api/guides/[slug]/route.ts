import { NextRequest, NextResponse } from "next/server";

import { readGuides, writeGuides } from "@/lib/guides";

interface GuideSlugRouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, context: GuideSlugRouteContext) {
  const { slug } = await context.params;

  const guides = await readGuides();
  const guide = guides.find((item) => item.slug === slug);

  if (!guide) {
    return NextResponse.json({ error: "Guide not found" }, { status: 404 });
  }

  return NextResponse.json({ guide }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(_request: NextRequest, context: GuideSlugRouteContext) {
  const { slug } = await context.params;

  const guides = await readGuides();
  const index = guides.findIndex((item) => item.slug === slug);

  if (index === -1) {
    return NextResponse.json({ error: "Guide not found" }, { status: 404 });
  }

  const updatedGuide = {
    ...guides[index],
    readCount: guides[index].readCount + 1,
  };

  guides[index] = updatedGuide;
  await writeGuides(guides);

  return NextResponse.json({
    guide: updatedGuide,
    message: "Read tracked",
  });
}
