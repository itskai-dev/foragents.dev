/** @jest-environment jsdom */

import React from "react";
import { render, cleanup } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Shared mocks
// ---------------------------------------------------------------------------

type LinkProps = {
  href: string;
  children?: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

jest.mock("next/link", () => {
  const LinkMock = ({ href, children, ...props }: LinkProps) => (
    <a href={href} {...props}>{children}</a>
  );
  LinkMock.displayName = "Link";
  return LinkMock;
});

jest.mock("next/image", () => {
  const ImageMock = (
    { alt = "", fill, priority, ...rest }: { alt?: string; fill?: unknown; priority?: unknown } & Record<string, unknown>
  ) => {
    void fill;
    void priority;
    return <div role="img" aria-label={alt} {...rest} />;
  };
  ImageMock.displayName = "Image";
  return ImageMock;
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), prefetch: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
  useParams: () => ({}),
  notFound: () => { throw new Error("NEXT_NOT_FOUND"); },
  redirect: (url: string) => { throw new Error(`NEXT_REDIRECT:${url}`); },
}));

jest.mock("next/headers", () => ({
  headers: () => new Map([["host", "localhost:3000"], ["x-forwarded-proto", "http"]]),
  cookies: () => ({ get: () => undefined, getAll: () => [] }),
}));

// ---------------------------------------------------------------------------
// Component mocks (heavy client components that aren't under test)
// ---------------------------------------------------------------------------

jest.mock("@/components/mobile-nav", () => ({
  MobileNav: () => <nav data-testid="mobile-nav" />,
}));

jest.mock("@/components/footer", () => ({
  Footer: () => <footer data-testid="footer" />,
}));

jest.mock("@/components/global-nav", () => ({
  GlobalNav: () => <nav data-testid="global-nav" />,
}));

jest.mock("@/components/InstallCount", () => ({
  InstallCount: () => <span data-testid="install-count">0</span>,
}));

jest.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => <button data-testid="theme-toggle" />,
}));

jest.mock("@/components/news-feed", () => ({
  NewsFeed: () => <div data-testid="news-feed" />,
}));

jest.mock("@/components/recent-submissions", () => ({
  RecentSubmissions: () => <div data-testid="recent-submissions" />,
}));

jest.mock("@/components/announcement-banner", () => ({
  AnnouncementBanner: () => <div data-testid="announcement-banner" />,
}));

jest.mock("@/components/recently-viewed/ResumeSection", () => ({
  ResumeSection: () => <div data-testid="resume-section" />,
}));

jest.mock("@/components/agent-bootstrap-panel", () => ({
  AgentBootstrapPanel: () => <div data-testid="agent-bootstrap-panel" />,
}));

jest.mock("@/components/newsletter-signup", () => ({
  NewsletterSignup: () => <div data-testid="newsletter-signup" />,
}));

jest.mock("@/components/TestimonialCarousel", () => ({
  TestimonialCarousel: () => <div data-testid="testimonial-carousel" />,
}));

jest.mock("@/components/compare/CompareToggleButton", () => ({
  CompareToggleButton: () => <button data-testid="compare-toggle" />,
}));

jest.mock("@/components/compare/ComparePageClient", () => {
  const Mock = () => <div data-testid="compare-page-client" />;
  Mock.displayName = "ComparePageClient";
  return Mock;
});

jest.mock("@/components/compare/SkillComparePageClient", () => {
  const Mock = () => <div data-testid="skill-compare-page-client" />;
  Mock.displayName = "SkillComparePageClient";
  return Mock;
});

jest.mock("@/components/next-best-action-panel", () => ({
  NextBestActionPanel: () => <div data-testid="next-best-action-panel" />,
}));

jest.mock("@/components/share-button", () => ({
  ShareButton: () => <button data-testid="share-button" />,
}));

jest.mock("@/components/share-stats-button", () => ({
  ShareStatsButton: () => <button data-testid="share-stats-button" />,
}));

