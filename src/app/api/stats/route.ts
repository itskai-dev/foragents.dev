import { NextResponse } from "next/server";
import { getSkills, getMcpServers } from "@/lib/data";
import { getAllReviews } from "@/lib/reviews";

export async function GET() {
  const skills = getSkills();
  const mcpServers = getMcpServers();

  const categorySet = new Set<string>();
  for (const skill of skills) {
    for (const tag of skill.tags) {
      categorySet.add(tag.toLowerCase());
    }
  }
  for (const server of mcpServers) {
    categorySet.add(server.category.toLowerCase());
  }

  const reviews = await getAllReviews();

  return NextResponse.json(
    {
      skills: skills.length,
      mcp_servers: mcpServers.length,
      categories: categorySet.size,
      reviews: reviews.length,
    },
    {
      headers: { "Cache-Control": "public, max-age=300" },
    }
  );
}
