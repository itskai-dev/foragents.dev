"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface GlossaryEntry {
  id: string;
  term: string;
  definition: string;
  relatedTerms: string[];
  seeAlso: string[];
}

interface GlossaryResponse {
  terms: GlossaryEntry[];
  total: number;
  letters: string[];
}

export default function GlossaryPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [terms, setTerms] = useState<GlossaryEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Agent Terminology Glossary — forAgents.dev",
    description:
      "Comprehensive glossary of AI agent terms, protocols, and concepts. From Agent to Zero-Trust, learn the language of autonomous AI development.",
    url: "https://foragents.dev/glossary",
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchGlossary = async () => {
      setIsLoading(true);

      try {
        const params = new URLSearchParams();

        if (debouncedSearch) {
          params.set("search", debouncedSearch);
        }

        if (selectedLetter) {
          params.set("letter", selectedLetter);
        }

        const query = params.toString();
        const response = await fetch(`/api/glossary${query ? `?${query}` : ""}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch glossary terms");
        }

        const data = (await response.json()) as GlossaryResponse;
        setTerms(Array.isArray(data.terms) ? data.terms : []);
        setTotal(typeof data.total === "number" ? data.total : 0);
        setAvailableLetters(Array.isArray(data.letters) ? data.letters : []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setTerms([]);
          setTotal(0);
          setAvailableLetters([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void fetchGlossary();

    return () => controller.abort();
  }, [debouncedSearch, selectedLetter]);

  const groupedEntries = useMemo(() => {
    const groups: Record<string, GlossaryEntry[]> = {};

    for (const entry of terms) {
      const letter = entry.term.charAt(0).toUpperCase();
      if (!groups[letter]) {
        groups[letter] = [];
      }
      groups[letter].push(entry);
    }

    return Object.fromEntries(
      Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    ) as Record<string, GlossaryEntry[]>;
  }, [terms]);

  const termMap = useMemo(() => {
    const map = new Map<string, GlossaryEntry>();

    for (const entry of terms) {
      map.set(entry.term.toLowerCase(), entry);
    }

    return map;
  }, [terms]);

  const findEntryByTerm = (term: string) => termMap.get(term.toLowerCase());

  const handleLetterClick = (letter: string) => {
    if (selectedLetter === letter) {
      setSelectedLetter(null);
      return;
    }

    setSelectedLetter(letter);

    setTimeout(() => {
      const element = document.getElementById(`letter-${letter}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 120);
  };

  const clearFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setSelectedLetter(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="relative">
          <div className="absolute inset-0 -z-10 opacity-30">
            <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#06D6A0]/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-purple/20 rounded-full blur-[100px]" />
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              📖 Agent Terminology
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-2">
              Your comprehensive guide to AI agent concepts and protocols
            </p>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              From Agent to Zero-Trust, master the vocabulary of autonomous AI development
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search terms or definitions..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full px-5 py-3 pl-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#06D6A0]/50 focus:ring-1 focus:ring-[#06D6A0]/50 transition-all"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {(debouncedSearch || selectedLetter || isLoading) && (
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {isLoading
                    ? "Loading terms..."
                    : `${total} ${total === 1 ? "term" : "terms"} found${selectedLetter ? ` for "${selectedLetter}"` : ""}`}
                </span>
                {(debouncedSearch || selectedLetter) && (
                  <button
                    onClick={clearFilters}
                    className="text-[#06D6A0] hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-sm border-y border-white/10 py-4 -mx-4 px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {alphabet.map((letter) => {
                  const isAvailable = availableLetters.includes(letter);
                  const isSelected = selectedLetter === letter;

                  return (
                    <button
                      key={letter}
                      onClick={() => isAvailable && handleLetterClick(letter)}
                      disabled={!isAvailable}
                      className={`w-8 h-8 flex items-center justify-center rounded font-semibold text-sm transition-all ${
                        isSelected
                          ? "bg-[#06D6A0] text-black"
                          : isAvailable
                          ? "bg-white/5 text-white hover:bg-white/10 hover:text-[#06D6A0]"
                          : "bg-transparent text-gray-700 cursor-not-allowed"
                      }`}
                      aria-label={`Filter by letter ${letter}`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-16">
        {!isLoading && terms.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No terms found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search or browse all terms
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-[#06D6A0] text-black font-semibold rounded-lg hover:brightness-110 transition-all"
            >
              Show all terms
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedEntries).map(([letter, entries]) => (
              <div key={letter} id={`letter-${letter}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#06D6A0]/10 border border-[#06D6A0]/30">
                    <span className="text-2xl font-bold text-[#06D6A0]">{letter}</span>
                  </div>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <div className="space-y-6">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      id={entry.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#06D6A0]/30 transition-all scroll-mt-32"
                    >
                      <h3 className="text-2xl font-bold text-white mb-3">
                        {entry.term}
                      </h3>

                      <p className="text-gray-300 leading-relaxed mb-4">
                        {entry.definition}
                      </p>

                      {entry.relatedTerms.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-gray-500 font-semibold">
                              Related:
                            </span>
                            {entry.relatedTerms.map((term, index) => {
                              const relatedEntry = findEntryByTerm(term);
                              return relatedEntry ? (
                                <a
                                  key={`${entry.id}-related-${index}`}
                                  href={`#${relatedEntry.id}`}
                                  className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-gray-400 hover:text-[#06D6A0] hover:border-[#06D6A0]/30 transition-all"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const element = document.getElementById(relatedEntry.id);
                                    if (element) {
                                      element.scrollIntoView({ behavior: "smooth", block: "center" });
                                      element.classList.add("ring-2", "ring-[#06D6A0]/50");
                                      setTimeout(() => {
                                        element.classList.remove("ring-2", "ring-[#06D6A0]/50");
                                      }, 1500);
                                    }
                                  }}
                                >
                                  {term}
                                </a>
                              ) : (
                                <span
                                  key={`${entry.id}-related-${index}`}
                                  className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-gray-400"
                                >
                                  {term}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {entry.seeAlso.length > 0 && (
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-gray-500 font-semibold">
                              See also:
                            </span>
                            {entry.seeAlso.map((term, index) => {
                              const relatedEntry = findEntryByTerm(term);
                              return relatedEntry ? (
                                <a
                                  key={`${entry.id}-see-${index}`}
                                  href={`#${relatedEntry.id}`}
                                  className="px-2 py-1 text-xs bg-[#06D6A0]/10 border border-[#06D6A0]/30 rounded text-[#06D6A0] hover:bg-[#06D6A0]/20 transition-all"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const element = document.getElementById(relatedEntry.id);
                                    if (element) {
                                      element.scrollIntoView({ behavior: "smooth", block: "center" });
                                      element.classList.add("ring-2", "ring-[#06D6A0]/50");
                                      setTimeout(() => {
                                        element.classList.remove("ring-2", "ring-[#06D6A0]/50");
                                      }, 1500);
                                    }
                                  }}
                                >
                                  {term}
                                </a>
                              ) : (
                                <span
                                  key={`${entry.id}-see-${index}`}
                                  className="px-2 py-1 text-xs bg-[#06D6A0]/10 border border-[#06D6A0]/30 rounded text-[#06D6A0]"
                                >
                                  {term}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/10 to-purple/10 p-8 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/20 rounded-full blur-[60px]" />

          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to Build?
            </h2>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              Now that you know the terminology, explore skills and start building your own agents
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/skills"
                className="px-6 py-3 bg-[#06D6A0] text-black font-semibold rounded-lg hover:brightness-110 transition-all"
              >
                Browse Skills →
              </Link>
              <Link
                href="/learn"
                className="px-6 py-3 border border-[#06D6A0] text-[#06D6A0] font-semibold rounded-lg hover:bg-[#06D6A0]/10 transition-all"
              >
                Start Learning
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
