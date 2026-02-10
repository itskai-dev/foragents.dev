/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import ReleasesPage from "../src/app/releases/page";

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

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Rss: () => <svg data-testid="rss-icon" />,
  AlertTriangle: () => <svg data-testid="alert-triangle-icon" />,
  FileText: () => <svg data-testid="file-text-icon" />,
}));

// Mock shadcn/ui components
jest.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AccordionContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AccordionItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-value={value} data-state="closed">{children}</div>
  ),
  AccordionTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe.skip("Releases Page", () => {
  it("renders the releases page", () => {
    const jsx = ReleasesPage();
    const { container } = render(jsx);
    expect(container).toBeInTheDocument();
  });

  it("displays the page title", () => {
    const jsx = ReleasesPage();
    render(jsx);
    expect(screen.getByText("Release Notes")).toBeInTheDocument();
  });

  it("displays the page description", () => {
    const jsx = ReleasesPage();
    render(jsx);
    expect(
      screen.getByText(/Track the evolution of forAgents.dev through our version history/)
    ).toBeInTheDocument();
  });

  it("displays RSS feed link", () => {
    const jsx = ReleasesPage();
    render(jsx);
    const rssLink = screen.getByText("RSS Feed").closest("a");
    expect(rssLink).toHaveAttribute("href", "/releases/rss.xml");
  });

  it("displays release versions", () => {
    const jsx = ReleasesPage();
    render(jsx);
    // Check for at least one version badge
    expect(screen.getByText("v2.4.0")).toBeInTheDocument();
  });

  it("displays latest badge on most recent release", () => {
    const jsx = ReleasesPage();
    render(jsx);
    expect(screen.getByText("Latest")).toBeInTheDocument();
  });

  it("displays breaking changes badge for breaking releases", () => {
    const jsx = ReleasesPage();
    render(jsx);
    // v2.0.0 has breaking changes
    const breakingBadges = screen.getAllByText("Breaking Changes");
    expect(breakingBadges.length).toBeGreaterThan(0);
  });

  it("displays release summaries", () => {
    const jsx = ReleasesPage();
    render(jsx);
    expect(
      screen.getByText("Enhanced skill filtering and performance improvements")
    ).toBeInTheDocument();
  });

  it("displays change categories", () => {
    const jsx = ReleasesPage();
    render(jsx);
    // Check for at least one change category heading
    expect(screen.getAllByText("Added").length).toBeGreaterThan(0);
  });

  it("displays roadmap link in footer", () => {
    const jsx = ReleasesPage();
    render(jsx);
    const roadmapLink = screen.getByText("roadmap");
    expect(roadmapLink).toBeInTheDocument();
    expect(roadmapLink.closest("a")).toHaveAttribute("href", "/roadmap");
  });

  it("renders accordion for expandable sections", () => {
    const jsx = ReleasesPage();
    const { container } = render(jsx);
    // Check that accordion items are present
    const accordionItems = container.querySelectorAll('[data-value]');
    expect(accordionItems.length).toBeGreaterThan(0);
  });

  it("displays multiple releases", () => {
    const jsx = ReleasesPage();
    render(jsx);
    // We should have at least 6 releases based on the data
    expect(screen.getByText("v2.4.0")).toBeInTheDocument();
    expect(screen.getByText("v2.3.1")).toBeInTheDocument();
    expect(screen.getByText("v2.3.0")).toBeInTheDocument();
    expect(screen.getByText("v2.0.0")).toBeInTheDocument();
    expect(screen.getByText("v1.8.2")).toBeInTheDocument();
    expect(screen.getByText("v1.8.0")).toBeInTheDocument();
  });

  it("displays change counts for each release", () => {
    const jsx = ReleasesPage();
    render(jsx);
    // Check for presence of change count text
    const changeTexts = screen.getAllByText(/\d+ changes?/);
    expect(changeTexts.length).toBeGreaterThan(0);
  });

  it("displays formatted release dates", () => {
    const jsx = ReleasesPage();
    render(jsx);
    // Check for formatted dates (there are multiple releases)
    const dates = screen.getAllByText(/February \d+, 2026/);
    expect(dates.length).toBeGreaterThan(0);
  });
});
