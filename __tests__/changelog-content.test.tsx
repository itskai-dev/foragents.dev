/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChangelogContent } from "../src/app/changelog/changelog-content";
import type { ChangelogEntry } from "../src/lib/changelog";

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

const mockEntries: ChangelogEntry[] = [
  {
    date: "2026-02-08",
    title: "New Feature Release",
    description: "Added new feature by @user1",
    category: "feature",
    link: "/feature",
    pr: "https://github.com/test/pr/1",
  },
  {
    date: "2026-02-07",
    title: "Bug Fix",
    description: "Fixed bug by @user2",
    category: "fix",
    link: "/fix",
    pr: "https://github.com/test/pr/2",
  },
  {
    date: "2026-02-06",
    title: "Documentation Update",
    description: "Updated docs by @user3",
    category: "docs",
    link: "/docs",
    pr: "https://github.com/test/pr/3",
  },
  {
    date: "2026-02-05",
    title: "Code Refactor",
    description: "Refactored code by @user4",
    category: "refactor",
    link: "/refactor",
    pr: "https://github.com/test/pr/4",
  },
];

describe("ChangelogContent", () => {
  it("renders all entries by default", () => {
    render(<ChangelogContent entries={mockEntries} />);
    expect(screen.getByText("New Feature Release")).toBeInTheDocument();
    expect(screen.getByText("Bug Fix")).toBeInTheDocument();
    expect(screen.getByText("Documentation Update")).toBeInTheDocument();
    expect(screen.getByText("Code Refactor")).toBeInTheDocument();
  });

  it("displays stats banner", () => {
    render(<ChangelogContent entries={mockEntries} />);
    expect(screen.getByText("Changes This Month")).toBeInTheDocument();
    expect(screen.getByText("Features Shipped")).toBeInTheDocument();
    expect(screen.getByText("Bugs Fixed")).toBeInTheDocument();
  });

  it("displays category filter tabs", () => {
    render(<ChangelogContent entries={mockEntries} />);
    const buttons = screen.getAllByRole("button");
    const buttonTexts = buttons.map(b => b.textContent);
    expect(buttonTexts).toContain("All");
    expect(buttonTexts).toContain("Features");
    expect(buttonTexts).toContain("Fixes");
    expect(buttonTexts).toContain("Docs");
    expect(buttonTexts).toContain("Refactors");
    expect(buttonTexts).toContain("Tests");
  });

  it("filters by feature category", () => {
    render(<ChangelogContent entries={mockEntries} />);
    const featuresButton = screen.getAllByRole("button").find(b => b.textContent === "Features");
    fireEvent.click(featuresButton!);
    
    expect(screen.getByText("New Feature Release")).toBeInTheDocument();
    expect(screen.queryByText("Bug Fix")).not.toBeInTheDocument();
    expect(screen.queryByText("Documentation Update")).not.toBeInTheDocument();
  });

  it("filters by fix category", () => {
    render(<ChangelogContent entries={mockEntries} />);
    const fixesButton = screen.getAllByRole("button").find(b => b.textContent === "Fixes");
    fireEvent.click(fixesButton!);
    
    expect(screen.getByText("Bug Fix")).toBeInTheDocument();
    expect(screen.queryByText("New Feature Release")).not.toBeInTheDocument();
  });

  it("filters by docs category", () => {
    render(<ChangelogContent entries={mockEntries} />);
    const docsButton = screen.getAllByRole("button").find(b => b.textContent === "Docs");
    fireEvent.click(docsButton!);
    
    expect(screen.getByText("Documentation Update")).toBeInTheDocument();
    expect(screen.queryByText("New Feature Release")).not.toBeInTheDocument();
  });

  it("shows all entries when clicking All filter", () => {
    render(<ChangelogContent entries={mockEntries} />);
    
    // First filter by features
    const featuresButton = screen.getAllByRole("button").find(b => b.textContent === "Features");
    fireEvent.click(featuresButton!);
    expect(screen.queryByText("Bug Fix")).not.toBeInTheDocument();
    
    // Then click All
    const allButton = screen.getAllByRole("button").find(b => b.textContent === "All");
    fireEvent.click(allButton!);
    expect(screen.getByText("New Feature Release")).toBeInTheDocument();
    expect(screen.getByText("Bug Fix")).toBeInTheDocument();
  });

  it("displays PR links", () => {
    render(<ChangelogContent entries={mockEntries} />);
    const prLinks = screen.getAllByText(/View PR/);
    expect(prLinks.length).toBeGreaterThan(0);
  });

  it("renders empty state when no entries match filter", () => {
    const emptyEntries: ChangelogEntry[] = [];
    render(<ChangelogContent entries={emptyEntries} />);
    expect(screen.getByText("No updates found for this filter.")).toBeInTheDocument();
  });
});
