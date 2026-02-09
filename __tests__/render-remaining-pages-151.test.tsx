/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";

jest.setTimeout(10_000);

// ---------------------------------------------------------------------------
// Browser API polyfills
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Next.js shims
// ---------------------------------------------------------------------------

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

jest.mock("next/image", () => {
  const NextImage = ({ alt = "", ...props }: { alt?: string } & Record<string, unknown>) => (
    <div role="img" aria-label={alt} {...props} />
  );
  NextImage.displayName = "NextImage";
  return NextImage;
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
  useParams: () => ({}),
  notFound: () => {
    const err: Error & { digest?: string } = new Error("NEXT_NOT_FOUND");
    err.digest = "NEXT_NOT_FOUND";
    throw err;
  },
  redirect: (url: string) => {
    const err: Error & { digest?: string; url?: string } = new Error("NEXT_REDIRECT");
    err.digest = "NEXT_REDIRECT";
    err.url = url;
    throw err;
  },
}));

jest.mock("next/headers", () => ({
  headers: () => new Map([
    ["host", "localhost:3000"],
    ["x-forwarded-proto", "http"],
    ["x-forwarded-host", "localhost:3000"],
  ]),
  cookies: () => ({ get: () => undefined, getAll: () => [] }),
}));

// ---------------------------------------------------------------------------
// Page-local client component mocks
// ---------------------------------------------------------------------------

jest.mock("@/app/api-docs/try-it", () => ({
  ApiTryIt: () => <section data-testid="api-try-it" />,
}));

jest.mock("@/app/inbox/inbox-client", () => ({
  InboxClient: () => <div data-testid="inbox-client" />,
}));

jest.mock("@/app/trace/trace-client", () => ({
  TraceClient: ({ initialId }: { initialId: string }) => (
    <div data-testid="trace-client">trace:{initialId}</div>
  ),
}));

jest.mock("@/app/stack/stack-builder", () => ({
  StackBuilder: () => <div data-testid="stack-builder" />,
}));

// ---------------------------------------------------------------------------
// Server/data mocks
// ---------------------------------------------------------------------------

jest.mock("@/lib/server/canaryStore", () => ({
  readCanaryResults: async () => [],
}));

jest.mock("@/lib/agentHealth", () => {
  const actual = jest.requireActual("@/lib/agentHealth") as Record<string, unknown>;
  return {
    ...actual,
    readHealthEvents: async () => [],
  };
});

jest.mock("@/lib/data", () => ({
  getSkills: () => [
    {
      id: "skill_1",
      slug: "example-skill",
      name: "Example Skill",
      tags: ["agents"],
    },
  ],
}));

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function renderPageModule(importPath: string, props: Record<string, unknown> = {}) {
  const mod: Record<string, unknown> = await import(importPath);
  const Page = mod.default as unknown;
  expect(Page).toBeTruthy();

  // Next.js server components are often `async function`.
  if ((Page as unknown as Record<string, unknown>)?.constructor?.name === "AsyncFunction") {
    const element = await (Page as unknown as (p: Record<string, unknown>) => Promise<React.ReactElement>)(props as Record<string, unknown>);
    return render(element);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return render(React.createElement(Page as React.ComponentType<any>, props));
}

describe("Render tests for remaining untested pages (Issue #151)", () => {
  test("/api-docs renders", async () => {
    await renderPageModule("@/app/api-docs/page");
    expect(screen.getByRole("heading", { name: /api documentation/i })).toBeInTheDocument();
  });

  test("/inbox renders", async () => {
    await renderPageModule("@/app/inbox/page");
    expect(screen.getByRole("heading", { name: /agent inbox/i })).toBeInTheDocument();
    expect(screen.getByTestId("inbox-client")).toBeInTheDocument();
  });

  test("/trace renders", async () => {
    await renderPageModule("@/app/trace/page", {
      searchParams: Promise.resolve({ id: "demo" }),
    });
    expect(screen.getByRole("heading", { name: /agent trace/i })).toBeInTheDocument();
    expect(screen.getByTestId("trace-client")).toBeInTheDocument();
  });

  test("/stack renders", async () => {
    await renderPageModule("@/app/stack/page", {
      searchParams: Promise.resolve({ title: "My Stack", skills: "example-skill" }),
    });
    expect(screen.getByTestId("stack-builder")).toBeInTheDocument();
  });

  test("/canary renders", async () => {
    await renderPageModule("@/app/canary/page");
    expect(screen.getByRole("heading", { name: /canary runs/i })).toBeInTheDocument();
  });

  test("/health renders", async () => {
    await renderPageModule("@/app/health/page");
    expect(screen.getByRole("heading", { name: /agent health/i })).toBeInTheDocument();
  });
});
