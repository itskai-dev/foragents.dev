import { NextRequest } from "next/server";

jest.mock("@/lib/supabase", () => ({
  getSupabase: jest.fn(() => null),
}));

async function loadRoutes() {
  jest.resetModules();
  const mod = await import("@/app/api/artifacts/route");
  return { GET: mod.GET as typeof mod.GET, POST: mod.POST as typeof mod.POST };
}

describe("/api/artifacts", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("GET returns a list shape", async () => {
    const { GET } = await loadRoutes();
    const req = new NextRequest("http://localhost/api/artifacts?limit=5");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(typeof body.count).toBe("number");
  });

  test("POST validates input", async () => {
    const { POST } = await loadRoutes();

    const req = new NextRequest("http://localhost/api/artifacts", {
      method: "POST",
      body: JSON.stringify({ title: "x", body: "short" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Validation failed");
  });

  test("POST creates artifact", async () => {
    const { POST } = await loadRoutes();

    const req = new NextRequest("http://localhost/api/artifacts", {
      method: "POST",
      body: JSON.stringify({
        title: "Hello Artifact",
        body: "This is a test artifact body that is long enough.",
        author: "test",
        tags: ["Test", "MVP"],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.artifact.id).toMatch(/^art_/);
    expect(json.artifact.title).toBe("Hello Artifact");
  });
});
