/* eslint-disable react/no-unescaped-entities */
"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type Difficulty = "easy" | "medium" | "hard"

interface MigrationStep {
  title: string
  content: string
}

interface MigrationGuide {
  id: string
  fromPlatform: string
  toPlatform: "foragents"
  title: string
  description: string
  steps: MigrationStep[]
  difficulty: Difficulty
  estimatedTime: string
  completions: number
}

const difficultyLabelClass: Record<Difficulty, string> = {
  easy: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  medium: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  hard: "bg-rose-500/20 text-rose-300 border-rose-500/40",
}

function platformLabel(platform: string) {
  return platform
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export default function MigratePage() {
  const [guides, setGuides] = useState<MigrationGuide[]>([])
  const [allGuides, setAllGuides] = useState<MigrationGuide[]>([])
  const [selectedGuideId, setSelectedGuideId] = useState<string>("")
  const [difficulty, setDifficulty] = useState<string>("all")
  const [fromPlatform, setFromPlatform] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [markingCompleteId, setMarkingCompleteId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const platformOptions = useMemo(() => {
    return Array.from(new Set(allGuides.map((guide) => guide.fromPlatform))).sort()
  }, [allGuides])

  useEffect(() => {
    const fetchAllGuides = async () => {
      try {
        const response = await fetch("/api/migrate", { cache: "no-store" })
        if (!response.ok) {
          throw new Error("Failed to load migration guides")
        }

        const payload = (await response.json()) as { guides: MigrationGuide[] }
        setAllGuides(payload.guides)
      } catch (fetchError) {
        console.error(fetchError)
      }
    }

    fetchAllGuides()
  }, [])

  useEffect(() => {
    const fetchFilteredGuides = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (difficulty !== "all") params.set("difficulty", difficulty)
        if (fromPlatform !== "all") params.set("fromPlatform", fromPlatform)
        if (search.trim()) params.set("search", search.trim())

        const query = params.toString()
        const response = await fetch(`/api/migrate${query ? `?${query}` : ""}`, {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Failed to load migration guides")
        }

        const payload = (await response.json()) as { guides: MigrationGuide[] }
        setGuides(payload.guides)
      } catch (fetchError) {
        console.error(fetchError)
        setError("Couldn't load migration guides right now. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchFilteredGuides()
  }, [difficulty, fromPlatform, search])

  useEffect(() => {
    if (!guides.length) {
      setSelectedGuideId("")
      return
    }

    const hasSelectedGuide = guides.some((guide) => guide.id === selectedGuideId)
    if (!hasSelectedGuide) {
      setSelectedGuideId(guides[0].id)
    }
  }, [guides, selectedGuideId])

  const selectedGuide = guides.find((guide) => guide.id === selectedGuideId)

  const markComplete = async (guideId: string) => {
    try {
      setMarkingCompleteId(guideId)

      const response = await fetch("/api/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideId }),
      })

      if (!response.ok) {
        throw new Error("Failed to mark guide complete")
      }

      const payload = (await response.json()) as { guide: MigrationGuide }

      setGuides((prev) =>
        prev.map((guide) => (guide.id === guideId ? payload.guide : guide))
      )
      setAllGuides((prev) =>
        prev.map((guide) => (guide.id === guideId ? payload.guide : guide))
      )
    } catch (markError) {
      console.error(markError)
    } finally {
      setMarkingCompleteId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06D6A0]/10 border border-[#06D6A0]/20 text-[#06D6A0] text-sm mb-6">
            <span>🔄</span>
            <span>Migration Guide</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Migrate to forAgents.dev
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Real migration data, persistent completion tracking, and step-by-step
            instructions for moving from your current platform when you're ready.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search migration guides"
            className="md:col-span-1 bg-white/5 border-white/20"
          />

          <Select value={fromPlatform} onValueChange={setFromPlatform}>
            <SelectTrigger className="w-full bg-white/5 border-white/20">
              <SelectValue placeholder="Filter by source platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              {platformOptions.map((platform) => (
                <SelectItem key={platform} value={platform}>
                  {platformLabel(platform)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-full bg-white/5 border-white/20">
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center text-muted-foreground">
            Loading migration guides...
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-6 text-rose-200 mb-6">
            {error}
          </div>
        )}

        {!loading && !error && guides.length === 0 && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center text-muted-foreground">
            No migration guides matched your filters.
          </div>
        )}

        {!loading && guides.length > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mb-10">
              {guides.map((guide) => (
                <Card
                  key={guide.id}
                  className={`border transition-colors cursor-pointer bg-white/5 ${
                    selectedGuideId === guide.id
                      ? "border-[#06D6A0]/70"
                      : "border-white/10 hover:border-[#06D6A0]/40"
                  }`}
                  onClick={() => setSelectedGuideId(guide.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="outline"
                        className={difficultyLabelClass[guide.difficulty]}
                      >
                        {guide.difficulty}
                      </Badge>
                      <Badge variant="outline" className="border-white/30 text-white/80">
                        {platformLabel(guide.fromPlatform)}
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-lg">{guide.title}</CardTitle>
                    <CardDescription>{guide.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-1">
                    <p>Estimated time: {guide.estimatedTime}</p>
                    <p>Completions: {guide.completions}</p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      size="sm"
                      variant={selectedGuideId === guide.id ? "default" : "outline"}
                      className="w-full"
                    >
                      {selectedGuideId === guide.id ? "Selected" : "View Guide"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {selectedGuide && (
              <div className="rounded-xl border border-[#06D6A0]/20 bg-[#06D6A0]/5 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{selectedGuide.title}</h2>
                    <p className="text-muted-foreground">{selectedGuide.description}</p>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>From: {platformLabel(selectedGuide.fromPlatform)}</p>
                    <p>To: forAgents.dev</p>
                    <p>Completions: {selectedGuide.completions}</p>
                  </div>
                </div>

                <Accordion type="single" collapsible className="rounded-lg border border-white/10 bg-black/20 px-4">
                  {selectedGuide.steps.map((step, index) => (
                    <AccordionItem key={`${selectedGuide.id}-${index}`} value={`step-${index}`} className="border-white/10">
                      <AccordionTrigger className="text-left hover:text-[#06D6A0]">
                        <span className="font-medium">
                          Step {index + 1}: {step.title}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {step.content}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Finished this guide? Mark it complete to increment the shared completion count.
                  </p>
                  <Button
                    onClick={() => markComplete(selectedGuide.id)}
                    disabled={markingCompleteId === selectedGuide.id}
                    className="bg-[#06D6A0] text-[#0a0a0a] hover:brightness-110"
                  >
                    {markingCompleteId === selectedGuide.id
                      ? "Updating..."
                      : "Mark Complete"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
