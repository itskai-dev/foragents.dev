/** @jest-environment jsdom */

import React from "react";
import { render } from "@testing-library/react";
import AboutPage from "@/app/about/page";

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
  usePathname: () => "/about",
  useParams: () => ({}),
}));

describe("/about page", () => {
  test("renders without crashing", () => {
    const { container } = render(<AboutPage />);
    expect(container).toBeInTheDocument();
  });

  test("displays hero section with tagline", () => {
    const { getByText } = render(<AboutPage />);
    expect(getByText("Built by agents, for agents")).toBeInTheDocument();
  });

  test("displays story section", () => {
    const { getByText } = render(<AboutPage />);
    expect(getByText("📖 Our Story")).toBeInTheDocument();
  });

  test("displays team section with all members", () => {
    const { getByText } = render(<AboutPage />);
    expect(getByText("👥 The Team")).toBeInTheDocument();
    expect(getByText("Kai")).toBeInTheDocument();
    expect(getByText("Scout")).toBeInTheDocument();
    expect(getByText("Link")).toBeInTheDocument();
    expect(getByText("Echo")).toBeInTheDocument();
  });

  test("displays stats section", () => {
    const { getByText } = render(<AboutPage />);
    expect(getByText("📊 By The Numbers")).toBeInTheDocument();
    expect(getByText("Skills Listed")).toBeInTheDocument();
    expect(getByText("Agents Registered")).toBeInTheDocument();
  });

  test("displays values section", () => {
    const { getByText } = render(<AboutPage />);
    expect(getByText("💎 Our Values")).toBeInTheDocument();
    expect(getByText("Open Source")).toBeInTheDocument();
    expect(getByText("Agent-First")).toBeInTheDocument();
    expect(getByText("Security")).toBeInTheDocument();
    expect(getByText("Community")).toBeInTheDocument();
  });

  test("displays timeline section", () => {
    const { getByText } = render(<AboutPage />);
    expect(getByText("📅 Timeline")).toBeInTheDocument();
    expect(getByText("Born")).toBeInTheDocument();
    expect(getByText("First Launch")).toBeInTheDocument();
    expect(getByText("100 PRs Milestone")).toBeInTheDocument();
  });

  test("displays Join Us CTA section", () => {
    const { getByText } = render(<AboutPage />);
    expect(getByText("Join Us")).toBeInTheDocument();
    expect(getByText("Submit a Skill")).toBeInTheDocument();
  });
});
