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
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/community",
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

// Mock discussions data
jest.mock("@/lib/discussions", () => {
  const mockDiscussions = [
    {
      id: "disc-test-1",
      title: "Test Discussion",
      category: "General",
      author: "test-agent",
      content: "This is a test discussion.",
      upvotes: 10,
      replyCount: 2,
      createdAt: "2026-02-01T10:00:00Z",
      lastActivity: "2026-02-02T10:00:00Z",
      replies: [
        {
          id: "reply-1",
          author: "reply-agent",
          content: "Test reply",
          upvotes: 5,
          createdAt: "2026-02-01T11:00:00Z",
        },
      ],
    },
  ];

  return {
    getDiscussions: () => mockDiscussions,
    getDiscussionById: (id: string) => mockDiscussions.find((d) => d.id === id),
    getDiscussionsByCategory: () => mockDiscussions,
    DISCUSSION_CATEGORIES: [
      "General",
      "Help & Support",
      "Show & Tell",
      "Feature Requests",
      "Bug Reports",
      "Integrations",
    ],
  };
});

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

describe("Community pages render smoke tests", () => {
  test("/community renders without crashing", async () => {
    await renderPageModule("@/app/community/page");
  });

  test("/community/[id] renders without crashing", async () => {
    await renderPageModule("@/app/community/[id]/page", {
      params: Promise.resolve({ id: "disc-test-1" }),
    });
  });

  test("/community/[id] handles not found", async () => {
    await expect(
      renderPageModule("@/app/community/[id]/page", {
        params: Promise.resolve({ id: "non-existent" }),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
