/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import ChangelogPage from "../src/app/changelog/page";

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

jest.mock("next/headers", () => ({
  headers: jest.fn(async () =>
    new Map([
      ["host", "localhost:3000"],
      ["x-forwarded-proto", "http"],
    ])
  ),
}));

const mockEntries = [
  {
    id: "entry-1",
    date: "2026-02-08",
    title: "Test Feature",
    description: "A test feature description",
    category: "feature",
    prNumber: 101,
    prUrl: "https://github.com/test/pr/101",
  },
  {
    id: "entry-2",
    date: "2026-02-07",
    title: "Test Fix",
    description: "A test fix description",
    category: "bugfix",
    prNumber: 102,
    prUrl: "https://github.com/test/pr/102",
  },
];

describe("Changelog Page", () => {
  beforeEach(() => {
    global.fetch = jest.fn(async () =>
      ({
        ok: true,
        json: async () => ({ entries: mockEntries, total: mockEntries.length }),
      } as Response)
    ) as jest.Mock;
  });

  it("renders the changelog page", async () => {
    const jsx = await ChangelogPage();
    const { container } = render(jsx);
    expect(container).toBeInTheDocument();
  });

  it("displays the page title and description", async () => {
    const jsx = await ChangelogPage();
    render(jsx);
    expect(screen.getByText("Changelog")).toBeInTheDocument();
    expect(screen.getByText(/Recent updates and improvements/)).toBeInTheDocument();
  });

  it("displays newsletter CTA and API link", async () => {
    const jsx = await ChangelogPage();
    render(jsx);

    expect(screen.getAllByText("Subscribe").length).toBeGreaterThan(0);
    const apiLink = screen.getByText("/api/changelog");
    expect(apiLink.closest("a")).toHaveAttribute("href", "/api/changelog");
  });

  it("renders even when API returns no entries", async () => {
    global.fetch = jest.fn(async () =>
      ({
        ok: true,
        json: async () => ({ entries: [], total: 0 }),
      } as Response)
    ) as jest.Mock;

    const jsx = await ChangelogPage();
    const { container } = render(jsx);
    expect(container).toBeInTheDocument();
  });
});
