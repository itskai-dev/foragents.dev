"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";

interface Lesson {
  id: string;
  title: string;
  estimatedTime: string;
  description: string;
}

interface Track {
  id: string;
  name: string;
  emoji: string;
  description: string;
  lessons: Lesson[];
}

const TRACKS: Track[] = [
  {
    id: "beginner",
    name: "Beginner",
    emoji: "🌱",
    description: "Start your journey into agent development",
    lessons: [
      {
        id: "what-are-agents",
        title: "What are AI Agents?",
        estimatedTime: "10 min",
        description: "Understand the fundamentals of autonomous AI agents and how they differ from traditional chatbots",
      },
      {
        id: "first-skill-install",
        title: "Your First Skill Install",
        estimatedTime: "15 min",
        description: "Learn how to discover and install your first skill package using forAgents.dev",
      },
      {
        id: "agent-workspace",
        title: "Setting Up Your Agent Workspace",
        estimatedTime: "20 min",
        description: "Configure your local environment, file structure, and essential tools for agent development",
      },
      {
        id: "reading-agent-logs",
        title: "Reading Agent Logs & Debugging",
        estimatedTime: "15 min",
        description: "Master the basics of troubleshooting agent behavior through logs and error messages",
      },
      {
        id: "basic-prompts",
        title: "Writing Effective Agent Prompts",
        estimatedTime: "20 min",
        description: "Craft clear instructions that help your agent understand its role and capabilities",
      },
    ],
  },
  {
    id: "intermediate",
    name: "Intermediate",
    emoji: "🌿",
    description: "Build custom skills and integrate protocols",
    lessons: [
      {
        id: "building-custom-skills",
        title: "Building Custom Skills",
        estimatedTime: "45 min",
        description: "Create your own skill packages with SKILL.md manifests and install scripts",
      },
      {
        id: "mcp-integration",
        title: "MCP Integration Basics",
        estimatedTime: "30 min",
        description: "Connect your agent to Model Context Protocol servers for extended capabilities",
      },
      {
        id: "tool-selection",
        title: "Tool Selection Strategies",
        estimatedTime: "25 min",
        description: "Help your agent choose the right tool for each task with context and examples",
      },
      {
        id: "memory-management",
        title: "Memory & State Management",
        estimatedTime: "35 min",
        description: "Implement persistent memory patterns using files, databases, and session context",
      },
    ],
  },
  {
    id: "advanced",
    name: "Advanced",
    emoji: "🌳",
    description: "Scale to production with multi-agent systems",
    lessons: [
      {
        id: "multi-agent-systems",
        title: "Multi-Agent Systems",
        estimatedTime: "60 min",
        description: "Coordinate teams of specialized agents with defined roles and communication patterns",
      },
      {
        id: "production-deployment",
        title: "Production Deployment",
        estimatedTime: "50 min",
        description: "Deploy your agents with proper security, monitoring, and error handling for production use",
      },
      {
        id: "advanced-mcp",
        title: "Advanced MCP Patterns",
        estimatedTime: "40 min",
        description: "Build custom MCP servers and implement complex tool chains for specialized workflows",
      },
      {
        id: "agent-orchestration",
        title: "Agent Orchestration & Queues",
        estimatedTime: "45 min",
        description: "Implement task queues, work distribution, and load balancing across agent teams",
      },
      {
        id: "security-best-practices",
        title: "Security & Privacy Best Practices",
        estimatedTime: "30 min",
        description: "Protect sensitive data, implement access controls, and audit agent actions in production",
      },
    ],
  },
];

const RECOMMENDED_PATH = [
  { trackId: "beginner", lessonId: "what-are-agents", order: 1 },
  { trackId: "beginner", lessonId: "first-skill-install", order: 2 },
  { trackId: "beginner", lessonId: "agent-workspace", order: 3 },
  { trackId: "intermediate", lessonId: "building-custom-skills", order: 4 },
  { trackId: "intermediate", lessonId: "mcp-integration", order: 5 },
  { trackId: "beginner", lessonId: "reading-agent-logs", order: 6 },
  { trackId: "intermediate", lessonId: "tool-selection", order: 7 },
  { trackId: "beginner", lessonId: "basic-prompts", order: 8 },
  { trackId: "intermediate", lessonId: "memory-management", order: 9 },
  { trackId: "advanced", lessonId: "multi-agent-systems", order: 10 },
  { trackId: "advanced", lessonId: "production-deployment", order: 11 },
];

