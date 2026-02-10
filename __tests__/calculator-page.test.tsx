/** @jest-environment jsdom */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import CalculatorPage from "../src/app/calculator/page";

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

const mockPresets = [
  {
    id: "preset-startup",
    name: "Startup Team",
    description: "Small team with fast automation wins",
    inputs: {
      agents: 4,
      hoursSavedPerAgentPerDay: 1.5,
      hourlyRate: 80,
      monthlyToolCosts: 499,
    },
  },
];

describe("Calculator Page", () => {
  beforeEach(() => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ presets: mockPresets }),
    } as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the updated calculator hero and primary sections", async () => {
    const { container } = render(<CalculatorPage />);
    expect(container).toBeInTheDocument();

    expect(screen.getByText("Agent ROI Calculator")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Startup Team" })).toBeInTheDocument();
    });

    expect(screen.getByText("Inputs")).toBeInTheDocument();
    expect(screen.getByText("Computed ROI")).toBeInTheDocument();
  });

  it("renders the current calculator input labels and ROI metrics", async () => {
    render(<CalculatorPage />);

    await waitFor(() => {
      expect(screen.getByText("Number of Agents")).toBeInTheDocument();
    });

    expect(screen.getByText("Hours Saved per Agent per Day")).toBeInTheDocument();
    expect(screen.getByText("Average Hourly Rate (USD)")).toBeInTheDocument();
    expect(screen.getByText("Monthly Tool Costs (USD)")).toBeInTheDocument();

    expect(screen.getByText("Monthly Productivity Value")).toBeInTheDocument();
    expect(screen.getByText("Monthly Savings")).toBeInTheDocument();
    expect(screen.getByText("Annual ROI")).toBeInTheDocument();
    expect(screen.getByText("Payback Period")).toBeInTheDocument();
    expect(screen.getByText("Efficiency Gain")).toBeInTheDocument();

    const formulaText = screen.getByText(/Formula used:/i);
    expect(formulaText).toBeInTheDocument();
    expect(formulaText).toHaveTextContent(/agents × hours saved × hourly rate × 22\s*days/i);
  });
});
