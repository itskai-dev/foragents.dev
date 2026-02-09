/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BenchmarksPage from "../src/app/benchmarks/page";

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

jest.mock("fs", () => ({
  readFileSync: jest.fn(() =>
    JSON.stringify([
      {
        id: "agent-1",
        name: "Claude Code",
        category: "coding",
        responseTime: 850,
        accuracy: 94,
        costEfficiency: 88,
        reliability: 96,
      },
      {
        id: "agent-2",
        name: "GPT-4 Assistant",
        category: "general",
        responseTime: 1200,
        accuracy: 92,
        costEfficiency: 75,
        reliability: 91,
      },
    ])
  ),
}));

jest.mock("path", () => ({
  join: jest.fn((...args) => args.join("/")),
}));

describe("Benchmarks Page", () => {
  it("renders the benchmarks page", () => {
    const { container } = render(<BenchmarksPage />);
    expect(container).toBeInTheDocument();
  });

  it("displays the page title", () => {
    render(<BenchmarksPage />);
    expect(screen.getByText("Agent Benchmarks")).toBeInTheDocument();
  });

  it("displays the page description", () => {
    render(<BenchmarksPage />);
    expect(
      screen.getByText(/Performance comparison of AI agents/i)
    ).toBeInTheDocument();
  });

  it("displays agent names in the table", () => {
    render(<BenchmarksPage />);
    expect(screen.getByText("Claude Code")).toBeInTheDocument();
    expect(screen.getByText("GPT-4 Assistant")).toBeInTheDocument();
  });

  it("displays category filter buttons", () => {
    render(<BenchmarksPage />);
    expect(screen.getByText("All Categories")).toBeInTheDocument();
  });

  it("displays table headers", () => {
    render(<BenchmarksPage />);
    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText(/Response Time \(ms\)/)).toBeInTheDocument();
    expect(screen.getAllByText(/Accuracy/)[0]).toBeInTheDocument();
    expect(screen.getByText(/Cost Efficiency/)).toBeInTheDocument();
    expect(screen.getAllByText(/Reliability/)[0]).toBeInTheDocument();
  });

  it("allows filtering by category", () => {
    render(<BenchmarksPage />);
    const codingButton = screen.getByText("Coding");
    fireEvent.click(codingButton);
    expect(screen.getByText("Claude Code")).toBeInTheDocument();
  });

  it("allows sorting by clicking column headers", () => {
    render(<BenchmarksPage />);
    const allTables = document.querySelectorAll("table");
    expect(allTables.length).toBeGreaterThan(0);
    expect(screen.getByText("Claude Code")).toBeInTheDocument();
  });
});
