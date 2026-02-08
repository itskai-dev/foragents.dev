"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";

type Term = {
  id: string;
  title: string;
  definition: string;
  related?: Array<{ label: string; href: string }>;
};

const glossaryTerms: Term[] = [
  {
    id: "agent",
    title: "Agent",
    definition:
      "An autonomous AI system capable of perceiving its environment, making decisions, and taking actions to achieve specific goals. Agents can interact with tools, APIs, and other systems to complete complex tasks without constant human supervision.",
    related: [
      { label: "Autonomy", href: "#autonomy" },
      { label: "Tool Use", href: "#tool-use" },
    ],
  },
  {
    id: "autonomy",
    title: "Autonomy",
    definition:
      "The ability of an AI agent to operate independently and make decisions without direct human intervention. Autonomous systems can adapt to changing conditions, learn from experience, and execute multi-step workflows.",
    related: [
      { label: "Agent", href: "#agent" },
      { label: "Orchestration", href: "#orchestration" },
    ],
  },
  {
    id: "chain-of-thought",
    title: "Chain-of-Thought",
    definition:
      "A prompting technique that encourages language models to break down complex reasoning into intermediate steps. This approach improves accuracy on tasks requiring multi-step logic by making the model&apos;s reasoning process explicit and traceable.",
    related: [
      { label: "Prompt", href: "#prompt" },
      { label: "Inference", href: "#inference" },
    ],
  },
  {
    id: "context-window",
    title: "Context Window",
    definition:
      "The maximum amount of text (measured in tokens) that a language model can process in a single request. This includes both the input prompt and the generated response, determining how much information the model can reference at once.",
    related: [
      { label: "Token", href: "#token" },
      { label: "LLM", href: "#llm" },
    ],
  },
  {
    id: "embedding",
    title: "Embedding",
    definition:
      "A numerical vector representation of text, images, or other data that captures semantic meaning in a high-dimensional space. Embeddings enable similarity comparisons and are fundamental to retrieval systems and vector databases.",
    related: [
      { label: "Vector Database", href: "#vector-database" },
      { label: "RAG", href: "#rag" },
    ],
  },
  {
    id: "fine-tuning",
    title: "Fine-tuning",
    definition:
      "The process of taking a pre-trained language model and further training it on a specific dataset to specialize its behavior. Fine-tuning adapts the model&apos;s weights to perform better on particular tasks or domains while retaining general knowledge.",
    related: [
      { label: "LLM", href: "#llm" },
      { label: "Grounding", href: "#grounding" },
    ],
  },
  {
    id: "grounding",
    title: "Grounding",
    definition:
      "The practice of connecting AI model outputs to factual, verifiable sources or real-world data. Grounding helps reduce hallucinations by anchoring responses in retrieved documents, databases, or external knowledge sources.",
    related: [
      { label: "RAG", href: "#rag" },
      { label: "Hallucination", href: "#hallucination" },
    ],
  },
  {
    id: "hallucination",
    title: "Hallucination",
    definition:
      "When a language model generates plausible-sounding but factually incorrect or nonsensical information. Hallucinations occur because models predict likely text continuations rather than retrieving verified facts, making grounding and verification critical.",
    related: [
      { label: "Grounding", href: "#grounding" },
      { label: "RAG", href: "#rag" },
    ],
  },
  {
    id: "inference",
    title: "Inference",
    definition:
      "The process of using a trained AI model to generate predictions or responses based on new input. During inference, the model applies its learned patterns to produce outputs without updating its weights, unlike during training.",
    related: [
      { label: "LLM", href: "#llm" },
      { label: "Chain-of-Thought", href: "#chain-of-thought" },
    ],
  },
  {
    id: "json-schema",
    title: "JSON Schema",
    definition:
      "A vocabulary for annotating and validating JSON documents, often used to define structured outputs for AI agents. JSON Schema ensures that model responses conform to expected formats, enabling reliable integration with downstream systems.",
    related: [
      { label: "Tool Use", href: "#tool-use" },
      { label: "Skill", href: "#skill" },
    ],
  },
  {
    id: "kit",
    title: "Kit",
    definition:
      "A packaged collection of tools, prompts, and configurations designed to enable specific agent capabilities. Kits provide reusable components that agents can install and use to extend their functionality without building from scratch.",
    related: [
      { label: "Skill", href: "#skill" },
      { label: "MCP", href: "#mcp" },
    ],
  },
  {
    id: "llm",
    title: "LLM",
    definition:
      "Large Language Model — a neural network trained on vast amounts of text data to understand and generate human-like language. LLMs power modern AI agents and assistants by providing natural language understanding and generation capabilities.",
    related: [
      { label: "Neural Network", href: "#neural-network" },
      { label: "Token", href: "#token" },
    ],
  },
  {
    id: "mcp",
    title: "MCP",
    definition:
      "Model Context Protocol — a standardized interface for connecting AI models with external data sources and tools. MCP enables agents to access context beyond their training data through a consistent, interoperable protocol.",
    related: [
      { label: "Kit", href: "#kit" },
      { label: "Tool Use", href: "#tool-use" },
    ],
  },
  {
    id: "neural-network",
    title: "Neural Network",
    definition:
      "A computational model inspired by biological neurons, consisting of interconnected layers of nodes that process information. Neural networks learn patterns from data through training and form the foundation of modern deep learning systems.",
    related: [
      { label: "LLM", href: "#llm" },
      { label: "Fine-tuning", href: "#fine-tuning" },
    ],
  },
  {
    id: "orchestration",
    title: "Orchestration",
    definition:
      "The coordination of multiple agents, models, or tools to accomplish complex tasks. Orchestration involves managing workflows, routing requests, handling failures, and combining outputs from different components into cohesive results.",
    related: [
      { label: "Agent", href: "#agent" },
      { label: "Autonomy", href: "#autonomy" },
    ],
  },
  {
    id: "prompt",
    title: "Prompt",
    definition:
      "The input text or instructions provided to a language model to elicit a desired response. Effective prompting is crucial for agent performance, with techniques ranging from simple instructions to complex few-shot examples and chain-of-thought reasoning.",
    related: [
      { label: "Chain-of-Thought", href: "#chain-of-thought" },
      { label: "LLM", href: "#llm" },
    ],
  },
  {
    id: "rag",
    title: "RAG",
    definition:
      "Retrieval-Augmented Generation — a technique that combines information retrieval with language generation. RAG systems retrieve relevant documents from a knowledge base and use them to ground model outputs, reducing hallucinations and enabling access to current information.",
    related: [
      { label: "Embedding", href: "#embedding" },
      { label: "Vector Database", href: "#vector-database" },
      { label: "Grounding", href: "#grounding" },
    ],
  },
  {
    id: "skill",
    title: "Skill",
    definition:
      "A discrete capability or function that an agent can perform, often implemented as a tool, API integration, or specialized module. Skills are composable building blocks that enable agents to handle diverse tasks from web search to code execution.",
    related: [
      { label: "Kit", href: "#kit" },
      { label: "Tool Use", href: "#tool-use" },
    ],
  },
  {
    id: "token",
    title: "Token",
    definition:
      "The basic unit of text processing in language models, roughly corresponding to a word or word fragment. Models process input and generate output as sequences of tokens, and token limits define the context window size.",
    related: [
      { label: "Context Window", href: "#context-window" },
      { label: "LLM", href: "#llm" },
    ],
  },
  {
    id: "tool-use",
    title: "Tool Use",
    definition:
      "The ability of AI agents to invoke external functions, APIs, or services to accomplish tasks beyond language generation. Tool use enables agents to take actions like searching databases, executing code, sending messages, or controlling software.",
    related: [
      { label: "Agent", href: "#agent" },
      { label: "MCP", href: "#mcp" },
      { label: "Skill", href: "#skill" },
    ],
  },
  {
    id: "vector-database",
    title: "Vector Database",
    definition:
      "A specialized database optimized for storing and querying high-dimensional vector embeddings. Vector databases enable fast similarity search over embedded documents, images, or other data, powering retrieval systems and RAG implementations.",
    related: [
      { label: "Embedding", href: "#embedding" },
      { label: "RAG", href: "#rag" },
    ],
  },
];

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Group terms alphabetically
  const groupedTerms = useMemo(() => {
    const filtered = glossaryTerms.filter(
      (term) =>
        term.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const grouped: Record<string, Term[]> = {};
    filtered.forEach((term) => {
      const firstLetter = term.title[0].toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(term);
    });

    return grouped;
  }, [searchQuery]);

  const availableLetters = Object.keys(groupedTerms).sort();
  const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-[#0a0a0a]/80 relative">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-gray-400 font-mono">
              forAgents.dev
            </span>
          </Link>
          <MobileNav />
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h1
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ color: "#06D6A0" }}
        >
          📖 AI Agent Glossary
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Essential terminology for building and understanding AI agents
        </p>

        {/* Search Input */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#06D6A0] focus:ring-1 focus:ring-[#06D6A0] transition-colors"
          />
        </div>

        {/* Alphabetical Navigation */}
        <div className="mb-12 pb-6 border-b border-white/10">
          <div className="flex flex-wrap gap-2 justify-center">
            {allLetters.map((letter) => {
              const isAvailable = availableLetters.includes(letter);
              return (
                <a
                  key={letter}
                  href={isAvailable ? `#letter-${letter}` : undefined}
                  className={`w-8 h-8 flex items-center justify-center rounded font-semibold text-sm transition-colors ${
                    isAvailable
                      ? "bg-[#06D6A0]/10 text-[#06D6A0] hover:bg-[#06D6A0]/20 border border-[#06D6A0]/30 cursor-pointer"
                      : "bg-white/5 text-gray-600 cursor-not-allowed"
                  }`}
                  onClick={(e) => {
                    if (!isAvailable) {
                      e.preventDefault();
                    }
                  }}
                >
                  {letter}
                </a>
              );
            })}
          </div>
        </div>

        {/* Terms */}
        <div className="space-y-12">
          {availableLetters.map((letter) => (
            <div key={letter} id={`letter-${letter}`} className="scroll-mt-24">
              <h2
                className="text-3xl font-bold mb-6 pb-2 border-b border-white/10"
                style={{ color: "#06D6A0" }}
              >
                {letter}
              </h2>
              <div className="space-y-6">
                {groupedTerms[letter].map((term) => (
                  <div
                    key={term.id}
                    id={term.id}
                    className="scroll-mt-24 bg-white/5 border border-white/10 rounded-lg p-6 hover:border-[#06D6A0]/30 transition-colors"
                  >
                    <h3 className="text-xl font-bold mb-3 text-white">
                      {term.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      {term.definition}
                    </p>
                    {term.related && term.related.length > 0 && (
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-gray-500">Related:</span>
                        {term.related.map((rel, idx) => (
                          <a
                            key={idx}
                            href={rel.href}
                            className="text-sm px-3 py-1 rounded-full bg-[#06D6A0]/10 text-[#06D6A0] border border-[#06D6A0]/30 hover:bg-[#06D6A0]/20 transition-colors"
                          >
                            {rel.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {availableLetters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              No terms found matching &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 text-[#06D6A0] hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Back to Top */}
        {availableLetters.length > 0 && (
          <div className="mt-12 text-center">
            <a
              href="#"
              className="inline-flex items-center gap-2 text-[#06D6A0] hover:underline"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              Back to top
            </a>
          </div>
        )}
      </section>

    </div>
  );
}
