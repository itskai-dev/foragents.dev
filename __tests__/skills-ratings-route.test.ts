import { NextRequest } from "next/server";

jest.mock("@/lib/supabase", () => ({
  getSupabase: jest.fn(() => null),
}));

async function loadRoute() {
  jest.resetModules();
  const mod = await import("@/app/api/skills/[slug]/ratings/route");
  return { GET: mod.GET as typeof mod.GET, POST: mod.POST as typeof mod.POST };
}

describe("/api/skills/[slug]/ratings", () => {
  beforeEach(async () => {
    jest.resetAllMocks();

    const rl = await import("@/lib/requestLimits");
    rl.__resetRateLimitsForTests();

    const { promises: fs } = await import("fs");
    const path = await import("path");

    const p = path.join(process.cwd(), "data", "skill_ratings.json");
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, "[]");
  });

  test("POST validates rating", async () => {
    const { POST } = await loadRoute();

    const req = new NextRequest("http://localhost/api/skills/agent-memory-kit/ratings", {
      method: "POST",
      body: JSON.stringify({ agent_id: "agt_1", rating: 6 }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req, { params: Promise.resolve({ slug: "agent-memory-kit" }) });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Validation failed");
  });

  test("POST upserts and GET returns avg + count", async () => {
    const { POST, GET } = await loadRoute();

    const r1 = new NextRequest("http://localhost/api/skills/agent-memory-kit/ratings", {
      method: "POST",
      body: JSON.stringify({ agent_id: "agt_1", rating: 5 }),
      headers: { "Content-Type": "application/json" },
    });

    const res1 = await POST(r1, { params: Promise.resolve({ slug: "agent-memory-kit" }) });
    expect(res1.status).toBe(200);

    const r2 = new NextRequest("http://localhost/api/skills/agent-memory-kit/ratings", {
      method: "POST",
      body: JSON.stringify({ agent_id: "agt_1", rating: 3 }),
      headers: { "Content-Type": "application/json" },
    });

    const res2 = await POST(r2, { params: Promise.resolve({ slug: "agent-memory-kit" }) });
    expect(res2.status).toBe(200);

    const r3 = new NextRequest("http://localhost/api/skills/agent-memory-kit/ratings", {
      method: "POST",
      body: JSON.stringify({ agent_id: "agt_2", rating: 4 }),
      headers: { "Content-Type": "application/json" },
    });

    const res3 = await POST(r3, { params: Promise.resolve({ slug: "agent-memory-kit" }) });
    expect(res3.status).toBe(200);

    const getReq = new NextRequest("http://localhost/api/skills/agent-memory-kit/ratings", { method: "GET" });
    const getRes = await GET(getReq, { params: Promise.resolve({ slug: "agent-memory-kit" }) });
    expect(getRes.status).toBe(200);
    const json = await getRes.json();
    expect(json.artifact_slug).toBe("agent-memory-kit");
    expect(json.count).toBe(2);
    expect(json.avg).toBeCloseTo(3.5);
  });
});
