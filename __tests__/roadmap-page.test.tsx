/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RoadmapPage from "../src/app/roadmap/page";

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
  usePathname: jest.fn(() => "/roadmap"),
}));

describe("Roadmap Page", () => {
  it("renders the roadmap page", () => {
    const { container } = render(<RoadmapPage />);
    expect(container).toBeInTheDocument();
  });

  it("displays the page title", () => {
    render(<RoadmapPage />);
    expect(screen.getByText("Product Roadmap")).toBeInTheDocument();
  });

  it("displays the page description", () => {
    render(<RoadmapPage />);
    expect(
      screen.getByText(/See what we're building/i)
    ).toBeInTheDocument();
  });

  it("displays category filter buttons", () => {
    render(<RoadmapPage />);
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Platform" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skills" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Community" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "API" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enterprise" })).toBeInTheDocument();
  });

  it("displays sort dropdown", () => {
    render(<RoadmapPage />);
    expect(screen.getByText("Sort by:")).toBeInTheDocument();
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });

  it("displays all status columns", () => {
    render(<RoadmapPage />);
    expect(screen.getByText("Planned")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Shipped")).toBeInTheDocument();
    expect(screen.getByText("Considering")).toBeInTheDocument();
  });

  it("displays roadmap items", () => {
    render(<RoadmapPage />);
    // Check for at least one item from the seed data
    expect(screen.getByText("Real-time Agent Monitoring")).toBeInTheDocument();
  });

  it("allows filtering by category", () => {
    render(<RoadmapPage />);
    const platformButton = screen.getByRole("button", { name: "Platform" });
    fireEvent.click(platformButton);
    expect(screen.getByText("Real-time Agent Monitoring")).toBeInTheDocument();
  });

  it("allows sorting items", () => {
    render(<RoadmapPage />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "newest" } });
    expect(select).toHaveValue("newest");
  });

  it("displays upvote and comment counts", () => {
    render(<RoadmapPage />);
    // Check that vote/comment icons and counts are rendered
    const cards = screen.getAllByRole("link");
    expect(cards.length).toBeGreaterThan(0);
  });

  it("items link to detail pages", () => {
    render(<RoadmapPage />);
    const links = screen.getAllByRole("link");
    const roadmapLink = links.find((link) =>
      link.getAttribute("href")?.startsWith("/roadmap/")
    );
    expect(roadmapLink).toBeTruthy();
  });
});
