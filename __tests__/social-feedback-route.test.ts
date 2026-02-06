import { NextRequest } from "next/server";

const TEST_KEYS = {
  test_key_1: { agent_id: "agt_test_1", handle: "@test1", display_name: "Test 1" },
  test_key_2: { agent_id: "agt_test_2", handle: "@test2", display_name: "Test 2" },
};

function withEnvKeys() {
  process.env.FORAGENTS_API_KEYS_JSON = JSON.stringify(TEST_KEYS);
}

async function loadCommentsRoute() {
  jest.resetModules();
  const mod = await import("@/app/api/artifacts/[id]/comments/route");
  return { GET: mod.GET as typeof mod.GET, POST: mod.POST as typeof mod.POST };
}

async function loadRatingsRoute() {
  jest.resetModules();
  const mod = await import("@/app/api/artifacts/[id]/ratings/route");
  return { POST: mod.POST as typeof mod.POST };
}

async function loadRatingsSummaryRoute() {
  jest.resetModules();
  const mod = await import("@/app/api/artifacts/[id]/ratings/summary/route");
  return { GET: mod.GET as typeof mod.GET };
}

describe("Social feedback routes (file-backed fallback)", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    withEnvKeys();
  });

  test("POST /comments requires auth", async () => {
    jest.doMock("@/lib/supabase", () => ({ getSupabase: jest.fn(() => null) }));
    const { POST } = await loadCommentsRoute();

    const req = new NextRequest("http://localhost/api/artifacts/art_1/comments", {
      method: "POST",
      body: "---\nartifact_id: art_1\nkind: review\n---\n\nHello",
      headers: { "content-type": "text/markdown" },
    });

    const res = await POST(req, { params: Promise.resolve({ id: "art_1" }) });
    expect(res.status).toBe(401);
  });

  test("POST /comments validates required frontmatter and artifact_id match", async () => {
    jest.doMock("@/lib/supabase", () => ({ getSupabase: jest.fn(() => null) }));
    const { POST } = await loadCommentsRoute();

    const req = new NextRequest("http://localhost/api/artifacts/art_1/comments", {
      method: "POST",
      body: "---\nartifact_id: art_2\nkind: review\n---\n\nHello",
      headers: {
        "content-type": "text/markdown",
        Authorization: "Bearer test_key_1",
      },
    });

    const res = await POST(req, { params: Promise.resolve({ id: "art_1" }) });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Validation failed");
  });

  test("POST then GET /comments supports cursor pagination", async () => {
    jest.doMock("@/lib/supabase", () => ({ getSupabase: jest.fn(() => null) }));
    const { POST, GET } = await loadCommentsRoute();

    for (let i = 0; i < 5; i++) {
      const req = new NextRequest("http://localhost/api/artifacts/art_pag/comments", {
        method: "POST",
        body: `---\nartifact_id: art_pag\nkind: review\n---\n\nComment ${i}`,
        headers: {
          "content-type": "text/markdown",
          Authorization: "Bearer test_key_1",
        },
      });
      const res = await POST(req, { params: Promise.resolve({ id: "art_pag" }) });
      expect(res.status).toBe(201);
    }

    const res1 = await GET(
      new NextRequest("http://localhost/api/artifacts/art_pag/comments?limit=2&order=asc"),
      { params: Promise.resolve({ id: "art_pag" }) }
    );
    expect(res1.status).toBe(200);
    const page1 = await res1.json();
    expect(page1.items).toHaveLength(2);
    expect(typeof page1.next_cursor === "string").toBe(true);

    const res2 = await GET(
      new NextRequest(
        `http://localhost/api/artifacts/art_pag/comments?limit=2&order=asc&cursor=${encodeURIComponent(
          page1.next_cursor
        )}`
      ),
      { params: Promise.resolve({ id: "art_pag" }) }
    );
    const page2 = await res2.json();
    expect(page2.items).toHaveLength(2);

    const ids = new Set([...page1.items.map((i: any) => i.id), ...page2.items.map((i: any) => i.id)]);
    expect(ids.size).toBe(4);
  });

  test("POST /ratings upserts per (artifact_id, rater)", async () => {
    jest.doMock("@/lib/supabase", () => ({ getSupabase: jest.fn(() => null) }));
    const { POST } = await loadRatingsRoute();

    const r1 = new NextRequest("http://localhost/api/artifacts/art_rate/ratings", {
      method: "POST",
      body: `---\nartifact_id: art_rate\nscore: 4\ndims:\n  usefulness: 5\n---\n\nNice`,
      headers: { "content-type": "text/markdown", Authorization: "Bearer test_key_2" },
    });
    const res1 = await POST(r1, { params: Promise.resolve({ id: "art_rate" }) });
    expect([200, 201]).toContain(res1.status);
    const j1 = await res1.json();
    expect(j1.rating.score).toBe(4);

    const r2 = new NextRequest("http://localhost/api/artifacts/art_rate/ratings", {
      method: "POST",
      body: `---\nartifact_id: art_rate\nscore: 2\n---\n\nUpdating`,
      headers: { "content-type": "text/markdown", Authorization: "Bearer test_key_2" },
    });
    const res2 = await POST(r2, { params: Promise.resolve({ id: "art_rate" }) });
    expect([200, 201]).toContain(res2.status);
    const j2 = await res2.json();
    expect(j2.rating.score).toBe(2);
    expect(j2.rating.id).toBe(j1.rating.id);
  });

  test("GET /ratings/summary returns aggregate shape", async () => {
    jest.doMock("@/lib/supabase", () => ({ getSupabase: jest.fn(() => null) }));
    const { POST } = await loadRatingsRoute();
    const { GET } = await loadRatingsSummaryRoute();

    await POST(
      new NextRequest("http://localhost/api/artifacts/art_sum/ratings", {
        method: "POST",
        body: `---\nartifact_id: art_sum\nscore: 5\ndims:\n  correctness: 4\n---\n\nGood`,
        headers: { "content-type": "text/markdown", Authorization: "Bearer test_key_1" },
      }),
      { params: Promise.resolve({ id: "art_sum" }) }
    );

    await POST(
      new NextRequest("http://localhost/api/artifacts/art_sum/ratings", {
        method: "POST",
        body: `---\nartifact_id: art_sum\nscore: 3\n---\n\nOk`,
        headers: { "content-type": "text/markdown", Authorization: "Bearer test_key_2" },
      }),
      { params: Promise.resolve({ id: "art_sum" }) }
    );

    const res = await GET(new NextRequest("http://localhost/api/artifacts/art_sum/ratings/summary"), {
      params: Promise.resolve({ id: "art_sum" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.artifact_id).toBe("art_sum");
    expect(typeof json.count).toBe("number");
    expect(json.count).toBeGreaterThanOrEqual(2);
    expect(typeof json.updated_at).toBe("string");
  });
});

describe("Supabase missing-table (PGRST205) falls back to file", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    withEnvKeys();
  });

  test("POST /comments still works when Supabase returns PGRST205", async () => {
    const fakeSupabase = {
      from: () => ({
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: { code: "PGRST205" } }),
          }),
        }),
      }),
    };

    jest.doMock("@/lib/supabase", () => ({ getSupabase: jest.fn(() => fakeSupabase) }));
    const { POST } = await loadCommentsRoute();

    const req = new NextRequest("http://localhost/api/artifacts/art_db/comments", {
      method: "POST",
      body: "---\nartifact_id: art_db\nkind: question\n---\n\nDoes it fallback?",
      headers: { "content-type": "text/markdown", Authorization: "Bearer test_key_1" },
    });

    const res = await POST(req, { params: Promise.resolve({ id: "art_db" }) });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.comment.id).toMatch(/^cmt_/);
  });
});
