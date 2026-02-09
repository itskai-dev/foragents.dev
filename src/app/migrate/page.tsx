"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import migrationData from "@/data/migration-guides.json"

interface CodeExample {
  before: string
  after: string
}

interface Step {
  title: string
  description: string
  code?: CodeExample
}

interface Pitfall {
  issue: string
  solution: string
}

interface Guide {
  id: string
  title: string
  estimatedTime: string
  overview: string
  prerequisites: string[]
  steps: Step[]
  commonPitfalls: Pitfall[]
}

export default function MigratePage() {
  const [activeGuide, setActiveGuide] = useState("langchain")
  // Load progress from localStorage with lazy initializer
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean[]>>(() => {
    if (typeof window === "undefined") return {}
    const savedProgress = localStorage.getItem("migration-progress")
    if (savedProgress) {
      try {
        return JSON.parse(savedProgress)
      } catch (e) {
        console.error("Failed to parse saved progress", e)
        return {}
      }
    }
    return {}
  })

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("migration-progress", JSON.stringify(checkedSteps))
  }, [checkedSteps])

  const toggleStep = (guideId: string, stepIndex: number) => {
    setCheckedSteps((prev) => {
      const guideSteps = prev[guideId] || []
      const newSteps = [...guideSteps]
      newSteps[stepIndex] = !newSteps[stepIndex]
      return {
        ...prev,
        [guideId]: newSteps,
      }
    })
  }

  const getProgress = (guideId: string, totalSteps: number) => {
    const steps = checkedSteps[guideId] || []
    const completed = steps.filter(Boolean).length
    return { completed, total: totalSteps, percentage: Math.round((completed / totalSteps) * 100) || 0 }
  }

  const guides: Guide[] = migrationData.guides

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/10 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06D6A0]/10 border border-[#06D6A0]/20 text-[#06D6A0] text-sm mb-6">
            <span>🔄</span>
            <span>Interactive Migration Guide</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Migrate to forAgents.dev
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Step-by-step guides with progress tracking to help you migrate from LangChain, CrewAI, custom solutions, or upgrade from v1 to v2.
          </p>
        </div>
      </section>

      {/* Migration Guides Tabs */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <Tabs value={activeGuide} onValueChange={setActiveGuide}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
            {guides.map((guide) => (
              <TabsTrigger key={guide.id} value={guide.id}>
                {guide.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {guides.map((guide) => {
            const progress = getProgress(guide.id, guide.steps.length)
            
            return (
              <TabsContent key={guide.id} value={guide.id}>
                {/* Guide Header */}
                <div className="mb-8 p-6 rounded-lg border border-[#06D6A0]/20 bg-[#06D6A0]/5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">{guide.title}</h2>
                      <p className="text-muted-foreground">{guide.overview}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="text-sm text-muted-foreground mb-1">Estimated Time</div>
                      <div className="text-2xl font-bold text-[#06D6A0]">{guide.estimatedTime}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium text-[#06D6A0]">
                        {progress.completed} / {progress.total} steps ({progress.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#06D6A0] transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Prerequisites */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">📋 Prerequisites</h3>
                  <div className="p-6 rounded-lg border border-white/10 bg-white/5">
                    <ul className="space-y-2">
                      {guide.prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-start gap-3 text-muted-foreground">
                          <span className="text-[#06D6A0] mt-1">✓</span>
                          <span>{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Migration Steps */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">🚀 Migration Steps</h3>
                  <div className="space-y-6">
                    {guide.steps.map((step, index) => {
                      const isChecked = checkedSteps[guide.id]?.[index] || false
                      
                      return (
                        <div
                          key={index}
                          className={`p-6 rounded-lg border transition-all ${
                            isChecked
                              ? "border-[#06D6A0]/40 bg-[#06D6A0]/10"
                              : "border-white/10 bg-white/5"
                          }`}
                        >
                          {/* Step Header */}
                          <div className="flex items-start gap-4 mb-4">
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => toggleStep(guide.id, index)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-semibold text-[#06D6A0]">
                                  Step {index + 1}
                                </span>
                                {isChecked && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#06D6A0] text-[#0a0a0a] font-medium">
                                    Completed
                                  </span>
                                )}
                              </div>
                              <h4 className="text-xl font-bold text-white mb-2">{step.title}</h4>
                              <p className="text-muted-foreground">{step.description}</p>
                            </div>
                          </div>

                          {/* Code Examples */}
                          {step.code && (
                            <div className="space-y-4 mt-4">
                              <div>
                                <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                                  <span className="text-red-400">❌</span>
                                  <span>Before:</span>
                                </div>
                                <pre className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
                                  <code className="text-white">{step.code.before}</code>
                                </pre>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                                  <span className="text-[#06D6A0]">✅</span>
                                  <span>After:</span>
                                </div>
                                <pre className="bg-black/50 border border-[#06D6A0]/20 rounded-lg p-4 overflow-x-auto text-sm">
                                  <code className="text-white">{step.code.after}</code>
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Common Pitfalls */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">⚠️ Common Pitfalls</h3>
                  <div className="space-y-4">
                    {guide.commonPitfalls.map((pitfall, index) => (
                      <div
                        key={index}
                        className="p-6 rounded-lg border border-yellow-500/20 bg-yellow-500/5"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">⚠️</span>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-white mb-2">{pitfall.issue}</h4>
                            <p className="text-muted-foreground">
                              <span className="font-semibold text-[#06D6A0]">Solution:</span>{" "}
                              {pitfall.solution}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Completion CTA */}
                {progress.percentage === 100 && (
                  <div className="p-6 rounded-lg border border-[#06D6A0]/40 bg-[#06D6A0]/10 text-center">
                    <div className="text-4xl mb-3">🎉</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Migration Complete!</h3>
                    <p className="text-muted-foreground mb-4">
                      Congratulations! You&apos;ve completed the migration guide.
                    </p>
                    <Link
                      href="/skills"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
                    >
                      Browse Skills →
                    </Link>
                  </div>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </section>

      {/* Why Migrate Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Why Migrate?</h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 rounded-lg border border-white/10 bg-white/5">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="text-xl font-bold text-[#06D6A0] mb-2">Faster Development</h3>
            <p className="text-muted-foreground">
              Skip the boilerplate. Our skills are pre-built, tested, and ready to install. What takes days in other frameworks takes minutes here.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-white/10 bg-white/5">
            <div className="text-3xl mb-3">🔧</div>
            <h3 className="text-xl font-bold text-[#06D6A0] mb-2">Less Maintenance</h3>
            <p className="text-muted-foreground">
              Community-maintained skills mean updates are handled for you. No more wrestling with breaking changes or deprecated APIs.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-white/10 bg-white/5">
            <div className="text-3xl mb-3">📦</div>
            <h3 className="text-xl font-bold text-[#06D6A0] mb-2">Better Ecosystem</h3>
            <p className="text-muted-foreground">
              Access a growing library of skills, MCP servers, and agent templates. If you need it, someone&apos;s probably built it.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-white/10 bg-white/5">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="text-xl font-bold text-[#06D6A0] mb-2">Framework Agnostic</h3>
            <p className="text-muted-foreground">
              Skills work with any agent framework or custom setup. You&apos;re not locked into a specific architecture or vendor.
            </p>
          </div>
        </div>
      </section>

      {/* Need Help CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/30 bg-gradient-to-br from-[#06D6A0]/10 to-purple/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/20 rounded-full blur-[80px]" />
          
          <div className="relative p-8 md:p-12 text-center">
            <div className="text-4xl mb-4">🤝</div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Need Help Migrating?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Stuck on a migration step? Have questions about specific skills? Our community is here to help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Get Migration Support →
              </Link>
              <Link
                href="/guides"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#06D6A0] text-[#06D6A0] font-semibold text-sm hover:bg-[#06D6A0]/10 transition-colors"
              >
                Browse Guides
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