export default function LearnPage() {
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  // Load completed lessons from localStorage on mount
  useEffect(() => {
    const loadLessons = () => {
      try {
        const stored = localStorage.getItem("foragents-completed-lessons");
        if (stored) {
          setCompletedLessons(new Set(JSON.parse(stored)));
        }
      } catch (error) {
        console.error("Failed to load completed lessons:", error);
      }
    };
    loadLessons();
  }, []);

  // Save completed lessons to localStorage
  const toggleLesson = (lessonId: string) => {
    setCompletedLessons((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId);
      } else {
        newSet.add(lessonId);
      }
      try {
        localStorage.setItem("foragents-completed-lessons", JSON.stringify(Array.from(newSet)));
      } catch (error) {
        console.error("Failed to save completed lessons:", error);
      }
      return newSet;
    });
  };

  const calculateProgress = (track: Track) => {
    const completed = track.lessons.filter((lesson) => completedLessons.has(lesson.id)).length;
    return Math.round((completed / track.lessons.length) * 100);
  };

  const getRecommendedLesson = (trackId: string, lessonId: string) => {
    return RECOMMENDED_PATH.find((item) => item.trackId === trackId && item.lessonId === lessonId);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-[#0a0a0a]/80">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-lg font-bold aurora-text">
              ⚡ Agent Hub
            </Link>
            <span className="text-xs text-muted-foreground font-mono">forAgents.dev</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <MobileNav />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="relative">
          {/* Subtle aurora background */}
          <div className="absolute inset-0 -z-10 opacity-30">
            <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#06D6A0]/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-purple/20 rounded-full blur-[100px]" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            📚 Learn Agent Development
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-2">
            Structured learning paths from beginner to advanced
          </p>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            Master AI agent development through hands-on lessons covering skills, MCP integration, multi-agent systems, and production deployment
          </p>

          {/* Overall Progress */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Overall Progress</span>
              <span className="text-[#06D6A0] font-semibold">
                {completedLessons.size} / {TRACKS.reduce((sum, track) => sum + track.lessons.length, 0)} lessons
              </span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#06D6A0] to-purple transition-all duration-500"
                style={{
                  width: `${Math.round(
                    (completedLessons.size / TRACKS.reduce((sum, track) => sum + track.lessons.length, 0)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Path */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-br from-[#06D6A0]/10 to-purple/10 border border-[#06D6A0]/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🎯</span>
            <h2 className="text-2xl font-bold text-white">Recommended Learning Path</h2>
          </div>
          <p className="text-gray-400 mb-6">
            Follow this curated sequence for the most effective learning experience. Each lesson builds on previous concepts.
          </p>
          <div className="grid gap-3">
            {RECOMMENDED_PATH.map((item) => {
              const track = TRACKS.find((t) => t.id === item.trackId);
              const lesson = track?.lessons.find((l) => l.id === item.lessonId);
              if (!track || !lesson) return null;

              const isCompleted = completedLessons.has(lesson.id);

              return (
                <div
                  key={`${item.trackId}-${item.lessonId}`}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                    isCompleted
                      ? "bg-[#06D6A0]/5 border-[#06D6A0]/30"
                      : "bg-white/5 border-white/10 hover:border-[#06D6A0]/30"
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#06D6A0]/10 text-[#06D6A0] font-bold text-sm">
                    {item.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{track.emoji}</span>
                      <h3 className="text-white font-semibold">{lesson.title}</h3>
                      <span className="text-xs text-gray-500 font-mono">{lesson.estimatedTime}</span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-1">{lesson.description}</p>
                  </div>
                  <button
                    onClick={() => toggleLesson(lesson.id)}
                    className={`flex items-center justify-center w-6 h-6 rounded border-2 transition-colors ${
                      isCompleted
                        ? "bg-[#06D6A0] border-[#06D6A0]"
                        : "bg-transparent border-gray-600 hover:border-[#06D6A0]"
                    }`}
                    aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                  >
                    {isCompleted && (
                      <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Learning Tracks */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Learning Tracks</h2>
          <p className="text-gray-400">
            Choose your path or mix and match lessons based on your experience level
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-1">
          {TRACKS.map((track) => {
            const progress = calculateProgress(track);

            return (
              <div
                key={track.id}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#06D6A0]/30 transition-all"
              >
                {/* Track Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{track.emoji}</span>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{track.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{track.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#06D6A0]">{progress}%</div>
                    <div className="text-xs text-gray-500">Complete</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#06D6A0] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Lessons */}
                <div className="space-y-3">
                  {track.lessons.map((lesson) => {
                    const isCompleted = completedLessons.has(lesson.id);
                    const recommended = getRecommendedLesson(track.id, lesson.id);

                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                          isCompleted
                            ? "bg-[#06D6A0]/5 border-[#06D6A0]/30"
                            : "bg-black/30 border-white/10 hover:border-[#06D6A0]/20"
                        }`}
                      >
                        <button
                          onClick={() => toggleLesson(lesson.id)}
                          className={`mt-1 flex items-center justify-center w-5 h-5 rounded border-2 transition-colors flex-shrink-0 ${
                            isCompleted
                              ? "bg-[#06D6A0] border-[#06D6A0]"
                              : "bg-transparent border-gray-600 hover:border-[#06D6A0]"
                          }`}
                          aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                        >
                          {isCompleted && (
                            <svg
                              className="w-3 h-3 text-black"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-white font-semibold">{lesson.title}</h4>
                            {recommended && (
                              <span className="px-2 py-0.5 text-xs font-semibold bg-[#06D6A0]/20 text-[#06D6A0] rounded border border-[#06D6A0]/30">
                                #{recommended.order} Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{lesson.description}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {lesson.estimatedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/10 to-purple/10 p-8 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/20 rounded-full blur-[60px]" />

          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to Build Something?
            </h2>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              Explore skills, browse trending tools, or jump into the community to start building your own agent
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/skills"
                className="px-6 py-3 bg-[#06D6A0] text-black font-semibold rounded-lg hover:brightness-110 transition-all"
              >
                Browse Skills →
              </Link>
              <Link
                href="/trending"
                className="px-6 py-3 border border-[#06D6A0] text-[#06D6A0] font-semibold rounded-lg hover:bg-[#06D6A0]/10 transition-all"
              >
                View Trending
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
