/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import ChangelogPage from "../src/app/changelog/page";
import * as changelogLib from "../src/lib/changelog";

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

// Mock the changelog data
jest.mock("../src/lib/changelog", () => ({
  getChangelogEntries: jest.fn(),
  type: jest.fn(),
}));

const mockEntries = [
  {
    date: "2026-02-08",
    title: "Test Feature",
    description: "A test feature description",
    category: "feature" as const,
    link: "/test",
    pr: "https://github.com/test/pr/1",
  },
  {
    date: "2026-02-07",
    title: "Test Fix",
    description: "A test fix description",
    category: "fix" as const,
    link: "/test-fix",
    pr: "https://github.com/test/pr/2",
  },
];

describe("Changelog Page", () => {
  beforeEach(() => {
    (changelogLib.getChangelogEntries as jest.Mock).mockResolvedValue(mockEntries);
  });

  it("renders the changelog page", async () => {
    const jsx = await ChangelogPage();
    const { container } = render(jsx);
    expect(container).toBeInTheDocument();
  });

  it("displays the page title", async () => {
    const jsx = await ChangelogPage();
    render(jsx);
    expect(screen.getByText("Changelog")).toBeInTheDocument();
  });

  it("displays the description", async () => {
    const jsx = await ChangelogPage();
    render(jsx);
    expect(screen.getByText(/Recent updates and improvements/)).toBeInTheDocument();
  });

  it("displays newsletter signup section", async () => {
    const jsx = await ChangelogPage();
    render(jsx);
    const subscribeButtons = screen.getAllByText("Subscribe");
    expect(subscribeButtons.length).toBeGreaterThan(0);
  });

  it("displays the API link", async () => {
    const jsx = await ChangelogPage();
    render(jsx);
    const apiLink = screen.getByText("/api/changelog");
    expect(apiLink).toBeInTheDocument();
    expect(apiLink.closest("a")).toHaveAttribute("href", "/api/changelog");
  });

  it("renders with no entries", async () => {
    (changelogLib.getChangelogEntries as jest.Mock).mockResolvedValue([]);
    const jsx = await ChangelogPage();
    const { container } = render(jsx);
    expect(container).toBeInTheDocument();
  });
});
