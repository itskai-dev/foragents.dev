import Link from "next/link";
import { Skill } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

type Props = {
  currentSkill: Skill;
  allSkills: Skill[];
  maxResults?: number;
};

/**
 * Calculates the number of overlapping tags between two skills
 */
function calculateTagOverlap(skill1Tags: string[], skill2Tags: string[]): number {
  const tags1 = new Set(skill1Tags);
  return skill2Tags.filter(tag => tags1.has(tag)).length;
}

/**
 * Finds and displays related skills based on tag overlap
 */
export function RelatedKits({ currentSkill, allSkills, maxResults = 5 }: Props) {
  // Filter out current skill and calculate tag overlap
  const relatedSkills = allSkills
    .filter((skill) => skill.slug !== currentSkill.slug)
    .map((skill) => ({
      skill,
      overlap: calculateTagOverlap(currentSkill.tags, skill.tags),
    }))
    .filter((item) => item.overlap > 0) // Only show skills with at least 1 shared tag
    .sort((a, b) => {
      // Sort by overlap (descending), then alphabetically by name
      if (b.overlap !== a.overlap) {
        return b.overlap - a.overlap;
      }
      return a.skill.name.localeCompare(b.skill.name);
    })
    .slice(0, maxResults);

  // If no related skills found, don't render anything
  if (relatedSkills.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">
        🔗 Works well with
      </h2>
      <div className="grid gap-3">
        {relatedSkills.map(({ skill, overlap }) => {
          // Find the shared tags
          const sharedTags = skill.tags.filter(tag => 
            currentSkill.tags.includes(tag)
          );

          return (
            <Link
              key={skill.slug}
              href={`/skills/${skill.slug}`}
              className="block rounded-lg border border-white/5 p-4 hover:border-cyan/20 transition-all group"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold group-hover:text-cyan transition-colors">
                  {skill.name}
                </h3>
                <span className="text-xs text-muted-foreground shrink-0">
                  {overlap} shared tag{overlap > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {skill.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sharedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs bg-cyan/10 text-cyan border-cyan/20"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
