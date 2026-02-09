/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import CareersPage from "@/app/careers/page";

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
  usePathname: () => "/careers",
  useParams: () => ({}),
}));

describe("Careers Page", () => {
  test("renders without crashing", () => {
    const { container } = render(<CareersPage />);
    expect(container).toBeInTheDocument();
  });

  test("displays hero heading", () => {
    render(<CareersPage />);
    const headings = screen.getAllByText(/Build the Future of Agent Infrastructure/i);
    expect(headings.length).toBeGreaterThan(0);
    expect(headings[0]).toBeInTheDocument();
  });

  test("displays Open Positions section", () => {
    render(<CareersPage />);
    expect(screen.getByText(/Open Positions/i)).toBeInTheDocument();
  });

  test("renders all 6 job positions", () => {
    render(<CareersPage />);
    expect(screen.getByText(/Senior Full-Stack Engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/DevRel \/ Developer Advocate/i)).toBeInTheDocument();
    expect(screen.getByText(/Agent Platform Engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/Product Designer/i)).toBeInTheDocument();
    expect(screen.getByText(/Community Manager/i)).toBeInTheDocument();
    expect(screen.getByText(/Technical Writer/i)).toBeInTheDocument();
  });

  test("displays department badges", () => {
    render(<CareersPage />);
    // Check for various departments
    const badges = screen.getAllByText(/Engineering|Marketing|Design|Community|Content/i);
    expect(badges.length).toBeGreaterThan(0);
  });

  test("displays Benefits & Perks section", () => {
    render(<CareersPage />);
    expect(screen.getByText(/Benefits & Perks/i)).toBeInTheDocument();
  });

  test("renders all 6 benefits", () => {
    render(<CareersPage />);
    // Check for benefit cards - count the specific benefit titles as card titles
    expect(screen.getByText("Learning Budget")).toBeInTheDocument();
    expect(screen.getByText("Flexible Hours")).toBeInTheDocument();
    expect(screen.getByText("Health & Wellness")).toBeInTheDocument();
    expect(screen.getByText("Agent Stipend")).toBeInTheDocument();
    // Remote-first and Equity appear multiple times, just verify one exists
    const remoteBenefits = screen.getAllByText(/Remote-first/i);
    expect(remoteBenefits.length).toBeGreaterThan(0);
    const equityBenefits = screen.getAllByText(/Equity/i);
    expect(equityBenefits.length).toBeGreaterThan(0);
  });

  test("displays Our Culture section", () => {
    render(<CareersPage />);
    expect(screen.getByText(/Our Culture/i)).toBeInTheDocument();
  });

  test("renders company values", () => {
    render(<CareersPage />);
    expect(screen.getByText(/Builders First/i)).toBeInTheDocument();
    expect(screen.getByText(/Move Fast, Think Deep/i)).toBeInTheDocument();
    expect(screen.getByText(/Radically Open/i)).toBeInTheDocument();
    expect(screen.getByText(/Human \+ AI/i)).toBeInTheDocument();
  });

  test("displays CTA section", () => {
    render(<CareersPage />);
    expect(screen.getByText(/Don't see the perfect role\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Get in Touch/i)).toBeInTheDocument();
  });

  test("has structured data for SEO", () => {
    const { container } = render(<CareersPage />);
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBeGreaterThan(0);
  });

  test("displays location and type for each job", () => {
    render(<CareersPage />);
    const remoteElements = screen.getAllByText(/Remote/i);
    expect(remoteElements.length).toBeGreaterThan(0);
    const fullTimeElements = screen.getAllByText(/Full-time/i);
    expect(fullTimeElements.length).toBeGreaterThan(0);
  });
});
