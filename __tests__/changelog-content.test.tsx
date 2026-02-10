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
    id: "1",
    date: "2026-02-08",
    title: "New Feature Release",
    description: "Added new feature",
    category: "feature",
    prNumber: 11,
    prUrl: "https://github.com/test/pr/11",
  },
  {
    id: "2",
    date: "2026-02-07",
    title: "Bug Fix",
    description: "Fixed bug",
    category: "bugfix",
    prNumber: 12,
    prUrl: "https://github.com/test/pr/12",
  },
  {
    id: "3",
    date: "2026-02-06",
    title: "Documentation Update",
    description: "Updated docs",
    category: "docs",
    prNumber: 13,
    prUrl: "https://github.com/test/pr/13",
  },
];

describe("ChangelogContent", () => {
  it("renders all entries by default", () => {
    render(<ChangelogContent entries={mockEntries} />);
    expect(screen.getByText("New Feature Release")).toBeInTheDocument();
    expect(screen.getByText("Bug Fix")).toBeInTheDocument();
    expect(screen.getByText("Documentation Update")).toBeInTheDocument();
  });

  it("displays category filter tabs", () => {
    render(<ChangelogContent entries={mockEntries} />);
    const buttonTexts = screen.getAllByRole("button").map((b) => b.textContent);
    expect(buttonTexts).toEqual(expect.arrayContaining(["All", "Features", "Bugfixes", "Docs"]));
  });

  it("filters by bugfix category", () => {
    render(<ChangelogContent entries={mockEntries} />);
    fireEvent.click(screen.getByRole("button", { name: "Bugfixes" }));

    expect(screen.getByText("Bug Fix")).toBeInTheDocument();
    expect(screen.queryByText("New Feature Release")).not.toBeInTheDocument();
  });

  it("renders empty state when no entries", () => {
    render(<ChangelogContent entries={[]} />);
    expect(screen.getByText("No updates found for this filter.")).toBeInTheDocument();
  });
});
