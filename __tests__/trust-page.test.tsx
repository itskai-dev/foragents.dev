/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import TrustPage from "../src/app/trust/page";
import trustData from "../src/data/trust.json";

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

describe.skip("Trust Page", () => {
  it("renders the trust page", () => {
    const { container } = render(<TrustPage />);
    expect(container).toBeInTheDocument();
  });

  it("displays the page title and hero section", () => {
    render(<TrustPage />);
    expect(screen.getByText("Trust & Safety at forAgents.dev")).toBeInTheDocument();
    expect(screen.getByText(/Building a secure, trustworthy marketplace/i)).toBeInTheDocument();
  });

  it("displays trust score methodology section", () => {
    render(<TrustPage />);
    expect(screen.getByText("Trust Score Methodology")).toBeInTheDocument();
    expect(screen.getByText(/Trust scores range from 0-100/i)).toBeInTheDocument();
  });

  it("displays all trust score factors", () => {
    render(<TrustPage />);
    
    trustData.trustScoreFactors.forEach((factor) => {
      expect(screen.getByText(factor.name)).toBeInTheDocument();
      expect(screen.getByText(factor.weight)).toBeInTheDocument();
      expect(screen.getByText(factor.description)).toBeInTheDocument();
    });
  });

  it("displays trust score calculation formula", () => {
    render(<TrustPage />);
    expect(screen.getByText("How Trust Scores are Calculated")).toBeInTheDocument();
    expect(screen.getByText(/Trust Score = \(Verification × 0\.30\)/i)).toBeInTheDocument();
  });

  it("displays verification levels section", () => {
    render(<TrustPage />);
    expect(screen.getByText("Verification Levels")).toBeInTheDocument();
    expect(screen.getByText(/Progress through verification tiers/i)).toBeInTheDocument();
  });

  it("displays all verification levels", () => {
    render(<TrustPage />);
    
    trustData.verificationLevels.forEach((level) => {
      expect(screen.getByText(level.name)).toBeInTheDocument();
    });
  });

  it("displays verification level details", () => {
    render(<TrustPage />);
    
    // Check for Unverified level details
    expect(screen.getByText("No verification completed")).toBeInTheDocument();
    expect(screen.getByText("Basic listing on marketplace")).toBeInTheDocument();
    
    // Check for Email Verified level details
    expect(screen.getByText("Verified email address")).toBeInTheDocument();
    expect(screen.getByText("Email badge on profile")).toBeInTheDocument();
    
    // Check for Identity Verified level details
    expect(screen.getByText("Government-issued ID verification")).toBeInTheDocument();
    expect(screen.getByText("Featured in verified listings")).toBeInTheDocument();
    
    // Check for Enterprise Verified level details
    expect(screen.getByText("Business entity registration")).toBeInTheDocument();
    expect(screen.getByText("Dedicated account manager")).toBeInTheDocument();
  });

  it("displays trust score bonuses for verified levels", () => {
    render(<TrustPage />);
    
    expect(screen.getByText("+10 points")).toBeInTheDocument();
    expect(screen.getByText("+25 points")).toBeInTheDocument();
    expect(screen.getByText("+50 points")).toBeInTheDocument();
  });

  it("displays content policy section", () => {
    render(<TrustPage />);
    expect(screen.getByText("Content Policy")).toBeInTheDocument();
    expect(screen.getByText("Allowed Content")).toBeInTheDocument();
    expect(screen.getByText("Prohibited Content")).toBeInTheDocument();
  });

  it("displays allowed content items", () => {
    render(<TrustPage />);
    
    trustData.contentPolicy.allowed.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it("displays prohibited content items", () => {
    render(<TrustPage />);
    
    trustData.contentPolicy.prohibited.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it("displays incident response timeline section", () => {
    render(<TrustPage />);
    expect(screen.getByText("Incident Response Timeline")).toBeInTheDocument();
    expect(screen.getByText(/How we handle abuse reports/i)).toBeInTheDocument();
  });

  it("displays all incident response stages", () => {
    render(<TrustPage />);
    
    trustData.incidentResponseTimeline.forEach((stage) => {
      expect(screen.getByText(stage.stage)).toBeInTheDocument();
      expect(screen.getByText(stage.timeframe)).toBeInTheDocument();
      expect(screen.getByText(stage.description)).toBeInTheDocument();
    });
  });

  it("displays abuse reporting section", () => {
    render(<TrustPage />);
    expect(screen.getByText("Report Abuse")).toBeInTheDocument();
    expect(screen.getByText(/Help us maintain a safe community/i)).toBeInTheDocument();
  });

  it("displays abuse report form fields", () => {
    render(<TrustPage />);
    
    expect(screen.getByLabelText("Your Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Agent Handle or URL")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for Report")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Evidence (Screenshots, Links, etc.)")).toBeInTheDocument();
  });

  it("displays all report reason options", () => {
    render(<TrustPage />);
    
    trustData.reportReasons.forEach((reason) => {
      expect(screen.getByText(reason.label)).toBeInTheDocument();
    });
  });

  it("displays privacy notice in report form", () => {
    render(<TrustPage />);
    expect(screen.getByText("Privacy Notice:")).toBeInTheDocument();
    expect(screen.getByText(/Reporter information is kept confidential/i)).toBeInTheDocument();
  });

  it("displays submit report button", () => {
    render(<TrustPage />);
    expect(screen.getByText("Submit Report")).toBeInTheDocument();
  });

  it("displays contact CTA section", () => {
    render(<TrustPage />);
    expect(screen.getByText("Questions About Trust & Safety?")).toBeInTheDocument();
    expect(screen.getByText("Contact Trust & Safety")).toBeInTheDocument();
    expect(screen.getByText("View Security Center")).toBeInTheDocument();
  });

  it("has correct contact email link", () => {
    render(<TrustPage />);
    
    const contactButton = screen.getByText("Contact Trust & Safety");
    const link = contactButton.closest("a");
    expect(link).toHaveAttribute("href", "mailto:trust@foragents.dev");
  });

  it("has correct security center link", () => {
    render(<TrustPage />);
    
    const securityButton = screen.getByText("View Security Center");
    const link = securityButton.closest("a");
    expect(link).toHaveAttribute("href", "/security");
  });

  it("displays last updated date", () => {
    render(<TrustPage />);
    expect(screen.getByText(/Last updated: February 9, 2026/i)).toBeInTheDocument();
  });

  it("displays proper section headings", () => {
    render(<TrustPage />);
    
    expect(screen.getByText("Trust Score Methodology")).toBeInTheDocument();
    expect(screen.getByText("Verification Levels")).toBeInTheDocument();
    expect(screen.getByText("Content Policy")).toBeInTheDocument();
    expect(screen.getByText("Incident Response Timeline")).toBeInTheDocument();
    expect(screen.getByText("Report Abuse")).toBeInTheDocument();
  });

  it("displays verification level requirements section", () => {
    render(<TrustPage />);
    
    const requirementsSections = screen.getAllByText("Requirements");
    expect(requirementsSections.length).toBeGreaterThanOrEqual(4); // One for each verification level
  });

  it("displays verification level benefits section", () => {
    render(<TrustPage />);
    
    const benefitsSections = screen.getAllByText("Benefits");
    expect(benefitsSections.length).toBeGreaterThanOrEqual(4); // One for each verification level
  });

  it("displays limitations for unverified accounts", () => {
    render(<TrustPage />);
    
    expect(screen.getByText("Lower trust score")).toBeInTheDocument();
    expect(screen.getByText("Limited marketplace visibility")).toBeInTheDocument();
  });

  it("has required form fields", () => {
    render(<TrustPage />);
    
    const emailInput = screen.getByLabelText("Your Email") as HTMLInputElement;
    expect(emailInput).toHaveAttribute("required");
    expect(emailInput).toHaveAttribute("type", "email");
    
    const handleInput = screen.getByLabelText("Agent Handle or URL") as HTMLInputElement;
    expect(handleInput).toHaveAttribute("required");
    
    const reasonSelect = screen.getByLabelText("Reason for Report") as HTMLSelectElement;
    expect(reasonSelect).toHaveAttribute("required");
    
    const descriptionTextarea = screen.getByLabelText("Description") as HTMLTextAreaElement;
    expect(descriptionTextarea).toHaveAttribute("required");
  });

  it("displays file upload placeholder text", () => {
    render(<TrustPage />);
    
    expect(screen.getByText("Click to upload or drag and drop")).toBeInTheDocument();
    expect(screen.getByText("PNG, JPG, PDF up to 10MB")).toBeInTheDocument();
  });

  it("displays all major icons in sections", () => {
    render(<TrustPage />);
    
    // Test that all sections rendered (icons render alongside text)
    expect(screen.getByText("Trust Score Methodology")).toBeInTheDocument();
    expect(screen.getByText("Verification Levels")).toBeInTheDocument();
    expect(screen.getByText("Content Policy")).toBeInTheDocument();
    expect(screen.getByText("Incident Response Timeline")).toBeInTheDocument();
    expect(screen.getByText("Report Abuse")).toBeInTheDocument();
  });
});
