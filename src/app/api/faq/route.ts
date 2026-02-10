import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

const FAQ_PATH = path.join(process.cwd(), "data", "faq.json");

const FAQ_CATEGORIES = [
  "getting-started",
  "billing",
  "technical",
  "integrations",
  "security",
  "general",
] as const;

type FaqCategory = (typeof FAQ_CATEGORIES)[number];

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  helpful: number;
};

type FaqSubmission = {
  id: string;
  question: string;
  category: FaqCategory;
  email?: string;
  createdAt: string;
};

type FaqData = {
  faqs: FaqItem[];
  submissions?: FaqSubmission[];
};

function isCategory(value: string): value is FaqCategory {
  return FAQ_CATEGORIES.includes(value as FaqCategory);
}

function normalizeFaq(data: unknown): FaqItem[] {
  if (!data || typeof data !== "object" || !Array.isArray((data as FaqData).faqs)) {
    return [];
  }

  return (data as FaqData).faqs.filter(
    (faq): faq is FaqItem =>
      typeof faq?.id === "string" &&
      typeof faq?.question === "string" &&
      typeof faq?.answer === "string" &&
      typeof faq?.category === "string" &&
      isCategory(faq.category) &&
      typeof faq?.helpful === "number"
  );
}

async function readFaqData(): Promise<FaqData> {
  try {
    const raw = await fs.readFile(FAQ_PATH, "utf8");
    const parsed = JSON.parse(raw) as FaqData;

    return {
      faqs: normalizeFaq(parsed),
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
    };
  } catch {
    return { faqs: [], submissions: [] };
  }
}

async function writeFaqData(data: FaqData): Promise<void> {
  await fs.writeFile(FAQ_PATH, JSON.stringify(data, null, 2));
}

export async function GET(request: NextRequest) {
  const categoryParam = request.nextUrl.searchParams.get("category")?.trim().toLowerCase() ?? "";
  const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase() ?? "";

  if (categoryParam && !isCategory(categoryParam)) {
    return NextResponse.json(
      {
        error: "Invalid category",
        allowed: FAQ_CATEGORIES,
      },
      { status: 400 }
    );
  }

  const data = await readFaqData();
  let faqs = data.faqs;

  if (categoryParam) {
    faqs = faqs.filter((faq) => faq.category === categoryParam);
  }

  if (search) {
    faqs = faqs.filter((faq) => {
      const haystack = `${faq.question} ${faq.answer}`.toLowerCase();
      return haystack.includes(search);
    });
  }

  return NextResponse.json(
    {
      faqs,
      total: faqs.length,
      categories: FAQ_CATEGORIES,
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
    const body = (await request.json()) as {
      question?: unknown;
      category?: unknown;
      email?: unknown;
    };

    const question = typeof body.question === "string" ? body.question.trim() : "";
    const categoryRaw = typeof body.category === "string" ? body.category.trim().toLowerCase() : "";
    const emailRaw = typeof body.email === "string" ? body.email.trim() : "";

    if (!question || question.length < 10) {
      return NextResponse.json(
        { error: "Question is required and must be at least 10 characters." },
        { status: 400 }
      );
    }

    if (!categoryRaw || !isCategory(categoryRaw)) {
      return NextResponse.json(
        { error: "Valid category is required.", allowed: FAQ_CATEGORIES },
        { status: 400 }
      );
    }

    if (emailRaw && !/^\S+@\S+\.\S+$/.test(emailRaw)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    const data = await readFaqData();

    const submission: FaqSubmission = {
      id: `question_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      question,
      category: categoryRaw,
      email: emailRaw || undefined,
      createdAt: new Date().toISOString(),
    };

    data.submissions = [...(data.submissions ?? []), submission];
    await writeFaqData(data);

    return NextResponse.json(
      {
        success: true,
        message: "Question submitted successfully.",
        submission,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}
