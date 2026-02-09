/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PrivacyPage from "../src/app/privacy/page";

describe("Privacy Policy Page", () => {
  it("renders the Privacy page", () => {
    const { container } = render(<PrivacyPage />);
    expect(container).toBeInTheDocument();
  });

  it("displays the page title", () => {
    render(<PrivacyPage />);
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });

  it("displays the effective date", () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/Effective Date:/)).toBeInTheDocument();
    expect(screen.getByText(/Last Updated:/)).toBeInTheDocument();
  });

  it("displays table of contents", () => {
    render(<PrivacyPage />);
    expect(screen.getByText("Table of Contents")).toBeInTheDocument();
  });

  it("displays all 12 sections in TOC", () => {
    render(<PrivacyPage />);
    expect(screen.getAllByText("1. Information We Collect").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2. How We Use Information").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3. Data Sharing").length).toBeGreaterThan(0);
    expect(screen.getAllByText("4. Data Retention").length).toBeGreaterThan(0);
    expect(screen.getAllByText("5. Security").length).toBeGreaterThan(0);
    expect(screen.getAllByText("6. Cookies").length).toBeGreaterThan(0);
    expect(screen.getAllByText("7. Your Rights (GDPR)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("8. California Privacy (CCPA)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("9. Children's Privacy").length).toBeGreaterThan(0);
    expect(screen.getAllByText("10. International Transfers").length).toBeGreaterThan(0);
    expect(screen.getAllByText("11. Changes to Policy").length).toBeGreaterThan(0);
    expect(screen.getAllByText("12. Contact Information").length).toBeGreaterThan(0);
  });

  it("displays section content headings", () => {
    render(<PrivacyPage />);
    expect(screen.getByRole("heading", { name: /1\. Information We Collect/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /2\. How We Use Information/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /3\. Data Sharing/ })).toBeInTheDocument();
  });

  it("displays contact email", () => {
    render(<PrivacyPage />);
    const privacyEmails = screen.getAllByText("privacy@foragents.dev");
    expect(privacyEmails[0]).toBeInTheDocument();
    expect(privacyEmails[0].closest("a")).toHaveAttribute("href", "mailto:privacy@foragents.dev");
  });

  it("has clickable TOC links", () => {
    render(<PrivacyPage />);
    const tocButton = screen.getByRole("button", { name: "1. Information We Collect" });
    expect(tocButton).toBeInTheDocument();
    
    // Click should trigger scroll behavior
    fireEvent.click(tocButton);
    // Verify the section exists
    expect(screen.getByRole("heading", { name: /1\. Information We Collect/ })).toBeInTheDocument();
  });

  it("displays information collection details", () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/We collect several types of information/)).toBeInTheDocument();
  });

  it("displays GDPR rights section", () => {
    render(<PrivacyPage />);
    expect(screen.getByRole("heading", { name: /7\. Your Rights \(GDPR\)/ })).toBeInTheDocument();
    expect(screen.getByText(/If you are located in the European Economic Area/)).toBeInTheDocument();
  });

  it("displays CCPA section", () => {
    render(<PrivacyPage />);
    expect(screen.getByRole("heading", { name: /8\. California Privacy Rights \(CCPA\)/ })).toBeInTheDocument();
    expect(screen.getByText(/If you are a California resident/)).toBeInTheDocument();
  });

  it("displays cookies information", () => {
    render(<PrivacyPage />);
    expect(screen.getByRole("heading", { name: /6\. Cookies/ })).toBeInTheDocument();
    expect(screen.getByText(/We use cookies and similar tracking technologies/)).toBeInTheDocument();
  });

  it("displays security section", () => {
    render(<PrivacyPage />);
    expect(screen.getByRole("heading", { name: /5\. Security/ })).toBeInTheDocument();
    expect(screen.getByText(/We implement appropriate technical and organizational security measures/)).toBeInTheDocument();
  });

  it("displays children's privacy section", () => {
    render(<PrivacyPage />);
    expect(screen.getByRole("heading", { name: /9\. Children's Privacy/ })).toBeInTheDocument();
    expect(screen.getByText(/Our Service is not intended for individuals under the age of 18/)).toBeInTheDocument();
  });

  it("displays data retention policy", () => {
    render(<PrivacyPage />);
    expect(screen.getByRole("heading", { name: /4\. Data Retention/ })).toBeInTheDocument();
    expect(screen.getByText(/We retain your personal information only for as long as necessary/)).toBeInTheDocument();
  });

  it("displays international transfers section", () => {
    render(<PrivacyPage />);
    expect(screen.getByRole("heading", { name: /10\. International Transfers/ })).toBeInTheDocument();
    expect(screen.getByText(/Your information may be transferred to and processed in countries/)).toBeInTheDocument();
  });

  it("displays contact section with multiple contact methods", () => {
    render(<PrivacyPage />);
    expect(screen.getAllByText("privacy@foragents.dev").length).toBeGreaterThan(0);
    expect(screen.getAllByText("contact@foragents.dev").length).toBeGreaterThan(0);
  });

  it("has proper section IDs for anchor navigation", () => {
    render(<PrivacyPage />);
    expect(document.getElementById("information")).toBeInTheDocument();
    expect(document.getElementById("usage")).toBeInTheDocument();
    expect(document.getElementById("sharing")).toBeInTheDocument();
    expect(document.getElementById("retention")).toBeInTheDocument();
    expect(document.getElementById("security")).toBeInTheDocument();
    expect(document.getElementById("cookies")).toBeInTheDocument();
    expect(document.getElementById("gdpr")).toBeInTheDocument();
    expect(document.getElementById("ccpa")).toBeInTheDocument();
    expect(document.getElementById("children")).toBeInTheDocument();
    expect(document.getElementById("international")).toBeInTheDocument();
    expect(document.getElementById("changes")).toBeInTheDocument();
    expect(document.getElementById("contact")).toBeInTheDocument();
  });

  it("displays key privacy principles", () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/we take your privacy seriously/)).toBeInTheDocument();
  });

  it("displays data sharing policy", () => {
    render(<PrivacyPage />);
    expect(screen.getByRole("heading", { name: /3\. Data Sharing/ })).toBeInTheDocument();
    expect(screen.getByText(/We do not sell your personal information/)).toBeInTheDocument();
  });
});
