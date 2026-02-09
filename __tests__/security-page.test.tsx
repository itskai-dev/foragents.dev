/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SecurityPage from "../src/app/security/page";

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

describe("Security Page", () => {
  it("renders the security page", () => {
    const { container } = render(<SecurityPage />);
    expect(container).toBeInTheDocument();
  });

  it("displays the page title and hero section", () => {
    render(<SecurityPage />);
    expect(screen.getByText("Security at forAgents.dev")).toBeInTheDocument();
    expect(screen.getByText(/Trust and security are foundational/i)).toBeInTheDocument();
  });

  it("displays all six security sections", () => {
    render(<SecurityPage />);
    
    // Check for all main section titles
    expect(screen.getByText("Data Protection")).toBeInTheDocument();
    expect(screen.getByText("Authentication")).toBeInTheDocument();
    expect(screen.getByText("Access Control")).toBeInTheDocument();
    expect(screen.getByText("Infrastructure Security")).toBeInTheDocument();
    expect(screen.getByText("Vulnerability Disclosure")).toBeInTheDocument();
    expect(screen.getByText("Compliance & Certifications")).toBeInTheDocument();
  });

  it("displays data protection details", () => {
    render(<SecurityPage />);
    
    expect(screen.getByText("Encryption at Rest & Transit")).toBeInTheDocument();
    expect(screen.getByText("Data Residency Options")).toBeInTheDocument();
    expect(screen.getByText("Data Retention & Deletion")).toBeInTheDocument();
    expect(screen.getByText(/AES-256 at rest and TLS 1.3/i)).toBeInTheDocument();
  });

  it("displays authentication details", () => {
    render(<SecurityPage />);
    
    expect(screen.getByText("API Key Management")).toBeInTheDocument();
    expect(screen.getByText("OAuth 2.0 Support")).toBeInTheDocument();
    expect(screen.getByText("Token Rotation & Expiry")).toBeInTheDocument();
    expect(screen.getByText(/Scoped API keys with granular permissions/i)).toBeInTheDocument();
  });

  it("displays access control details", () => {
    render(<SecurityPage />);
    
    expect(screen.getByText("Role-Based Access Control (RBAC)")).toBeInTheDocument();
    expect(screen.getByText("Team Permissions")).toBeInTheDocument();
    expect(screen.getByText("Comprehensive Audit Trails")).toBeInTheDocument();
  });

  it("displays infrastructure security details", () => {
    render(<SecurityPage />);
    
    expect(screen.getByText("SOC 2 Type II Certified")).toBeInTheDocument();
    expect(screen.getByText("99.9% Uptime SLA")).toBeInTheDocument();
    expect(screen.getByText("DDoS Protection")).toBeInTheDocument();
  });

  it("displays vulnerability disclosure details", () => {
    render(<SecurityPage />);
    
    expect(screen.getByText("Responsible Disclosure Policy")).toBeInTheDocument();
    expect(screen.getByText("Security Contact")).toBeInTheDocument();
    expect(screen.getByText("Bug Bounty Program")).toBeInTheDocument();
    expect(screen.getByText(/security@foragents.dev/i)).toBeInTheDocument();
  });

  it("displays compliance badges", () => {
    render(<SecurityPage />);
    
    expect(screen.getByText("GDPR Compliant")).toBeInTheDocument();
    // SOC 2 Type II appears twice (Infrastructure and Compliance sections)
    const soc2Elements = screen.getAllByText("SOC 2 Type II");
    expect(soc2Elements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("HIPAA Ready")).toBeInTheDocument();
  });

  it("displays the security checklist", () => {
    render(<SecurityPage />);
    
    expect(screen.getByText("Security Checklist for AI Agents")).toBeInTheDocument();
    expect(screen.getByText(/Essential security practices/i)).toBeInTheDocument();
  });

  it("displays checklist items", () => {
    render(<SecurityPage />);
    
    // Check for some checklist items
    expect(screen.getByText(/API keys are stored securely/i)).toBeInTheDocument();
    expect(screen.getByText(/Rate limiting is implemented/i)).toBeInTheDocument();
    expect(screen.getByText(/HTTPS\/TLS encryption is enforced/i)).toBeInTheDocument();
  });

  it("allows checking checklist items", () => {
    render(<SecurityPage />);
    
    const checklistItem = screen.getByText(/API keys are stored securely/i);
    expect(checklistItem).not.toHaveClass("line-through");
    
    // Click the checklist item
    fireEvent.click(checklistItem.closest("div")!);
    
    // Item should now be checked (have line-through)
    expect(checklistItem).toHaveClass("line-through");
  });

  it("displays the Report a Vulnerability CTA", () => {
    render(<SecurityPage />);
    
    expect(screen.getByText("Found a Security Issue?")).toBeInTheDocument();
    expect(screen.getByText("Report a Vulnerability")).toBeInTheDocument();
    expect(screen.getByText(/We take security seriously/i)).toBeInTheDocument();
  });

  it("displays the last updated date", () => {
    render(<SecurityPage />);
    
    expect(screen.getByText(/Last updated: February 9, 2026/i)).toBeInTheDocument();
  });

  it("has correct link for vulnerability reporting", () => {
    render(<SecurityPage />);
    
    const reportButton = screen.getByText("Report a Vulnerability");
    const link = reportButton.closest("a");
    expect(link).toHaveAttribute("href", "mailto:security@foragents.dev");
  });

  it("displays certification badges", () => {
    render(<SecurityPage />);
    
    // Check for badge text (Certified, Compliant, Available)
    const badges = screen.getAllByText(/Certified|Compliant|Available/i);
    expect(badges.length).toBeGreaterThanOrEqual(5); // At least 5 badges should be present
  });

  it("displays checklist progress", () => {
    render(<SecurityPage />);
    
    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText(/0\/10 completed/i)).toBeInTheDocument();
  });

  it("updates checklist progress when items are checked", () => {
    render(<SecurityPage />);
    
    // Initially 0/10
    expect(screen.getByText(/0\/10 completed \(0%\)/i)).toBeInTheDocument();
    
    // Click first item
    const firstItem = screen.getByText(/API keys are stored securely/i);
    fireEvent.click(firstItem.closest("div")!);
    
    // Should now be 1/10
    expect(screen.getByText(/1\/10 completed \(10%\)/i)).toBeInTheDocument();
  });

  it("shows completion message when all items are checked", () => {
    render(<SecurityPage />);
    
    // Get all checklist items and click them - use specific text matches from checklist
    const checklistItems = [
      "API keys are stored securely and never committed to version control",
      "Rate limiting is implemented on all agent-facing endpoints",
      "Input validation and sanitization is applied to all user data",
      "HTTPS/TLS encryption is enforced for all communications",
      "Authentication tokens have appropriate expiration times",
      "Audit logging is enabled for all security-relevant events",
      "Dependencies are regularly updated and scanned for vulnerabilities",
      "Principle of least privilege is applied to all access controls",
      "Backup and disaster recovery procedures are tested regularly",
      "Security incident response plan is documented and accessible",
    ];
    
    checklistItems.forEach((itemText) => {
      const item = screen.getByText(itemText);
      fireEvent.click(item.closest("div")!);
    });
    
    // Should show completion message
    expect(screen.getByText(/Excellent! All security checks completed/i)).toBeInTheDocument();
  });

  it("displays security contact email link", () => {
    render(<SecurityPage />);
    
    const emailLinks = screen.getAllByText(/security@foragents.dev/i);
    expect(emailLinks.length).toBeGreaterThanOrEqual(1);
    
    const link = emailLinks[0].closest("a");
    expect(link).toHaveAttribute("href", "mailto:security@foragents.dev");
  });

  it("has proper styling for cards", () => {
    render(<SecurityPage />);
    
    // Check that cards exist (by checking for section titles in cards)
    const dataProtectionCard = screen.getByText("Data Protection").closest("div");
    expect(dataProtectionCard).toBeInTheDocument();
  });
});
