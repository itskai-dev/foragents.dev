/** @jest-environment jsdom */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import StatusPage from "../src/app/status/page";

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

const statusPayload = {
  services: [
    {
      name: "API",
      status: "operational",
      latencyMs: 42,
      lastCheck: "2026-02-09T12:00:00.000Z",
    },
    {
      name: "Website",
      status: "degraded",
      latencyMs: 180,
      lastCheck: "2026-02-09T12:00:00.000Z",
    },
  ],
  overall: "degraded",
};

const historyPayload = {
  history: [
    { date: "2026-02-03", uptime: 99.9, incidents: 0 },
    { date: "2026-02-04", uptime: 99.5, incidents: 1 },
  ],
};

describe("Status Page", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/status/history")) {
        return { ok: true, json: async () => historyPayload } as Response;
      }
      if (url.includes("/api/status")) {
        return { ok: true, json: async () => statusPayload } as Response;
      }
      return { ok: false, json: async () => ({}) } as Response;
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders title and services after fetch", async () => {
    render(<StatusPage />);

    expect(screen.getByText("System Status")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Some Systems Degraded")).toBeInTheDocument();
      expect(screen.getByText("API")).toBeInTheDocument();
      expect(screen.getByText("Website")).toBeInTheDocument();
      expect(screen.getByText("Uptime (Last 7 Days)")).toBeInTheDocument();
    });
  });

  it("renders structured data for SEO", () => {
    const { container } = render(<StatusPage />);
    const scriptTag = container.querySelector('script[type="application/ld+json"]');
    expect(scriptTag).toBeInTheDocument();
  });
});
