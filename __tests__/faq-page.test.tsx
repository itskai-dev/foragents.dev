/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FAQPage from "../src/app/faq/page";

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

describe("FAQ Page", () => {
  it("renders the FAQ page", () => {
    const { container } = render(<FAQPage />);
    expect(container).toBeInTheDocument();
  });

  it("displays the page title", () => {
    render(<FAQPage />);
    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
  });

  it("displays the search bar", () => {
    render(<FAQPage />);
    const searchInput = screen.getByPlaceholderText("Search questions...");
    expect(searchInput).toBeInTheDocument();
  });

  it("displays all category sections", () => {
    render(<FAQPage />);
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Getting Started")).toBeInTheDocument();
    expect(screen.getByText("Skills & Kits")).toBeInTheDocument();
    expect(screen.getByText("Billing & Pricing")).toBeInTheDocument();
    expect(screen.getByText("Security")).toBeInTheDocument();
    expect(screen.getByText("API")).toBeInTheDocument();
    expect(screen.getByText("Enterprise")).toBeInTheDocument();
  });

  it("displays question count for each category", () => {
    render(<FAQPage />);
    // Each category should have (4) next to it
    const categoryHeaders = screen.getAllByText(/\(4\)/);
    expect(categoryHeaders.length).toBeGreaterThan(0);
  });

  it("filters questions based on search input", () => {
    render(<FAQPage />);
    const searchInput = screen.getByPlaceholderText("Search questions...");
    
    fireEvent.change(searchInput, { target: { value: "API" } });
    
    // Should show result count
    expect(screen.getByText(/result\(s\) found/)).toBeInTheDocument();
  });

  it("displays 'Still need help?' CTA section", () => {
    render(<FAQPage />);
    expect(screen.getByText("Still need help?")).toBeInTheDocument();
    expect(screen.getByText("Join Community")).toBeInTheDocument();
    expect(screen.getByText("Contact Support")).toBeInTheDocument();
  });

  it("includes link to community page", () => {
    render(<FAQPage />);
    const communityLink = screen.getByText("Join Community").closest("a");
    expect(communityLink).toHaveAttribute("href", "/community");
  });

  it("includes link to support email", () => {
    render(<FAQPage />);
    const supportLink = screen.getByText("Contact Support").closest("a");
    expect(supportLink).toHaveAttribute("href", "mailto:support@foragents.dev");
  });

  it("displays thumbs up/down feedback buttons when accordion is opened", () => {
    render(<FAQPage />);
    
    // Find and click on the first accordion trigger to open it
    const firstQuestion = screen.getByText("What is forAgents.dev?");
    fireEvent.click(firstQuestion);
    
    // Now the feedback buttons should be visible
    const thumbsUpButtons = screen.getAllByLabelText("Thumbs up");
    const thumbsDownButtons = screen.getAllByLabelText("Thumbs down");
    
    // Should have at least one of each button
    expect(thumbsUpButtons.length).toBeGreaterThan(0);
    expect(thumbsDownButtons.length).toBeGreaterThan(0);
  });

  it("shows no results message when search returns empty", () => {
    render(<FAQPage />);
    const searchInput = screen.getByPlaceholderText("Search questions...");
    
    fireEvent.change(searchInput, { target: { value: "xyznonexistentquery123" } });
    
    expect(screen.getByText(/No questions found matching/)).toBeInTheDocument();
  });

  it("displays total question count in hero section", () => {
    render(<FAQPage />);
    expect(screen.getByText(/28 questions across/)).toBeInTheDocument();
  });
});
