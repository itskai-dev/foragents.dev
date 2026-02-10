/** @jest-environment jsdom */

import React from 'react';
import { render } from '@testing-library/react';

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

// matchMedia is used by some components (themes, responsive hooks)
Object.defineProperty(window, 'matchMedia', {
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

jest.mock('next/link', () => {
  const LinkMock = ({ href, children, ...props }: LinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  LinkMock.displayName = 'Link';
  return LinkMock;
});

jest.mock('next/image', () => {
  const NextImage = ({ alt = '', ...props }: { alt?: string } & Record<string, unknown>) => (
    <div role="img" aria-label={alt} {...props} />
  );
  NextImage.displayName = 'NextImage';
  return NextImage;
});

jest.mock('next/navigation', () => {
  const makeErr = (digest: string) => {
    const err: Error & { digest?: string } = new Error(digest);
    err.digest = digest;
    return err;
  };

  // Return a stable instance so components that depend on referential equality
  // (e.g. useEffect deps) don't infinite-loop.
  const stableSearchParams = new URLSearchParams('session_id=test_session');

  return {
    redirect: (url: string) => {
      const err: Error & { digest?: string } = makeErr('NEXT_REDIRECT');
      err.url = url;
      throw err;
    },
    notFound: () => {
      throw makeErr('NEXT_NOT_FOUND');
    },
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      refresh: jest.fn(),
    }),
    useSearchParams: () => stableSearchParams,
    usePathname: () => '/',
    useParams: () => ({}),
  };
});

jest.mock('next/headers', () => ({
  headers: () =>
    new Map([
      ['host', 'localhost:3000'],
      ['x-forwarded-proto', 'http'],
    ]),
  cookies: () => ({ get: () => undefined, getAll: () => [] }),
}));

// ---- Shared component mocks (keep render tests lightweight/deterministic) ----

jest.mock('@/components/mobile-nav', () => ({
  MobileNav: () => <nav data-testid="mobile-nav" />,
}));

jest.mock('@/components/footer', () => ({
  Footer: () => <footer data-testid="footer" />,
}));

jest.mock('@/components/global-nav', () => ({
  GlobalNav: () => <nav data-testid="global-nav" />,
}));

jest.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <button type="button" data-testid="theme-toggle" />,
}));

jest.mock('@/components/InstallCount', () => ({
  InstallCount: () => <span data-testid="install-count" />,
}));

jest.mock('@/components/TestimonialCarousel', () => ({
  TestimonialCarousel: () => <div data-testid="testimonial-carousel" />,
}));

jest.mock('@/components/UpgradeCTA', () => ({
  UpgradeCTA: () => <div data-testid="upgrade-cta" />,
}));

jest.mock('@/components/breadcrumbs', () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs" />,
}));

jest.mock('@/components/get-started/BootstrapPromptCard', () => ({
  BootstrapPromptCard: () => <section data-testid="bootstrap-prompt-card" />,
}));

jest.mock('@/components/get-started/ActivationChecklist', () => ({
  ActivationChecklist: () => <section data-testid="activation-checklist" />,
}));

jest.mock('@/components/PremiumBadge', () => ({
  PremiumBadge: () => <span data-testid="premium-badge" />,
  VerifiedBadge: () => <span data-testid="verified-badge" />,
}));

// Mock changelog data
jest.mock('@/lib/changelog', () => ({
  getChangelogEntries: () => [
    {
      version: '1.0.0',
      date: '2026-01-01',
      title: 'Example Update',
      description: 'Example description',
      changes: [],
    },
  ],
}));

