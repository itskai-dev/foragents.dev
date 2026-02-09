/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PartnersPage from "@/app/partners/page";
import partnersData from "@/data/partners.json";

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

describe("Partners Page", () => {
  it("renders the partners page", () => {
    const { container } = render(<PartnersPage />);
    expect(container).toBeInTheDocument();
  });

  it("displays the page title", () => {
    render(<PartnersPage />);
    expect(screen.getByRole("heading", { name: /partners & integrations/i })).toBeInTheDocument();
  });

  it("displays partner count", () => {
    render(<PartnersPage />);
    expect(screen.getByText(`${partnersData.length} verified partners`)).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(<PartnersPage />);
    const searchInput = screen.getByPlaceholderText(/search partners/i);
    expect(searchInput).toBeInTheDocument();
  });

  it("renders tier filter buttons", () => {
    render(<PartnersPage />);
    expect(screen.getByText("Filter by Tier")).toBeInTheDocument();
    const buttons = screen.getAllByRole("button");
    expect(buttons.some(btn => btn.textContent === "Gold")).toBe(true);
    expect(buttons.some(btn => btn.textContent === "Silver")).toBe(true);
    expect(buttons.some(btn => btn.textContent === "Bronze")).toBe(true);
    expect(buttons.some(btn => btn.textContent === "Community")).toBe(true);
  });

  it("renders integration type filter buttons", () => {
    render(<PartnersPage />);
    const buttons = screen.getAllByRole("button");
    const apiButton = buttons.find(btn => btn.textContent === "API");
    const sdkButton = buttons.find(btn => btn.textContent === "SDK");
    const pluginButton = buttons.find(btn => btn.textContent === "Plugin");
    const serviceButton = buttons.find(btn => btn.textContent === "Service");
    
    expect(apiButton).toBeInTheDocument();
    expect(sdkButton).toBeInTheDocument();
    expect(pluginButton).toBeInTheDocument();
    expect(serviceButton).toBeInTheDocument();
  });

  it("displays all partners by default", () => {
    render(<PartnersPage />);
    const goldPartners = partnersData.filter(p => p.tier === "Gold");
    goldPartners.forEach(partner => {
      expect(screen.getByText(partner.name)).toBeInTheDocument();
    });
  });

  it("filters partners by tier", () => {
    render(<PartnersPage />);
    const goldButton = screen.getByRole("button", { name: /^gold$/i });
    fireEvent.click(goldButton);
    
    const goldPartners = partnersData.filter(p => p.tier === "Gold");
    const silverPartners = partnersData.filter(p => p.tier === "Silver");
    
    goldPartners.forEach(partner => {
      expect(screen.getByText(partner.name)).toBeInTheDocument();
    });
    
    silverPartners.forEach(partner => {
      expect(screen.queryByText(partner.name)).not.toBeInTheDocument();
    });
  });

  it("filters partners by integration type", () => {
    render(<PartnersPage />);
    const buttons = screen.getAllByRole("button");
    const apiButton = buttons.find(btn => btn.textContent === "API") as HTMLElement;
    fireEvent.click(apiButton);
    
    const apiPartners = partnersData.filter(p => p.integrationType === "API");
    const sdkPartners = partnersData.filter(p => p.integrationType === "SDK");
    
    apiPartners.forEach(partner => {
      expect(screen.getByText(partner.name)).toBeInTheDocument();
    });
    
    sdkPartners.forEach(partner => {
      expect(screen.queryByText(partner.name)).not.toBeInTheDocument();
    });
  });

  it("filters partners by search query", () => {
    render(<PartnersPage />);
    const searchInput = screen.getByPlaceholderText(/search partners/i);
    fireEvent.change(searchInput, { target: { value: "OpenClaw" } });
    
    expect(screen.getByText("OpenClaw")).toBeInTheDocument();
    expect(screen.queryByText("Supabase")).not.toBeInTheDocument();
  });

  it("shows no results message when filters match nothing", () => {
    render(<PartnersPage />);
    const searchInput = screen.getByPlaceholderText(/search partners/i);
    fireEvent.change(searchInput, { target: { value: "nonexistent partner xyz" } });
    
    expect(screen.getByText(/no partners found/i)).toBeInTheDocument();
  });

  it("displays partner cards with correct information", () => {
    render(<PartnersPage />);
    const openclaw = partnersData.find(p => p.slug === "openclaw");
    
    expect(screen.getByText(openclaw!.name)).toBeInTheDocument();
    expect(screen.getByText(openclaw!.description)).toBeInTheDocument();
    const tierBadges = screen.getAllByText(openclaw!.tier);
    expect(tierBadges.length).toBeGreaterThan(0);
    const integrationTypeBadges = screen.getAllByText(openclaw!.integrationType);
    expect(integrationTypeBadges.length).toBeGreaterThan(0);
  });

  it("displays partner icons", () => {
    render(<PartnersPage />);
    partnersData.forEach(partner => {
      expect(screen.getByText(partner.icon)).toBeInTheDocument();
    });
  });

  it("has links to partner detail pages", () => {
    render(<PartnersPage />);
    partnersData.forEach(partner => {
      const links = screen.getAllByRole("link");
      const partnerLink = links.find(link => 
        link.getAttribute("href") === `/partners/${partner.slug}`
      );
      expect(partnerLink).toBeInTheDocument();
    });
  });

  it("displays become a partner CTA section", () => {
    render(<PartnersPage />);
    expect(screen.getByRole("heading", { name: /become a partner/i })).toBeInTheDocument();
  });

  it("displays partner benefits", () => {
    render(<PartnersPage />);
    expect(screen.getByText(/featured placement/i)).toBeInTheDocument();
    expect(screen.getByText(/co-marketing/i)).toBeInTheDocument();
    expect(screen.getByText(/technical support/i)).toBeInTheDocument();
    expect(screen.getByText(/community access/i)).toBeInTheDocument();
    expect(screen.getByText(/early access/i)).toBeInTheDocument();
    expect(screen.getByText(/partner badge/i)).toBeInTheDocument();
  });

  it("has apply for partnership link", () => {
    render(<PartnersPage />);
    const applyLink = screen.getByRole("link", { name: /apply for partnership/i });
    expect(applyLink).toHaveAttribute("href", "/contact");
  });

  it("has view integration guides link", () => {
    render(<PartnersPage />);
    const guidesLink = screen.getByRole("link", { name: /view integration guides/i });
    expect(guidesLink).toHaveAttribute("href", "/guides");
  });

  it("combines tier and type filters correctly", () => {
    render(<PartnersPage />);
    
    // Filter by Gold tier
    const goldButton = screen.getByRole("button", { name: /^gold$/i });
    fireEvent.click(goldButton);
    
    // Then filter by API type
    const buttons = screen.getAllByRole("button");
    const apiButton = buttons.find(btn => btn.textContent === "API") as HTMLElement;
    fireEvent.click(apiButton);
    
    // Should only show Gold + API partners
    const goldApiPartners = partnersData.filter(
      p => p.tier === "Gold" && p.integrationType === "API"
    );
    const otherPartners = partnersData.filter(
      p => p.tier !== "Gold" || p.integrationType !== "API"
    );
    
    goldApiPartners.forEach(partner => {
      expect(screen.getByText(partner.name)).toBeInTheDocument();
    });
  });

  it("resets to all partners when clicking All button", () => {
    render(<PartnersPage />);
    
    // Filter by Gold
    const goldButton = screen.getByRole("button", { name: /^gold$/i });
    fireEvent.click(goldButton);
    
    // Reset to All
    const allButtons = screen.getAllByRole("button", { name: /^all$/i });
    fireEvent.click(allButtons[0]);
    
    // Should show all partners again
    partnersData.forEach(partner => {
      expect(screen.getByText(partner.name)).toBeInTheDocument();
    });
  });
});
