/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import AgentLeaderboardPage from "@/app/leaderboard/agents/page";

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
  usePathname: () => "/leaderboard/agents",
  useParams: () => ({}),
}));

describe("/leaderboard/agents page", () => {
  test("renders without crashing", () => {
    const { container } = render(<AgentLeaderboardPage />);
    expect(container).toBeInTheDocument();
  });

  test("renders the page title", () => {
    render(<AgentLeaderboardPage />);
    expect(screen.getByText("Agent Leaderboard")).toBeInTheDocument();
  });

  test("renders the page description", () => {
    render(<AgentLeaderboardPage />);
    expect(
      screen.getByText(/Top agents ranked by trust score, skills published, downloads/i)
    ).toBeInTheDocument();
  });

  test("renders time period tabs", () => {
    render(<AgentLeaderboardPage />);
    expect(screen.getByText("This Week")).toBeInTheDocument();
    expect(screen.getByText("This Month")).toBeInTheDocument();
    expect(screen.getByText("All Time")).toBeInTheDocument();
  });

  test("renders category filter label", () => {
    render(<AgentLeaderboardPage />);
    expect(screen.getByText("Category:")).toBeInTheDocument();
  });

  test("renders top 3 podium agents", () => {
    render(<AgentLeaderboardPage />);
    expect(screen.getAllByText("Kai")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Link")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Scout")[0]).toBeInTheDocument();
  });

  test("renders agent handles", () => {
    render(<AgentLeaderboardPage />);
    expect(screen.getAllByText("@kai")[0]).toBeInTheDocument();
    expect(screen.getAllByText("@link")[0]).toBeInTheDocument();
    expect(screen.getAllByText("@scout")[0]).toBeInTheDocument();
  });

  test("renders full rankings section", () => {
    render(<AgentLeaderboardPage />);
    expect(screen.getByText("Full Rankings")).toBeInTheDocument();
  });

  test("renders table headers", () => {
    render(<AgentLeaderboardPage />);
    expect(screen.getByText("Rank")).toBeInTheDocument();
    expect(screen.getByText("Agent")).toBeInTheDocument();
    expect(screen.getAllByText("Trust")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Skills")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Downloads")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Rating")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Streak")[0]).toBeInTheDocument();
  });

  test("renders how scores work section", () => {
    render(<AgentLeaderboardPage />);
    expect(screen.getAllByText(/How Scores Work/i)[0]).toBeInTheDocument();
    expect(screen.getByText("Composite Score")).toBeInTheDocument();
    expect(screen.getByText("Trust Score")).toBeInTheDocument();
    expect(screen.getByText("Skills & Downloads")).toBeInTheDocument();
    expect(screen.getByText("Rating & Streak")).toBeInTheDocument();
  });

  test("renders agent data from JSON", () => {
    render(<AgentLeaderboardPage />);
    // Check that data is loaded by looking for specific patterns
    const container = screen.getByText("Full Rankings").parentElement;
    expect(container).toBeInTheDocument();
    
    // Check for formatted numbers (downloads)
    expect(screen.getByText(/152\.3K/i)).toBeInTheDocument(); // Kai's downloads
  });
});
