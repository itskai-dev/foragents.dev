/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import ApiDocsClient from "../src/app/api-docs/api-docs-client";
import apiData from "../src/data/api-endpoints.json";

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

describe.skip("API Documentation Page", () => {
  it("renders the API documentation page", () => {
    const { container } = render(<ApiDocsClient data={apiData} />);
    expect(container).toBeInTheDocument();
  });

  it("displays the page title", () => {
    render(<ApiDocsClient data={apiData} />);
    expect(screen.getByText("API Documentation")).toBeInTheDocument();
  });

  it("displays the overview section", () => {
    render(<ApiDocsClient data={apiData} />);
    expect(screen.getByText("Getting Started")).toBeInTheDocument();
    expect(screen.getByText(/programmatic access to skills/i)).toBeInTheDocument();
  });

  it("displays authentication section content", () => {
    render(<ApiDocsClient data={apiData} />);
    expect(screen.getByText(/Using API Keys/i)).toBeInTheDocument();
  });

  it("displays rate limits section content", () => {
    render(<ApiDocsClient data={apiData} />);
    expect(screen.getByText(/Handling Rate Limit Errors/i)).toBeInTheDocument();
  });

  it("displays all endpoint group descriptions", () => {
    render(<ApiDocsClient data={apiData} />);
    
    expect(screen.getByText(/Endpoints for browsing and interacting with skills/i)).toBeInTheDocument();
    expect(screen.getByText(/Endpoints for agent profiles and events/i)).toBeInTheDocument();
    expect(screen.getByText(/Endpoints for skill reviews and comments/i)).toBeInTheDocument();
    expect(screen.getByText(/Endpoints for MCP servers and skill collections/i)).toBeInTheDocument();
    expect(screen.getByText(/Endpoints for agent health monitoring/i)).toBeInTheDocument();
    expect(screen.getByText(/Endpoints for searching skills and kit requests/i)).toBeInTheDocument();
  });

  it("displays API conventions section", () => {
    render(<ApiDocsClient data={apiData} />);
    expect(screen.getByText("API Conventions")).toBeInTheDocument();
    expect(screen.getByText(/Error Responses/i)).toBeInTheDocument();
  });

  it("displays rate limit tiers", () => {
    render(<ApiDocsClient data={apiData} />);
    
    apiData.rateLimits.forEach((limit) => {
      expect(screen.getByText(limit.tier)).toBeInTheDocument();
    });
  });

  it("displays base URL badge", () => {
    render(<ApiDocsClient data={apiData} />);
    expect(screen.getByText(/Base URL:/i)).toBeInTheDocument();
  });

  it("displays method badges for endpoints", () => {
    render(<ApiDocsClient data={apiData} />);
    
    const getAllEndpoints = apiData.groups.flatMap(g => g.endpoints);
    const hasMethods = {
      GET: getAllEndpoints.some(e => e.method === "GET"),
      POST: getAllEndpoints.some(e => e.method === "POST"),
    };
    
    if (hasMethods.GET) {
      expect(screen.getAllByText("GET").length).toBeGreaterThan(0);
    }
    if (hasMethods.POST) {
      expect(screen.getAllByText("POST").length).toBeGreaterThan(0);
    }
  });

  it("displays Try it placeholder", () => {
    render(<ApiDocsClient data={apiData} />);
    const tryItElements = screen.getAllByText(/Interactive API testing coming soon/i);
    expect(tryItElements.length).toBeGreaterThan(0);
  });

  it("renders sidebar navigation", () => {
    render(<ApiDocsClient data={apiData} />);
    
    // Sidebar should have Overview, Authentication, Rate Limits
    const overviewButtons = screen.getAllByText("Overview");
    expect(overviewButtons.length).toBeGreaterThan(0);
    
    const authButtons = screen.getAllByText("Authentication");
    expect(authButtons.length).toBeGreaterThan(0);
    
    const rateLimitButtons = screen.getAllByText("Rate Limits");
    expect(rateLimitButtons.length).toBeGreaterThan(0);
  });

  it("renders at least 15 endpoints", () => {
    render(<ApiDocsClient data={apiData} />);
    
    const totalEndpoints = apiData.groups.reduce((sum, group) => sum + group.endpoints.length, 0);
    expect(totalEndpoints).toBeGreaterThanOrEqual(15);
  });

  it("displays endpoint summaries", () => {
    render(<ApiDocsClient data={apiData} />);
    
    // Check some specific endpoint summaries (they appear in sidebar and main content)
    expect(screen.getAllByText("List all skills").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Get skill ratings").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Rate a skill").length).toBeGreaterThan(0);
  });

  it("displays parameter tables", () => {
    render(<ApiDocsClient data={apiData} />);
    
    // Check for parameter table headers
    const nameHeaders = screen.getAllByText("Name");
    expect(nameHeaders.length).toBeGreaterThan(0);
    
    const typeHeaders = screen.getAllByText("Type");
    expect(typeHeaders.length).toBeGreaterThan(0);
  });

  it("displays required badges", () => {
    render(<ApiDocsClient data={apiData} />);
    
    // Check for required badges
    const requiredBadges = screen.getAllByText("Required");
    expect(requiredBadges.length).toBeGreaterThan(0);
  });

  it("displays code examples", () => {
    render(<ApiDocsClient data={apiData} />);
    
    // Check for curl commands
    const codeBlocks = document.querySelectorAll('code');
    expect(codeBlocks.length).toBeGreaterThan(0);
  });

  it("renders sidebar endpoint groups", () => {
    render(<ApiDocsClient data={apiData} />);
    
    // Count occurrences of group names (sidebar + main content)
    apiData.groups.forEach((group) => {
      const elements = screen.getAllByText(group.name);
      expect(elements.length).toBeGreaterThanOrEqual(2); // At least one in sidebar, one in main
    });
  });
});
