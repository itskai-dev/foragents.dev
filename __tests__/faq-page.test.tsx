/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

const mockFaqResponse = {
  faqs: [
    {
      id: "faq-getting-started-1",
      category: "getting-started",
      question: "What is forAgents.dev?",
      answer: "forAgents.dev is an agent-first directory.",
      helpful: 10,
    },
    {
      id: "faq-billing-1",
      category: "billing",
      question: "Is forAgents.dev free to use?",
      answer: "Core discovery features are free.",
      helpful: 12,
    },
  ],
  total: 2,
  categories: ["getting-started", "billing", "technical", "integrations", "security", "general"],
};

describe("FAQ Page", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockFaqResponse,
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

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
    expect(screen.getByPlaceholderText("Search questions or answers...")).toBeInTheDocument();
  });

  it("shows category tabs", async () => {
    render(<FAQPage />);

    expect(await screen.findByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Getting Started" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Billing" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Technical" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Integrations" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Security" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "General" })).toBeInTheDocument();
  });

  it("displays result count after searching", async () => {
    render(<FAQPage />);
    const searchInput = screen.getByPlaceholderText("Search questions or answers...");

    fireEvent.change(searchInput, { target: { value: "agent" } });

    await waitFor(() => {
      expect(screen.getByText(/result\(s\) found/)).toBeInTheDocument();
    });
  });

  it("includes CTA links", () => {
    render(<FAQPage />);
    expect(screen.getByText("Still need help?")).toBeInTheDocument();

    const communityLink = screen.getByText("Join Community").closest("a");
    expect(communityLink).toHaveAttribute("href", "/community");

    const supportLink = screen.getByText("Contact Support").closest("a");
    expect(supportLink).toHaveAttribute("href", "mailto:support@foragents.dev");
  });

  it("displays helpful button when accordion is opened", async () => {
    render(<FAQPage />);

    const firstQuestion = await screen.findByText("What is forAgents.dev?");
    fireEvent.click(firstQuestion);

    expect(screen.getAllByText("Was this helpful?").length).toBeGreaterThan(0);
  });

  it("calls faq api", async () => {
    render(<FAQPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/faq",
        expect.objectContaining({ method: "GET", cache: "no-store" })
      );
    });
  });
});
