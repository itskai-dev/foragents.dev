import { NextResponse } from "next/server";
import { getMcpServers } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const servers = getMcpServers(category);

  return NextResponse.json(servers, {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}
