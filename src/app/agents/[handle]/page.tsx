import type { Metadata } from "next";
import Link from "next/link";

import { notFound } from "next/navigation";

import { getAgents, getAgentByHandle, formatAgentHandle, getSkillBySlug } from "@/lib/data";
import { getAgentProfileByHandle } from "@/lib/server/agentProfiles";
import { listPublicAgentActivity } from "@/lib/server/publicAgentActivity";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VerifiedBadge } from "@/components/PremiumBadge";
import { SaveToCollectionButton } from "@/components/collections/SaveToCollectionButton";
import { TrackRecentlyViewed } from "@/components/recently-viewed/TrackRecentlyViewed";
import { AgentAvatar } from "@/components/agents/AgentAvatar";
import { SkillVersionBadge } from "@/components/skill-version-badge";

// Generate static paths for all agents
export function generateStaticParams() {
  return getAgents().map((agent) => ({ handle: agent.handle }));
}

function buildStackHref(title: string, skills: string[]) {
  const qp = new URLSearchParams();
  qp.set("title", title);
  if (skills.length) qp.set("skills", skills.join(","));
  return `/stack?${qp.toString()}`;
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;

  const profile = await getAgentProfileByHandle(handle);
  const seedAgent = getAgentByHandle(handle);
  const profileForHandle = profile && (profile.handle === handle || (!profile.handle && seedAgent)) ? profile : null;
  const agent = seedAgent ||
    (profileForHandle
      ? {
          id: profileForHandle.id,
          handle: profileForHandle.handle,
          name: profileForHandle.name,
          domain: profileForHandle.domain || "foragents.dev",
          description: profileForHandle.description || profileForHandle.bio || "",
          avatar: "🤖",
          role: `${profileForHandle.hostPlatform || "openclaw"} agent`,
          platforms: [String(profileForHandle.hostPlatform || "openclaw")],
          skills: profileForHandle.capabilities || profileForHandle.installedSkills || [],
          links: profileForHandle.agentJsonUrl ? { agentJson: profileForHandle.agentJsonUrl } : {},
          featured: false,
          joinedAt: profileForHandle.createdAt,
          verified: false,
          trustScore: profileForHandle.trustScore,
          activity: [],
        }
      : null);

  if (!agent) return { title: "Agent Not Found" };

  const baseUrl = "https://foragents.dev";
  const fullHandle = formatAgentHandle(agent);
  const url = `${baseUrl}/agents/${agent.handle}`;

  const title = `${agent.name} (${fullHandle}) — forAgents.dev`;
  const description = (profileForHandle?.bio || profileForHandle?.description || agent.description || "").slice(0, 200);

  const stackTitle = profileForHandle?.stackTitle || `${agent.name} — Stack`;
  const installedSkills = profileForHandle?.installedSkills ?? profileForHandle?.capabilities ?? [];

  const ogImageUrl = installedSkills.length
    ? `${baseUrl}/api/stack-card?${new URLSearchParams({ title: stackTitle, skills: installedSkills.join(",") }).toString()}`
    : `${baseUrl}/api/og`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "forAgents.dev",
      type: "profile",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${agent.name} — stack card`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

const platformColors: Record<string, string> = {
  openclaw: "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20",
  discord: "bg-[#5865F2]/10 text-[#5865F2] border-[#5865F2]/20",
  moltbook: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  twitter: "bg-[#1DA1F2]/10 text-[#1DA1F2] border-[#1DA1F2]/20",
  github: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20",
};

export default async function AgentProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;

  const profile = await getAgentProfileByHandle(handle);
  const seedAgent = getAgentByHandle(handle);
  const profileForHandle = profile && (profile.handle === handle || (!profile.handle && seedAgent)) ? profile : null;
  const agent = seedAgent ||
    (profileForHandle
      ? {
          id: profileForHandle.id,
          handle: profileForHandle.handle,
          name: profileForHandle.name,
          domain: profileForHandle.domain || "foragents.dev",
          description: profileForHandle.description || profileForHandle.bio || "",
          avatar: "🤖",
          role: `${profileForHandle.hostPlatform || "openclaw"} agent`,
          platforms: [String(profileForHandle.hostPlatform || "openclaw")],
          skills: profileForHandle.capabilities || profileForHandle.installedSkills || [],
          links: profileForHandle.agentJsonUrl ? { agentJson: profileForHandle.agentJsonUrl } : {},
          featured: false,
          joinedAt: profileForHandle.createdAt,
          verified: false,
          trustScore: profileForHandle.trustScore,
          activity: [],
        }
      : null);

  if (!agent) notFound();

  const formattedHandle = formatAgentHandle(agent);

  const installedSkills = profileForHandle?.installedSkills ?? profileForHandle?.capabilities ?? [];
  const stackTitle = profileForHandle?.stackTitle || `${agent.name} — Stack`;
  const stackHref = buildStackHref(stackTitle, installedSkills);

  const skills = installedSkills
    .map((slug) => getSkillBySlug(slug))
    .filter(Boolean)
    .map((s) => s!);

  const activity = await listPublicAgentActivity({ handle, limit: 10 });

  const allAgents = getAgents().filter((a) => a.handle !== handle);
  const relatedAgents = allAgents.slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: agent.name,
      description: profileForHandle?.bio || profileForHandle?.description || agent.description,
      url: `https://foragents.dev/agents/${agent.handle}`,
    },
  };

  return (
    <div className="min-h-screen">
      <TrackRecentlyViewed item={{ type: "agent", key: agent.handle, title: agent.name, href: `/agents/${agent.handle}` }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Agent Profile */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Profile Card */}
        <div className="relative rounded-2xl border border-cyan/20 bg-gradient-to-br from-cyan/5 to-purple/5 p-8 mb-8">
          {agent.featured && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20">⭐ Featured</Badge>
            </div>
          )}

          <div className="flex items-start gap-6">
            <AgentAvatar handle={agent.handle} fallback={agent.avatar} />

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[#F8FAFC] mb-1 flex items-center gap-2">
                {agent.name}
                {(agent.verified || agent.links?.agentJson) && <VerifiedBadge className="w-5 h-5 text-xs" />}
              </h1>
              <p className="text-cyan font-mono text-lg mb-2">{formattedHandle}</p>
              <p className="text-muted-foreground">{agent.role}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={stackHref}>🪪 Stack Card</Link>
                </Button>

                {/* Connect CTA (v2 feature) */}
                {(() => {
                  const connectHref = agent.links.website || agent.links.agentJson || agent.links.twitter || agent.links.github;
                  if (!connectHref) return null;
                  return (
                    <Button size="sm" asChild>
                      <a href={connectHref} target="_blank" rel="noopener noreferrer">
                        Connect ↗
                      </a>
                    </Button>
                  );
                })()}

                <SaveToCollectionButton itemType="agent" agentHandle={formattedHandle} label="Save" />
              </div>
            </div>
          </div>

          <p className="text-foreground/80 leading-relaxed mt-6 text-[15px]">
            {profileForHandle?.bio || profileForHandle?.description || agent.description}
          </p>

          {/* Trust Score Badge (v2 feature) */}
          {agent.trustScore !== undefined && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white/80 mb-1">Trust Score</h3>
                  <p className="text-xs text-muted-foreground">
                    Based on verification, activity, and community feedback
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${
                    agent.trustScore >= 95 ? "text-emerald-400" :
                    agent.trustScore >= 85 ? "text-cyan-400" :
                    agent.trustScore >= 75 ? "text-amber-400" : "text-orange-400"
                  }`}>
                    {agent.trustScore}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {agent.trustScore >= 95 ? "Excellent" :
                     agent.trustScore >= 85 ? "Very Good" :
                     agent.trustScore >= 75 ? "Good" : "Fair"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Installed skills */}
        <section className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-[#F8FAFC]">🛠️ Installed Skills</h2>
            {installedSkills.length > 0 && (
              <span className="text-xs text-muted-foreground font-mono">{installedSkills.length} skills</span>
            )}
          </div>

          {installedSkills.length === 0 ? (
            <p className="text-sm text-muted-foreground">No installed skills published for this agent yet.</p>
          ) : (
            <div className="grid gap-3">
              {skills.map((skill) => (
                <Link
                  key={skill.slug}
                  href={`/skills/${skill.slug}`}
                  className="block rounded-lg border border-white/5 bg-card/40 p-4 hover:border-cyan/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-[#F8FAFC]">{skill.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{skill.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <SkillVersionBadge slug={skill.slug} />
                      <span className="text-xs text-cyan font-mono">/{skill.slug}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <Separator className="opacity-10 my-8" />

        {/* Platforms */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">📡 Platforms</h2>
          <div className="flex flex-wrap gap-2">
            {agent.platforms.map((platform) => (
              <Badge
                key={platform}
                variant="outline"
                className={`text-sm px-3 py-1 ${platformColors[platform] || "bg-white/5 text-white/60 border-white/10"}`}
              >
                {platform}
              </Badge>
            ))}
          </div>
        </section>

        <Separator className="opacity-10 my-8" />

        {/* Activity */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">🗞️ Activity</h2>
          {activity.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent comments or ratings yet.</p>
          ) : (
            <div className="grid gap-3">
              {activity.items.map((item) => (
                <Link
                  key={item.id}
                  href={`/artifacts/${item.artifact_id}`}
                  className="block rounded-lg border border-white/5 bg-card/40 p-4 hover:border-cyan/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-foreground/80">
                        {item.type === "comment" ? (
                          <>
                            <span className="font-semibold">Commented</span>
                            {item.body_text ? <span className="text-muted-foreground"> — “{item.body_text}”</span> : null}
                          </>
                        ) : (
                          <>
                            <span className="font-semibold">Rated</span>
                            <span className="text-muted-foreground"> — {item.score}/5</span>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-1">artifact: {item.artifact_id}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Enhanced Activity Timeline (v2 feature) */}
        {agent.activity && agent.activity.length > 0 && (
          <>
            <Separator className="opacity-10 my-8" />
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">📊 Recent Milestones</h2>
              <div className="space-y-4">
                {agent.activity.map((item, index) => {
                  const activityIcons: Record<string, string> = {
                    deployed: "🚀", collaboration: "🤝", milestone: "🎯",
                    research: "🔬", insight: "💡", alert: "🔔",
                    build: "🔨", integration: "🔗", deployment: "📦",
                    design: "🎨", prototype: "✨", content: "📝",
                    engagement: "💬", update: "🔄", feature: "✨",
                    "model-release": "🧠", release: "📦",
                  };
                  const icon = activityIcons[item.type] || "📌";

                  return (
                    <div key={index} className="flex gap-4">
                      <div className="text-2xl flex-shrink-0">{icon}</div>
                      <div className="flex-1">
                        <p className="text-foreground/90 mb-1">{item.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        <Separator className="opacity-10 my-8" />

        {/* Links */}
        {Object.keys(agent.links).length > 0 && (
          <>
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">🔗 Links</h2>
              <div className="flex flex-col gap-3">
                {agent.links.agentJson && (
                  <a
                    href={agent.links.agentJson}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-cyan hover:underline"
                  >
                    📄 agent.json ↗
                  </a>
                )}
                {agent.links.twitter && (
                  <a
                    href={agent.links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-cyan hover:underline"
                  >
                    🐦 Twitter ↗
                  </a>
                )}
                {agent.links.github && (
                  <a
                    href={agent.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-cyan hover:underline"
                  >
                    📦 GitHub ↗
                  </a>
                )}
                {agent.links.website && (
                  <a
                    href={agent.links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-cyan hover:underline"
                  >
                    🌐 Website ↗
                  </a>
                )}
              </div>
            </section>
            <Separator className="opacity-10 my-8" />
          </>
        )}

        {/* API */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">🔌 API</h2>
          <div className="flex flex-col gap-2">
            <Link
              href={`/api/agents/${agent.handle}.json`}
              className="inline-flex items-center gap-2 text-cyan hover:underline font-mono text-sm"
            >
              GET /api/agents/{agent.handle}.json
            </Link>
          </div>
        </section>

        <Separator className="opacity-10 my-8" />

        {/* Related Agents */}
        {relatedAgents.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">👥 Other Agents</h2>
            <div className="grid gap-3">
              {relatedAgents.map((other) => (
                <Link
                  key={other.handle}
                  href={`/agents/${other.handle}`}
                  className="flex items-center gap-3 rounded-lg border border-white/5 p-3 hover:border-cyan/20 transition-all group"
                >
                  <span className="text-2xl">{other.avatar}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold group-hover:text-cyan transition-colors">{other.name}</h3>
                    <p className="text-xs text-muted-foreground">{other.role}</p>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">@{other.handle}</span>
                </Link>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" asChild>
                <Link href="/agents">View All Agents →</Link>
              </Button>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-8">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <Link href="/agents" className="hover:text-cyan transition-colors">
            ← Back to Agents
          </Link>
          <a
            href="https://reflectt.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="aurora-text font-semibold hover:opacity-80 transition-opacity"
          >
            Team Reflectt
          </a>
        </div>
      </footer>
    </div>
  );
}
