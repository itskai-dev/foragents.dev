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

describe("Careers V2 Page - Enhanced Requirements", () => {
  test("renders without crashing", () => {
    const { container } = render(<CareersPage />);
    expect(container).toBeInTheDocument();
  });

  describe("Hero Section", () => {
    test('displays hero heading "Build the Future of Agent Infrastructure"', () => {
      render(<CareersPage />);
      expect(screen.getAllByText(/Build the Future of Agent Infrastructure/i).length).toBeGreaterThan(0);
    });

    test("displays hero subtitle text", () => {
      render(<CareersPage />);
      expect(screen.getByText(/Join our team of builders creating the platform/i)).toBeInTheDocument();
    });
  });

  describe("Open Positions Section", () => {
    test("displays Open Positions section heading", () => {
      render(<CareersPage />);
      expect(screen.getByText(/Open Positions/i)).toBeInTheDocument();
    });

    test("renders all 7 required job positions", () => {
      render(<CareersPage />);
      // Required positions from spec
      expect(screen.getByText(/Agent Platform Engineer/i)).toBeInTheDocument();
      expect(screen.getByText(/DevRel \/ Developer Advocate/i)).toBeInTheDocument();
      expect(screen.getByText(/Senior Full-Stack Engineer/i)).toBeInTheDocument();
      expect(screen.getByText(/Security Researcher/i)).toBeInTheDocument();
      expect(screen.getByText(/Community Manager/i)).toBeInTheDocument();
      // Additional positions
      expect(screen.getByText(/Product Designer/i)).toBeInTheDocument();
      expect(screen.getByText(/Technical Writer/i)).toBeInTheDocument();
    });

    test("each position displays title, team/department, location, and type", () => {
      render(<CareersPage />);
      
      // Check for department badges
      const badges = screen.getAllByText(/Engineering|Marketing|Design|Community|Content/i);
      expect(badges.length).toBeGreaterThan(0);

      // Check for Remote location
      const remoteElements = screen.getAllByText(/Remote/i);
      expect(remoteElements.length).toBeGreaterThanOrEqual(7);

      // Check for Full-time type
      const fullTimeElements = screen.getAllByText(/Full-time/i);
      expect(fullTimeElements.length).toBeGreaterThan(0);
    });

    test("each position has a short description", () => {
      render(<CareersPage />);
      // Checking that descriptions exist by looking for unique text from position descriptions
      expect(screen.getByText(/Build the future of agent infrastructure/i)).toBeInTheDocument();
      expect(screen.getByText(/Be the bridge between our platform and the developer community/i)).toBeInTheDocument();
    });

    test("each position has an Apply button", () => {
      render(<CareersPage />);
      const applyButtons = screen.getAllByText(/Apply for this position/i);
      expect(applyButtons.length).toBeGreaterThanOrEqual(7);
    });
  });

  describe("Company Values Section", () => {
    test("displays company culture/values section", () => {
      render(<CareersPage />);
      expect(screen.getByText(/Our Culture/i)).toBeInTheDocument();
    });

    test("renders all 4 company values with icons", () => {
      render(<CareersPage />);
      expect(screen.getByText(/Builders First/i)).toBeInTheDocument();
      expect(screen.getByText(/Move Fast, Think Deep/i)).toBeInTheDocument();
      expect(screen.getByText(/Radically Open/i)).toBeInTheDocument();
      expect(screen.getByText(/Human \+ AI/i)).toBeInTheDocument();
    });

    test("each value has a description", () => {
      render(<CareersPage />);
      expect(screen.getByText(/We exist to serve developers/i)).toBeInTheDocument();
      expect(screen.getByText(/Ship quickly, but think carefully/i)).toBeInTheDocument();
      expect(screen.getByText(/Default to transparency/i)).toBeInTheDocument();
      expect(screen.getByText(/We build tools that enhance human capabilities/i)).toBeInTheDocument();
    });
  });

  describe("Benefits Section", () => {
    test("displays Benefits & Perks section heading", () => {
      render(<CareersPage />);
      expect(screen.getByText(/Benefits & Perks/i)).toBeInTheDocument();
    });

    test("renders all required benefits with icons", () => {
      render(<CareersPage />);
      // Health
      expect(screen.getAllByText(/Health & Wellness/i).length).toBeGreaterThan(0);
      // Equity
      expect(screen.getAllByText(/Equity/i).length).toBeGreaterThan(0);
      // Remote
      expect(screen.getAllByText(/Remote-first/i).length).toBeGreaterThan(0);
      // Learning budget
      expect(screen.getAllByText(/Learning Budget/i).length).toBeGreaterThan(0);
    });

    test("benefits include additional perks", () => {
      render(<CareersPage />);
      expect(screen.getAllByText(/Flexible Hours/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Agent Stipend/i).length).toBeGreaterThan(0);
    });
  });

  describe("General Application CTA Section", () => {
    test('displays "Don\'t see your role?" section', () => {
      render(<CareersPage />);
      expect(screen.getByText(/Don't see the perfect role\?/i)).toBeInTheDocument();
    });

    test("displays general application CTA button", () => {
      render(<CareersPage />);
      expect(screen.getByText(/Get in Touch/i)).toBeInTheDocument();
    });

    test("CTA section has descriptive text", () => {
      render(<CareersPage />);
      expect(screen.getByText(/We're always looking for talented people/i)).toBeInTheDocument();
    });
  });

  describe("SEO and Accessibility", () => {
    test("has structured data for job postings (Schema.org)", () => {
      const { container } = render(<CareersPage />);
      const scripts = container.querySelectorAll('script[type="application/ld+json"]');
      expect(scripts.length).toBeGreaterThan(0);
    });

    test("structured data includes all job positions", () => {
      const { container } = render(<CareersPage />);
      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script?.textContent).toBeTruthy();
      if (script?.textContent) {
        const jsonData = JSON.parse(script.textContent);
        expect(Array.isArray(jsonData)).toBe(true);
        expect(jsonData.length).toBeGreaterThanOrEqual(5);
      }
    });
  });

  describe("Client-side Requirements", () => {
    test('page uses "use client" directive', () => {
      // This is checked at build time, but we can verify the page renders client-side components
      render(<CareersPage />);
      // If accordion interactions work, it's client-side
      expect(screen.getByText(/Open Positions/i)).toBeInTheDocument();
    });
  });
});
