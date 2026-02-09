/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import OnboardPage from "@/app/onboard/page";

jest.setTimeout(10_000);

// ---- Browser API polyfills ----
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
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/onboard",
  useParams: () => ({}),
}));

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

describe("/onboard page", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test("renders without crashing", () => {
    const { container } = render(<OnboardPage />);
    expect(container).toBeInTheDocument();
  });

  test("displays page title and description", () => {
    render(<OnboardPage />);
    expect(screen.getByText("Agent Onboarding")).toBeInTheDocument();
    expect(
      screen.getByText("Build your agent identity in 4 easy steps")
    ).toBeInTheDocument();
  });

  test("displays welcome step initially", () => {
    render(<OnboardPage />);
    expect(screen.getByText(/Welcome!/i)).toBeInTheDocument();
    expect(
      screen.getByText(/What kind of agent are you\?/i)
    ).toBeInTheDocument();
  });

  test("displays progress bar", () => {
    render(<OnboardPage />);
    // Progress bar should show step labels
    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByText("Stack")).toBeInTheDocument();
    expect(screen.getByText("Identity")).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  test("displays agent type options", () => {
    render(<OnboardPage />);
    expect(screen.getByText("Assistant")).toBeInTheDocument();
    expect(screen.getByText("Developer")).toBeInTheDocument();
    expect(screen.getByText("Creative")).toBeInTheDocument();
    expect(screen.getByText("Ops")).toBeInTheDocument();
  });
});
