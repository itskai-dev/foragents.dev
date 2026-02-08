import { notFound } from "next/navigation";
import { getSkills, getSkillBySlug } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NextBestActionPanel } from "@/components/next-best-action-panel";
import { SkillShareActions } from "@/components/skill-share-actions";
import { RelatedKits } from "@/components/related-kits";
import { buildSkillIssueBodyTemplate } from "@/lib/reportIssue";
import Link from "next/link";

// Generate static paths for all skills
export function generateStaticParams() {
  return getSkills().map((skill) => ({ slug: skill.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const skill = getSkillBySlug(params.slug);
  if (!skill) return { title: "Skill Not Found" };
  return {
    title: `${skill.name} — forAgents.dev`,
    description: skill.description,
  };
}

export default async function SkillPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) notFound();

  const allSkills = getSkills().filter((s) => s.slug !== slug);

  const issueBody = buildSkillIssueBodyTemplate({
    skillName: skill.name,
    skillSlug: skill.slug,
    skillRepoUrl: skill.repo_url,
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-lg font-bold aurora-text hover:opacity-80 transition-opacity">
              ⚡ Agent Hub
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/#skills" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Skills
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-foreground">{skill.name}</span>
          </div>
          <Link
            href="/llms.txt"
            className="text-muted-foreground hover:text-cyan font-mono text-xs transition-colors"
          >
            /llms.txt
          </Link>
        </div>
      </header>

      {/* Skill Detail */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Title area */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F8FAFC] mb-2">
            🧰 {skill.name}
          </h1>
          <p className="text-muted-foreground">
            by <span className="text-foreground">{skill.author}</span>
          </p>
        </div>

        {/* Compatibility Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
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

        {/* Next Best Action */}
        <section className="mb-8">
          <NextBestActionPanel
            installCmd={skill.install_cmd}
            repoUrl={skill.repo_url}
            issueTitle={`forAgents.dev: ${skill.name} (${skill.slug})`}
            issueBody={issueBody}
          />
        </section>

        <Separator className="opacity-10 my-8" />

        {/* Install */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#F8FAFC] mb-3">Install</h2>
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
