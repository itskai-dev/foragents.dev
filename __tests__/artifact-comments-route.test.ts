import { NextRequest } from "next/server";

jest.mock("@/lib/supabase", () => ({
  getSupabase: jest.fn(() => null),
}));

async function loadRoute() {
  jest.resetModules();
  const mod = await import("@/app/api/artifacts/[id]/comments/route");
  return { GET: mod.GET as typeof mod.GET, POST: mod.POST as typeof mod.POST };
}

describe("/api/artifacts/[id]/comments", () => {
  beforeEach(async () => {
    jest.resetAllMocks();
    process.env.FORAGENTS_API_KEYS_JSON = JSON.stringify({
      testkey: { agent_id: "agt_test", handle: "@test@local", display_name: "Test" },
    });
    const rl = await import("@/lib/requestLimits");
    rl.__resetRateLimitsForTests();

    // Ensure file-backed store is clean per test.
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const p = path.join(process.cwd(), "data", "artifact_comments.json");
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, "[]");
  });

  test("POST requires auth", async () => {
    const { POST } = await loadRoute();
    const req = new NextRequest("http://localhost/api/artifacts/art_1/comments", {
      method: "POST",
      body: "---\nartifact_id: art_1\nkind: review\n---\n\nHello",
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });

    const res = await POST(req, { params: Promise.resolve({ id: "art_1" }) });
    expect(res.status).toBe(401);
  });

  test("POST validates frontmatter + body", async () => {
    const { POST } = await loadRoute();
    const req = new NextRequest("http://localhost/api/artifacts/art_1/comments", {
      method: "POST",
      body: "---\nartifact_id: art_2\nkind: nope\n---\n\n",
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        Authorization: "Bearer testkey",
      },
    });

    const res = await POST(req, { params: Promise.resolve({ id: "art_1" }) });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Validation failed");
    expect(Array.isArray(json.details)).toBe(true);
  });

  test("POST creates comment (file fallback)", async () => {
    const { POST } = await loadRoute();

    const md = "---\nartifact_id: art_1\nkind: review\nparent_id: null\n---\n\nNice work.";

    const req = new NextRequest("http://localhost/api/artifacts/art_1/comments", {
      method: "POST",
      body: md,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        Authorization: "Bearer testkey",
      },
    });

    const res = await POST(req, { params: Promise.resolve({ id: "art_1" }) });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.comment.artifact_id).toBe("art_1");
    expect(json.comment.author.agent_id).toBe("agt_test");
    expect(typeof json.comment.created_at).toBe("string");
  });

  test("POST returns 413 when request body is too large", async () => {
    const { POST } = await loadRoute();

    const huge = "a".repeat(30_000);
    const req = new NextRequest("http://localhost/api/artifacts/art_1/comments", {
      method: "POST",
      body: huge,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        Authorization: "Bearer testkey",
        "x-forwarded-for": "203.0.113.10",
      },
    });

    const res = await POST(req, { params: Promise.resolve({ id: "art_1" }) });
    expect(res.status).toBe(413);
  });

  test("GET returns list shape", async () => {
    const { GET } = await loadRoute();
    const req = new NextRequest("http://localhost/api/artifacts/art_1/comments?limit=2&order=asc");
    const res = await GET(req, { params: Promise.resolve({ id: "art_1" }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.artifact_id).toBe("art_1");
    expect(Array.isArray(json.items)).toBe(true);
    expect("next_cursor" in json).toBe(true);
  });
});
