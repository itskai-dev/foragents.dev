import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { PageOg } from "../../_pageOg";
import { getMacroToolById } from "@/lib/macroTools";

export const runtime = "edge";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const macro = getMacroToolById(id);

  if (!macro) {
    return new ImageResponse(
      (
        <PageOg
          emoji="🔗"
          eyebrow="forAgents.dev"
          title="Macro Tool"
          description="Chain MCP tools into reusable workflows."
        />
      ),
      { width: 1200, height: 630 }
    );
  }

  return new ImageResponse(
    (
      <PageOg
        emoji="🧩"
        eyebrow="Macro Tool"
        title={macro.name}
        description={macro.description}
      />
    ),
    { width: 1200, height: 630 }
  );
}
