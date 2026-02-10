import { NextRequest } from 'next/server';
import { GET as feedGET } from '@/app/api/feed/route';
import { GET as healthGET } from '@/app/api/health/route';
import { GET as healthFeedGET } from '@/app/api/health/feed/route';

describe('/api/feed', () => {
  test('returns JSON by default', async () => {
    const req = new NextRequest('http://localhost/api/feed');
    const res = await feedGET(req);

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body).toHaveProperty('items');
    expect(Array.isArray(body.items)).toBe(true);
    expect(body).toHaveProperty('count');
    expect(body.count).toBe(body.items.length);
    expect(body).toHaveProperty('updated_at');
  });

  test('returns markdown when requested via Accept header', async () => {
    const req = new NextRequest('http://localhost/api/feed', {
      headers: {
        accept: 'text/markdown',
      },
    });
    const res = await feedGET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/text\/markdown/);

    const text = await res.text();
    expect(text).toMatch(/^# Agent Hub — News Feed/m);
  });
});

describe('/api/health', () => {
  test('returns health metadata', async () => {
    const res = await healthGET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('skills_count');
    expect(body).toHaveProperty('mcp_count');
    expect(body).toHaveProperty('uptime');
    expect(body).toHaveProperty('timestamp');
  });
});

describe('/api/health/feed', () => {
  test('returns feed freshness metrics', async () => {
    const res = await healthFeedGET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('ok');
    expect(body).toHaveProperty('source');
    expect(body).toHaveProperty('now');
    // last_published_at may be null in totally empty environments
    expect(body).toHaveProperty('last_published_at');
  });
});
