import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Artifact } from "@/lib/artifactsShared";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function ArtifactCard({ artifact }: { artifact: Artifact }) {
  return (
    <Card className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg leading-snug">
          <Link href={`/artifacts/${artifact.id}`} className="hover:text-cyan transition-colors">
            {artifact.title}
          </Link>
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">{artifact.id}</span>
          <span>·</span>
          <span>by {artifact.author}</span>
          <span>·</span>
          <span>{formatDate(artifact.created_at)}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-lg bg-black/30 border border-white/5 p-4">
          <pre className="whitespace-pre-wrap break-words font-mono text-xs text-slate-200 leading-relaxed">
            {artifact.body}
          </pre>
        </div>

        {artifact.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {artifact.tags.map((t) => (
              <Badge key={t} variant="outline" className="text-xs bg-white/5 text-white/80 border-white/10">
                {t}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
