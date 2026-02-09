/** @jest-environment jsdom */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AnalyticsPage from "../src/app/analytics/page";

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

describe("Analytics Page - Skill Analytics Dashboard", () => {
  it("renders the analytics page", () => {
    const { container } = render(<AnalyticsPage />);
    expect(container).toBeInTheDocument();
  });

  it("displays the page title", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText("📊 Skill Analytics Dashboard")).toBeInTheDocument();
  });

  it("displays the page description", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText("Insights into skill performance, downloads, creators, and trends")).toBeInTheDocument();
  });

  it("displays overview section", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText("📈 Overview")).toBeInTheDocument();
  });

  it("displays overview stats cards", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText("Total Skills")).toBeInTheDocument();
    expect(screen.getByText("Total Downloads")).toBeInTheDocument();
    expect(screen.getByText("Active Creators")).toBeInTheDocument();
    expect(screen.getByText("Average Rating")).toBeInTheDocument();
  });

  it("displays overview stats values from analytics data", () => {
    render(<AnalyticsPage />);
    // Total Skills
    expect(screen.getByText("342")).toBeInTheDocument();
    // Total Downloads
    expect(screen.getByText("127,856")).toBeInTheDocument();
    // Active Creators
    expect(screen.getByText("89")).toBeInTheDocument();
    // Average Rating (4.7 ⭐) - appears multiple times in skills list
    const ratingElements = screen.getAllByText("4.7 ⭐");
    expect(ratingElements.length).toBeGreaterThan(0);
  });

  it("displays time range selector buttons", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText("Last 7 days")).toBeInTheDocument();
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
    expect(screen.getByText("Last 90 days")).toBeInTheDocument();
    expect(screen.getByText("All Time")).toBeInTheDocument();
  });

  it("changes time range when clicking selector buttons", () => {
    render(<AnalyticsPage />);
    const sevenDaysButton = screen.getByText("Last 7 days");
    fireEvent.click(sevenDaysButton);
    // Check that the chart title updates
    expect(screen.getByText(/Downloads Over Time \(Last 7 Days\)/)).toBeInTheDocument();
  });

  it("displays downloads over time chart section", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText(/📉 Downloads Over Time/)).toBeInTheDocument();
  });

  it("displays top 10 most downloaded skills section", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText("🏆 Top 10 Most Downloaded Skills")).toBeInTheDocument();
  });

  it("displays top skills from analytics data", () => {
    render(<AnalyticsPage />);
    // Check for some of the top skills
    expect(screen.getByText("SSH Manager")).toBeInTheDocument();
    expect(screen.getByText("Web Scraper Pro")).toBeInTheDocument();
    expect(screen.getByText("API Monitor")).toBeInTheDocument();
  });

  it("displays skill categories in top skills", () => {
    render(<AnalyticsPage />);
    // These categories appear multiple times (in skills and category breakdown)
    expect(screen.getAllByText("DevOps").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Data").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Monitoring").length).toBeGreaterThan(0);
  });

  it("displays category breakdown section", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText("📦 Category Breakdown")).toBeInTheDocument();
  });

  it("displays category breakdown pie visualization", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText("Skills by Category")).toBeInTheDocument();
  });

  it("displays categories with percentages", () => {
    render(<AnalyticsPage />);
    // DevOps is 23%
    const devOpsElements = screen.getAllByText("23%");
    expect(devOpsElements.length).toBeGreaterThan(0);
  });

  it("displays creator leaderboard section", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText("👥 Creator Leaderboard")).toBeInTheDocument();
  });

  it("displays top creators from analytics data", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText("DevMaster")).toBeInTheDocument();
    expect(screen.getByText("Cloud Ninja")).toBeInTheDocument();
    expect(screen.getByText("Data Wizard")).toBeInTheDocument();
  });

  it("displays creator avatars", () => {
    render(<AnalyticsPage />);
    // Check for emoji avatars in the leaderboard
    expect(screen.getByText("👨‍💻")).toBeInTheDocument();
    expect(screen.getByText("🥷")).toBeInTheDocument();
    expect(screen.getByText("🧙")).toBeInTheDocument();
  });

  it("displays creator download counts", () => {
    render(<AnalyticsPage />);
    // DevMaster has 34,567 downloads
    expect(screen.getByText("34,567")).toBeInTheDocument();
  });

  it("displays skill rankings with badges", () => {
    render(<AnalyticsPage />);
    // Check for rank badges in top skills
    const badges = screen.getAllByText(/^#[1-9]0?$/);
    expect(badges.length).toBeGreaterThanOrEqual(10); // At least top 10
  });

  it("displays footer note", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText(/Analytics data reflects aggregated skill downloads/)).toBeInTheDocument();
  });

  it("displays last updated timestamp", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it("links to skill detail pages", () => {
    render(<AnalyticsPage />);
    const sshManagerLink = screen.getByText("SSH Manager").closest("a");
    expect(sshManagerLink).toHaveAttribute("href", "/skills/ssh-manager");
  });

  it("links to creator profile pages", () => {
    render(<AnalyticsPage />);
    const devMasterLink = screen.getByText("DevMaster").closest("a");
    expect(devMasterLink).toHaveAttribute("href", "/creators/devmaster");
  });
});
