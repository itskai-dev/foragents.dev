import { ImageResponse } from "next/og";
import { PageOg } from "../../_pageOg";
import { getBountyById } from "@/lib/bounties";

export const runtime = "edge";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bounty = getBountyById(id);

  const title = bounty?.title ?? "Bounty";
  const description =
    bounty?.description ??
    "Fund-a-Kit bounties: sponsor kits, integrations, and agent tooling.";

  return new ImageResponse(
    (
      <PageOg
        emoji="🎯"
        eyebrow={bounty ? `Bounty · ${bounty.id}` : "Bounties"}
        title={title}
        description={description}
      />
    ),
    { width: 1200, height: 630 }
  );
}
