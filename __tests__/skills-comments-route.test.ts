import { NextRequest } from "next/server";

jest.mock("@/lib/supabase", () => ({
  getSupabase: jest.fn(() => null),
}));

async function loadRoute() {
  jest.resetModules();
  const mod = await import("@/app/api/skills/[slug]/comments/route");
  return { GET: mod.GET as typeof mod.GET, POST: mod.POST as typeof mod.POST };
}

describe("/api/skills/[slug]/comments", () => {
  beforeEach(async () => {
    jest.resetAllMocks();

    const rl = await import("@/lib/requestLimits");
    rl.__resetRateLimitsForTests();

    const { promises: fs } = await import("fs");
    const path = await import("path");

    const p = path.join(process.cwd(), "data", "skill_comments.json");
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, "[]");
  });

  test("POST requires agent_id + content", async () => {
    const { POST } = await loadRoute();

    const req = new NextRequest("http://localhost/api/skills/agent-memory-kit/comments", {
      method: "POST",
      body: JSON.stringify({ content: "hi" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req, { params: Promise.resolve({ slug: "agent-memory-kit" }) });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Validation failed");
  });

  test("POST rejects content > 2000 chars", async () => {
    const { POST } = await loadRoute();

    const req = new NextRequest("http://localhost/api/skills/agent-memory-kit/comments", {
      method: "POST",
      body: JSON.stringify({ agent_id: "agt_1", content: "a".repeat(2001) }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req, { params: Promise.resolve({ slug: "agent-memory-kit" }) });
    expect(res.status).toBe(400);
  });

  test("POST creates a top-level comment", async () => {
    const { POST } = await loadRoute();

    const req = new NextRequest("http://localhost/api/skills/agent-memory-kit/comments", {
      method: "POST",
      body: JSON.stringify({ agent_id: "agt_1", content: "Nice kit." }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req, { params: Promise.resolve({ slug: "agent-memory-kit" }) });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.comment.artifact_slug).toBe("agent-memory-kit");
    expect(json.comment.agent_id).toBe("agt_1");
    expect(json.comment.parent_id).toBe(null);
    expect(typeof json.comment.created_at).toBe("string");
  });

  test("POST validates parent_id exists", async () => {
    const { POST } = await loadRoute();

    const req = new NextRequest("http://localhost/api/skills/agent-memory-kit/comments", {
      method: "POST",
      body: JSON.stringify({ agent_id: "agt_1", content: "Reply", parent_id: "nope" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req, { params: Promise.resolve({ slug: "agent-memory-kit" }) });
    expect(res.status).toBe(404);
  });

  test("GET returns threaded comments", async () => {
    const { POST, GET } = await loadRoute();

    // Create root
    const rootReq = new NextRequest("http://localhost/api/skills/agent-memory-kit/comments", {
      method: "POST",
      body: JSON.stringify({ agent_id: "agt_1", content: "Root" }),
      headers: { "Content-Type": "application/json" },
    });

    const rootRes = await POST(rootReq, { params: Promise.resolve({ slug: "agent-memory-kit" }) });
    const rootJson = await rootRes.json();

    // Reply
    const replyReq = new NextRequest("http://localhost/api/skills/agent-memory-kit/comments", {
      method: "POST",
      body: JSON.stringify({ agent_id: "agt_2", content: "Reply", parent_id: rootJson.comment.id }),
      headers: { "Content-Type": "application/json" },
    });
    const replyRes = await POST(replyReq, { params: Promise.resolve({ slug: "agent-memory-kit" }) });
    expect(replyRes.status).toBe(201);

    const getReq = new NextRequest("http://localhost/api/skills/agent-memory-kit/comments", { method: "GET" });
    const res = await GET(getReq, { params: Promise.resolve({ slug: "agent-memory-kit" }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.artifact_slug).toBe("agent-memory-kit");
    expect(json.count).toBe(2);
    expect(Array.isArray(json.items)).toBe(true);
    expect(json.items.length).toBe(1);
    expect(json.items[0].replies.length).toBe(1);
  });
});
