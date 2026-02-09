import type { MetadataRoute } from "next";
import { getAgents, getSkills, getCreators } from "@/lib/data";
import { getArtifacts } from "@/lib/artifacts";
import { getSupabase } from "@/lib/supabase";
import newsData from "@/data/news.json";

type NewsItem = {
  id: string;
  published_at: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://foragents.dev";
  const now = new Date();

  // Key landing pages
  const staticPages: MetadataRoute.Sitemap = [
    // Homepage
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    
    // Key pages - daily updates
    { url: `${baseUrl}/trending`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/agents`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/creators`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/artifacts`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/skills`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/search`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/get-started`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/getting-started`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    
    // Frequently updated pages
    { url: `${baseUrl}/requests`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/news`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/stats`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/mcp`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/acp`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/llms-txt`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    
    // Content pages - weekly updates
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/digest`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/changelog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/resources`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/updates`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/releases`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/whats-new`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/learn`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/glossary`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/use-cases`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/showcase`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/testimonials`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/events`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/demos`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    
    // Feature pages
    { url: `${baseUrl}/collections`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/compare`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/bookmarks`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/settings`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/playground`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/integrations`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/feeds`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/status`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/badges`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/submit`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/subscribe`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    
    // Static pages - monthly updates
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/accessibility`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/security`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/support`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/brand`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/press`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/careers`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/enterprise`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/community`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/open-source`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/governance`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/credits`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/newsletter`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/history`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/roadmap`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/verify`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/sitemap-visual`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/migrate`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Dynamic agent pages
  const agents = getAgents();
  const agentPages: MetadataRoute.Sitemap = agents.map((agent) => ({
    url: `${baseUrl}/agents/${agent.handle}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic skill pages
  const skills = getSkills();
  const skillPages: MetadataRoute.Sitemap = skills.map((skill) => ({
    url: `${baseUrl}/skills/${skill.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic creator pages
  const creators = getCreators();
  const creatorPages: MetadataRoute.Sitemap = creators.map((creator) => ({
    url: `${baseUrl}/creators/${creator.username}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic artifact pages (best-effort pagination through latest artifacts)
  const artifactPages: MetadataRoute.Sitemap = [];
  try {
    let before: string | null = null;
    let safety = 0;

    // Keep this bounded so /sitemap.xml remains fast even with a huge DB.
    while (safety < 50) {
      safety += 1;
      const batch = await getArtifacts({ limit: 100, before });
      if (batch.length === 0) break;

      for (const a of batch) {
        artifactPages.push({
          url: `${baseUrl}/artifacts/${a.id}`,
          lastModified: new Date(a.created_at),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        });
      }

      before = batch[batch.length - 1]?.created_at ?? null;
      if (!before) break;
      if (artifactPages.length >= 5000) break;
    }
  } catch {
    // ignore sitemap artifact failures (keep core pages indexable)
  }

  // Dynamic news pages
  const newsItems = newsData as NewsItem[];
  const newsPages: MetadataRoute.Sitemap = newsItems.slice(0, 100).map((item) => ({
    url: `${baseUrl}/news/${item.id}`,
    lastModified: new Date(item.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Dynamic collection pages (from database)
  const collectionPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data: collections } = await supabase
        .from("collections")
        .select("slug, updated_at")
        .eq("visibility", "public")
        .limit(1000);

      if (collections) {
        for (const col of collections) {
          collectionPages.push({
            url: `${baseUrl}/c/${col.slug}`,
            lastModified: new Date(col.updated_at),
            changeFrequency: "weekly" as const,
            priority: 0.6,
          });
        }
      }
    }
  } catch {
    // ignore collection fetch failures (keep core pages indexable)
  }

  return [
    ...staticPages,
    ...agentPages,
    ...skillPages,
    ...creatorPages,
    ...artifactPages,
    ...newsPages,
    ...collectionPages,
  ];
}
