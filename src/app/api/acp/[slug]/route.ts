import { NextResponse } from "next/server";
import protocols from "@/data/acp-protocols.json";

type AcpProtocol = {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  status: "stable" | "beta" | "draft" | "deprecated";
  category: "messaging" | "discovery" | "auth" | "data";
  specUrl: string;
  adoptionCount: number;
  lastUpdated: string;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  const protocol = (protocols as AcpProtocol[]).find((item) => item.slug === slug);

  if (!protocol) {
    return NextResponse.json({ error: "Protocol not found" }, { status: 404 });
  }

  return NextResponse.json({ protocol }, {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}
