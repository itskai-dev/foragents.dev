import { NextRequest } from "next/server";
import { GET as digestJsonGET } from "@/app/api/digest.json/route";
import { GET as digestMdGET } from "@/app/api/digest.md/route";

describe("/api/digest.json + /api/digest.md", () => {
  test("digest.json returns structured digest with stable generated_at", async () => {
    const req = new NextRequest("http://localhost/api/digest.json?since=2026-01-01");
    const res = await digestJsonGET(req);

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body).toHaveProperty("generated_at");
    expect(typeof body.generated_at).toBe("string");
    expect(body.generated_at).toMatch(/T00:00:00\.000Z$/); // start-of-day UTC

    expect(body).toHaveProperty("period");
    expect(body.period).toHaveProperty("since");
    expect(body.period).toHaveProperty("until");

    expect(body).toHaveProperty("counts");
    expect(body.counts).toHaveProperty("new_artifacts");
    expect(body.counts).toHaveProperty("new_agents");

    expect(Array.isArray(body.new_artifacts)).toBe(true);
    expect(Array.isArray(body.new_agents)).toBe(true);

    expect(Array.isArray(body.repost_sections)).toBe(true);
    expect(body.repost_sections[0]).toHaveProperty("title");
    expect(body.repost_sections[0]).toHaveProperty("markdown");
  });

  test("digest.md returns markdown digest", async () => {
    const req = new NextRequest("http://localhost/api/digest.md?since=2026-01-01");
    const res = await digestMdGET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/text\/markdown/);

    const text = await res.text();
    expect(text).toMatch(/^# forAgents\.dev — Agent Digest/m);
    expect(text).toMatch(/## Repost-ready sections/m);
  });
});
