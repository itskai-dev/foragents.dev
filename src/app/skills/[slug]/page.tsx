import { notFound } from "next/navigation";
import { getSkills, getSkillBySlug } from "@/lib/data";
import { getSkillTrendingMap } from "@/lib/server/trendingSkills";
import { SkillTrendingBadge } from "@/components/skill-trending-badge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NextBestActionPanel } from "@/components/next-best-action-panel";
import { SkillShareActions } from "@/components/skill-share-actions";
import { RelatedKits } from "@/components/related-kits";
import { CompatibilityMatrix } from "@/components/compatibility-matrix";
import { buildSkillIssueBodyTemplate } from "@/lib/reportIssue";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { InstallCount } from "@/components/InstallCount";
import { SkillPageClient } from "@/components/skill-page-client";
import { getCollectionsForSkill } from "@/lib/skillCollections";
import { RunInReflecttButton } from "@/components/RunInReflecttButton";
import Link from "next/link";

// Generate static paths for all skills
export function generateStaticParams() {
  return getSkills().map((skill) => ({ slug: skill.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const skill = getSkillBySlug(params.slug);
  if (!skill) return { title: "Skill Not Found" };
  
  const ogImageUrl = `https://foragents.dev/api/og/skill/${skill.slug}`;
  
  return {
    title: `${skill.name} — forAgents.dev`,
    description: skill.description,
    openGraph: {
      title: `${skill.name} — forAgents.dev`,
      description: skill.description,
      url: `https://foragents.dev/skills/${skill.slug}`,
      siteName: "forAgents.dev",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${skill.name} - ${skill.description}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${skill.name} — forAgents.dev`,
      description: skill.description,
      images: [ogImageUrl],
    },
  };
}

export default async function SkillPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const allSkillsList = getSkills();

  const skill = getSkillBySlug(slug);
  if (!skill) notFound();

  const inCollections = await getCollectionsForSkill(skill.slug);

  const allSkills = allSkillsList.filter((s) => s.slug !== slug);

  const trendingMap = await getSkillTrendingMap(allSkillsList);
  const trendingBadge = trendingMap[slug]?.trendingBadge ?? null;

  const issueBody = buildSkillIssueBodyTemplate({
    skillName: skill.name,
    skillSlug: skill.slug,
    skillRepoUrl: skill.repo_url,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": skill.name,
    "description": skill.description,
    "applicationCategory": "DeveloperApplication",
    "author": {
      "@type": "Person",
      "name": skill.author
    },
    "keywords": skill.tags.join(", "),
    "url": `https://foragents.dev/skills/${skill.slug}`,
    "codeRepository": skill.repo_url,
    "installUrl": skill.repo_url,
    "softwareHelp": {
      "@type": "CreativeWork",
      "url": skill.repo_url
    }
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Skill Detail */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Title area */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F8FAFC] mb-2">
            🧰 {skill.name}
          </h1>
          <div className="flex items-center gap-3 text-muted-foreground flex-wrap">
            <p>
              by <span className="text-foreground">{skill.author}</span>
            </p>
            <span className="text-white/20">•</span>
            <InstallCount 
              skillSlug={skill.slug} 
              className="text-sm text-cyan"
            />
            {inCollections.length > 0 ? (
              <>
                <span className="text-white/20">•</span>
                <Link
                  href={`/collections?skill=${encodeURIComponent(skill.slug)}`}
                  className="text-sm text-cyan hover:underline"
                >
                  View collections
                </Link>
              </>
            ) : null}
          </div>
        </div>

        {/* Compatibility Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {trendingBadge && <SkillTrendingBadge badge={trendingBadge} />}
          {skill.author === "Team Reflectt" && (
            <Badge className="bg-gradient-to-r from-cyan to-electric-blue text-white border-0 font-semibold">
              ✓ Verified
            </Badge>
          )}
          <Badge className="bg-purple/20 text-purple border border-purple/30 font-semibold">
            ⚡ OpenClaw Compatible
          </Badge>
          {skill.tags.includes("openclaw") && (
            <Badge className="bg-cyan/20 text-cyan border border-cyan/30">
              🖥️ Multi-Platform
            </Badge>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {skill.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs bg-white/5 text-white/60 border-white/10"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Share / copy */}
        <section className="mb-8">
          <SkillShareActions skillName={skill.name} slug={skill.slug} />
        </section>

        {/* Description */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#F8FAFC] mb-3">Description</h2>
          <p className="text-foreground/80 leading-relaxed text-[15px]">
            {skill.description}
          </p>
        </section>

        {inCollections.length > 0 ? (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-[#F8FAFC] mb-3">Collections</h2>
            <p className="text-sm text-muted-foreground mb-3">
              This skill appears in:
            </p>
            <div className="flex flex-wrap gap-2">
              {inCollections.map((c) => (
                <Link key={c.slug} href={`/collections/${c.slug}`}>
                  <Badge className="bg-cyan/10 text-cyan border border-cyan/20 hover:bg-cyan/15">
                    {c.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* Next Best Action */}
        <section className="mb-8">
          <NextBestActionPanel
            installCmd={skill.install_cmd}
            repoUrl={skill.repo_url}
            issueTitle={`forAgents.dev: ${skill.name} (${skill.slug})`}
            issueBody={issueBody}
            skillSlug={skill.slug}
          />
        </section>

        <Separator className="opacity-10 my-8" />

        {/* Install */}
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <h2 className="text-lg font-semibold text-[#F8FAFC]">Install</h2>
            <RunInReflecttButton skillSlug={skill.slug} name={skill.name} size="sm" />
          </div>
          <div className="relative group">
            <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto">
              <code className="text-sm text-green font-mono">
                {skill.install_cmd}
              </code>
            </pre>
          </div>
        </section>

        <Separator className="opacity-10 my-8" />

        {/* Links */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#F8FAFC] mb-3">Links</h2>
          <div className="flex flex-col gap-2">
            <a
              href={skill.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-cyan hover:underline"
            >
              📦 GitHub Repository ↗
            </a>
            <Link
              href={`/api/skill/${skill.slug}`}
              className="inline-flex items-center gap-2 text-cyan hover:underline font-mono text-sm"
            >
              📄 GET /api/skill/{skill.slug}
            </Link>
          </div>
        </section>

        <Separator className="opacity-10 my-8" />

        {/* Related Kits */}
        <RelatedKits currentSkill={skill} allSkills={allSkills} maxResults={5} />

        <Separator className="opacity-10 my-8" />

        {/* Compatibility */}
        <CompatibilityMatrix skillSlug={skill.slug} />

        <Separator className="opacity-10 my-8" />

        {/* Recently Viewed */}
        <SkillPageClient slug={skill.slug} name={skill.name} />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-8">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <Link href="/" className="hover:text-cyan transition-colors">
            ← Back to Agent Hub
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