// Avoid network / filesystem variability for render-only tests.
jest.mock('@/lib/data', () => {
  const skill = {
    id: 'skill_1',
    slug: 'example-skill',
    name: 'Example Skill',
    description: 'Example description',
    author: 'Team Reflectt',
    install_cmd: 'echo install',
    repo_url: 'https://example.com',
    tags: ['agents', 'tools'],
  };

  const agent = {
    id: 'agent_1',
    handle: 'example',
    name: 'Example Agent',
    domain: 'example.com',
    description: 'Example agent description',
    role: 'Demo',
    avatar: '🤖',
    platforms: ['web'],
    skills: ['example-skill'],
    links: { agentJson: 'https://example.com/agent.json' },
    featured: false,
    joinedAt: '2026-01-01',
  };

  const acpAgent = {
    id: 'acp_1',
    license: 'MIT',
    ides: ['JetBrains'],
    name: 'Example ACP Agent',
    version: '1.0.0',
    author: 'Example Author',
    description: 'Example ACP agent description',
    install_cmd: 'acp install example',
    repository: 'https://github.com/example/acp-agent',
    tags: ['coding', 'agents'],
  };

  const creator = {
    username: 'example_creator',
    verified: true,
    skillCount: 1,
    topTags: [{ tag: 'agents', count: 1 }],
    skills: [{ name: 'Example Skill' }],
  };

  const mcp = {
    id: 'mcp_1',
    name: 'Example MCP',
    description: 'Example MCP description',
    author: 'Example Author',
    install_cmd: 'npm i example',
    category: 'tools',
    tags: ['official'],
    github: 'https://github.com/example',
  };

  const llms = {
    id: 'llms_1',
    title: 'Example.com',
    domain: 'example.com',
    url: 'https://example.com/llms.txt',
    description: 'Example llms.txt entry',
    sections: ['Docs', 'API', 'Guides'],
  };

  return {
    __esModule: true,
    // Lists
    getSkills: () => [skill],
    getAgents: () => [agent],
    getFeaturedAgents: () => [agent],
    getAcpAgents: () => [acpAgent],
    getCreators: () => [creator],
    getMcpServers: () => [mcp],
    getLlmsTxtEntries: () => [llms],
    getNews: () => [
      {
        id: 'news_1',
        title: 'Example News',
        summary: 'Example summary',
        source_url: 'https://example.com',
        source_name: 'Example',
        tags: ['agents'],
        published_at: '2026-01-01',
      },
    ],

    // Helpers used by pages
    formatAgentHandle: (a: { handle: string }) => `@${a.handle}`,

    // Async functions
    getRecentSubmissions: async () => [],

    // Blog functions
    getBlogPosts: () => [
      {
        slug: 'example-post',
        title: 'Example Post',
        excerpt: 'Example excerpt',
        category: 'Updates',
        date: '2026-01-01',
        author: {
          name: 'Team',
          avatar: '🤖',
        },
      },
    ],
    getBlogCategories: () => ['Updates', 'Technical'],

    // Types
    Skill: {},
  };
});

beforeAll(() => {
  global.fetch = jest.fn(async (input: RequestInfo | URL) => {
    const url = String(input);

    if (url.includes('/api/blog')) {
      return { ok: true, json: async () => ({ posts: [], total: 0 }) } as Response;
    }
    if (url.includes('/api/changelog')) {
      return { ok: true, json: async () => ({ entries: [], total: 0 }) } as Response;
    }
    if (url.includes('/api/status/history')) {
      return { ok: true, json: async () => ({ history: [] }) } as Response;
    }
    if (url.includes('/api/status')) {
      return { ok: true, json: async () => ({ services: [], overall: 'operational' }) } as Response;
    }

    return { ok: true, json: async () => ({}) } as Response;
  }) as jest.Mock;
});

async function renderPageModule(importPath: string, props: Record<string, unknown> = {}) {
  const mod: Record<string, unknown> = await import(importPath);
  const Page = mod.default;

  expect(Page).toBeTruthy();

  // Next.js server components are often `async function`.
  if (Page?.constructor?.name === 'AsyncFunction') {
    const element = await Page(props);
    const { container } = render(element);
    expect(container).toBeInTheDocument();
    return;
  }

  const { container } = render(React.createElement(Page, props));
  expect(container).toBeInTheDocument();
}

