/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
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

describe("Analytics Page", () => {
  it("renders the analytics page", () => {
    const { container } = render(<AnalyticsPage />);
    expect(container).toBeInTheDocument();
  });

  it("displays the page title", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText("📊 Analytics Dashboard")).toBeInTheDocument();
  });

  it("displays the page description", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText("Real-time insights into forAgents.dev traffic and engagement")).toBeInTheDocument();
  });

  it("displays overview section", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText("📈 Overview")).toBeInTheDocument();
  });

  it("displays overview stats cards", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText("Page Views (This Month)")).toBeInTheDocument();
    expect(screen.getAllByText("Unique Visitors").length).toBeGreaterThan(0);
    expect(screen.getByText("Skill Downloads")).toBeInTheDocument();
    expect(screen.getByText("API Calls")).toBeInTheDocument();
    expect(screen.getByText("Avg Session Duration")).toBeInTheDocument();
  });

  it("displays traffic chart section", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText("📉 Daily Traffic (Last 14 Days)")).toBeInTheDocument();
  });

  it("displays top pages section", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText("📄 Top Pages")).toBeInTheDocument();
  });

  it("displays top pages table headers", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText("Page Path")).toBeInTheDocument();
    expect(screen.getByText("Views")).toBeInTheDocument();
    expect(screen.getAllByText("Unique Visitors").length).toBeGreaterThan(0);
    expect(screen.getByText("Avg Time on Page")).toBeInTheDocument();
  });

  it("displays top referrers section", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText("🔗 Top Referrers")).toBeInTheDocument();
  });

  it("displays geographic breakdown section", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText("🌍 Geographic Breakdown")).toBeInTheDocument();
  });

  it("displays device breakdown section", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText("💻 Device Breakdown")).toBeInTheDocument();
  });

  it("displays time range selector buttons", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText("Last 7 days")).toBeInTheDocument();
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
    expect(screen.getByText("Last 90 days")).toBeInTheDocument();
  });

  it("displays device types", () => {
    render(<AnalyticsPage />);
    expect(screen.getByText("Desktop")).toBeInTheDocument();
    expect(screen.getByText("Mobile")).toBeInTheDocument();
    expect(screen.getByText("Tablet")).toBeInTheDocument();
  });

  it("displays analytics data from JSON", () => {
    render(<AnalyticsPage />);
    // Check that numeric data is displayed (formatted with commas)
    expect(screen.getByText("47,823")).toBeInTheDocument(); // Page views
    expect(screen.getByText("12,456")).toBeInTheDocument(); // Unique visitors
    expect(screen.getByText("3,421")).toBeInTheDocument(); // Skill downloads
    expect(screen.getByText("89,234")).toBeInTheDocument(); // API calls
  });
});