jest.mock("@/components/breadcrumbs", () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs" />,
}));

jest.mock("@/components/color-swatch", () => ({
  ColorSwatch: () => <div data-testid="color-swatch" />,
}));

jest.mock("@/components/artifacts/ArtifactCard", () => ({
  ArtifactCard: () => <div data-testid="artifact-card" />,
}));

jest.mock("@/components/artifacts/CopySnippets", () => ({
  CopySnippets: () => <div data-testid="copy-snippets" />,
}));

jest.mock("@/components/PremiumBadge", () => ({
  PremiumBadge: () => <span data-testid="premium-badge" />,
  VerifiedBadge: () => <span data-testid="verified-badge" />,
}));

jest.mock("@/components/get-started/BootstrapPromptCard", () => ({
  BootstrapPromptCard: () => <div data-testid="bootstrap-prompt-card" />,
}));

jest.mock("@/components/get-started/ActivationChecklist", () => ({
  ActivationChecklist: () => <div data-testid="activation-checklist" />,
}));

// Mock problematic client components with infinite loop bugs
jest.mock("@/components/skill-page-client", () => ({
  SkillPageClient: () => <div data-testid="skill-page-client" />,
}));

// Mock subscribe success client (uses useSearchParams)
jest.mock("@/app/subscribe/success/success-client", () => ({
  SubscribeSuccessClient: () => <div data-testid="subscribe-success-client" />,
}));

// Mock use-cases client
jest.mock("@/app/use-cases/use-cases-client", () => {
  const Mock = () => <div data-testid="use-cases-client" />;
  Mock.displayName = "UseCasesClient";
  return Mock;
});

// ---------------------------------------------------------------------------
// Data layer mocks
// ---------------------------------------------------------------------------

const mockSkill = {
  id: "test-skill-1",
  name: "Test Skill",
  slug: "test-skill",
  description: "A test skill",
  author: "Test Author",
  tags: ["test"],
  category: "development",
  url: "https://example.com",
  sourceUrl: "https://example.com",
  installCommand: "npm install test",
};

const mockAgent = {
  id: "test-agent-1",
  name: "Test Agent",
  handle: "test-agent",
  description: "A test agent",
  avatar: "/avatar.png",
  profileUrl: "https://example.com",
  tags: ["test"],
  capabilities: ["chat"],
  provider: "openai",
  featured: false,
  links: { agentJson: null, website: null, github: null },
  platforms: ["web"],
  category: "general",
  skills: ["chat", "search"],
  pricing: { model: "free" },
  status: "active",
};

const mockCreator = {
  username: "testuser",
  displayName: "Test User",
  bio: "A test creator",
  avatar: "/avatar.png",
  skills: [mockSkill],
  skillCount: 1,
  totalInstalls: 100,
  topTags: [{ tag: "test", count: 1 }],
};

const mockNewsItem = {
  id: "news-1",
  title: "Test News",
  summary: "Test summary",
  source_url: "https://example.com",
  source_name: "Test Source",
  tags: ["test"],
  published_at: "2024-01-01T00:00:00Z",
};

jest.mock("@/lib/data", () => ({
  getSkills: () => [mockSkill],
  getSkillBySlug: () => mockSkill,
  getNews: () => [mockNewsItem],
  getNewsById: () => mockNewsItem,
  getMcpServers: () => [],
  getMcpServerBySlug: () => undefined,
  getLlmsTxtEntries: () => [],
  getAgents: () => [mockAgent],
  getFeaturedAgents: () => [mockAgent],
  getAgentByHandle: () => mockAgent,
  formatAgentHandle: (a: { handle: string }) => `@${a.handle}`,
  getAcpAgents: () => [],
  getAcpAgentById: () => undefined,
  getRecentSubmissions: () => Promise.resolve([]),
  getCreators: () => [mockCreator],
  getCreatorByUsername: () => mockCreator,
  getSkillsByAuthor: () => [mockSkill],
  getBlogPosts: () => [{
    slug: 'example-post',
    title: 'Example Post',
    excerpt: 'Example excerpt',
    category: 'Updates',
    date: '2026-01-01',
    author: { name: 'Team', avatar: '🤖' },
  }],
  getBlogCategories: () => ['Updates', 'Technical'],
  getBlogPostBySlug: () => ({
    slug: 'example-post',
    title: 'Example Post',
    excerpt: 'Example excerpt',
    category: 'Updates',
    date: '2026-01-01',
    author: { name: 'Team', avatar: '🤖' },
    content: ['Example content paragraph'],
    tags: ['example', 'test'],
  }),
  getRelatedBlogPosts: () => [],
}));

