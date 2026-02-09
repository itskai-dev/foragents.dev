/** @jest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";

jest.setTimeout(10_000);

// ---- Browser API polyfills commonly used by UI libs ----
class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-expect-error - polyfill for tests
global.ResizeObserver = global.ResizeObserver ?? NoopObserver;
// @ts-expect-error - polyfill for tests
global.IntersectionObserver = global.IntersectionObserver ?? NoopObserver;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value:
    window.matchMedia ??
    ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })),
});

// ---- Next.js shims ----

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

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/events",
  useParams: () => ({}),
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

jest.mock("next/headers", () => ({
  headers: () =>
    new Map([
      ["host", "localhost:3000"],
      ["x-forwarded-proto", "http"],
    ]),
  cookies: () => ({ get: () => undefined, getAll: () => [] }),
}));

describe("Events page", () => {
  test("renders without crashing", async () => {
    const EventsPage = (await import("@/app/events/page")).default;
    const { container } = render(<EventsPage />);
    expect(container).toBeInTheDocument();
  });

  test("displays page title", async () => {
    const EventsPage = (await import("@/app/events/page")).default;
    render(<EventsPage />);
    expect(screen.getByText("Events & Community")).toBeInTheDocument();
  });

  test("displays upcoming and past events sections", async () => {
    const EventsPage = (await import("@/app/events/page")).default;
    render(<EventsPage />);
    expect(screen.getByText("Upcoming Events")).toBeInTheDocument();
    expect(screen.getByText("Past Events")).toBeInTheDocument();
  });

  test("displays event type filters", async () => {
    const EventsPage = (await import("@/app/events/page")).default;
    render(<EventsPage />);
    expect(screen.getByText("All Events")).toBeInTheDocument();
    expect(screen.getAllByText("Webinar").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Workshop").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Hackathon").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Meetup").length).toBeGreaterThan(0);
  });

  test("displays host an event CTA", async () => {
    const EventsPage = (await import("@/app/events/page")).default;
    render(<EventsPage />);
    expect(screen.getByText("Want to host an event?")).toBeInTheDocument();
  });
});
