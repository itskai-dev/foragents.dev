"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { InstallCount } from "@/components/InstallCount";
type Skill = {
  id: string;
  slug: string;
  name: string;
  description: string;
  author: string;
  install_cmd: string;
  repo_url: string;
  tags: string[];
};

type BookmarkedSkill = Skill & {
  bookmarkedAt: number;
};

type SortOption = "date" | "name" | "author";

export default function BookmarksPage() {
  const [bookmarkedSkills, setBookmarkedSkills] = useState<BookmarkedSkill[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      // Get bookmarked skill slugs from localStorage
      const bookmarksData = localStorage.getItem("foragents-bookmarks");
      if (!bookmarksData) {
        setBookmarkedSkills([]);
        setIsLoading(false);
        return;
      }

      const bookmarks: Record<string, number> = JSON.parse(bookmarksData);
      const slugs = Object.keys(bookmarks);

      if (slugs.length === 0) {
        setBookmarkedSkills([]);
        setIsLoading(false);
        return;
      }

      // Fetch skills data
      const response = await fetch("/api/skills.json");
      const allSkills: Skill[] = await response.json();

      // Filter to only bookmarked skills and add timestamp
      const bookmarked = allSkills
        .filter(skill => slugs.includes(skill.slug))
        .map(skill => ({
          ...skill,
          bookmarkedAt: bookmarks[skill.slug] || Date.now(),
        }));

      setBookmarkedSkills(bookmarked);
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
      setBookmarkedSkills([]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeBookmark = (slug: string) => {
    try {
      const bookmarksData = localStorage.getItem("foragents-bookmarks");
      if (!bookmarksData) return;

      const bookmarks: Record<string, number> = JSON.parse(bookmarksData);
      delete bookmarks[slug];
      localStorage.setItem("foragents-bookmarks", JSON.stringify(bookmarks));

      setBookmarkedSkills(prev => prev.filter(skill => skill.slug !== slug));
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
    }
  };

  const exportBookmarks = () => {
    const exportData = {
      exported_at: new Date().toISOString(),
      bookmarks: bookmarkedSkills.map(skill => ({
        slug: skill.slug,
        name: skill.name,
        bookmarked_at: new Date(skill.bookmarkedAt).toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `foragents-bookmarks-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSortedSkills = () => {
    const sorted = [...bookmarkedSkills];
    
    switch (sortBy) {
      case "date":
        return sorted.sort((a, b) => b.bookmarkedAt - a.bookmarkedAt);
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "author":
        return sorted.sort((a, b) => a.author.localeCompare(b.author));
      default:
        return sorted;
    }
  };

  const sortedSkills = getSortedSkills();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-[#06D6A0]/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] bg-purple/3 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC] mb-4">
            💾 Your Saved Skills
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Quick access to your bookmarked skills and tools
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading bookmarks...</p>
          </div>
        ) : sortedSkills.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🔖</div>
            <h2 className="text-2xl font-bold mb-3">No bookmarks yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Browse skills to save your favorites for quick access later
            </p>
            <Link
              href="/#skills"
              className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
            >
              Browse Skills
            </Link>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold">
                  {sortedSkills.length} Saved {sortedSkills.length === 1 ? "Skill" : "Skills"}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Your curated collection
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Options */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="text-sm bg-card border border-white/10 rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:border-[#06D6A0]/50"
                  >
                    <option value="date">Date Saved</option>
                    <option value="name">Name</option>
                    <option value="author">Author</option>
                  </select>
                </div>

                {/* Export Button */}
                <Button
                  onClick={exportBookmarks}
                  size="sm"
                  variant="outline"
                  className="text-xs border-[#06D6A0]/30 text-[#06D6A0] hover:bg-[#06D6A0]/10"
                >
                  Export JSON
                </Button>
              </div>
            </div>

            {/* Skills Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedSkills.map((skill) => (
                <div key={skill.id} className="relative">
                  <Link href={`/skills/${skill.slug}`}>
                    <Card className="bg-card/50 border-white/5 hover:border-[#06D6A0]/20 transition-all group h-full">
                      <CardHeader>
                        <CardTitle className="text-lg group-hover:text-[#06D6A0] transition-colors flex items-center gap-1.5">
                          {skill.name}
                          {skill.author === "Team Reflectt" && (
                            <Image
                              src="/badges/verified-skill.svg"
                              alt="Verified Skill"
                              title="Verified: Team Reflectt skill"
                              width={20}
                              height={20}
                              className="w-5 h-5 inline-block"
                            />
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs flex items-center gap-2">
                          <span>by {skill.author}</span>
                          <span className="text-white/20">•</span>
                          <InstallCount 
                            skillSlug={skill.slug} 
                            className="text-xs text-[#06D6A0]"
                          />
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {skill.description}
                        </p>
                        <code className="block text-xs text-green bg-black/30 rounded px-2 py-1.5 mb-3 overflow-x-auto">
                          {skill.install_cmd}
                        </code>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {skill.tags.slice(0, 2).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs bg-white/5 text-white/60 border-white/10"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {skill.tags.length > 2 && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-white/5 text-white/60 border-white/10"
                              >
                                +{skill.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-[#06D6A0] group-hover:underline">
                            View →
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  {/* Remove Bookmark Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeBookmark(skill.slug);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Remove bookmark"
                    aria-label={`Remove ${skill.name} from bookmarks`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

    </div>
  );
}
