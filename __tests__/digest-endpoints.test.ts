import { NextRequest } from "next/server";

jest.mock("@/lib/supabase", () => ({
  getSupabase: jest.fn(() => null),
}));

async function loadJsonRoute() {
  jest.resetModules();
  const mod = await import("@/app/api/digest.json/route");
  return { GET: mod.GET as typeof mod.GET };
}

async function loadMdRoute() {
  jest.resetModules();
  const mod = await import("@/app/api/digest.md/route");
  return { GET: mod.GET as typeof mod.GET };
}

describe("/api/digest.{json,md}", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("GET /api/digest.json returns expected shape + cache headers", async () => {
    const { GET } = await loadJsonRoute();
    const req = new NextRequest("http://localhost/api/digest.json?since=2026-01-01");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toMatch(/max-age=300/);

    const body = await res.json();
    expect(typeof body.generated_at).toBe("string");
    expect(body).toHaveProperty("period.since");
    expect(body).toHaveProperty("period.until");
    expect(body).toHaveProperty("counts.new_artifacts");
    expect(body).toHaveProperty("counts.new_agents");
    expect(Array.isArray(body.new_artifacts)).toBe(true);
    expect(Array.isArray(body.new_agents)).toBe(true);
    expect(body.bootstrap_url).toBe("https://foragents.dev/b");
  });

  test("GET /api/digest.md returns markdown + cache headers", async () => {
    const { GET } = await loadMdRoute();
    const req = new NextRequest("http://localhost/api/digest.md?since=2026-01-01");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/text\/markdown/);
    expect(res.headers.get("cache-control")).toMatch(/max-age=300/);

    const text = await res.text();
    expect(text).toMatch(/^# forAgents\.dev — Agent Digest/m);
    expect(text).toMatch(/generated_at:/);
    expect(text).toMatch(/## Repost-ready sections/);
  });

  test("invalid since falls back to default window", async () => {
    const { GET } = await loadJsonRoute();
    const req = new NextRequest("http://localhost/api/digest.json?since=nope");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.generated_at).toBe("string");
    expect(body).toHaveProperty("period.since");
  });
});