jest.mock("@/lib/artifacts", () => ({
  getArtifacts: () => Promise.resolve([]),
  getArtifactById: () => Promise.resolve(null),
  getArtifactLineage: () => Promise.resolve([]),
  validateArtifactInput: () => [],
}));

jest.mock("@/lib/supabase", () => ({
  getSupabase: () => null,
}));

jest.mock("@/lib/stripe", () => ({
  stripe: null,
  PREMIUM_PRICE_IDS: { monthly: "", quarterly: "", annual: "" },
  PREMIUM_PRICE_ID: "",
  PREMIUM_PRODUCT: {
    name: "forAgents.dev Premium",
    price: 900,
    interval: "month",
    features: ["Feature 1", "Feature 2"],
  },
}));

jest.mock("@/lib/compare", () => ({
  parseCompareIdsParam: () => [],
  buildCompareUrl: () => "/compare",
  COMPARE_TRAY_STORAGE_KEY: "foragents.compareTray.v1",
  COMPARE_TRAY_MAX: 4,
}));

jest.mock("@/lib/testimonials", () => ({
  testimonials: [
    { name: "Test", role: "Tester", quote: "Great!", rating: 5, initials: "T" },
  ],
}));

// Mock fetch - return ok: false for unknown API calls (triggers notFound in pages)
const originalFetch = global.fetch;
beforeAll(() => {
  (global as Record<string, unknown>).fetch = jest.fn(() =>
    Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(""),
    })
  );
});
afterAll(() => {
  global.fetch = originalFetch;
});

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Helper for async server components
// ---------------------------------------------------------------------------

async function renderServerComponent(
  Component: (...args: unknown[]) => unknown,
  props: Record<string, unknown> = {}
) {
  const result = await Component(props);
  return render(result as React.ReactElement);
}

// ---------------------------------------------------------------------------
// Tests – Sync pages (no async, no special props)
// ---------------------------------------------------------------------------

