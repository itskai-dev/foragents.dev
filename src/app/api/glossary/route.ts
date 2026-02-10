import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

type GlossaryCategory =
  | "core-concepts"
  | "protocols"
  | "infrastructure"
  | "security"
  | "patterns";

type GlossaryEntry = {
  term: string;
  definition: string;
  category: GlossaryCategory;
  relatedTerms: string[];
  slug: string;
};

type GlossarySuggestion = {
  id: string;
  term: string;
  definition: string;
  category: GlossaryCategory;
  slug: string;
  createdAt: string;
  status: "pending";
};

const GLOSSARY_PATH = path.join(process.cwd(), "data", "glossary.json");
const SUGGESTIONS_PATH = path.join(process.cwd(), "data", "glossary-suggestions.json");

const VALID_CATEGORIES: GlossaryCategory[] = [
  "core-concepts",
  "protocols",
  "infrastructure",
  "security",
  "patterns",
];

function isGlossaryCategory(value: unknown): value is GlossaryCategory {
  return typeof value === "string" && VALID_CATEGORIES.includes(value as GlossaryCategory);
}

function isGlossaryEntry(value: unknown): value is GlossaryEntry {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<GlossaryEntry>;

  return (
    typeof item.term === "string" &&
    typeof item.definition === "string" &&
    isGlossaryCategory(item.category) &&
    typeof item.slug === "string" &&
    Array.isArray(item.relatedTerms) &&
    item.relatedTerms.every((term) => typeof term === "string")
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function readGlossaryFile(): Promise<GlossaryEntry[]> {
  try {
    const raw = await fs.readFile(GLOSSARY_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isGlossaryEntry);
  } catch {
    return [];
  }
}

async function readSuggestionFile(): Promise<GlossarySuggestion[]> {
  try {
    const raw = await fs.readFile(SUGGESTIONS_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item) => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Partial<GlossarySuggestion>;
      return (
        typeof candidate.id === "string" &&
        typeof candidate.term === "string" &&
        typeof candidate.definition === "string" &&
        isGlossaryCategory(candidate.category) &&
        typeof candidate.slug === "string" &&
        typeof candidate.createdAt === "string" &&
        candidate.status === "pending"
      );
    });
  } catch {
    return [];
  }
}

async function writeSuggestionFile(suggestions: GlossarySuggestion[]): Promise<void> {
  await fs.writeFile(SUGGESTIONS_PATH, `${JSON.stringify(suggestions, null, 2)}\n`, "utf8");
}

export async function GET(request: NextRequest) {
  const allTerms = await readGlossaryFile();

  const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase() ?? "";
  const letterParam = request.nextUrl.searchParams.get("letter")?.trim().toUpperCase() ?? "";
  const letter = /^[A-Z]$/.test(letterParam) ? letterParam : "";

  const letters = Array.from(
    new Set(
      allTerms
        .map((entry) => entry.term.charAt(0).toUpperCase())
        .filter((char) => /^[A-Z]$/.test(char))
    )
  ).sort();

  const filteredTerms = allTerms
    .filter((entry) => {
      if (search) {
        const matchesSearch =
          entry.term.toLowerCase().includes(search) ||
          entry.definition.toLowerCase().includes(search) ||
          entry.category.toLowerCase().includes(search);

        if (!matchesSearch) return false;
      }

      if (letter) {
        return entry.term.charAt(0).toUpperCase() === letter;
      }

      return true;
    })
    .sort((a, b) => a.term.localeCompare(b.term));

  return NextResponse.json(
    {
      terms: filteredTerms,
      total: filteredTerms.length,
      letters,
      categories: VALID_CATEGORIES,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const term = typeof body.term === "string" ? body.term.trim() : "";
    const definition = typeof body.definition === "string" ? body.definition.trim() : "";
    const category = body.category;

    const errors: string[] = [];

    if (!term) errors.push("term is required");
    if (term.length > 100) errors.push("term must be 100 characters or less");

    if (!definition) errors.push("definition is required");
    if (definition.length > 1200) errors.push("definition must be 1200 characters or less");

    if (!isGlossaryCategory(category)) {
      errors.push(`category must be one of: ${VALID_CATEGORIES.join(", ")}`);
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const slug = slugify(term);
    if (!slug) {
      return NextResponse.json({ error: "Invalid term. Could not generate slug." }, { status: 400 });
    }

    const validatedCategory = category as GlossaryCategory;

    const [allTerms, suggestions] = await Promise.all([readGlossaryFile(), readSuggestionFile()]);

    const termExists = allTerms.some(
      (entry) => entry.slug === slug || entry.term.toLowerCase() === term.toLowerCase()
    );

    if (termExists) {
      return NextResponse.json({ error: "This term already exists in the glossary." }, { status: 409 });
    }

    const pendingExists = suggestions.some(
      (entry) => entry.slug === slug || entry.term.toLowerCase() === term.toLowerCase()
    );

    if (pendingExists) {
      return NextResponse.json(
        { error: "A suggestion for this term is already pending review." },
        { status: 409 }
      );
    }

    const suggestion: GlossarySuggestion = {
      id: `glossary_suggestion_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      term,
      definition,
      category: validatedCategory,
      slug,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    await writeSuggestionFile([...suggestions, suggestion]);

    return NextResponse.json(
      {
        success: true,
        message: "Thanks! Your term suggestion has been submitted for review.",
        suggestion,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}
