/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
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

describe("Calculator Page", () => {
  it("renders the calculator page", () => {
    const { container } = render(<CalculatorPage />);
    expect(container).toBeInTheDocument();
  });

  it("displays the page title", () => {
    render(<CalculatorPage />);
    expect(screen.getByText("AI Agent Cost Calculator")).toBeInTheDocument();
  });

  it("displays configuration section", () => {
    render(<CalculatorPage />);
    expect(screen.getByText("Configuration")).toBeInTheDocument();
  });

  it("displays estimated costs section", () => {
    render(<CalculatorPage />);
    expect(screen.getByText("Estimated Costs")).toBeInTheDocument();
  });

  it("displays model comparison section", () => {
    render(<CalculatorPage />);
    expect(screen.getByText("Model Comparison")).toBeInTheDocument();
  });

  it("displays optimization tips section", () => {
    render(<CalculatorPage />);
    expect(screen.getByText("Cost Optimization Tips")).toBeInTheDocument();
  });
});
