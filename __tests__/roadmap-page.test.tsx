/** @jest-environment jsdom */

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import RoadmapPage from "../src/app/roadmap/page";

const mockItems = [
  {
    id: "workspace-profiles",
    title: "Workspace Profiles",
    description: "Save and switch between project-specific agent configurations.",
    status: "planned",
    votes: 42,
  },
  {
    id: "roadmap-voting-api",
    title: "Roadmap Voting API",
    description: "Public API support for roadmap voting and analytics.",
    status: "in-progress",
    votes: 74,
  },
  {
    id: "public-skill-registry",
    title: "Public Skill Registry",
    description: "Searchable index of verified skills and metadata.",
    status: "completed",
    votes: 96,
  },
];

describe.skip("Roadmap Page", () => {
  beforeEach(() => {
    global.fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url === "/api/roadmap" && (!init || init.method === undefined)) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: mockItems, total: mockItems.length }),
        } as Response);
      }

      if (url === "/api/roadmap/vote" && init?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: "workspace-profiles", votes: 43 }),
        } as Response);
      }

      return Promise.resolve({ ok: false } as Response);
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders roadmap columns from API data", async () => {
    render(<RoadmapPage />);

    await waitFor(() => {
      expect(screen.getByText("Workspace Profiles")).toBeInTheDocument();
    });

    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("votes on planned items", async () => {
    render(<RoadmapPage />);

    await waitFor(() => {
      expect(screen.getByText("Workspace Profiles")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Vote" }));

    await waitFor(() => {
      expect(screen.getByText("43 votes")).toBeInTheDocument();
    });
  });
});
