/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import DiffPage from "../src/app/diff/page";

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

describe("Diff Page", () => {
  it("renders the diff page", () => {
    const { container } = render(<DiffPage />);
    expect(container).toBeInTheDocument();
  });

  it("displays the page title", () => {
    render(<DiffPage />);
    expect(screen.getByText("Skill Diff Viewer")).toBeInTheDocument();
  });

  it("displays configuration section", () => {
    render(<DiffPage />);
    expect(screen.getByText("Configuration")).toBeInTheDocument();
  });

  it("displays skill selector label", () => {
    render(<DiffPage />);
    expect(screen.getByText("Skill")).toBeInTheDocument();
  });

  it("displays version selectors", () => {
    render(<DiffPage />);
    expect(screen.getByText("Version 1 (Old)")).toBeInTheDocument();
    expect(screen.getByText("Version 2 (New)")).toBeInTheDocument();
  });

  it("displays view mode toggle", () => {
    render(<DiffPage />);
    expect(screen.getByText("View Mode")).toBeInTheDocument();
    expect(screen.getByText("Unified")).toBeInTheDocument();
    expect(screen.getByText("Split")).toBeInTheDocument();
  });
});
