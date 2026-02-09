/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import { notFound } from "next/navigation";
import PartnerDetailPage from "@/app/partners/[slug]/page";
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

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

describe("Partner Detail Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders OpenClaw partner details", async () => {
    const params = Promise.resolve({ slug: "openclaw" });
    render(await PartnerDetailPage({ params }));
    
    expect(screen.getByRole("heading", { name: /openclaw/i })).toBeInTheDocument();
    expect(screen.getByText(/open-source ai agent orchestration platform/i)).toBeInTheDocument();
  });

  test("renders Supabase partner details", async () => {
    const params = Promise.resolve({ slug: "supabase" });
    render(await PartnerDetailPage({ params }));
    
    expect(screen.getByRole("heading", { name: /supabase/i })).toBeInTheDocument();
    expect(screen.getByText(/open-source firebase alternative/i)).toBeInTheDocument();
  });

  test("displays tier and integration type badges", async () => {
    const params = Promise.resolve({ slug: "openclaw" });
    render(await PartnerDetailPage({ params }));
    
    expect(screen.getByText(/gold partner/i)).toBeInTheDocument();
    expect(screen.getByText("SDK")).toBeInTheDocument();
  });

  test("shows partner icon", async () => {
    const params = Promise.resolve({ slug: "openclaw" });
    render(await PartnerDetailPage({ params }));
    
    const partner = partnersData.find(p => p.slug === "openclaw");
    expect(partner).toBeDefined();
    expect(screen.getByText(partner!.icon)).toBeInTheDocument();
  });

  test("displays full description", async () => {
    const params = Promise.resolve({ slug: "anthropic" });
    render(await PartnerDetailPage({ params }));
    
    const partner = partnersData.find(p => p.slug === "anthropic");
    expect(screen.getByText(partner!.fullDescription)).toBeInTheDocument();
  });

  test("renders key features section", async () => {
    const params = Promise.resolve({ slug: "openclaw" });
    render(await PartnerDetailPage({ params }));
    
    expect(screen.getByText(/key features/i)).toBeInTheDocument();
    
    const partner = partnersData.find(p => p.slug === "openclaw");
    partner!.features.forEach(feature => {
      expect(screen.getByText(feature)).toBeInTheDocument();
    });
  });

  test("displays integration guide section", async () => {
    const params = Promise.resolve({ slug: "supabase" });
    render(await PartnerDetailPage({ params }));
    
    expect(screen.getByText(/integration guide/i)).toBeInTheDocument();
    
    const partner = partnersData.find(p => p.slug === "supabase");
    const codeSnippet = screen.getByText(new RegExp(partner!.integrationGuide.split('\n')[0]));
    expect(codeSnippet).toBeInTheDocument();
  });

  test("shows get in touch section", async () => {
    const params = Promise.resolve({ slug: "openclaw" });
    render(await PartnerDetailPage({ params }));
    
    expect(screen.getByText(/get in touch/i)).toBeInTheDocument();
  });

  test("has link to official documentation", async () => {
    const params = Promise.resolve({ slug: "openclaw" });
    render(await PartnerDetailPage({ params }));
    
    const partner = partnersData.find(p => p.slug === "openclaw");
    const docLinks = screen.getAllByRole("link", { name: /view documentation/i });
    expect(docLinks.length).toBeGreaterThan(0);
    expect(docLinks[0]).toHaveAttribute("href", partner!.docsUrl);
    expect(docLinks[0]).toHaveAttribute("target", "_blank");
  });

  test("displays partner contact email", async () => {
    const params = Promise.resolve({ slug: "openclaw" });
    render(await PartnerDetailPage({ params }));
    
    const partner = partnersData.find(p => p.slug === "openclaw");
    expect(screen.getByText(partner!.contactEmail)).toBeInTheDocument();
  });

  test("has partner support email link", async () => {
    const params = Promise.resolve({ slug: "anthropic" });
    render(await PartnerDetailPage({ params }));
    
    const partner = partnersData.find(p => p.slug === "anthropic");
    const emailLink = screen.getByRole("link", { name: new RegExp(partner!.contactEmail) });
    expect(emailLink).toHaveAttribute("href", `mailto:${partner!.contactEmail}`);
  });

  test("renders breadcrumb navigation", async () => {
    const params = Promise.resolve({ slug: "openclaw" });
    render(await PartnerDetailPage({ params }));
    
    const homeLink = screen.getByRole("link", { name: /^home$/i });
    expect(homeLink).toHaveAttribute("href", "/");
    
    const partnersLink = screen.getByRole("link", { name: /^partners$/i });
    expect(partnersLink).toHaveAttribute("href", "/partners");
  });

  test("has back to partners link", async () => {
    const params = Promise.resolve({ slug: "openclaw" });
    render(await PartnerDetailPage({ params }));
    
    const backLink = screen.getByRole("link", { name: /back to partners/i });
    expect(backLink).toHaveAttribute("href", "/partners");
  });

  test("has link to forAgents.dev guides", async () => {
    const params = Promise.resolve({ slug: "openclaw" });
    render(await PartnerDetailPage({ params }));
    
    const guidesLinks = screen.getAllByRole("link", { name: /foragents\.dev guides/i });
    expect(guidesLinks.length).toBeGreaterThan(0);
    expect(guidesLinks[0]).toHaveAttribute("href", "/guides");
  });

  test("has link to general support", async () => {
    const params = Promise.resolve({ slug: "openclaw" });
    render(await PartnerDetailPage({ params }));
    
    const supportLink = screen.getByRole("link", { name: /general support/i });
    expect(supportLink).toHaveAttribute("href", "/contact");
  });

  test("calls notFound for invalid slug", async () => {
    const params = Promise.resolve({ slug: "invalid-partner-slug-xyz" });
    
    try {
      await PartnerDetailPage({ params });
    } catch (error) {
      // Expected to throw
    }
    
    expect(notFound).toHaveBeenCalled();
  });

  test("renders Silver tier partner correctly", async () => {
    const params = Promise.resolve({ slug: "vercel" });
    render(await PartnerDetailPage({ params }));
    
    expect(screen.getByRole("heading", { name: /vercel/i })).toBeInTheDocument();
    expect(screen.getByText(/silver partner/i)).toBeInTheDocument();
  });

  test("renders Bronze tier partner correctly", async () => {
    const params = Promise.resolve({ slug: "github" });
    render(await PartnerDetailPage({ params }));
    
    expect(screen.getByRole("heading", { name: /github/i })).toBeInTheDocument();
    expect(screen.getByText(/bronze partner/i)).toBeInTheDocument();
  });

  test("renders Community tier partner correctly", async () => {
    const params = Promise.resolve({ slug: "langchain" });
    render(await PartnerDetailPage({ params }));
    
    expect(screen.getByRole("heading", { name: /langchain/i })).toBeInTheDocument();
    expect(screen.getByText(/community partner/i)).toBeInTheDocument();
  });

  test("renders API integration type correctly", async () => {
    const params = Promise.resolve({ slug: "anthropic" });
    render(await PartnerDetailPage({ params }));
    
    expect(screen.getByText("API")).toBeInTheDocument();
  });

  test("renders SDK integration type correctly", async () => {
    const params = Promise.resolve({ slug: "openclaw" });
    render(await PartnerDetailPage({ params }));
    
    expect(screen.getByText("SDK")).toBeInTheDocument();
  });

  test("renders Service integration type correctly", async () => {
    const params = Promise.resolve({ slug: "vercel" });
    render(await PartnerDetailPage({ params }));
    
    expect(screen.getByText("Service")).toBeInTheDocument();
  });

  test("displays all partner features with checkmarks", async () => {
    const params = Promise.resolve({ slug: "supabase" });
    render(await PartnerDetailPage({ params }));
    
    const partner = partnersData.find(p => p.slug === "supabase");
    const checkmarks = screen.getAllByText("✓");
    expect(checkmarks.length).toBeGreaterThanOrEqual(partner!.features.length);
  });

  test("renders all 12 seed partners correctly", async () => {
    const slugs = [
      "openclaw", "supabase", "vercel", "anthropic",
      "openai", "stripe", "github", "cloudflare",
      "langchain", "crewai", "autogpt", "composio"
    ];
    
    for (const slug of slugs) {
      jest.clearAllMocks();
      const params = Promise.resolve({ slug });
      const partner = partnersData.find(p => p.slug === slug);
      
      render(await PartnerDetailPage({ params }));
      expect(screen.getByRole("heading", { name: new RegExp(partner!.name, "i") })).toBeInTheDocument();
    }
  });

  test("displays integration code in code block", async () => {
    const params = Promise.resolve({ slug: "anthropic" });
    render(await PartnerDetailPage({ params }));
    
    const codeBlock = screen.getByRole("code");
    expect(codeBlock).toBeInTheDocument();
  });
});
