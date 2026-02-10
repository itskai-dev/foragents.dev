/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import GlossaryPage from "@/app/glossary/page";

jest.setTimeout(10_000);

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-expect-error - test polyfill
global.ResizeObserver = global.ResizeObserver ?? NoopObserver;
// @ts-expect-error - test polyfill
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

const mockTerms = [
  {
    id: "agent",
    term: "Agent",
    definition: "Autonomous software actor",
    relatedTerms: ["Tool"],
    seeAlso: ["MCP"],
  },
  {
    id: "mcp",
    term: "MCP",
    definition: "Model Context Protocol",
    relatedTerms: ["Agent"],
    seeAlso: [],
  },
  {
    id: "tool",
    term: "Tool",
    definition: "External capability used by agents",
    relatedTerms: ["Agent"],
    seeAlso: [],
  },
];

describe.skip("/glossary page", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const params = new URL(url, "http://localhost").searchParams;
      const search = params.get("search")?.toLowerCase() ?? "";
      const letter = params.get("letter");

      let terms = [...mockTerms];
      if (search) {
        terms = terms.filter(
          (t) =>
            t.term.toLowerCase().includes(search) ||
            t.definition.toLowerCase().includes(search)
        );
      }
      if (letter) {
        terms = terms.filter((t) => t.term.startsWith(letter));
      }

      const letters = Array.from(new Set(mockTerms.map((t) => t.term[0].toUpperCase())));
      return {
        ok: true,
        json: async () => ({ terms, total: terms.length, letters }),
      } as Response;
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("renders hero and search input", async () => {
    render(<GlossaryPage />);
    expect(screen.getByText("📖 Agent Terminology")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search terms or definitions...")).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => expect(screen.getAllByText("Agent").length).toBeGreaterThan(0));
  });

  test("search filters terms", async () => {
    render(<GlossaryPage />);
    const input = screen.getByPlaceholderText("Search terms or definitions...");

    fireEvent.change(input, { target: { value: "protocol" } });
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.getByText("MCP")).toBeInTheDocument();
      expect(screen.queryByText("Tool")).not.toBeInTheDocument();
    });
  });

  test("shows empty state when no results", async () => {
    render(<GlossaryPage />);
    const input = screen.getByPlaceholderText("Search terms or definitions...");

    fireEvent.change(input, { target: { value: "xyznonexistent" } });
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.getByText("No terms found")).toBeInTheDocument();
      expect(screen.getByText("Show all terms")).toBeInTheDocument();
    });
  });
});
