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
  it("renders the sponsor page", () => {
    const { container } = render(<SponsorPage />);
    expect(container).toBeInTheDocument();
  });

  it("displays the hero heading", () => {
    render(<SponsorPage />);
    expect(
      screen.getByText("Support the Agent Ecosystem")
    ).toBeInTheDocument();
  });

  it("displays the mission statement", () => {
    render(<SponsorPage />);
    expect(
      screen.getByText(/forAgents.dev is built by the community/)
    ).toBeInTheDocument();
  });

  it("displays all sponsor tiers", () => {
    render(<SponsorPage />);
    const individualTiers = screen.getAllByText("Individual");
    const teamTiers = screen.getAllByText("Team");
    const enterpriseTiers = screen.getAllByText("Enterprise");
    const customTiers = screen.getAllByText("Custom");
    
    expect(individualTiers.length).toBeGreaterThan(0);
    expect(teamTiers.length).toBeGreaterThan(0);
    expect(enterpriseTiers.length).toBeGreaterThan(0);
    expect(customTiers.length).toBeGreaterThan(0);
  });

  it("displays tier prices", () => {
    render(<SponsorPage />);
    expect(screen.getByText("$5")).toBeInTheDocument();
    expect(screen.getByText("$25")).toBeInTheDocument();
    expect(screen.getByText("$100")).toBeInTheDocument();
  });

  it("displays sponsor CTA buttons", () => {
    render(<SponsorPage />);
    const sponsorButtons = screen.getAllByText("Sponsor");
    expect(sponsorButtons.length).toBeGreaterThan(0);
  });

  it("displays the Why Sponsor section", () => {
    render(<SponsorPage />);
    expect(screen.getByText("Why Sponsor?")).toBeInTheDocument();
  });

  it("displays all four benefit cards", () => {
    render(<SponsorPage />);
    expect(screen.getByText("Visibility")).toBeInTheDocument();
    expect(screen.getByText("Priority Support")).toBeInTheDocument();
    expect(screen.getByText("Early Access")).toBeInTheDocument();
    expect(screen.getByText("Community Recognition")).toBeInTheDocument();
  });

  it("displays the Our Sponsors section", () => {
    render(<SponsorPage />);
    expect(screen.getByText("Our Sponsors")).toBeInTheDocument();
  });

  it("displays impact stats", () => {
    render(<SponsorPage />);
    expect(screen.getByText("Skills Funded")).toBeInTheDocument();
    expect(screen.getByText("Agents Supported")).toBeInTheDocument();
    expect(screen.getByText("Community Members")).toBeInTheDocument();
  });

  it("displays impact stat values", () => {
    render(<SponsorPage />);
    expect(screen.getByText("127")).toBeInTheDocument();
    expect(screen.getByText("2,400+")).toBeInTheDocument();
    expect(screen.getByText("18,000+")).toBeInTheDocument();
  });

  it("displays sponsor tier badges", () => {
    render(<SponsorPage />);
    // Check that tier names appear in the tier cards
    const tierCards = screen.getAllByText("Individual");
    expect(tierCards.length).toBeGreaterThan(0);
  });

  it("displays the final CTA section", () => {
    render(<SponsorPage />);
    expect(screen.getByText("Ready to make an impact?")).toBeInTheDocument();
  });

  it("displays contact link", () => {
    render(<SponsorPage />);
    const contactButtons = screen.getAllByText("Contact Us");
    expect(contactButtons.length).toBeGreaterThan(0);
  });
});
