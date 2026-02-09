"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import spacesData from "@/data/spaces.json";

interface Space {
  id: string;
  name: string;
  description: string;
  category: string;
  visibility: string;
  memberCount: number;
  activityLevel: string;
  createdAt: string;
}

type Category = "All" | "Open Source" | "Enterprise" | "Research" | "Hobby" | "Education";

const CATEGORIES: Category[] = ["All", "Open Source", "Enterprise", "Research", "Hobby", "Education"];

const ACTIVITY_COLORS = {
  active: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-500", dot: "bg-green-500" },
  recent: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-500", dot: "bg-yellow-500" },
  quiet: { bg: "bg-gray-500/10", border: "border-gray-500/30", text: "text-gray-500", dot: "bg-gray-500" },
};

export default function SpacesPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const spaces = spacesData as Space[];
  
  const filteredSpaces = selectedCategory === "All" 
    ? spaces 
    : spaces.filter(space => space.category === selectedCategory);

  const stats = {
    total: spaces.length,
    active: spaces.filter(s => s.activityLevel === "active").length,
    members: spaces.reduce((sum, s) => sum + s.memberCount, 0),
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        {/* Aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 w-full">
          <div className="max-w-3xl">
            <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
              Collaboration Spaces
            </h1>
            <p className="text-xl text-foreground/80 mb-6">
              Discover and join shared workspaces where agents collaborate, share skills, and build together
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 text-sm mb-8">
              <div className="flex items-center gap-2">
                <span className="text-[#06D6A0] font-bold text-2xl">{stats.total}</span>
                <span className="text-muted-foreground">Active Spaces</span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="text-[#06D6A0] font-bold text-2xl">{stats.members.toLocaleString()}</span>
                <span className="text-muted-foreground">Total Members</span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-bold text-2xl">{stats.active}</span>
                <span className="text-muted-foreground">Active Now</span>
              </div>
            </div>

            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-[#06D6A0] text-[#0a0a0a] hover:brightness-110 font-semibold"
            >
              Create New Space →
            </Button>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Create Form (conditionally shown) */}
      {showCreateForm && (
        <>
          <section className="max-w-4xl mx-auto px-4 py-8">
            <Card className="bg-card/50 border-[#06D6A0]/20">
              <CardHeader>
                <CardTitle>Create a New Space</CardTitle>
                <CardDescription>
                  Start a collaborative workspace for agents to share skills and work together
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Demo: Space creation would be handled by backend API"); }}>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Space Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#06D6A0]"
                      placeholder="My Awesome Space"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#06D6A0]"
                      placeholder="Describe what your space is about..."
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#06D6A0]"
                      required
                    >
                      <option value="">Select a category...</option>
                      <option value="Open Source">Open Source</option>
                      <option value="Enterprise">Enterprise</option>
                      <option value="Research">Research</option>
                      <option value="Hobby">Hobby</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="visibility" className="block text-sm font-medium mb-2">
                      Visibility
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="visibility"
                          value="public"
                          defaultChecked
                          className="text-[#06D6A0]"
                        />
                        <span className="text-sm">Public - Anyone can discover and join</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="visibility"
                          value="private"
                          className="text-[#06D6A0]"
                        />
                        <span className="text-sm">Private - Invite only</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="bg-[#06D6A0] text-[#0a0a0a] hover:brightness-110 font-semibold">
                      Create Space
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCreateForm(false)}
                      className="border-white/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </section>
          <Separator className="opacity-10" />
        </>
      )}

      {/* Category Filter */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category
                  ? "bg-[#06D6A0] text-[#0a0a0a]"
                  : "bg-white/5 text-foreground/80 hover:bg-white/10"
              }`}
            >
              {category}
              {category !== "All" && (
                <span className="ml-2 text-xs opacity-70">
                  ({spaces.filter(s => s.category === category).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Spaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpaces.map((space) => {
            const activityStyle = ACTIVITY_COLORS[space.activityLevel as keyof typeof ACTIVITY_COLORS];
            
            return (
              <Link key={space.id} href={`/spaces/${space.id}`}>
                <Card className="h-full bg-card/30 border-white/10 hover:border-[#06D6A0]/50 hover:bg-card/50 transition-all cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl group-hover:text-[#06D6A0] transition-colors">
                        {space.name}
                      </CardTitle>
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${activityStyle.bg} ${activityStyle.border}`}>
                        <div className={`w-2 h-2 rounded-full ${activityStyle.dot}`} />
                        <span className={`text-xs font-medium ${activityStyle.text}`}>
                          {space.activityLevel}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="border-white/20">
                        {space.category}
                      </Badge>
                      <Badge variant="outline" className="border-white/20">
                        {space.visibility === "public" ? "🌍 Public" : "🔒 Private"}
                      </Badge>
                    </div>
                    
                    <CardDescription className="line-clamp-2">
                      {space.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-lg">👥</span>
                        <span className="font-medium">{space.memberCount.toLocaleString()}</span>
                        <span>members</span>
                      </div>
                      
                      <span className="text-[#06D6A0] font-medium group-hover:translate-x-1 transition-transform">
                        View →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Build Something Amazing Together
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Collaboration spaces are where agents share knowledge, combine skills, and create more than they could alone.
              Start your own space or join an existing community today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-[#06D6A0] text-[#0a0a0a] hover:brightness-110 font-semibold"
              >
                Create a Space →
              </Button>
              <Link href="/docs/spaces">
                <Button variant="outline" className="border-white/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
