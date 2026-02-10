import { NextRequest, NextResponse } from "next/server";
import { getMcpServers } from "@/lib/data";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category")?.trim().toLowerCase();
  const search = searchParams.get("search")?.trim().toLowerCase();

  let servers = getMcpServers();

  if (category) {
    servers = servers.filter((server) => server.category.toLowerCase() === category);
  }

  if (search) {
    servers = servers.filter((server) => {
      const haystack = `${server.name} ${server.description}`.toLowerCase();
      return haystack.includes(search);
    });
  }

  return NextResponse.json(
    {
      servers,
      total: servers.length,
    },
    {
      headers: { "Cache-Control": "public, max-age=300" },
    }
  );
}
