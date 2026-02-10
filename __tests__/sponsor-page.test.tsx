/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import SponsorPage from "../src/app/sponsor/page";

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

describe("Sponsor Page", () => {
  it("renders hero and core sections", async () => {
    const jsx = await SponsorPage();
    render(jsx);

    expect(screen.getByText("Support the Agent Ecosystem")).toBeInTheDocument();
    expect(screen.getByText("Sponsor Tiers")).toBeInTheDocument();
    expect(screen.getByText("Why Sponsor?")).toBeInTheDocument();
    expect(screen.getByText("Current Sponsors")).toBeInTheDocument();
  });

  it("shows tier pricing", async () => {
    const jsx = await SponsorPage();
    render(jsx);

    expect(screen.getByText("$5")).toBeInTheDocument();
    expect(screen.getByText("$25")).toBeInTheDocument();
    expect(screen.getByText("$100")).toBeInTheDocument();
  });

  it("renders CTA buttons", async () => {
    const jsx = await SponsorPage();
    render(jsx);

    expect(screen.getAllByText("Apply").length).toBeGreaterThan(0);
    expect(screen.getByText("Become a Sponsor")).toBeInTheDocument();
  });
});
