/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import BadgesPage from "@/app/badges/page";

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
  usePathname: () => "/badges",
  useParams: () => ({}),
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

describe.skip("Badges & Achievements Page", () => {
  test("renders page title and description", () => {
    const { container } = render(<BadgesPage />);
    
    expect(container).toBeInTheDocument();
    expect(screen.getByText(/Badges & Achievements/i)).toBeInTheDocument();
    expect(screen.getByText(/Earn badges by contributing/i)).toBeInTheDocument();
  });

  test("displays user progress section", () => {
    render(<BadgesPage />);
    
    expect(screen.getByText("Your Progress")).toBeInTheDocument();
    expect(screen.getByText(/You've unlocked/i)).toBeInTheDocument();
  });

  test("renders all badge categories", () => {
    render(<BadgesPage />);
    
    expect(screen.getByText("Getting Started")).toBeInTheDocument();
    expect(screen.getByText("Skills")).toBeInTheDocument();
    expect(screen.getByText("Community")).toBeInTheDocument();
    expect(screen.getByText("Trust")).toBeInTheDocument();
  });

  test("displays Getting Started badges", () => {
    render(<BadgesPage />);
    
    // These badges appear both in "Your Progress" and their category section
    expect(screen.getAllByText("First Login").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Profile Complete").length).toBeGreaterThan(0);
    expect(screen.getAllByText("First Skill").length).toBeGreaterThan(0);
    expect(screen.getAllByText("First Review").length).toBeGreaterThan(0);
  });

  test("displays Skills badges", () => {
    render(<BadgesPage />);
    
    expect(screen.getByText("Skill Publisher")).toBeInTheDocument();
    expect(screen.getByText("Power Publisher")).toBeInTheDocument();
    expect(screen.getByText("Verified Creator")).toBeInTheDocument();
    expect(screen.getByText("Top Rated")).toBeInTheDocument();
  });

  test("displays Community badges", () => {
    render(<BadgesPage />);
    
    expect(screen.getByText("First Post")).toBeInTheDocument();
    expect(screen.getByText("Helpful")).toBeInTheDocument();
    expect(screen.getByText("Influencer")).toBeInTheDocument();
    expect(screen.getByText("Mentor")).toBeInTheDocument();
  });

  test("displays Trust badges", () => {
    render(<BadgesPage />);
    
    expect(screen.getByText("Verified Agent")).toBeInTheDocument();
    expect(screen.getByText("Security Certified")).toBeInTheDocument();
    expect(screen.getByText("99% Uptime")).toBeInTheDocument();
    expect(screen.getByText("Enterprise Ready")).toBeInTheDocument();
  });

  test("shows leaderboard sidebar", () => {
    render(<BadgesPage />);
    
    expect(screen.getByText("Top Badge Collectors")).toBeInTheDocument();
    expect(screen.getByText("Most badges earned this month")).toBeInTheDocument();
    expect(screen.getByText("AgentAlpha")).toBeInTheDocument();
    expect(screen.getByText("SkillMaster")).toBeInTheDocument();
  });

  test("displays badge statistics", () => {
    render(<BadgesPage />);
    
    expect(screen.getByText("Badge Statistics")).toBeInTheDocument();
    expect(screen.getByText("Total Badges")).toBeInTheDocument();
    expect(screen.getByText("Your Badges")).toBeInTheDocument();
    expect(screen.getByText("Completion")).toBeInTheDocument();
  });

  test("shows rarity labels for badges", () => {
    render(<BadgesPage />);
    
    const rarityLabels = screen.getAllByText(/Common|Uncommon|Rare|Legendary/);
    expect(rarityLabels.length).toBeGreaterThan(0);
  });

  test("displays unlocked status for earned badges", () => {
    render(<BadgesPage />);
    
    const unlockedBadges = screen.getAllByText("Unlocked");
    expect(unlockedBadges.length).toBeGreaterThan(0);
  });

  test("shows how to unlock criteria for each badge", () => {
    render(<BadgesPage />);
    
    const howToUnlockHeaders = screen.getAllByText("How to unlock");
    expect(howToUnlockHeaders.length).toBeGreaterThan(0);
  });
});
