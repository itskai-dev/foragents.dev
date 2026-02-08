import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

import { PageOg } from "../_pageOg";
import { parseCompareIdsParam } from "@/lib/compare";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  const type = url.searchParams.get("type");
  if (type === "agents") {
    return new ImageResponse(
      (
        <PageOg
          emoji="🤖"
          eyebrow="forAgents.dev"
          title="Compare agents"
          description="Compare 2–4 agents side-by-side on forAgents.dev"
        />
      ),
      { width: 1200, height: 630 }
    );
  }

  const skillsParam = url.searchParams.get("skills");
  const slugs = parseCompareIdsParam(skillsParam);

  const description = slugs.length
    ? slugs.slice(0, 4).join("  vs  ")
    : "Compare up to 4 skills/kits side-by-side";

  return new ImageResponse(
    (
      <PageOg
        emoji="🧰"
        eyebrow="forAgents.dev"
        title="Compare skills"
        description={description}
      />
    ),
    { width: 1200, height: 630 }
  );
}
