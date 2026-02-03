import { NextResponse } from 'next/server';
import { getNews, getSkills, getMcpServers, getAgents, getAcpAgents, getLlmsTxtEntries } from '@/lib/data';

export async function GET() {
  const news = getNews();
  const skills = getSkills();
  const mcp = getMcpServers();
  const agents = getAgents();
  const acp = getAcpAgents();
  const llmstxt = getLlmsTxtEntries();

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    data: {
      news: news.length,
      skills: skills.length,
      mcp: mcp.length,
      agents: agents.length,
      acp: acp.length,
      llmstxt: llmstxt.length,
      total: news.length + skills.length + mcp.length + agents.length + acp.length + llmstxt.length
    }
  });
}
