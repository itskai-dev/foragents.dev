/** @jest-environment jsdom */

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import RoadmapItemPage from "../src/app/roadmap/[id]/page";

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
  usePathname: jest.fn(() => "/roadmap/real-time-agent-monitoring"),
  notFound: jest.fn(),
}));

const mockItem = {
  id: "real-time-agent-monitoring",
  title: "Real-time Agent Monitoring",
  description: "Monitor agent activity in real-time with dashboards and alerts.",
  status: "planned",
  quarter: "Q2 2026",
  category: "platform",
  votes: 42,
  updatedAt: "2026-02-01",
};

beforeEach(() => {
  global.fetch = jest.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/api/roadmap/")) {
      return {
        ok: true,
        json: async () => ({ item: mockItem }),
      } as Response;
    }
    return { ok: true, json: async () => ({}) } as Response;
  }) as jest.Mock;
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Roadmap Detail Page", () => {
  const mockParams = Promise.resolve({ id: "real-time-agent-monitoring" });

  it("renders the roadmap detail page", async () => {
    const { container } = render(<RoadmapItemPage params={mockParams} />);
    expect(container).toBeInTheDocument();
  });

  it("displays loading state initially", () => {
    render(<RoadmapItemPage params={mockParams} />);
    expect(screen.getByText("Loading roadmap item...")).toBeInTheDocument();
  });

  it("displays back to roadmap link", async () => {
    render(<RoadmapItemPage params={mockParams} />);
    await waitFor(() => {
      expect(screen.getByText(/Back to Roadmap/)).toBeInTheDocument();
    });
  });

  it("displays the item title", async () => {
    render(<RoadmapItemPage params={mockParams} />);
    await waitFor(() => {
      expect(screen.getByText("Real-time Agent Monitoring")).toBeInTheDocument();
    });
  });

  it("displays category and status badges", async () => {
    render(<RoadmapItemPage params={mockParams} />);
    await waitFor(() => {
      expect(screen.getByText("Platform")).toBeInTheDocument();
      expect(screen.getByText("Planned")).toBeInTheDocument();
    });
  });

  it("displays vote count", async () => {
    render(<RoadmapItemPage params={mockParams} />);
    await waitFor(() => {
      expect(screen.getByText(/42/)).toBeInTheDocument();
      expect(screen.getByText(/votes/i)).toBeInTheDocument();
    });
  });

  it("displays the description section", async () => {
    render(<RoadmapItemPage params={mockParams} />);
    await waitFor(() => {
      expect(screen.getByText("Description")).toBeInTheDocument();
    });
  });

  it("has a vote button", async () => {
    render(<RoadmapItemPage params={mockParams} />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Vote for this feature/i })
      ).toBeInTheDocument();
    });
  });

  it("allows voting on the feature", async () => {
    const votedItem = { ...mockItem, votes: 43 };
    (global.fetch as jest.Mock).mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/roadmap/")) {
        return {
          ok: true,
          json: async () => ({ item: votedItem }),
        } as Response;
      }
      return { ok: true, json: async () => ({}) } as Response;
    });

    render(<RoadmapItemPage params={mockParams} />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Vote for this feature/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Vote for this feature/i }));

    await waitFor(() => {
      expect(screen.getByText(/43/)).toBeInTheDocument();
    });
  });

  it("displays quarter info", async () => {
    render(<RoadmapItemPage params={mockParams} />);
    await waitFor(() => {
      expect(screen.getByText("Q2 2026")).toBeInTheDocument();
    });
  });

  it("handles fetch error gracefully", async () => {
    (global.fetch as jest.Mock).mockImplementation(async () => ({
      ok: false,
      json: async () => ({ error: "Not found" }),
    }));

    render(<RoadmapItemPage params={mockParams} />);
    await waitFor(() => {
      expect(screen.getByText("Not found")).toBeInTheDocument();
    });
  });
});
