/** @jest-environment jsdom */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import AboutPage from "@/app/about/page";

jest.setTimeout(10_000);

// ---- Browser API polyfills ----
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
  usePathname: () => "/about",
  useParams: () => ({}),
}));

const mockAboutPayload = {
  mission: "Build reliable defaults for every autonomous software agent.",
  team: [
    {
      name: "Kai",
      role: "Founder",
      bio: "Builds product direction and platform roadmap.",
      avatarUrl: "https://example.com/kai.png",
      socialLinks: { GitHub: "https://github.com/kai" },
    },
    {
      name: "Scout",
      role: "Developer Relations",
      bio: "Supports contributors and documentation quality.",
      avatarUrl: "https://example.com/scout.png",
      socialLinks: { X: "https://x.com/scout" },
    },
  ],
  milestones: [
    {
      date: "2025-01-10",
      title: "Public launch",
      description: "Opened contributions to the wider agent ecosystem.",
    },
  ],
  stats: {
    launchDate: "2025-01-01",
    totalSkills: 42,
    totalAgents: 150,
    contributorsCount: 18,
  },
};

describe("/about page", () => {
  let rafTime = 0;

  beforeEach(() => {
    rafTime = 0;

    jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      rafTime += 1500;
      return window.setTimeout(() => cb(rafTime), 0);
    });

    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockAboutPayload,
    } as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders hero and mission content from live payload", async () => {
    const { container } = render(<AboutPage />);
    expect(container).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Built by agents, for agents")).toBeInTheDocument();
    });

    expect(screen.getByText("Live platform data")).toBeInTheDocument();
    expect(screen.getByText("Mission")).toBeInTheDocument();
    expect(screen.getByText(mockAboutPayload.mission)).toBeInTheDocument();
  });

  test("renders stats, team, milestones, and CTA sections", async () => {
    render(<AboutPage />);

    await waitFor(() => {
      expect(screen.getByText("Platform Stats")).toBeInTheDocument();
    });

    expect(screen.getByText("Skills")).toBeInTheDocument();
    expect(screen.getByText("Agents")).toBeInTheDocument();
    expect(screen.getByText("Contributors")).toBeInTheDocument();
    expect(screen.getByText("Days since launch")).toBeInTheDocument();

    expect(screen.getByText("Team")).toBeInTheDocument();
    expect(screen.getByText("Kai")).toBeInTheDocument();
    expect(screen.getByText("Scout")).toBeInTheDocument();

    expect(screen.getByText("Milestones")).toBeInTheDocument();
    expect(screen.getByText("Public launch")).toBeInTheDocument();

    expect(screen.getByText("Build with us")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Submit a Skill" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contribute on GitHub" })).toBeInTheDocument();
  });
});
