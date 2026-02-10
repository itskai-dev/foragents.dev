import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "node:fs"
import path from "node:path"

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

interface MigrationGuideStore {
  guides: MigrationGuide[]
}

const DATA_PATH = path.join(process.cwd(), "data", "migration-guides.json")

async function readGuideStore() {
  const raw = await fs.readFile(DATA_PATH, "utf8")
  return JSON.parse(raw) as MigrationGuideStore
}

async function writeGuideStore(store: MigrationGuideStore) {
  await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2) + "\n", "utf8")
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const difficulty = searchParams.get("difficulty")?.trim().toLowerCase()
    const search = searchParams.get("search")?.trim().toLowerCase()
    const fromPlatform = searchParams.get("fromPlatform")?.trim().toLowerCase()

    const validDifficulty = ["easy", "medium", "hard"] as const
    const hasDifficultyFilter = Boolean(
      difficulty && validDifficulty.includes(difficulty as Difficulty)
    )

    const store = await readGuideStore()

    const guides = store.guides.filter((guide) => {
      const matchesDifficulty = hasDifficultyFilter
        ? guide.difficulty === difficulty
        : true

      const matchesFromPlatform = fromPlatform
        ? guide.fromPlatform.toLowerCase() === fromPlatform
        : true

      const matchesSearch = search
        ? `${guide.title} ${guide.description}`
            .toLowerCase()
            .includes(search)
        : true

      return matchesDifficulty && matchesFromPlatform && matchesSearch
    })

    return NextResponse.json({ guides, count: guides.length })
  } catch (error) {
    console.error("Failed to fetch migration guides", error)
    return NextResponse.json(
      { error: "Failed to fetch migration guides" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { guideId?: unknown }
    const guideId = typeof body.guideId === "string" ? body.guideId.trim() : ""

    if (!guideId) {
      return NextResponse.json({ error: "guideId is required" }, { status: 400 })
    }

    const store = await readGuideStore()
    const guideIndex = store.guides.findIndex((guide) => guide.id === guideId)

    if (guideIndex === -1) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 })
    }

    const updatedGuide = {
      ...store.guides[guideIndex],
      completions: store.guides[guideIndex].completions + 1,
    }

    store.guides[guideIndex] = updatedGuide
    await writeGuideStore(store)

    return NextResponse.json({ guide: updatedGuide })
  } catch (error) {
    console.error("Failed to mark migration guide as complete", error)
    return NextResponse.json(
      { error: "Failed to mark guide complete" },
      { status: 500 }
    )
  }
}
