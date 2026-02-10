import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

const FAQ_CATEGORIES = ["getting-started", "skills", "mcp", "pricing", "agents"] as const;
type FaqCategory = (typeof FAQ_CATEGORIES)[number];

type FaqItem = {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
};

type FaqFile = {
  faqs: FaqItem[];
};

async function readFaqFile(): Promise<FaqItem[]> {
  const faqPath = path.join(process.cwd(), "data", "faq.json");
  const raw = await fs.readFile(faqPath, "utf8");
  const parsed = JSON.parse(raw) as FaqFile;

  if (!parsed || !Array.isArray(parsed.faqs)) {
    return [];
  }

  return parsed.faqs.filter(
    (faq): faq is FaqItem =>
      typeof faq?.id === "string" &&
      typeof faq?.question === "string" &&
      typeof faq?.answer === "string" &&
      typeof faq?.category === "string" &&
      FAQ_CATEGORIES.includes(faq.category as FaqCategory)
  );
}

export async function GET(request: NextRequest) {
  try {
    const allFaqs = await readFaqFile();

    const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase() ?? "";
    const categoryParam = request.nextUrl.searchParams.get("category")?.trim().toLowerCase() ?? "";

    if (categoryParam && !FAQ_CATEGORIES.includes(categoryParam as FaqCategory)) {
      return NextResponse.json(
        {
          error: "Invalid category",
          allowed: FAQ_CATEGORIES,
        },
        { status: 400 }
      );
    }

    let filtered = allFaqs;

    if (categoryParam) {
      filtered = filtered.filter((faq) => faq.category === categoryParam);
    }

    if (search) {
      filtered = filtered.filter((faq) => {
        const haystack = `${faq.question} ${faq.answer}`.toLowerCase();
        return haystack.includes(search);
      });
    }

    return NextResponse.json(
      {
        faqs: filtered,
        total: filtered.length,
        categories: FAQ_CATEGORIES,
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
        faqs: [],
        total: 0,
        categories: FAQ_CATEGORIES,
      },
      { status: 200 }
    );
  }
}
