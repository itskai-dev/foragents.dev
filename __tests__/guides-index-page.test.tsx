/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import GuidesPage from "../src/app/guides/page";

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

describe.skip("Guides Index Page", () => {
  it("renders the guides page", () => {
    const { container } = render(<GuidesPage />);
    expect(container).toBeInTheDocument();
  });

  it("displays the page title", () => {
    render(<GuidesPage />);
    expect(screen.getByText(/Agent Guides & Tutorials/i)).toBeInTheDocument();
  });

  it("displays search input", () => {
    render(<GuidesPage />);
    const searchInput = screen.getByPlaceholderText("Search guides...");
    expect(searchInput).toBeInTheDocument();
  });

  it("displays category filters", () => {
    render(<GuidesPage />);
    expect(screen.getByText("All Guides")).toBeInTheDocument();
    expect(screen.getAllByText("Getting Started").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Memory & State").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Autonomy").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Security").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Deployment").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Integration").length).toBeGreaterThan(0);
  });

  it("displays guide cards", () => {
    render(<GuidesPage />);
    expect(screen.getByText("Your First Agent")).toBeInTheDocument();
    expect(screen.getByText("Setting Up Agent Memory")).toBeInTheDocument();
    expect(screen.getByText("Autonomous Task Execution")).toBeInTheDocument();
  });

  it("filters guides by category", () => {
    render(<GuidesPage />);
    
    const securityButtons = screen.getAllByText("Security");
    // Click the first one (the filter button)
    fireEvent.click(securityButtons[0]);
    
    // Should show security guide
    expect(screen.getByText("Securing Agent Communications")).toBeInTheDocument();
    
    // Should not show guides from other categories in the count
    const resultsText = screen.getByText(/guide found|guides found/i);
    expect(resultsText).toBeInTheDocument();
  });

  it("filters guides by search query", () => {
    render(<GuidesPage />);
    
    const searchInput = screen.getByPlaceholderText("Search guides...");
    fireEvent.change(searchInput, { target: { value: "memory" } });
    
    // Should show memory-related guide
    expect(screen.getByText("Setting Up Agent Memory")).toBeInTheDocument();
  });

  it("displays difficulty badges", () => {
    render(<GuidesPage />);
    const beginnerBadges = screen.getAllByText("Beginner");
    expect(beginnerBadges.length).toBeGreaterThan(0);
  });

  it("displays estimated reading time", () => {
    render(<GuidesPage />);
    expect(screen.getByText(/15 min/i)).toBeInTheDocument();
  });

  it("displays CTA section", () => {
    render(<GuidesPage />);
    expect(screen.getByText("Ready to Build?")).toBeInTheDocument();
    expect(screen.getByText("Browse Skills →")).toBeInTheDocument();
  });

  it("shows no results message when no guides match filter", () => {
    render(<GuidesPage />);
    
    const searchInput = screen.getByPlaceholderText("Search guides...");
    fireEvent.change(searchInput, { target: { value: "nonexistentguide12345" } });
    
    expect(screen.getByText("No guides found")).toBeInTheDocument();
  });
});
