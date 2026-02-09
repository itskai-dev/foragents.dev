/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";

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

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
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
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(""),
  usePathname: () => "/builder",
  useParams: () => ({}),
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

jest.mock("next/headers", () => ({
  headers: () =>
    new Map([
      ["host", "localhost:3000"],
      ["x-forwarded-proto", "http"],
    ]),
  cookies: () => ({ get: () => undefined, getAll: () => [] }),
}));

describe("/builder page", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test("renders without crashing", async () => {
    const BuilderPage = (await import("@/app/builder/page")).default;
    const { container } = render(<BuilderPage />);
    expect(container).toBeInTheDocument();
  });

  test("renders with correct title", async () => {
    const BuilderPage = (await import("@/app/builder/page")).default;
    render(<BuilderPage />);
    expect(screen.getByText("Skill")).toBeInTheDocument();
    expect(screen.getByText("Builder")).toBeInTheDocument();
  });

  test("renders step 1 by default", async () => {
    const BuilderPage = (await import("@/app/builder/page")).default;
    render(<BuilderPage />);
    expect(screen.getByText("Skill Information")).toBeInTheDocument();
  });

  test("renders progress indicator with 4 steps", async () => {
    const BuilderPage = (await import("@/app/builder/page")).default;
    const { container } = render(<BuilderPage />);
    const progressSteps = container.querySelectorAll(
      '[class*="rounded-full"][class*="flex items-center justify-center"]'
    );
    // Should have 4 step indicators
    expect(progressSteps.length).toBeGreaterThanOrEqual(4);
  });

  test("renders form inputs for step 1", async () => {
    const BuilderPage = (await import("@/app/builder/page")).default;
    render(<BuilderPage />);
    
    // Check for required form fields in step 1
    expect(screen.getByLabelText(/Skill Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
  });

  test("loads sample skill data by default", async () => {
    const BuilderPage = (await import("@/app/builder/page")).default;
    render(<BuilderPage />);
    
    // Sample skill should have "Code Reviewer" as the name
    const nameInput = screen.getByLabelText(/Skill Name/i) as HTMLInputElement;
    expect(nameInput.value).toBe("Code Reviewer");
  });

  test("renders navigation buttons", async () => {
    const BuilderPage = (await import("@/app/builder/page")).default;
    render(<BuilderPage />);
    
    // Should have Previous and Next buttons
    expect(screen.getByText(/Previous/i)).toBeInTheDocument();
    expect(screen.getByText(/Next/i)).toBeInTheDocument();
  });
});
