import { NextResponse } from "next/server";
import { getSkills, getMcpServers } from "@/lib/data";

function formatUptime(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));

  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(" ");
}

export async function GET() {
  const skills = getSkills();
  const mcpServers = getMcpServers();

  return NextResponse.json(
    {
      status: "ok",
      version: "1.0.0",
      skills_count: skills.length,
      mcp_count: mcpServers.length,
      uptime: formatUptime(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
