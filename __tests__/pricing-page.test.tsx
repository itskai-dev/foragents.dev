/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import PricingPage from "@/app/pricing/page";

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
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/pricing",
  useParams: () => ({}),
}));

describe("Pricing Page", () => {
  it("renders without crashing", () => {
    render(<PricingPage />);
    expect(screen.getByText("Choose Your Plan")).toBeInTheDocument();
  });

  it("displays all three pricing tiers", () => {
    render(<PricingPage />);
    // Use getAllByText for items that appear multiple times
    expect(screen.getAllByText("Free").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pro").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Enterprise").length).toBeGreaterThan(0);
  });

  it("shows the Most Popular badge on Pro tier", () => {
    render(<PricingPage />);
    expect(screen.getByText("Most Popular")).toBeInTheDocument();
  });

  it("displays pricing for Free and Pro tiers", () => {
    render(<PricingPage />);
    // Free tier
    expect(screen.getByText("$0")).toBeInTheDocument();
    // Pro tier - should show $29 for monthly
    expect(screen.getByText("$29")).toBeInTheDocument();
    // Enterprise - Custom pricing
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });

  it("displays key tier features", () => {
    render(<PricingPage />);
    // Free tier features
    expect(screen.getAllByText(/100 API calls\/day/i).length).toBeGreaterThan(
      0
    );
    expect(screen.getAllByText(/5 skills/i).length).toBeGreaterThan(0);

    // Pro tier features
    expect(
      screen.getAllByText(/10,000 API calls\/day/i).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/Custom domains/i).length).toBeGreaterThan(0);

    // Enterprise tier features
    expect(screen.getAllByText(/Unlimited API calls/i).length).toBeGreaterThan(
      0
    );
    expect(screen.getAllByText(/SSO\/SAML/i).length).toBeGreaterThan(0);
  });

  it("displays correct CTA buttons", () => {
    render(<PricingPage />);
    expect(screen.getByText("Get Started")).toBeInTheDocument();
    expect(screen.getByText("Start Free Trial")).toBeInTheDocument();
    // Contact Sales appears twice (Enterprise button + CTA section)
    expect(screen.getAllByText("Contact Sales").length).toBeGreaterThan(0);
  });

  it("displays Feature Comparison section", () => {
    render(<PricingPage />);
    expect(screen.getByText("Feature Comparison")).toBeInTheDocument();
    expect(
      screen.getByText("See what's included in each plan")
    ).toBeInTheDocument();
  });

  it("displays FAQ section", () => {
    render(<PricingPage />);
    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
    expect(
      screen.getByText("Everything you need to know about pricing")
    ).toBeInTheDocument();
  });

  it("displays annual/monthly toggle text", () => {
    render(<PricingPage />);
    expect(screen.getByText("Monthly")).toBeInTheDocument();
    expect(screen.getByText("Yearly")).toBeInTheDocument();
    expect(screen.getByText("Save 20% with annual billing")).toBeInTheDocument();
  });

  it("displays Ready to Get Started CTA section", () => {
    render(<PricingPage />);
    expect(screen.getByText("Ready to Get Started?")).toBeInTheDocument();
    expect(
      screen.getByText(/Join thousands of developers building with AI agents/)
    ).toBeInTheDocument();
  });

  it("displays FAQ questions", () => {
    render(<PricingPage />);
    expect(
      screen.getByText(/Can I switch between monthly and annual billing/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/What happens after my free trial ends/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Can I cancel my subscription anytime/)
    ).toBeInTheDocument();
  });

  it("has structured pricing data", () => {
    render(<PricingPage />);
    // Check that there's structured data (JSON-LD)
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBeGreaterThan(0);
  });
});
