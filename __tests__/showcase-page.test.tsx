/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";

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

jest.mock("@/app/showcase/showcase-client", () => ({
  ShowcaseClient: () => <div data-testid="showcase-client">Mocked Showcase Client</div>,
}));

import ShowcasePage from "@/app/showcase/page";

describe("Showcase Page", () => {
  test("renders heading and description", () => {
    render(<ShowcasePage />);

    expect(screen.getByRole("heading", { name: /community showcase/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/discover what other builders are shipping/i)).toBeInTheDocument();
  });

  test("renders showcase client component", () => {
    render(<ShowcasePage />);
    expect(screen.getByTestId("showcase-client")).toBeInTheDocument();
  });
});