describe("Untested Pages – Render Tests", () => {
  // Simple sync pages
  const syncPages: Array<[string, () => Promise<{ default: React.ComponentType }>]> = [
    ["accessibility", () => import("@/app/accessibility/page")],
    ["acp", () => import("@/app/acp/page")],
    ["badges", () => import("@/app/badges/page")],
    ["blog", () => import("@/app/blog/page")],
    ["bookmarks", () => import("@/app/bookmarks/page")],
    ["brand", () => import("@/app/brand/page")],
    // TODO: ChangelogPage is async server component, needs different test approach
    // ["changelog", () => import("@/app/changelog/page")],
    // collections is now an async server component
    ["contact", () => import("@/app/contact/page")],
    ["credits", () => import("@/app/credits/page")],
    ["demos", () => import("@/app/demos/page")],
    ["docs/api", () => import("@/app/docs/api/page")],
    ["docs/playground", () => import("@/app/docs/playground/page")],
    ["enterprise", () => import("@/app/enterprise/page")],
    ["faq", () => import("@/app/faq/page")],
    ["feeds", () => import("@/app/feeds/page")],
    ["governance", () => import("@/app/governance/page")],
    ["guides", () => import("@/app/guides/page")],
    ["guides/kit-integration", () => import("@/app/guides/kit-integration/page")],
    ["history", () => import("@/app/history/page")],
    ["integrations", () => import("@/app/integrations/page")],
    ["llms-txt", () => import("@/app/llms-txt/page")],
    ["migrate", () => import("@/app/migrate/page")],
    ["newsletter", () => import("@/app/newsletter/page")],
    ["open-source", () => import("@/app/open-source/page")],
    ["playground", () => import("@/app/playground/page")],
    ["privacy", () => import("@/app/privacy/page")],
    ["releases", () => import("@/app/releases/page")],
    ["requests", () => import("@/app/requests/page")],
    ["roadmap", () => import("@/app/roadmap/page")],
    ["search", () => import("@/app/search/page")],
    ["settings", () => import("@/app/settings/page")],
    ["settings/billing", () => import("@/app/settings/billing/page")],
    ["settings/notifications", () => import("@/app/settings/notifications/page")],
    ["settings/profile", () => import("@/app/settings/profile/page")],
    ["settings/profile/premium", () => import("@/app/settings/profile/premium/page")],
    ["sitemap-visual", () => import("@/app/sitemap-visual/page")],
    ["status", () => import("@/app/status/page")],
    ["submit", () => import("@/app/submit/page")],
    ["subscribe", () => import("@/app/subscribe/page")],
    ["subscribe/success", () => import("@/app/subscribe/success/page")],
    ["terms", () => import("@/app/terms/page")],
    ["testimonials", () => import("@/app/testimonials/page")],
    ["updates", () => import("@/app/updates/page")],
    ["use-cases", () => import("@/app/use-cases/page")],
    ["verify", () => import("@/app/verify/page")],
    ["whats-new", () => import("@/app/whats-new/page")],
  ];

  test.each(syncPages)("/%s renders without crashing", async (_name, importFn) => {
    const mod = await importFn();
    const Page = mod.default;
    const { container } = render(<Page />);
    expect(container).toBeInTheDocument();
  });

  // Sync pages that need searchParams/params props
  test("/compare renders without crashing", async () => {
    const mod = await import("@/app/compare/page");
    const Page = mod.default;
    const { container } = render(<Page searchParams={{}} />);
    expect(container).toBeInTheDocument();
  });

  test("/skills/compare renders without crashing", async () => {
    const mod = await import("@/app/skills/compare/page");
    const Page = mod.default;
    const { container } = render(<Page searchParams={{}} />);
    expect(container).toBeInTheDocument();
  });

  test("/blog/[slug] renders without crashing", async () => {
    const mod = await import("@/app/blog/[slug]/page");
    const Page = mod.default;
    const { container } = render(<Page params={{ slug: "test-post" }} />);
    expect(container).toBeInTheDocument();
  });

  test("/collections/[slug] (curated) renders without crashing", async () => {
    const mod = await import("@/app/collections/[slug]/page");
    const { container } = await renderServerComponent(mod.default, {
      params: Promise.resolve({ slug: "essential-agent-kit" }),
    });
    expect(container).toBeInTheDocument();
  });

  // TODO: GuidePage is async server component, needs different test approach
  test.skip("/guides/[slug] renders with valid slug", async () => {
    const mod = await import("@/app/guides/[slug]/page");
    const Page = mod.default;
    // This page calls notFound() for unknown slugs
    expect(() => render(<Page params={{ slug: "nonexistent" }} />)).toThrow("NEXT_NOT_FOUND");
  });

  // /getting-started redirects
  test("/getting-started redirects to /b", async () => {
    const mod = await import("@/app/getting-started/page");
    const Page = mod.default;
    expect(() => render(<Page />)).toThrow("NEXT_REDIRECT:/b");
  });

  // Get-started page (different from getting-started)
  test("/get-started renders without crashing", async () => {
    const mod = await import("@/app/get-started/page");
    const Page = mod.default;
    const { container } = render(<Page />);
    expect(container).toBeInTheDocument();
  });

  // Admin submissions page (client component)
  test("/admin/submissions renders without crashing", async () => {
    const mod = await import("@/app/admin/submissions/page");
    const Page = mod.default;
    const { container } = render(<Page />);
    expect(container).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Async server components
  // ---------------------------------------------------------------------------

  test("/ (home) renders without crashing", async () => {
    const mod = await import("@/app/page");
    const { container } = await renderServerComponent(mod.default);
    expect(container).toBeInTheDocument();
  });

  test("/agents renders without crashing", async () => {
    const mod = await import("@/app/agents/page");
    const { container } = await renderServerComponent(mod.default);
    expect(container).toBeInTheDocument();
  });

  test("/collections renders without crashing", async () => {
    const mod = await import("@/app/collections/page");
    const { container } = await renderServerComponent(mod.default);
    expect(container).toBeInTheDocument();
  });

  test("/agents/[handle] renders without crashing", async () => {
    const mod = await import("@/app/agents/[handle]/page");
    const { container } = await renderServerComponent(mod.default, {
      params: Promise.resolve({ handle: "test-agent" }),
    });
    expect(container).toBeInTheDocument();
  });

  test("/artifacts renders without crashing", async () => {
    const mod = await import("@/app/artifacts/page");
    const { container } = await renderServerComponent(mod.default);
    expect(container).toBeInTheDocument();
  });

  test("/artifacts/[id] renders without crashing", async () => {
    const mod = await import("@/app/artifacts/[id]/page");
    // getArtifactById returns null → notFound()
    await expect(
      renderServerComponent(mod.default, {
        params: Promise.resolve({ id: "nonexistent" }),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  test("/creators renders without crashing", async () => {
    const mod = await import("@/app/creators/page");
    const { container } = await renderServerComponent(mod.default);
    expect(container).toBeInTheDocument();
  });

  test("/creators/[username] renders without crashing", async () => {
    const mod = await import("@/app/creators/[username]/page");
    const { container } = await renderServerComponent(mod.default, {
      params: Promise.resolve({ username: "testuser" }),
    });
    expect(container).toBeInTheDocument();
  });

  test("/creators/[username]/stats renders without crashing", async () => {
    const mod = await import("@/app/creators/[username]/stats/page");
    const { container } = await renderServerComponent(mod.default, {
      params: Promise.resolve({ username: "testuser" }),
    });
    expect(container).toBeInTheDocument();
  });

  test("/mcp renders without crashing", async () => {
    const mod = await import("@/app/mcp/page");
    const { container } = await renderServerComponent(mod.default);
    expect(container).toBeInTheDocument();
  });

  test("/news/[id] renders without crashing", async () => {
    const mod = await import("@/app/news/[id]/page");
    const { container } = await renderServerComponent(mod.default, {
      params: Promise.resolve({ id: "news-1" }),
    });
    expect(container).toBeInTheDocument();
  });

  test("/skills/[slug] renders without crashing", async () => {
    const mod = await import("@/app/skills/[slug]/page");
    const { container } = await renderServerComponent(mod.default, {
      params: Promise.resolve({ slug: "test-skill" }),
    });
    expect(container).toBeInTheDocument();
  });

  test("/stats renders without crashing", async () => {
    const mod = await import("@/app/stats/page");
    const { container } = await renderServerComponent(mod.default);
    expect(container).toBeInTheDocument();
  });

  test("/trending renders without crashing", async () => {
    const mod = await import("@/app/trending/page");
    const { container } = await renderServerComponent(mod.default);
    expect(container).toBeInTheDocument();
  });

  test("/c/[slug] calls fetch and renders or notFound", async () => {
    const mod = await import("@/app/c/[slug]/page");
    // The page fetches from API - our mock fetch returns ok:false so fetchCollection returns null → notFound
    await expect(
      renderServerComponent(mod.default, {
        params: Promise.resolve({ slug: "test-collection" }),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
