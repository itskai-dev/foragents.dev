/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import StatusPage from "../src/app/status/page";

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

describe("Status Page", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the status page", () => {
    const { container } = render(<StatusPage />);
    expect(container).toBeInTheDocument();
  });

  it("displays the page title", () => {
    render(<StatusPage />);
    expect(screen.getByText("System Status")).toBeInTheDocument();
  });

  it("displays overall status banner", () => {
    render(<StatusPage />);
    expect(screen.getByText("All Systems Operational")).toBeInTheDocument();
  });

  it("displays all service components", () => {
    render(<StatusPage />);
    // Service names appear in both the services section and incident affected services
    const apiElements = screen.getAllByText("API");
    expect(apiElements.length).toBeGreaterThan(0);
    const websiteElements = screen.getAllByText("Website");
    expect(websiteElements.length).toBeGreaterThan(0);
    const mcpElements = screen.getAllByText("MCP Registry");
    expect(mcpElements.length).toBeGreaterThan(0);
    const supabaseElements = screen.getAllByText("Supabase");
    expect(supabaseElements.length).toBeGreaterThan(0);
    const cdnElements = screen.getAllByText("CDN");
    expect(cdnElements.length).toBeGreaterThan(0);
  });

  it("displays services section heading", () => {
    render(<StatusPage />);
    expect(screen.getByText("Services")).toBeInTheDocument();
  });

  it("displays uptime metrics", () => {
    render(<StatusPage />);
    const uptimeElements = screen.getAllByText(/Uptime \(30d\)/i);
    expect(uptimeElements.length).toBeGreaterThan(0);
  });

  it("displays response time metrics", () => {
    render(<StatusPage />);
    const responseTimeElements = screen.getAllByText(/Response Time/i);
    expect(responseTimeElements.length).toBeGreaterThan(0);
  });

  it("displays incident history section", () => {
    render(<StatusPage />);
    expect(screen.getByText("Incident History")).toBeInTheDocument();
  });

  it("displays at least 5 incidents", () => {
    render(<StatusPage />);
    // Check for resolved badge which should appear for each incident
    const resolvedBadges = screen.getAllByText(/resolved/i);
    expect(resolvedBadges.length).toBeGreaterThanOrEqual(5);
  });

  it("displays incident titles", () => {
    render(<StatusPage />);
    expect(screen.getByText("Brief API Latency Spike")).toBeInTheDocument();
    expect(
      screen.getByText("CDN Cache Invalidation Issue")
    ).toBeInTheDocument();
  });

  it("displays affected services for incidents", () => {
    render(<StatusPage />);
    // "Affected Services:" appears multiple times (once per incident)
    const affectedServicesElements = screen.getAllByText("Affected Services:");
    expect(affectedServicesElements.length).toBeGreaterThanOrEqual(5);
  });

  it("displays subscribe to updates section", () => {
    render(<StatusPage />);
    expect(screen.getByText("Stay Updated")).toBeInTheDocument();
  });

  it("displays last updated timestamp", () => {
    render(<StatusPage />);
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it("renders structured data for SEO", () => {
    const { container } = render(<StatusPage />);
    const scriptTag = container.querySelector('script[type="application/ld+json"]');
    expect(scriptTag).toBeInTheDocument();
    if (scriptTag) {
      const jsonLd = JSON.parse(scriptTag.textContent || "{}");
      expect(jsonLd["@type"]).toBe("WebPage");
      expect(jsonLd.name).toContain("Status");
    }
  });
});
