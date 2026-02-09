import type { Metadata } from "next";
import { TestingClient } from "./testing-client";
import rawTestData from "@/data/test-templates.json";

export const dynamic = "force-static";

// Type assertion to ensure proper typing
const testData = rawTestData as {
  categories: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
  }>;
  templates: Array<{
    id: string;
    name: string;
    category: string;
    description: string;
    difficulty: string;
    estimatedDuration: string;
    steps: string[];
    assertions: string[];
    tags: string[];
  }>;
  testRuns: Array<{
    id: string;
    timestamp: string;
    config: {
      model: string;
      timeout: number;
      retries: number;
      environment: string;
    };
    results: {
      total: number;
      passed: number;
      failed: number;
      skipped: number;
      duration: number;
      coverage: number;
    };
    tests: Array<{
      templateId: string;
      status: "passed" | "failed" | "skipped";
      duration: number;
    }>;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const title = "Agent Testing Framework — forAgents.dev";
  const description =
    "Comprehensive testing suite for agents: unit tests, integration tests, end-to-end workflows, and stress testing with pre-built templates and detailed analytics.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: "https://foragents.dev/testing",
      siteName: "forAgents.dev",
      type: "website",
      images: [
        {
          url: "/api/og/testing",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/api/og/testing"],
    },
  };
}

export default function TestingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <TestingClient data={testData} />
    </div>
  );
}
