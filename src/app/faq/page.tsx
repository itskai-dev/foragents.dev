"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, ThumbsUp, ThumbsDown, MessageCircle, Mail } from "lucide-react";
import faqData from "@/data/faq.json";

type FeedbackState = Record<string, "up" | "down" | null>;

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>({});

  // Generate JSON-LD schema for FAQ
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: "FAQ — forAgents.dev",
    description: "Frequently asked questions about forAgents.dev, the central hub for AI agent development.",
    url: "https://foragents.dev/faq",
    mainEntity: faqData.categories.flatMap((category) =>
      category.questions.map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: q.answer,
        },
      }))
    ),
  };

  // Filter questions based on search query
  const getFilteredCategories = () => {
    if (!searchQuery.trim()) {
      return faqData.categories;
    }

    const query = searchQuery.toLowerCase();
    return faqData.categories
      .map((category) => ({
        ...category,
        questions: category.questions.filter(
          (q) =>
            q.question.toLowerCase().includes(query) ||
            q.answer.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.questions.length > 0);
  };

  const filteredCategories = getFilteredCategories();

  const handleFeedback = (questionId: string, type: "up" | "down") => {
    setFeedback((prev) => ({
      ...prev,
      [questionId]: prev[questionId] === type ? null : type,
    }));
  };

  const totalQuestions = faqData.categories.reduce(
    (sum, cat) => sum + cat.questions.length,
    0
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[300px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-foreground/80 mb-2">
            Everything you need to know about forAgents.dev
          </p>
          <p className="text-sm text-muted-foreground">
            {totalQuestions} questions across {faqData.categories.length} categories
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="relative max-w-5xl mx-auto px-4 -mt-8 mb-12">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-6 text-lg bg-[#0f0f0f] border-white/10 focus:border-[#06D6A0] rounded-lg"
          />
        </div>
        {searchQuery && (
          <p className="mt-3 text-sm text-muted-foreground">
            {filteredCategories.reduce((sum, cat) => sum + cat.questions.length, 0)}{" "}
            result(s) found
          </p>
        )}
      </section>

      {/* FAQ Content */}
      <section className="relative max-w-5xl mx-auto px-4 pb-12">
        {filteredCategories.length === 0 ? (
          <Card className="bg-[#0f0f0f] border-white/10 p-12 text-center">
            <p className="text-muted-foreground mb-4">
              No questions found matching &quot;{searchQuery}&quot;
            </p>
            <Button
              onClick={() => setSearchQuery("")}
              variant="outline"
              className="border-white/10 hover:bg-white/5"
            >
              Clear search
            </Button>
          </Card>
        ) : (
          <div className="space-y-12">
            {filteredCategories.map((category) => (
              <div key={category.id}>
                <h2 className="text-2xl font-bold mb-6 text-[#F8FAFC]">
                  {category.name}
                  <span className="ml-3 text-sm font-normal text-muted-foreground">
                    ({category.questions.length})
                  </span>
                </h2>

                <Card className="bg-[#0f0f0f] border-white/10">
                  <CardContent className="p-6">
                    <Accordion type="single" collapsible className="space-y-0">
                      {category.questions.map((question) => (
                        <AccordionItem
                          key={question.id}
                          value={question.id}
                          className="border-white/10"
                        >
                          <AccordionTrigger className="text-left hover:text-[#06D6A0] transition-colors">
                            <span className="font-semibold pr-4">
                              {question.question}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="text-muted-foreground leading-relaxed mb-4">
                              {question.answer}
                            </div>

                            {/* Feedback Section */}
                            <div className="flex items-center gap-4 pt-3 border-t border-white/5">
                              <span className="text-sm text-muted-foreground">
                                Was this helpful?
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleFeedback(question.id, "up")}
                                  className={`p-2 rounded-md transition-all ${
                                    feedback[question.id] === "up"
                                      ? "bg-[#06D6A0]/20 text-[#06D6A0]"
                                      : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                                  }`}
                                  aria-label="Thumbs up"
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleFeedback(question.id, "down")}
                                  className={`p-2 rounded-md transition-all ${
                                    feedback[question.id] === "down"
                                      ? "bg-red-500/20 text-red-400"
                                      : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                                  }`}
                                  aria-label="Thumbs down"
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="relative max-w-5xl mx-auto px-4 pb-16">
        <Card className="bg-gradient-to-br from-[#06D6A0]/10 to-transparent border-[#06D6A0]/20">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4 text-[#F8FAFC]">
              Still need help?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Can&apos;t find what you&apos;re looking for? Our community and support team
              are here to help you get the most out of forAgents.dev.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/community">
                <Button className="bg-[#06D6A0] hover:bg-[#06D6A0]/90 text-black font-medium gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Join Community
                </Button>
              </Link>
              <Link href="mailto:support@foragents.dev">
                <Button
                  variant="outline"
                  className="border-white/10 hover:bg-white/5 gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Contact Support
                </Button>
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-sm text-muted-foreground">
                Looking for detailed documentation?{" "}
                <Link
                  href="/docs/api"
                  className="text-[#06D6A0] hover:underline font-medium"
                >
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