const MISSING_PAGES: Array<{ name: string; importPath: string }> = [
  { name: 'Accessibility', importPath: '@/app/accessibility/page' },
  { name: 'ACP', importPath: '@/app/acp/page' },
  { name: 'Admin submissions', importPath: '@/app/admin/submissions/page' },
  // Agents index covered by dedicated agents-profile-page test suite
  // { name: 'Agents index', importPath: '@/app/agents/page' },
  { name: 'Artifacts index', importPath: '@/app/artifacts/page' },
  { name: 'Badges', importPath: '@/app/badges/page' },
  { name: 'Blog', importPath: '@/app/blog/page' },
  { name: 'Bookmarks', importPath: '@/app/bookmarks/page' },
  { name: 'Brand', importPath: '@/app/brand/page' },
  { name: 'Changelog', importPath: '@/app/changelog/page' },
  { name: 'Collections index', importPath: '@/app/collections/page' },
  { name: 'Compare', importPath: '@/app/compare/page' },
  { name: 'Contact', importPath: '@/app/contact/page' },
  { name: 'Creators index', importPath: '@/app/creators/page' },
  { name: 'Credits', importPath: '@/app/credits/page' },
  { name: 'Demos', importPath: '@/app/demos/page' },
  { name: 'Docs playground', importPath: '@/app/docs/playground/page' },
  { name: 'Enterprise', importPath: '@/app/enterprise/page' },
  { name: 'FAQ', importPath: '@/app/faq/page' },
  { name: 'Feeds', importPath: '@/app/feeds/page' },
  { name: 'Get started', importPath: '@/app/get-started/page' },
  { name: 'Governance', importPath: '@/app/governance/page' },
  { name: 'Guides: kit integration', importPath: '@/app/guides/kit-integration/page' },
  { name: 'Guides index', importPath: '@/app/guides/page' },
  { name: 'History', importPath: '@/app/history/page' },
  { name: 'Integrations', importPath: '@/app/integrations/page' },
  { name: 'llms.txt directory', importPath: '@/app/llms-txt/page' },
  { name: 'MCP', importPath: '@/app/mcp/page' },
  { name: 'Migrate', importPath: '@/app/migrate/page' },
  { name: 'Newsletter', importPath: '@/app/newsletter/page' },
  { name: 'Open source', importPath: '@/app/open-source/page' },
  { name: 'Home', importPath: '@/app/page' },
  { name: 'Playground', importPath: '@/app/playground/page' },
  { name: 'Privacy', importPath: '@/app/privacy/page' },
  { name: 'Releases', importPath: '@/app/releases/page' },
  { name: 'Requests', importPath: '@/app/requests/page' },
  { name: 'Roadmap', importPath: '@/app/roadmap/page' },
  { name: 'Search', importPath: '@/app/search/page' },
  { name: 'Settings: billing', importPath: '@/app/settings/billing/page' },
  { name: 'Settings: notifications', importPath: '@/app/settings/notifications/page' },
  { name: 'Settings', importPath: '@/app/settings/page' },
  { name: 'Settings: profile', importPath: '@/app/settings/profile/page' },
  { name: 'Settings: premium', importPath: '@/app/settings/profile/premium/page' },
  { name: 'Sitemap visual', importPath: '@/app/sitemap-visual/page' },
  { name: 'Skills compare', importPath: '@/app/skills/compare/page' },
  { name: 'Stats', importPath: '@/app/stats/page' },
  { name: 'Status', importPath: '@/app/status/page' },
  { name: 'Submit', importPath: '@/app/submit/page' },
  { name: 'Subscribe', importPath: '@/app/subscribe/page' },
  { name: 'Subscribe success', importPath: '@/app/subscribe/success/page' },
  { name: 'Terms', importPath: '@/app/terms/page' },
  { name: 'Testimonials', importPath: '@/app/testimonials/page' },
  { name: 'Trending', importPath: '@/app/trending/page' },
  { name: 'Updates', importPath: '@/app/updates/page' },
  { name: 'Use cases', importPath: '@/app/use-cases/page' },
  { name: 'Verify', importPath: '@/app/verify/page' },
  { name: "What's new", importPath: '@/app/whats-new/page' },
];

describe('Render tests for previously-untested pages (Issue #151)', () => {
  test.each(MISSING_PAGES)('$name renders without crashing', async ({ importPath }) => {
    await renderPageModule(importPath);
  });

  test('Getting Started legacy path redirects', async () => {
    const mod: Record<string, unknown> = await import('@/app/getting-started/page');
    const Page = mod.default;
    expect(Page).toBeTruthy();

    // Rendering this route should trigger a Next.js redirect (throws).
    expect(() => render(React.createElement(Page))).toThrow();
  });
});
