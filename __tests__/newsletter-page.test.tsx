/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import NewsletterPage from "@/app/newsletter/page";

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
  usePathname: () => "/newsletter",
  useParams: () => ({}),
}));

describe("/newsletter page", () => {
  test("renders without crashing", () => {
    const { container } = render(<NewsletterPage />);
    expect(container).toBeInTheDocument();
  });

  test("displays hero section with main heading", () => {
    render(<NewsletterPage />);
    expect(screen.getByText("Stay in the Loop")).toBeInTheDocument();
  });

  test("displays subscriber count", () => {
    render(<NewsletterPage />);
    expect(screen.getByText("2,400+")).toBeInTheDocument();
  });

  test("displays subscription form", () => {
    render(<NewsletterPage />);
    expect(screen.getByText("Subscribe to Our Newsletter")).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  });

  test("displays all interest checkboxes", () => {
    render(<NewsletterPage />);
    expect(screen.getByText("New Skills")).toBeInTheDocument();
    expect(screen.getByText("Platform Updates")).toBeInTheDocument();
    expect(screen.getByText("Community Highlights")).toBeInTheDocument();
    expect(screen.getByText("Security Advisories")).toBeInTheDocument();
    expect(screen.getByText("API Changes")).toBeInTheDocument();
  });

  test("displays benefits section", () => {
    render(<NewsletterPage />);
    expect(screen.getByText("Why Subscribe?")).toBeInTheDocument();
    expect(screen.getByText("Weekly Digest")).toBeInTheDocument();
    expect(screen.getByText("Early Access")).toBeInTheDocument();
    expect(screen.getByText("Community Spotlights")).toBeInTheDocument();
    expect(screen.getByText("No Spam Promise")).toBeInTheDocument();
  });

  test("displays recent issues section", () => {
    render(<NewsletterPage />);
    expect(screen.getByText("Recent Newsletter Issues")).toBeInTheDocument();
    expect(screen.getByText(/February Platform Update/i)).toBeInTheDocument();
  });

  test("displays unsubscribe section", () => {
    render(<NewsletterPage />);
    expect(screen.getByText("Need to Unsubscribe?")).toBeInTheDocument();
    expect(screen.getByLabelText(/Unsubscribe Token/i)).toBeInTheDocument();
  });

  test("has subscribe button", () => {
    render(<NewsletterPage />);
    const subscribeButtons = screen.getAllByRole("button", { name: /subscribe/i });
    expect(subscribeButtons.length).toBeGreaterThan(0);
  });

  test("has unsubscribe button", () => {
    render(<NewsletterPage />);
    expect(screen.getByRole("button", { name: /unsubscribe/i })).toBeInTheDocument();
  });
});
