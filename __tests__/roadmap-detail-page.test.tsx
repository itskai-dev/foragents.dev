/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
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

describe("Roadmap Detail Page", () => {
  const mockParams = Promise.resolve({ id: "real-time-agent-monitoring" });

  it("renders the roadmap detail page", () => {
    const { container } = render(<RoadmapItemPage params={mockParams} />);
    expect(container).toBeInTheDocument();
  });

  it("displays back to roadmap link", () => {
    render(<RoadmapItemPage params={mockParams} />);
    expect(screen.getByText("Back to Roadmap")).toBeInTheDocument();
  });

  it("displays the item title", () => {
    render(<RoadmapItemPage params={mockParams} />);
    expect(screen.getByText("Real-time Agent Monitoring")).toBeInTheDocument();
  });

  it("displays category and status badges", () => {
    render(<RoadmapItemPage params={mockParams} />);
    const badges = screen.getAllByText("Platform");
    expect(badges.length).toBeGreaterThan(0);
    const statusBadges = screen.getAllByText("Planned");
    expect(statusBadges.length).toBeGreaterThan(0);
  });

  it("displays upvote count", () => {
    render(<RoadmapItemPage params={mockParams} />);
    const upvoteText = screen.getByText(/upvotes/i);
    expect(upvoteText).toBeInTheDocument();
  });

  it("displays comment count", () => {
    render(<RoadmapItemPage params={mockParams} />);
    const commentText = screen.getByText(/comments/i);
    expect(commentText).toBeInTheDocument();
  });

  it("displays the full description section", () => {
    render(<RoadmapItemPage params={mockParams} />);
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("displays the status timeline section", () => {
    render(<RoadmapItemPage params={mockParams} />);
    expect(screen.getByText("Status Timeline")).toBeInTheDocument();
  });

  it("displays the discussion section", () => {
    render(<RoadmapItemPage params={mockParams} />);
    expect(screen.getByText(/Discussion/i)).toBeInTheDocument();
  });

  it("displays the share section", () => {
    render(<RoadmapItemPage params={mockParams} />);
    expect(screen.getByText("Share")).toBeInTheDocument();
    expect(screen.getByText("Share on Twitter")).toBeInTheDocument();
    expect(screen.getByText("Copy Link")).toBeInTheDocument();
  });

  it("has an upvote button", () => {
    render(<RoadmapItemPage params={mockParams} />);
    const upvoteButton = screen.getByRole("button", {
      name: /Upvote this feature/i,
    });
    expect(upvoteButton).toBeInTheDocument();
  });

  it("allows voting on the feature", () => {
    render(<RoadmapItemPage params={mockParams} />);
    const upvoteButton = screen.getByRole("button", {
      name: /Upvote this feature/i,
    });
    
    fireEvent.click(upvoteButton);
    
    expect(screen.getByText("Voted")).toBeInTheDocument();
  });

  it("displays comment form", () => {
    render(<RoadmapItemPage params={mockParams} />);
    const textarea = screen.getByPlaceholderText(
      /Share your thoughts or suggestions/i
    );
    expect(textarea).toBeInTheDocument();
    
    const postButton = screen.getByRole("button", { name: /Post Comment/i });
    expect(postButton).toBeInTheDocument();
  });

  it("displays mock discussion comments", () => {
    render(<RoadmapItemPage params={mockParams} />);
    expect(screen.getByText("agent_dev_42")).toBeInTheDocument();
  });

  it("displays timeline events", () => {
    render(<RoadmapItemPage params={mockParams} />);
    // Timeline should show status updates
    const timelineDots = document.querySelectorAll(".absolute.left-0");
    expect(timelineDots.length).toBeGreaterThan(0);
  });
});
