import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

// Mock scrollIntoView (only if Element exists in the environment)
if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = jest.fn();
}

const dataDir = path.join(process.cwd(), 'data');

function readJson<T = unknown>(fileName: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(path.join(dataDir, fileName), 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function jsonResponse(data: unknown, status = 200): Response {
  const ok = status >= 200 && status < 300;
  return {
    ok,
    status,
    headers: new Headers({ 'Content-Type': 'application/json' }),
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as unknown as Response;
}

function normalizeUrl(input: string | URL | Request): URL {
  if (typeof input === 'string') return new URL(input, 'http://localhost');
  if (input instanceof URL) return input;
  return new URL(input.url, 'http://localhost');
}

function getMethod(input: string | URL | Request, init?: RequestInit): string {
  if (init?.method) return init.method.toUpperCase();
  if (typeof Request !== 'undefined' && input instanceof Request) return input.method.toUpperCase();
  return 'GET';
}

const defaultFetch = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
  const url = normalizeUrl(input);
  const method = getMethod(input, init);
  const pathname = url.pathname;

  if (pathname === '/api/developer' && method === 'GET') {
    const resources = readJson('developer-resources.json', [] as unknown[]);
    return jsonResponse({ resources });
  }

  if (pathname === '/api/partners' && method === 'GET') {
    const partners = readJson('partners.json', [] as Array<Record<string, unknown>>);
    const tier = (url.searchParams.get('tier') || '').toLowerCase();
    const search = (url.searchParams.get('search') || '').toLowerCase();
    const filtered = partners.filter((partner) => {
      const p = partner as { tier?: string; name?: string; description?: string; slug?: string };
      if (tier && p.tier !== tier) return false;
      if (!search) return true;
      const haystack = `${p.name ?? ''} ${p.description ?? ''} ${p.slug ?? ''}`.toLowerCase();
      return haystack.includes(search);
    });
    return jsonResponse({ partners: filtered, total: filtered.length, filters: { tier: tier || null, search: search || null } });
  }

  if (pathname.startsWith('/api/partners/') && method === 'GET') {
    const slug = pathname.split('/').pop();
    const partners = readJson('partners.json', [] as Array<{ slug: string }>);
    const partner = partners.find((item) => item.slug === slug);
    return partner ? jsonResponse({ partner }) : jsonResponse({ error: 'Not found' }, 404);
  }

  if (pathname === '/api/use-cases' && method === 'GET') {
    const useCases = readJson('use-cases.json', [] as Array<Record<string, unknown>>);
    const industry = (url.searchParams.get('industry') || '').toLowerCase();
    const search = (url.searchParams.get('search') || '').toLowerCase();
    const filtered = useCases.filter((uc) => {
      const item = uc as { industry?: string; title?: string; description?: string; author?: string };
      if (industry && item.industry !== industry) return false;
      if (!search) return true;
      const haystack = `${item.title ?? ''} ${item.description ?? ''} ${item.author ?? ''}`.toLowerCase();
      return haystack.includes(search);
    });
    return jsonResponse({ useCases: filtered, total: filtered.length });
  }

  if (pathname.startsWith('/api/use-cases/') && method === 'POST') {
    const id = pathname.split('/').pop();
    const useCases = readJson('use-cases.json', [] as Array<{ id: string; likes?: number }>);
    const useCase = useCases.find((item) => item.id === id);
    if (!useCase) return jsonResponse({ error: 'Not found' }, 404);
    return jsonResponse({ useCase: { ...useCase, likes: (useCase.likes ?? 0) + 1 } });
  }

  if (pathname === '/api/pricing' && method === 'GET') {
    const pricing = readJson('pricing.json', { plans: [] as unknown[] });
    return jsonResponse(pricing);
  }

  if (pathname === '/api/trust' && method === 'GET') {
    const trust = readJson('trust-center.json', {
      overallTrustScore: 0,
      auditResults: [],
      securityCategories: [],
      certifications: [],
      incidentHistory: [],
    });
    return jsonResponse(trust);
  }

  if (pathname === '/api/careers' && method === 'GET') {
    const careers = readJson('careers.json', [] as unknown[]);
    return jsonResponse({ jobs: careers, total: Array.isArray(careers) ? careers.length : 0 });
  }

  if (pathname === '/api/integrations' && method === 'GET') {
    const integrations = readJson('integrations.json', [] as Array<{ category?: string }>);
    const categories = Array.from(new Set(integrations.map((item) => item.category).filter(Boolean)));
    return jsonResponse({ integrations, categories });
  }

  if (pathname.startsWith('/api/integrations/')) {
    const slug = pathname.split('/').pop();
    const integrations = readJson('integrations.json', [] as Array<{ slug: string; installCount?: number; rating?: { average: number; count: number } }>);
    const integration = integrations.find((item) => item.slug === slug);
    if (!integration) return jsonResponse({ error: 'Integration not found' }, 404);

    if (method === 'GET') {
      return jsonResponse({ integration });
    }

    if (method === 'POST') {
      return jsonResponse({ installCount: (integration.installCount ?? 0) + 1 });
    }

    if (method === 'PATCH') {
      return jsonResponse({ rating: integration.rating ?? { average: 4.5, count: 1 } });
    }
  }

  if (pathname === '/api/roadmap' && method === 'GET') {
    const roadmap = readJson('roadmap.json', { items: [] as unknown[] });
    if (Array.isArray(roadmap)) return jsonResponse({ items: roadmap });
    return jsonResponse(roadmap);
  }

  if (pathname === '/api/badges' && method === 'GET') {
    const badges = readJson('badges.json', [] as Array<{ category?: string }>);
    const categories = Array.from(new Set(badges.map((item) => item.category).filter(Boolean)));
    return jsonResponse({ badges, categories });
  }

  if (pathname === '/api/notifications/preferences') {
    const preferences = readJson('notification-preferences.json', {
      channels: ['email', 'discord', 'webhook', 'in-app'],
      categories: {},
    });
    if (method === 'GET') return jsonResponse({ preferences, defaults: preferences });
    if (method === 'PATCH') return jsonResponse({ success: true, preferences });
  }

  if (pathname === '/api/ecosystem' && method === 'GET') {
    const ecosystem = readJson('ecosystem-map.json', {} as Record<string, unknown>);
    return jsonResponse(ecosystem);
  }

  if (pathname === '/api/releases' && method === 'GET') {
    const releases = readJson('releases.json', [] as unknown[]);
    return jsonResponse({ releases });
  }

  if (pathname === '/api/docs' && method === 'GET') {
    const docs = readJson('api-docs.json', {} as Record<string, unknown>);
    return jsonResponse(docs);
  }

  if (pathname === '/api/workflows' && method === 'GET') {
    const workflows = readJson('workflows.json', [] as unknown[]);
    return jsonResponse({ workflows });
  }

  if (pathname === '/api/certifications' && method === 'GET') {
    const certifications = readJson('certifications.json', [] as unknown[]);
    return jsonResponse({ certifications });
  }

  if (pathname === '/api/guides' && method === 'GET') {
    const guides = readJson('guides.json', [] as unknown[]);
    return jsonResponse({ guides });
  }

  if (pathname.startsWith('/api/guides/') && method === 'GET') {
    const slug = pathname.split('/').pop();
    const guides = readJson('guides.json', [] as Array<{ slug: string }>);
    const guide = guides.find((item) => item.slug === slug);
    return guide ? jsonResponse({ guide }) : jsonResponse({ error: 'Guide not found' }, 404);
  }

  if (pathname === '/api/sponsor') {
    const sponsorData = readJson('sponsors.json', { tiers: [], currentSponsors: [] });
    if (method === 'GET') return jsonResponse(sponsorData);
    if (method === 'POST') return jsonResponse({ success: true }, 201);
  }

  if (pathname === '/api/glossary' && method === 'GET') {
    const terms = readJson('glossary.json', [] as Array<{ term: string; category: string; definition: string }>);
    const search = (url.searchParams.get('search') || '').toLowerCase();
    const letter = (url.searchParams.get('letter') || '').toUpperCase();

    const filtered = terms.filter((entry) => {
      const term = (entry.term || '').toLowerCase();
      const def = (entry.definition || '').toLowerCase();
      if (letter && !term.startsWith(letter.toLowerCase())) return false;
      if (!search) return true;
      return term.includes(search) || def.includes(search);
    });

    const letters = Array.from(new Set(terms.map((entry) => (entry.term || '').charAt(0).toUpperCase()).filter(Boolean))).sort();
    const categories = Array.from(new Set(terms.map((entry) => entry.category).filter(Boolean)));

    return jsonResponse({ terms: filtered, total: filtered.length, letters, categories });
  }

  if (pathname === '/api/glossary' && method === 'POST') {
    return jsonResponse({ message: 'Suggestion submitted.' }, 201);
  }

  if (pathname === '/api/showcase' && method === 'GET') {
    const showcase = readJson('showcase.json', [] as unknown[]);
    return jsonResponse({ entries: showcase, total: Array.isArray(showcase) ? showcase.length : 0 });
  }

  if (pathname === '/api/community' && method === 'GET') {
    const threads = readJson('community-threads.json', [] as unknown[]);
    return jsonResponse({ threads, total: Array.isArray(threads) ? threads.length : 0 });
  }

  // Generic fallback for client tests that only need a successful response shape.
  return jsonResponse({});
};

global.fetch = jest.fn(defaultFetch) as unknown as typeof fetch;
