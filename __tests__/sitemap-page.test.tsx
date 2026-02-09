/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
// TODO: sitemap-client component was removed, these tests need to be rewritten or removed
// import SitemapClient from "@/app/sitemap/sitemap-client";

// Stub component for skipped tests
const SitemapClient = () => <div>Sitemap stub</div>;

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
  usePathname: () => "/sitemap",
  useParams: () => ({}),
}));

// TODO: sitemap-client component was removed, these tests need to be rewritten or removed
describe.skip("/sitemap page", () => {
  test("renders without crashing", () => {
    const { container } = render(<SitemapClient />);
    expect(container).toBeInTheDocument();
  });

  test("displays page title and description", () => {
    render(<SitemapClient />);
    expect(screen.getByText("Sitemap")).toBeInTheDocument();
    expect(screen.getByText(/Complete directory of all/)).toBeInTheDocument();
  });

  test("displays search input", () => {
    render(<SitemapClient />);
    const searchInput = screen.getByPlaceholderText("Search pages...");
    expect(searchInput).toBeInTheDocument();
  });

  test("displays all main sections", () => {
    render(<SitemapClient />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Skills")).toBeInTheDocument();
    expect(screen.getByText("Agents")).toBeInTheDocument();
    expect(screen.getByText("Community")).toBeInTheDocument();
    expect(screen.getByText("Resources")).toBeInTheDocument();
    expect(screen.getByText("Legal")).toBeInTheDocument();
    expect(screen.getByText("API")).toBeInTheDocument();
  });

  test("displays key page links", () => {
    render(<SitemapClient />);
    expect(screen.getByText("Skills Directory")).toBeInTheDocument();
    expect(screen.getByText("Agent Directory")).toBeInTheDocument();
    expect(screen.getByText("API Documentation")).toBeInTheDocument();
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });

  test("displays last updated date", () => {
    render(<SitemapClient />);
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  test("displays XML sitemap link", () => {
    render(<SitemapClient />);
    expect(screen.getByText("Looking for the XML sitemap?")).toBeInTheDocument();
    const xmlLink = screen.getByText("View sitemap.xml");
    expect(xmlLink).toBeInTheDocument();
    expect(xmlLink.closest("a")).toHaveAttribute("href", "/sitemap.xml");
  });

  test("filters pages when searching", () => {
    render(<SitemapClient />);
    const searchInput = screen.getByPlaceholderText("Search pages...");
    
    // Type "API" in the search box
    fireEvent.change(searchInput, { target: { value: "API" } });
    
    // Should show filtered results badge
    expect(screen.getByText(/found$/)).toBeInTheDocument();
    
    // Should still show API-related content
    expect(screen.getByText("API Documentation")).toBeInTheDocument();
  });

  test("shows no results message when search has no matches", () => {
    render(<SitemapClient />);
    const searchInput = screen.getByPlaceholderText("Search pages...");
    
    // Type something that won't match anything
    fireEvent.change(searchInput, { target: { value: "xyzabc123nonexistent" } });
    
    // Should show no results message
    expect(screen.getByText(/No pages found matching/)).toBeInTheDocument();
    expect(screen.getByText("Clear search")).toBeInTheDocument();
  });

  test("clears search when clicking clear button", () => {
    render(<SitemapClient />);
    const searchInput = screen.getByPlaceholderText("Search pages...") as HTMLInputElement;
    
    // Type something that won't match
    fireEvent.change(searchInput, { target: { value: "xyznonexistent" } });
    expect(screen.getByText(/No pages found matching/)).toBeInTheDocument();
    
    // Click clear search
    const clearButton = screen.getByText("Clear search");
    fireEvent.click(clearButton);
    
    // Search should be cleared
    expect(searchInput.value).toBe("");
  });

  test("displays page descriptions", () => {
    render(<SitemapClient />);
    expect(screen.getByText("Browse all AI agent skills")).toBeInTheDocument();
    expect(screen.getByText("How we handle your data")).toBeInTheDocument();
    expect(screen.getByText("Complete API reference")).toBeInTheDocument();
  });

  test("displays page counts for each section", () => {
    render(<SitemapClient />);
    // Each section should show a count like "X pages"
    const pageCounts = screen.getAllByText(/\d+ page(s)?/);
    expect(pageCounts.length).toBeGreaterThan(0);
  });
});
