/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import GuidePage from "../src/app/guides/[slug]/page";

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
  notFound: jest.fn(),
  usePathname: () => "/guides/your-first-agent",
}));

describe.skip("Guide Detail Page", () => {
  const mockParams = Promise.resolve({ slug: "your-first-agent" });

  it("renders a guide page", async () => {
    const { container } = render(await GuidePage({ params: mockParams }));
    expect(container).toBeInTheDocument();
  });

  it("displays the guide title", async () => {
    render(await GuidePage({ params: mockParams }));
    expect(screen.getAllByText("Your First Agent").length).toBeGreaterThan(0);
  });

  it("displays the guide description", async () => {
    render(await GuidePage({ params: mockParams }));
    expect(
      screen.getByText(/Build your first AI agent from scratch/i)
    ).toBeInTheDocument();
  });

  it("displays difficulty badge", async () => {
    render(await GuidePage({ params: mockParams }));
    expect(screen.getAllByText("Beginner").length).toBeGreaterThan(0);
  });

  it("displays estimated reading time", async () => {
    render(await GuidePage({ params: mockParams }));
    expect(screen.getByText(/15 min read/i)).toBeInTheDocument();
  });

  it("displays category", async () => {
    render(await GuidePage({ params: mockParams }));
    expect(screen.getByText("Getting Started")).toBeInTheDocument();
  });

  it("displays breadcrumb navigation", async () => {
    render(await GuidePage({ params: mockParams }));
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getAllByText("Guides")[0]).toBeInTheDocument();
  });

  it("displays table of contents", async () => {
    render(await GuidePage({ params: mockParams }));
    expect(screen.getByText("Table of Contents")).toBeInTheDocument();
  });

  it("displays content sections", async () => {
    render(await GuidePage({ params: mockParams }));
    expect(
      screen.getByText(/Welcome to your first AI agent/i)
    ).toBeInTheDocument();
  });

  it("displays related guides section", async () => {
    render(await GuidePage({ params: mockParams }));
    expect(screen.getByText("Related Guides")).toBeInTheDocument();
  });

  it("displays back to guides button", async () => {
    render(await GuidePage({ params: mockParams }));
    expect(screen.getByText("← All Guides")).toBeInTheDocument();
  });

  it("displays navigation to next guide", async () => {
    render(await GuidePage({ params: mockParams }));
    // The first guide should have a "Next" link
    const nextLinks = screen.queryAllByText("Next");
    expect(nextLinks.length).toBeGreaterThan(0);
  });

  it("displays tags", async () => {
    render(await GuidePage({ params: mockParams }));
    expect(screen.getByText("#basics")).toBeInTheDocument();
    expect(screen.getByText("#setup")).toBeInTheDocument();
    expect(screen.getByText("#beginner")).toBeInTheDocument();
  });
});
