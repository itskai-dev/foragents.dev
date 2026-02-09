/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import RegistryPage from "../src/app/registry/page";
import { getRegistryAgents } from "../src/lib/registry-data";

// Mock Next.js Link component
jest.mock("next/link", () => {
  const LinkMock = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  LinkMock.displayName = "Link";
  return LinkMock;
});

// Mock the client component
jest.mock("../src/app/registry/registry-client", () => ({
  RegistryClient: ({ agents }: { agents: unknown[] }) => (
    <div data-testid="registry-client">
      <input 
        placeholder="Search by name, handle, or skills..." 
        data-testid="search-input"
      />
      <div data-testid="agent-count">{agents.length} agents</div>
    </div>
  ),
}));

// Mock the registry data module
jest.mock("../src/lib/registry-data", () => ({
  getRegistryAgents: jest.fn(),
}));

describe("Registry Page", () => {
  const mockAgents = [
    {
      id: "test-001",
      handle: "testbot",
      name: "Test Bot",
      avatar: "🤖",
      description: "A test agent for unit testing",
      verified: true,
      trustScore: 95,
      trustTier: "Gold" as const,
      category: "Developer" as const,
      skillsCount: 10,
      skills: ["testing", "automation", "ci-cd"],
      joinedAt: "2024-01-01",
      lastActive: "2026-02-09",
    },
    {
      id: "test-002",
      handle: "creativemuse",
      name: "Creative Muse",
      avatar: "🎨",
      description: "A creative assistant for design tasks",
      verified: true,
      trustScore: 88,
      trustTier: "Silver" as const,
      category: "Creative" as const,
      skillsCount: 8,
      skills: ["design", "branding", "ui-ux"],
      joinedAt: "2024-02-15",
      lastActive: "2026-02-08",
    },
    {
      id: "test-003",
      handle: "securityguard",
      name: "Security Guard",
      avatar: "🛡️",
      description: "Security specialist for threat detection",
      verified: true,
      trustScore: 82,
      trustTier: "Bronze" as const,
      category: "Security" as const,
      skillsCount: 12,
      skills: ["security-audit", "penetration-testing", "compliance"],
      joinedAt: "2024-03-20",
      lastActive: "2026-02-07",
    },
  ];

  beforeEach(() => {
    (getRegistryAgents as jest.Mock).mockReturnValue(mockAgents);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the registry page with correct title", () => {
    render(<RegistryPage />);
    
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Agent Registry");
  });

  it("displays the correct description", () => {
    render(<RegistryPage />);
    
    expect(
      screen.getByText(/Browse verified AI agents by trust tier, category, and skills/i)
    ).toBeInTheDocument();
  });

  it("shows trust tier statistics", () => {
    render(<RegistryPage />);
    
    // Check for Gold tier count (1 agent)
    expect(screen.getByText("1 Gold")).toBeInTheDocument();
    
    // Check for Silver tier count (1 agent)
    expect(screen.getByText("1 Silver")).toBeInTheDocument();
    
    // Check for Bronze tier count (1 agent)
    expect(screen.getByText("1 Bronze")).toBeInTheDocument();
  });

  it("displays total verified agents count", () => {
    render(<RegistryPage />);
    
    // Check for total count
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Total Verified")).toBeInTheDocument();
  });

  it("renders the RegistryClient component", () => {
    render(<RegistryPage />);
    
    // Check for search input (part of RegistryClient)
    const searchInput = screen.getByPlaceholderText(/Search by name, handle, or skills/i);
    expect(searchInput).toBeInTheDocument();
  });

  it("includes structured data (JSON-LD)", () => {
    const { container } = render(<RegistryPage />);
    
    const scriptTag = container.querySelector('script[type="application/ld+json"]');
    expect(scriptTag).toBeInTheDocument();
    
    if (scriptTag?.textContent) {
      const jsonLd = JSON.parse(scriptTag.textContent);
      expect(jsonLd["@type"]).toBe("CollectionPage");
      expect(jsonLd.name).toBe("Agent Registry");
      expect(jsonLd.numberOfItems).toBe(3);
    }
  });

  it("displays trust tier labels correctly", () => {
    render(<RegistryPage />);
    
    // Check for trust score ranges in tier descriptions
    expect(screen.getByText("Trust 95-100")).toBeInTheDocument();
    expect(screen.getByText("Trust 85-94")).toBeInTheDocument();
    expect(screen.getByText("Trust 75-84")).toBeInTheDocument();
  });

  it("renders with empty agent list", () => {
    (getRegistryAgents as jest.Mock).mockReturnValue([]);
    
    render(<RegistryPage />);
    
    // Should still render the page structure
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Agent Registry");
    
    // All tier counts should be 0
    expect(screen.getByText("0 Gold")).toBeInTheDocument();
    expect(screen.getByText("0 Silver")).toBeInTheDocument();
    expect(screen.getByText("0 Bronze")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument(); // Total count
  });
});
