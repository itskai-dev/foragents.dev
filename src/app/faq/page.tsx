/* eslint-disable react/no-unescaped-entities */
"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, MessageCircle, Mail, ThumbsUp, Loader2 } from "lucide-react";

type FaqCategory =
  | "getting-started"
  | "billing"
  | "technical"
  | "integrations"
  | "security"
  | "general";

type TabValue = "all" | FaqCategory;

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  helpful: number;
};

type FaqApiResponse = {
  faqs: FaqItem[];
  total: number;
  categories: FaqCategory[];
};

type AskFormState = {
  question: string;
  category: FaqCategory;
  email: string;
};

const FALLBACK_CATEGORIES: FaqCategory[] = [
  "getting-started",
  "billing",
  "technical",
  "integrations",
  "security",
  "general",
];

const CATEGORY_LABELS: Record<FaqCategory, string> = {
  "getting-started": "Getting Started",
  billing: "Billing",
  technical: "Technical",
  integrations: "Integrations",
  security: "Security",
  general: "General",
};

export default function FAQPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<TabValue>("all");
  const [faqData, setFaqData] = useState<FaqApiResponse>({
    faqs: [],
    total: 0,
    categories: FALLBACK_CATEGORIES,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [helpfulLoading, setHelpfulLoading] = useState<Record<string, boolean>>({});
  const [helpfulError, setHelpfulError] = useState<string | null>(null);
  const [askForm, setAskForm] = useState<AskFormState>({
    question: "",
    category: "general",
    email: "",
  });
  const [askStatus, setAskStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [askMessage, setAskMessage] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchFaqs = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const params = new URLSearchParams();
        if (debouncedSearch) {
          params.set("search", debouncedSearch);
        }
        if (activeCategory !== "all") {
          params.set("category", activeCategory);
        }

        const query = params.toString();
        const url = query ? `/api/faq?${query}` : "/api/faq";

        const response = await fetch(url, {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to load FAQs (${response.status})`);
        }

        const data = (await response.json()) as FaqApiResponse;
        setFaqData({
          faqs: Array.isArray(data.faqs) ? data.faqs : [],
          total: typeof data.total === "number" ? data.total : 0,
          categories:
            Array.isArray(data.categories) && data.categories.length > 0
              ? data.categories
              : FALLBACK_CATEGORIES,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setFetchError("Unable to load FAQs right now. Please try again.");
          setFaqData({
            faqs: [],
            total: 0,
            categories: FALLBACK_CATEGORIES,
          });
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void fetchFaqs();

    return () => controller.abort();
  }, [debouncedSearch, activeCategory]);

  const groupedFaqs = useMemo(() => {
    const groups = new Map<FaqCategory, FaqItem[]>();

    faqData.faqs.forEach((faq) => {
      const existing = groups.get(faq.category) ?? [];
      existing.push(faq);
      groups.set(faq.category, existing);
    });

    return groups;
  }, [faqData.faqs]);

  const orderedCategories = faqData.categories.length > 0 ? faqData.categories : FALLBACK_CATEGORIES;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: "FAQ — forAgents.dev",
    description: "Frequently asked questions about forAgents.dev.",
    url: "https://foragents.dev/faq",
    mainEntity: faqData.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const handleHelpful = async (id: string) => {
    setHelpfulError(null);
    setHelpfulLoading((prev) => ({ ...prev, [id]: true }));

    try {
      const response = await fetch(`/api/faq/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update helpful count.");
      }

      const data = (await response.json()) as { id?: string; helpful?: number };
      if (typeof data.id === "string" && typeof data.helpful === "number") {
        setFaqData((prev) => ({
          ...prev,
          faqs: prev.faqs.map((faq) =>
            faq.id === data.id ? { ...faq, helpful: data.helpful as number } : faq
          ),
        }));
      }
    } catch {
      setHelpfulError("Could not save your feedback. Please try again.");
    } finally {
      setHelpfulLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleAskQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setAskStatus("submitting");
    setAskMessage(null);

    try {
      const response = await fetch("/api/faq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: askForm.question,
          category: askForm.category,
          email: askForm.email || undefined,
        }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to submit question.");
      }

      setAskStatus("success");
      setAskMessage(payload.message ?? "Question submitted successfully.");
      setAskForm({ question: "", category: "general", email: "" });
    } catch (error) {
      setAskStatus("error");
      setAskMessage((error as Error).message);
    }
  };

  const renderFaqSection = (category: FaqCategory, questions: FaqItem[]) => (
    <div key={category}>
      <h2 className="text-2xl font-bold mb-6 text-[#F8FAFC]">
        {CATEGORY_LABELS[category]}
        <span className="ml-3 text-sm font-normal text-muted-foreground">({questions.length})</span>
      </h2>

      <Card className="bg-[#0f0f0f] border-white/10">
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="space-y-0">
            {questions.map((question) => (
              <AccordionItem key={question.id} value={question.id} className="border-white/10">
                <AccordionTrigger className="text-left hover:text-[#06D6A0] transition-colors">
                  <span className="font-semibold pr-4">{question.question}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-muted-foreground leading-relaxed mb-4">{question.answer}</div>

                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/5">
                    <Button
                      variant="outline"
                      className="border-white/10 hover:bg-white/5"
                      onClick={() => void handleHelpful(question.id)}
                      disabled={helpfulLoading[question.id]}
                    >
                      {helpfulLoading[question.id] ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ThumbsUp className="w-4 h-4 mr-2" />
                      )}
                      Was this helpful?
                    </Button>
                    <span className="text-sm text-muted-foreground">Helpful: {question.helpful}</span>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="relative overflow-hidden min-h-[300px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-foreground/80 mb-2">Everything you need to know about forAgents.dev</p>
          <p className="text-sm text-muted-foreground">
            {faqData.total} questions across {orderedCategories.length} categories
          </p>
        </div>
      </section>

      <section className="relative max-w-5xl mx-auto px-4 -mt-8 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search questions or answers..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-12 pr-4 py-6 text-lg bg-[#0f0f0f] border-white/10 focus:border-[#06D6A0] rounded-lg"
          />
        </div>

        {(debouncedSearch || activeCategory !== "all") && (
          <p className="mt-3 text-sm text-muted-foreground">{faqData.total} result(s) found</p>
        )}
      </section>

      <section className="relative max-w-5xl mx-auto px-4 mb-10">
        <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as TabValue)}>
          <TabsList className="w-full h-auto justify-start overflow-x-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            {orderedCategories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </section>

      <section className="relative max-w-5xl mx-auto px-4 pb-12">
        {isLoading ? (
          <Card className="bg-[#0f0f0f] border-white/10 p-12 text-center">
            <p className="text-muted-foreground">Loading FAQs...</p>
          </Card>
        ) : fetchError ? (
          <Card className="bg-[#0f0f0f] border-white/10 p-12 text-center">
            <p className="text-red-400 mb-4">{fetchError}</p>
            <Button
              variant="outline"
              className="border-white/10 hover:bg-white/5"
              onClick={() => {
                setSearchInput("");
                setDebouncedSearch("");
                setActiveCategory("all");
              }}
            >
              Retry
            </Button>
          </Card>
        ) : faqData.faqs.length === 0 ? (
          <Card className="bg-[#0f0f0f] border-white/10 p-12 text-center">
            <p className="text-muted-foreground mb-4">
              No questions found matching "{debouncedSearch || activeCategory}".
            </p>
            <Button
              onClick={() => {
                setSearchInput("");
                setActiveCategory("all");
              }}
              variant="outline"
              className="border-white/10 hover:bg-white/5"
            >
              Clear filters
            </Button>
          </Card>
        ) : (
          <div className="space-y-12">
            {activeCategory === "all"
              ? orderedCategories
                  .filter((category) => groupedFaqs.has(category))
                  .map((category) => renderFaqSection(category, groupedFaqs.get(category) ?? []))
              : renderFaqSection(activeCategory, groupedFaqs.get(activeCategory) ?? [])}
          </div>
        )}

        {helpfulError ? <p className="mt-4 text-sm text-red-400">{helpfulError}</p> : null}
      </section>

      <section className="relative max-w-5xl mx-auto px-4 pb-10">
        <Card className="bg-[#0f0f0f] border-white/10">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-2 text-[#F8FAFC]">Ask a Question</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Didn't find your answer? Submit your question and we'll review it for the FAQ.
            </p>

            <form onSubmit={handleAskQuestion} className="space-y-4">
              <div>
                <label htmlFor="faq-question" className="block text-sm mb-2 text-foreground">
                  Your question
                </label>
                <Textarea
                  id="faq-question"
                  value={askForm.question}
                  onChange={(event) =>
                    setAskForm((prev) => ({ ...prev, question: event.target.value }))
                  }
                  placeholder="What would you like to ask?"
                  required
                  minLength={10}
                  className="bg-[#0a0a0a] border-white/10"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="faq-category" className="block text-sm mb-2 text-foreground">
                    Category
                  </label>
                  <select
                    id="faq-category"
                    value={askForm.category}
                    onChange={(event) =>
                      setAskForm((prev) => ({ ...prev, category: event.target.value as FaqCategory }))
                    }
                    className="w-full h-10 rounded-md border border-white/10 bg-[#0a0a0a] px-3 text-sm"
                  >
                    {FALLBACK_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {CATEGORY_LABELS[category]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="faq-email" className="block text-sm mb-2 text-foreground">
                    Email (optional)
                  </label>
                  <Input
                    id="faq-email"
                    type="email"
                    value={askForm.email}
                    onChange={(event) =>
                      setAskForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                    placeholder="you@company.com"
                    className="bg-[#0a0a0a] border-white/10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="bg-[#06D6A0] hover:bg-[#06D6A0]/90 text-black font-medium"
                disabled={askStatus === "submitting"}
              >
                {askStatus === "submitting" ? "Submitting..." : "Submit Question"}
              </Button>
            </form>

            {askMessage ? (
              <p className={`mt-4 text-sm ${askStatus === "success" ? "text-[#06D6A0]" : "text-red-400"}`}>
                {askMessage}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="relative max-w-5xl mx-auto px-4 pb-16">
        <Card className="bg-gradient-to-br from-[#06D6A0]/10 to-transparent border-[#06D6A0]/20">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4 text-[#F8FAFC]">Still need help?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Can't find what you're looking for? Our community and support team are here to help you get
              the most out of forAgents.dev.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/community">
                <Button className="bg-[#06D6A0] hover:bg-[#06D6A0]/90 text-black font-medium gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Join Community
                </Button>
              </Link>
              <Link href="mailto:support@foragents.dev">
                <Button variant="outline" className="border-white/10 hover:bg-white/5 gap-2">
                  <Mail className="w-4 h-4" />
                  Contact Support
                </Button>
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-sm text-muted-foreground">
                Looking for detailed documentation?{" "}
                <Link href="/docs/api" className="text-[#06D6A0] hover:underline font-medium">
                  Check out our API docs
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
