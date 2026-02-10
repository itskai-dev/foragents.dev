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

type FaqData = {
  faqs: FaqItem[];
  submissions?: unknown[];
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

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const faqId = typeof id === "string" ? id.trim() : "";

  if (!faqId) {
    return NextResponse.json({ error: "FAQ id is required." }, { status: 400 });
  }

  const data = await readFaqData();
  const index = data.faqs.findIndex((faq) => faq.id === faqId);

  if (index === -1) {
    return NextResponse.json({ error: "FAQ not found." }, { status: 404 });
  }

  const nextFaq = {
    ...data.faqs[index],
    helpful: data.faqs[index].helpful + 1,
  };

  data.faqs[index] = nextFaq;
  await writeFaqData(data);

  return NextResponse.json({
    success: true,
    id: nextFaq.id,
    helpful: nextFaq.helpful,
  });
}
