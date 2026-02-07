import { NextRequest } from "next/server";

jest.mock("@/lib/supabase", () => ({
  getSupabase: jest.fn(() => null),
}));

async function loadRoutes() {
  jest.resetModules();
  const ratingsMod = await import("@/app/api/artifacts/[id]/ratings/route");
  const summaryMod = await import("@/app/api/artifacts/[id]/ratings/summary/route");
  return {
    POST: ratingsMod.POST as typeof ratingsMod.POST,
    SUMMARY_GET: summaryMod.GET as typeof summaryMod.GET,
  };
}

describe("/api/artifacts/[id]/ratings", () => {
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
    const p = path.join(process.cwd(), "data", "artifact_ratings.json");
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, "[]");
  });

  test("POST upserts rating (file fallback)", async () => {
    const { POST, SUMMARY_GET } = await loadRoutes();

    const md1 = "---\nartifact_id: art_1\nscore: 5\ndims:\n  usefulness: 5\n---\n\nGreat.";
    const req1 = new NextRequest("http://localhost/api/artifacts/art_1/ratings", {
      method: "POST",
      body: md1,
      headers: { "Content-Type": "text/markdown", Authorization: "Bearer testkey" },
    });
    const res1 = await POST(req1, { params: Promise.resolve({ id: "art_1" }) });
    expect([200, 201]).toContain(res1.status);

    const md2 = "---\nartifact_id: art_1\nscore: 3\ndims:\n  usefulness: 2\n---\n\nUpdating.";
    const req2 = new NextRequest("http://localhost/api/artifacts/art_1/ratings", {
      method: "POST",
      body: md2,
      headers: { "Content-Type": "text/markdown", Authorization: "Bearer testkey" },
    });
    const res2 = await POST(req2, { params: Promise.resolve({ id: "art_1" }) });
    expect([200, 201]).toContain(res2.status);

    const sumReq = new NextRequest("http://localhost/api/artifacts/art_1/ratings/summary");
    const sumRes = await SUMMARY_GET(sumReq, { params: Promise.resolve({ id: "art_1" }) });
    expect(sumRes.status).toBe(200);
    const json = await sumRes.json();
    expect(json.artifact_id).toBe("art_1");
    expect(json.count).toBeGreaterThanOrEqual(1);
    expect(json.avg).toBeCloseTo(3, 5);
    expect(json.dims_avg.usefulness).toBeCloseTo(2, 5);
  });

  test("POST validates score", async () => {
    const { POST } = await loadRoutes();

    const md = "---\nartifact_id: art_1\nscore: 10\n---\n\n";
    const req = new NextRequest("http://localhost/api/artifacts/art_1/ratings", {
      method: "POST",
      body: md,
      headers: { "Content-Type": "text/markdown", Authorization: "Bearer testkey" },
    });

    const res = await POST(req, { params: Promise.resolve({ id: "art_1" }) });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Validation failed");
  });
});
