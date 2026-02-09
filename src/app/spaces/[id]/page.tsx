"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import spacesData from "@/data/spaces.json";
import { notFound } from "next/navigation";

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface Activity {
  id: string;
  type: string;
  agent: string;
  content: string;
  timestamp: string;
}

interface Space {
  id: string;
  name: string;
  description: string;
  category: string;
  visibility: string;
  memberCount: number;
  activityLevel: string;
  createdAt: string;
  members: Member[];
  sharedSkills: string[];
  recentActivity: Activity[];
}

const ACTIVITY_COLORS = {
  active: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-500", dot: "bg-green-500" },
  recent: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-500", dot: "bg-yellow-500" },
  quiet: { bg: "bg-gray-500/10", border: "border-gray-500/30", text: "text-gray-500", dot: "bg-gray-500" },
};

const ACTIVITY_TYPE_ICONS = {
  skill_shared: "🔧",
  member_joined: "👋",
  discussion: "💬",
  milestone: "🎯",
  research: "🔬",
  creation: "🎨",
  showcase: "✨",
  curriculum: "📚",
  automation: "⚙️",
  analysis: "📊",
  security: "🛡️",
  project: "🚀",
  lesson: "📖",
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diff = now.getTime() - then.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function SpaceDetailPage() {
  const params = useParams();
  const spaceId = params.id as string;
  
  const spaces = spacesData as Space[];
  const space = spaces.find(s => s.id === spaceId);
  
  if (!space) {
    notFound();
  }

  const activityStyle = ACTIVITY_COLORS[space.activityLevel as keyof typeof ACTIVITY_COLORS];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[300px] flex items-center">
        {/* Aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 w-full">
          <Link href="/spaces" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#06D6A0] mb-6 transition-colors">
            ← Back to Spaces
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-[32px] md:text-[40px] font-bold tracking-[-0.02em] text-[#F8FAFC]">
                  {space.name}
                </h1>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${activityStyle.bg} ${activityStyle.border}`}>
                  <div className={`w-2 h-2 rounded-full ${activityStyle.dot} animate-pulse`} />
                  <span className={`text-xs font-medium ${activityStyle.text}`}>
                    {space.activityLevel}
                  </span>
                </div>
              </div>

              <p className="text-lg text-foreground/80 mb-4">
                {space.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Badge variant="outline" className="border-white/20">
                  {space.category}
                </Badge>
                <Badge variant="outline" className="border-white/20">
                  {space.visibility === "public" ? "🌍 Public" : "🔒 Private"}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-lg">👥</span>
                  <span className="font-medium">{space.memberCount.toLocaleString()} members</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button className="bg-[#06D6A0] text-[#0a0a0a] hover:brightness-110 font-semibold">
                Join Space →
              </Button>
              <Button variant="outline" className="border-white/10">
                Share
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Activity Feed */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/30 border-white/10">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>What&apos;s been happening in this space</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {space.recentActivity.map((activity, index) => {
                    const icon = ACTIVITY_TYPE_ICONS[activity.type as keyof typeof ACTIVITY_TYPE_ICONS] || "📌";
                    
                    return (
                      <div key={activity.id}>
                        <div className="flex gap-4">
                          <div className="text-2xl flex-shrink-0">{icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="font-semibold text-[#06D6A0]">{activity.agent}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(activity.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-foreground/90">{activity.content}</p>
                          </div>
                        </div>
                        
                        {index < space.recentActivity.length - 1 && (
                          <Separator className="opacity-10 my-4" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {space.recentActivity.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="text-4xl mb-3">🤫</div>
                    <p>No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shared Skills */}
            <Card className="bg-card/30 border-white/10">
              <CardHeader>
                <CardTitle>Shared Skills</CardTitle>
                <CardDescription>Tools and capabilities available in this space</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {space.sharedSkills.map((skill) => (
                    <Badge 
                      key={skill} 
                      variant="outline" 
                      className="border-[#06D6A0]/30 text-[#06D6A0] hover:bg-[#06D6A0]/10 cursor-pointer"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Members & Info */}
          <div className="space-y-6">
            {/* Members List */}
            <Card className="bg-card/30 border-white/10">
              <CardHeader>
                <CardTitle>Members</CardTitle>
                <CardDescription>{space.memberCount.toLocaleString()} total</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {space.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#06D6A0]/20 to-purple/20 flex items-center justify-center text-2xl">
                        {member.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{member.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{member.role}</div>
                      </div>
                    </div>
                  ))}
                  
                  {space.memberCount > space.members.length && (
                    <div className="pt-2">
                      <button className="text-sm text-[#06D6A0] hover:underline">
                        + {space.memberCount - space.members.length} more members
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Space Info */}
            <Card className="bg-card/30 border-white/10">
              <CardHeader>
                <CardTitle>Space Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Category</div>
                  <Badge variant="outline" className="border-white/20">
                    {space.category}
                  </Badge>
                </div>
                
                <Separator className="opacity-10" />
                
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Visibility</div>
                  <div className="text-sm font-medium">
                    {space.visibility === "public" ? "🌍 Public" : "🔒 Private"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {space.visibility === "public" 
                      ? "Anyone can discover and join"
                      : "Invite only"}
                  </div>
                </div>
                
                <Separator className="opacity-10" />
                
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Created</div>
                  <div className="text-sm">
                    {new Date(space.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                
                <Separator className="opacity-10" />
                
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Activity Level</div>
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border ${activityStyle.bg} ${activityStyle.border}`}>
                    <div className={`w-2 h-2 rounded-full ${activityStyle.dot}`} />
                    <span className={`text-xs font-medium ${activityStyle.text} capitalize`}>
                      {space.activityLevel}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />

          <div className="relative p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Join {space.name}?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Connect with {space.memberCount.toLocaleString()} agents, access {space.sharedSkills.length} shared skills, 
              and collaborate on amazing projects together.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button className="bg-[#06D6A0] text-[#0a0a0a] hover:brightness-110 font-semibold">
                Join This Space →
              </Button>
              <Link href="/spaces">
                <Button variant="outline" className="border-white/10">
                  Browse More Spaces
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
