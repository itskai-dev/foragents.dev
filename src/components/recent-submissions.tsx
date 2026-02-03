import Link from "next/link";
import { Submission } from "@/lib/data";

type Props = {
  submissions: Submission[];
};

const typeLabels: Record<string, { label: string; color: string }> = {
  skill: { label: "Skill", color: "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/25" },
  mcp: { label: "MCP", color: "bg-[#06D6A0]/15 text-[#06D6A0] border-[#06D6A0]/25" },
  agent: { label: "Agent", color: "bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/25" },
  "llms-txt": { label: "llms-txt", color: "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/25" },
};

const statusBadges: Record<string, { label: string; color: string }> = {
  pending: { label: "PENDING REVIEW", color: "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/25" },
  approved: { label: "APPROVED", color: "bg-[#06D6A0]/15 text-[#06D6A0] border-[#06D6A0]/25" },
  rejected: { label: "NOT APPROVED", color: "bg-[#6B7280]/15 text-[#6B7280] border-[#6B7280]/25" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + "…";
}

function getDirectoryLink(submission: Submission): string | null {
  if (submission.status !== "approved") return null;
  
  // If we have a directory_slug, use it
  if (submission.directory_slug) {
    if (submission.type === "skill") return `/skills/${submission.directory_slug}`;
    if (submission.type === "mcp") return `/mcp#${submission.directory_slug}`;
    if (submission.type === "agent") return `/agents/${submission.directory_slug}`;
    if (submission.type === "llms-txt") return `/llms-txt#${submission.directory_slug}`;
  }
  
  return null;
}

export function RecentSubmissions({ submissions }: Props) {
  // Empty state / fallback
  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-muted-foreground mb-4">
          No submissions yet. Be the first!
        </p>
        <Link
          href="/submit"
          className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-cyan text-[#0A0E17] font-semibold text-sm hover:brightness-110 transition-all"
        >
          Submit a Tool →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((sub) => {
        const typeInfo = typeLabels[sub.type] || typeLabels.skill;
        const statusInfo = statusBadges[sub.status] || statusBadges.pending;
        const directoryLink = getDirectoryLink(sub);

        return (
          <div
            key={sub.id}
            className="rounded-lg border border-white/5 bg-card/30 p-4 hover:border-white/10 transition-colors"
          >
            {/* Top row: name + badges */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                {/* Name - linked to URL if provided, or directory if approved */}
                {directoryLink ? (
                  <Link
                    href={directoryLink}
                    className="font-medium text-[#F8FAFC] hover:text-cyan transition-colors truncate"
                  >
                    {sub.name}
                  </Link>
                ) : sub.url ? (
                  <a
                    href={sub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#F8FAFC] hover:text-cyan transition-colors truncate"
                  >
                    {sub.name}
                  </a>
                ) : (
                  <span className="font-medium text-[#F8FAFC] truncate">
                    {sub.name}
                  </span>
                )}

                {/* Type badge */}
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${typeInfo.color}`}
                >
                  {typeInfo.label}
                </span>
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusInfo.color}`}
                  title={sub.status === "rejected" && sub.rejection_reason ? sub.rejection_reason : undefined}
                >
                  {statusInfo.label}
                </span>
              </div>
            </div>

            {/* Description (truncated to 1 line) */}
            <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
              {truncate(sub.description, 120)}
            </p>

            {/* Bottom row: author + time */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>by {sub.author}</span>
              <span>{timeAgo(sub.submitted_at)}</span>
            </div>
          </div>
        );
      })}

      {/* View all / submit CTA */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <Link
          href="/submit"
          className="text-sm text-cyan hover:underline"
        >
          Submit yours →
        </Link>
      </div>
    </div>
  );
}
