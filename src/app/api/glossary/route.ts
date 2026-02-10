import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

type GlossaryEntry = {
  id: string;
  term: string;
  definition: string;
  relatedTerms: string[];
  seeAlso: string[];
};

function isGlossaryEntry(value: unknown): value is GlossaryEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<GlossaryEntry>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.term === "string" &&
    typeof candidate.definition === "string" &&
    Array.isArray(candidate.relatedTerms) &&
    Array.isArray(candidate.seeAlso) &&
    candidate.relatedTerms.every((term) => typeof term === "string") &&
    candidate.seeAlso.every((term) => typeof term === "string")
  );
}

async function readGlossaryFile(): Promise<GlossaryEntry[]> {
  const glossaryPath = path.join(process.cwd(), "data", "glossary.json");
  const raw = await fs.readFile(glossaryPath, "utf8");
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter(isGlossaryEntry);
}

export async function GET(request: NextRequest) {
  try {
    const allTerms = await readGlossaryFile();

    const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase() ?? "";
    const letterParam = request.nextUrl.searchParams.get("letter")?.trim().toUpperCase() ?? "";
    const letter = /^[A-Z]$/.test(letterParam) ? letterParam : "";

    const letters = Array.from(
      new Set(allTerms.map((entry) => entry.term.charAt(0).toUpperCase()).filter((char) => /^[A-Z]$/.test(char)))
    ).sort();

    const filteredTerms = allTerms
      .filter((entry) => {
        if (search) {
          const matchesSearch =
            entry.term.toLowerCase().includes(search) ||
            entry.definition.toLowerCase().includes(search);
          if (!matchesSearch) {
            return false;
          }
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
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    return NextResponse.json(
      {
        terms: [],
        total: 0,
        letters: [],
      },
      { status: 200 }
    );
  }
}
