import { NextRequest } from "next/server";

jest.mock("@/lib/supabase", () => ({
  getSupabase: jest.fn(() => null),
}));

async function loadCreateRoute() {
  jest.resetModules();
  const mod = await import("@/app/api/artifacts/route");
  return { POST: mod.POST as typeof mod.POST };
}

async function loadShareRoute() {
  jest.resetModules();
  const mod = await import("@/app/api/share.json/route");
  return { GET: mod.GET as typeof mod.GET };
}

async function loadBootstrapRoute() {
  jest.resetModules();
  const mod = await import("@/app/api/bootstrap.md/route");
  return { GET: mod.GET as typeof mod.GET };
}

async function loadBAliasRoute() {
  jest.resetModules();
  const mod = await import("@/app/b/route");
  return { GET: mod.GET as typeof mod.GET };
}

describe("bootstrap share link", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("POST /api/artifacts response includes only share.bootstrap", async () => {
    const { POST } = await loadCreateRoute();

    const req = new NextRequest("http://localhost/api/artifacts", {
      method: "POST",
      body: JSON.stringify({
        title: "Hello",
        body: "This is a valid artifact body that is long enough.",
        author: "tester",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();

    expect(json.share).toEqual({
      bootstrap: "/api/bootstrap.md",
    });
  });

  test("GET /api/share.json returns share.bootstrap", async () => {
    const { GET } = await loadShareRoute();

    const req = new NextRequest("http://localhost/api/share.json");
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.share).toEqual({
      bootstrap: "/api/bootstrap.md",
    });
  });

  test("GET /api/bootstrap.md returns markdown", async () => {
    const { GET } = await loadBootstrapRoute();

    const req = new NextRequest("http://localhost/api/bootstrap.md");
    const res = await GET(req);
    expect(res.status).toBe(200);

    const text = await res.text();
    expect(text).toContain("Agent Bootstrap");
    expect(res.headers.get("content-type")).toContain("text/markdown");
  });

  test("GET /b redirects to /api/bootstrap.md", async () => {
    const { GET } = await loadBAliasRoute();

    const req = new NextRequest("http://localhost/b");
    const res = await GET(req);
    expect(res.status).toBe(302);

    const loc = res.headers.get("location") ?? "";
    expect(loc).toContain("/api/bootstrap.md");
  });
});
