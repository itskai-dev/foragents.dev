/** @jest-environment jsdom */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PartnersPage from "@/app/partners/page";

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

const mockPartners = [
  {
    id: "1",
    name: "OpenClaw",
    slug: "openclaw",
    icon: "🛠️",
    description: "Agent runtime",
    tier: "Gold",
    integrationType: "API",
    type: "partner",
    website: "https://openclaw.example",
  },
  {
    id: "2",
    name: "Supabase",
    slug: "supabase",
    icon: "🟢",
    description: "Database backend",
    tier: "Silver",
    integrationType: "SDK",
    type: "sponsor",
    website: "https://supabase.example",
  },
] as const;

describe("Partners Page", () => {
  beforeEach(() => {
    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.includes("/api/partners/apply") && init?.method === "POST") {
        return { ok: true, json: async () => ({ message: "Application received." }) } as Response;
      }

      if (url.includes("/api/partners")) {
        return {
          ok: true,
          json: async () => ({ partners: mockPartners, total: mockPartners.length }),
        } as Response;
      }

      return { ok: false, json: async () => ({}) } as Response;
    }) as jest.Mock;
  });

  it("renders title and loaded partner count", async () => {
    render(<PartnersPage />);

    expect(screen.getByRole("heading", { name: /partners & sponsors/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(`${mockPartners.length} listed organizations`)).toBeInTheDocument();
    });
  });

  it("filters by search", async () => {
    render(<PartnersPage />);

    await waitFor(() => expect(screen.getByText("OpenClaw")).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText(/search partners/i), {
      target: { value: "OpenClaw" },
    });

    expect(screen.getByText("OpenClaw")).toBeInTheDocument();
    expect(screen.queryByText("Supabase")).not.toBeInTheDocument();
  });

  it("shows apply section", async () => {
    render(<PartnersPage />);

    expect(screen.getByText("Apply to Join")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit application/i })).toBeInTheDocument();
  });
});
