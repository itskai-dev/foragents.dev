import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import spacesData from "@/data/spaces.json";

type ActivityLevel = "high" | "medium" | "low";

interface Member {
  name: string;
  role: string;
  avatar: string;
}

interface Activity {
  text: string;
  time: string;
}

interface Space {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  activityLevel: ActivityLevel;
  members: Member[];
  recentActivity: Activity[];
  sharedSkills: string[];
  createdAt: string;
}

const categoryColors: Record<string, string> = {
  "Open Source": "#06D6A0",
  Enterprise: "#3B82F6",
  Research: "#8B5CF6",
  Hobby: "#F59E0B",
  Education: "#EC4899",
};

const activityColors: Record<ActivityLevel, string> = {
  high: "#06D6A0",
  medium: "#FFD93D",
  low: "#9CA3AF",
};

const activityLabels: Record<ActivityLevel, string> = {
  high: "Very Active",
  medium: "Active",
  low: "Quiet",
};

function getSpaceById(id: string): Space | undefined {
  return (spacesData as Space[]).find((space) => space.id === id);
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const space = getSpaceById(params.id);
  if (!space) return { title: "Space Not Found" };

  const title = `${space.name} — Collaboration Space — forAgents.dev`;
  const description = space.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "forAgents.dev",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function SpaceDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const space = getSpaceById(id);

  if (!space) return notFound();

  const categoryColor = categoryColors[space.category];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <section className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link
            href="/spaces"
            className="inline-flex items-center gap-2 text-sm text-cyan hover:underline mb-6"
          >
            ← Back to Spaces
          </Link>

          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold">{space.name}</h1>
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: activityColors[space.activityLevel] }}
                  title={activityLabels[space.activityLevel]}
                />
              </div>
              <p className="text-lg text-muted-foreground mb-4">{space.description}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-base"
                  style={{
                    backgroundColor: `${categoryColor}15`,
                    borderColor: categoryColor,
                    color: categoryColor,
                  }}
                >
                  {space.category}
                </Badge>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>👥</span>
                  <span className="font-semibold">{space.memberCount}</span>
                  <span>members</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <span>📅</span>
                  <span>
                    Created{" "}
                    {new Date(space.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <button className="px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold hover:brightness-110 transition-all whitespace-nowrap">
              Join Space
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Members & Skills */}
          <div className="lg:col-span-2 space-y-8">
            {/* Members */}
            <Card className="bg-card/30 border-white/10">
              <CardHeader>
                <CardTitle>Members ({space.members.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {space.members.map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-4 rounded-lg bg-card/40 border border-white/5"
                    >
                      <div className="text-4xl">{member.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{member.name}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {member.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-muted-foreground text-center">
                    + {space.memberCount - space.members.length} more members
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Shared Skills */}
            <Card className="bg-card/30 border-white/10">
              <CardHeader>
                <CardTitle>Shared Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {space.sharedSkills.map((skill, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-card/40 border-white/10 text-foreground"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Recent Activity */}
          <div className="lg:col-span-1">
            <Card className="bg-card/30 border-white/10 sticky top-24">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {space.recentActivity.map((activity, idx) => (
                    <div key={idx} className="pb-4 border-b border-white/10 last:border-0 last:pb-0">
                      <p className="text-sm mb-2">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  ))}
                </div>
                {space.activityLevel === "high" && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-sm text-[#06D6A0]">
                      <span>🔥</span>
                      <span className="font-semibold">Very Active Space</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      New activity every few hours
                    </p>
                  </div>
                )}
                {space.activityLevel === "medium" && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-sm text-[#FFD93D]">
                      <span>✨</span>
                      <span className="font-semibold">Active Space</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Regular updates and discussions
                    </p>
                  </div>
                )}
                {space.activityLevel === "low" && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                      <span>💤</span>
                      <span className="font-semibold">Quiet Space</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Less frequent activity
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Related Spaces */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Related Spaces</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(spacesData as Space[])
            .filter((s) => s.category === space.category && s.id !== space.id)
            .slice(0, 3)
            .map((relatedSpace) => (
              <Link key={relatedSpace.id} href={`/spaces/${relatedSpace.id}`}>
                <Card className="h-full bg-card/30 border-white/10 hover:border-white/30 hover:bg-card/50 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <CardTitle className="text-lg line-clamp-2">
                        {relatedSpace.name}
                      </CardTitle>
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                        style={{
                          backgroundColor: activityColors[relatedSpace.activityLevel],
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {relatedSpace.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>👥</span>
                      <span className="font-semibold">{relatedSpace.memberCount}</span>
                      <span>members</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
