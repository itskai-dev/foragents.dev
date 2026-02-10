import { NextRequest, NextResponse } from "next/server";

import {
  isGlossaryCategory,
  readGlossaryTerms,
  slugifyGlossaryTerm,
  VALID_GLOSSARY_CATEGORIES,
  writeGlossaryTerms,
  type GlossaryCategory,
  type GlossaryTermRecord,
} from "@/lib/server/glossaryStore";

function normalizeCsvInput(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export async function GET(request: NextRequest) {
  const allTerms = await readGlossaryTerms();

  const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase() ?? "";
  const categoryParam = request.nextUrl.searchParams.get("category")?.trim() ?? "";
  const category = isGlossaryCategory(categoryParam) ? categoryParam : "";
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
      if (category && entry.category !== category) {
        return false;
      }

      if (search) {
        const haystack = [
          entry.term,
          entry.definition,
          entry.category,
          ...entry.relatedTerms,
          ...entry.tags,
        ]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(search)) {
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
      categories: VALID_GLOSSARY_CATEGORIES,
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
    const relatedTerms = normalizeCsvInput(body.relatedTerms);
    const tags = normalizeCsvInput(body.tags);

    const errors: string[] = [];

    if (!term) errors.push("term is required");
    if (term.length > 100) errors.push("term must be 100 characters or less");

    if (!definition) errors.push("definition is required");
    if (definition.length > 1200) errors.push("definition must be 1200 characters or less");

    if (!isGlossaryCategory(category)) {
      errors.push(`category must be one of: ${VALID_GLOSSARY_CATEGORIES.join(", ")}`);
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const slug = slugifyGlossaryTerm(term);
    if (!slug) {
      return NextResponse.json({ error: "Invalid term. Could not generate slug." }, { status: 400 });
    }

    const allTerms = await readGlossaryTerms();

    const termExists = allTerms.some(
      (entry) => entry.slug === slug || entry.term.toLowerCase() === term.toLowerCase()
    );

    if (termExists) {
      return NextResponse.json({ error: "This term already exists in the glossary." }, { status: 409 });
    }

    const now = new Date().toISOString();
    const createdTerm: GlossaryTermRecord = {
      id: `glossary-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      term,
      definition,
      category: category as GlossaryCategory,
      relatedTerms,
      tags,
      updatedAt: now,
      slug,
    };

    allTerms.unshift(createdTerm);
    await writeGlossaryTerms(allTerms);

    return NextResponse.json(
      {
        success: true,
        message: "Glossary term created.",
        term: createdTerm,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}
