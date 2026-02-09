/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TermsPage from "../src/app/terms/page";

describe("Terms of Service Page", () => {
  it("renders the Terms page", () => {
    const { container } = render(<TermsPage />);
    expect(container).toBeInTheDocument();
  });

  it("displays the page title", () => {
    render(<TermsPage />);
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
  });

  it("displays the effective date", () => {
    render(<TermsPage />);
    expect(screen.getByText(/Effective Date:/)).toBeInTheDocument();
    expect(screen.getByText(/Last Updated:/)).toBeInTheDocument();
  });

  it("displays table of contents", () => {
    render(<TermsPage />);
    expect(screen.getByText("Table of Contents")).toBeInTheDocument();
  });

  it("displays all 12 sections in TOC", () => {
    render(<TermsPage />);
    expect(screen.getAllByText("1. Acceptance of Terms").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2. Description of Service").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3. User Accounts").length).toBeGreaterThan(0);
    expect(screen.getAllByText("4. API Usage").length).toBeGreaterThan(0);
    expect(screen.getAllByText("5. Acceptable Use").length).toBeGreaterThan(0);
    expect(screen.getAllByText("6. Intellectual Property").length).toBeGreaterThan(0);
    expect(screen.getAllByText("7. Payment Terms").length).toBeGreaterThan(0);
    expect(screen.getAllByText("8. Termination").length).toBeGreaterThan(0);
    expect(screen.getAllByText("9. Limitation of Liability").length).toBeGreaterThan(0);
    expect(screen.getAllByText("10. Governing Law").length).toBeGreaterThan(0);
    expect(screen.getAllByText("11. Changes to Terms").length).toBeGreaterThan(0);
    expect(screen.getAllByText("12. Contact Information").length).toBeGreaterThan(0);
  });

  it("displays section content headings", () => {
    render(<TermsPage />);
    expect(screen.getByRole("heading", { name: /1\. Acceptance of Terms/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /2\. Description of Service/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /3\. User Accounts/ })).toBeInTheDocument();
  });

  it("displays contact email", () => {
    render(<TermsPage />);
    const emailLinks = screen.getAllByText("legal@foragents.dev");
    expect(emailLinks[0]).toBeInTheDocument();
    expect(emailLinks[0].closest("a")).toHaveAttribute("href", "mailto:legal@foragents.dev");
  });

  it("has clickable TOC links", () => {
    render(<TermsPage />);
    const tocButton = screen.getByRole("button", { name: "1. Acceptance of Terms" });
    expect(tocButton).toBeInTheDocument();
    
    // Click should trigger scroll behavior
    fireEvent.click(tocButton);
    // Verify the section exists
    expect(screen.getByRole("heading", { name: /1\. Acceptance of Terms/ })).toBeInTheDocument();
  });

  it("displays key legal terms", () => {
    render(<TermsPage />);
    expect(screen.getByText(/By accessing and using forAgents\.dev/)).toBeInTheDocument();
    expect(screen.getByText(/These Terms shall be governed/)).toBeInTheDocument();
  });

  it("displays API usage section", () => {
    render(<TermsPage />);
    expect(screen.getByRole("heading", { name: /4\. API Usage/ })).toBeInTheDocument();
    expect(screen.getByText(/If you access our API/)).toBeInTheDocument();
  });

  it("displays payment terms", () => {
    render(<TermsPage />);
    expect(screen.getByRole("heading", { name: /7\. Payment Terms/ })).toBeInTheDocument();
    expect(screen.getByText(/Certain features of the Service may be provided for a fee/)).toBeInTheDocument();
  });

  it("displays limitation of liability section", () => {
    render(<TermsPage />);
    expect(screen.getByRole("heading", { name: /9\. Limitation of Liability/ })).toBeInTheDocument();
  });

  it("displays contact section with multiple contact methods", () => {
    render(<TermsPage />);
    expect(screen.getByText("legal@foragents.dev")).toBeInTheDocument();
    expect(screen.getByText("foragents.dev")).toBeInTheDocument();
  });

  it("has proper section IDs for anchor navigation", () => {
    render(<TermsPage />);
    expect(document.getElementById("acceptance")).toBeInTheDocument();
    expect(document.getElementById("service")).toBeInTheDocument();
    expect(document.getElementById("accounts")).toBeInTheDocument();
    expect(document.getElementById("api")).toBeInTheDocument();
    expect(document.getElementById("acceptable")).toBeInTheDocument();
    expect(document.getElementById("intellectual")).toBeInTheDocument();
    expect(document.getElementById("payment")).toBeInTheDocument();
    expect(document.getElementById("termination")).toBeInTheDocument();
    expect(document.getElementById("limitation")).toBeInTheDocument();
    expect(document.getElementById("governing")).toBeInTheDocument();
    expect(document.getElementById("changes")).toBeInTheDocument();
    expect(document.getElementById("contact")).toBeInTheDocument();
  });
});
