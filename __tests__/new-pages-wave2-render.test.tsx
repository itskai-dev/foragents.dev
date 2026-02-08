/** @jest-environment jsdom */

import React from "react";
import { render } from "@testing-library/react";

jest.setTimeout(10_000);

// ---- Browser API polyfills commonly used by UI libs ----
class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-expect-error - polyfill for tests
global.ResizeObserver = global.ResizeObserver ?? NoopObserver;
// @ts-expect-error - polyfill for tests
global.IntersectionObserver = global.IntersectionObserver ?? NoopObserver;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value:
    window.matchMedia ??
    ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })),
});

// ---- Next.js shims ----

type LinkProps = {
  href: string;
  children?: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

jest.mock("next/link", () => {
  const LinkMock = ({ href, children, ...props }: LinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  LinkMock.displayName = "Link";
  return LinkMock;
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), prefetch: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => new URLSearchParams("agentId=test-agent"),
  usePathname: () => "/",
  useParams: () => ({}),
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

jest.mock("next/headers", () => ({
  headers: () => new Map([["host", "localhost:3000"], ["x-forwarded-proto", "http"]]),
  cookies: () => ({ get: () => undefined, getAll: () => [] }),
}));

// ---- Page-specific component + data mocks ----

jest.mock("@/app/stack/stack-builder", () => ({
  StackBuilder: () => <div data-testid="stack-builder" />,
}));

jest.mock("@/app/inbox/inbox-client", () => ({
  InboxClient: () => <div data-testid="inbox-client" />,
}));

jest.mock("@/app/trace/trace-client", () => ({
  TraceClient: () => <div data-testid="trace-client" />,
}));

jest.mock("@/lib/data", () => ({
  getSkills: () => [
    { slug: "test-skill", name: "Test Skill", tags: ["test"] },
    { slug: "another-skill", name: "Another Skill", tags: [] },
  ],
}));

jest.mock("@/lib/server/canaryStore", () => ({
  readCanaryResults: async () => [],
}));

jest.mock("@/lib/agentHealth", () => ({
  readHealthEvents: async () => [],
  computeAgentHealthMetrics: () => ({
    generatedAt: Date.now(),
    totals: {
      activeSessions: 0,
      stalledSessions: 0,
      potentiallyStuckSessions: 0,
      failures24h: 0,
    },
    successRate24h: {
      rate: null,
      success: 0,
      total: 0,
    },
    activeSessions: [],
    stalledOrStuckSessions: [],
    recentFailures: [],
    averageRunDurationByAgentType: [],
  }),
}));

async function renderPageModule(importPath: string, props: Record<string, unknown> = {}) {
  const mod: Record<string, unknown> = await import(importPath);
  const Page = mod.default;

  expect(Page).toBeTruthy();

  // Next.js server components are often `async function`.
  if (Page?.constructor?.name === "AsyncFunction") {
    const element = await (Page as (p: Record<string, unknown>) => Promise<React.ReactElement>)(props);
    const { container } = render(element);
    expect(container).toBeInTheDocument();
    return;
  }

  const { container } = render(React.createElement(Page as React.ComponentType, props));
  expect(container).toBeInTheDocument();
}

describe("Wave 2 new pages render smoke tests", () => {
  test("/stack renders without crashing", async () => {
    await renderPageModule("@/app/stack/page", {
      searchParams: Promise.resolve({ title: "My Stack", skills: "test-skill,another-skill" }),
    });
  });

  test("/inbox renders without crashing", async () => {
    await renderPageModule("@/app/inbox/page");
  });

  test("/trace renders without crashing", async () => {
    await renderPageModule("@/app/trace/page", {
      searchParams: Promise.resolve({ id: "demo" }),
    });
  });

  test("/canary renders without crashing", async () => {
    await renderPageModule("@/app/canary/page");
  });

  test("/health renders without crashing", async () => {
    await renderPageModule("@/app/health/page");
  });
});
