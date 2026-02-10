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
      question: "What is forAgents.dev in one sentence?",
      answer:
        "forAgents.dev is an agent-first directory of reusable skills, MCP servers, templates, and guides.",
    },
    {
      id: "faq-skills-1",
      category: "skills",
      question: "What is a skill on forAgents.dev?",
      answer: "A skill is a focused capability package with docs and install instructions.",
    },
  ],
  total: 15,
  categories: ["getting-started", "skills", "mcp", "pricing", "agents"],
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
    expect(screen.getByPlaceholderText("Search questions...")).toBeInTheDocument();
  });

  it("shows category tabs", async () => {
    render(<FAQPage />);

    expect(await screen.findByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Getting Started" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skills" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "MCP" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pricing" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Agents" })).toBeInTheDocument();
  });

  it("displays result count after searching", async () => {
    render(<FAQPage />);
    const searchInput = screen.getByPlaceholderText("Search questions...");

    fireEvent.change(searchInput, { target: { value: "skill" } });

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

  it("displays thumbs up/down feedback buttons when accordion is opened", async () => {
    render(<FAQPage />);

    const firstQuestion = await screen.findByText("What is forAgents.dev in one sentence?");
    fireEvent.click(firstQuestion);

    expect(screen.getAllByLabelText("Thumbs up").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("Thumbs down").length).toBeGreaterThan(0);
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
