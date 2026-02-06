import { NextRequest } from "next/server";

jest.mock("@/lib/supabase", () => ({
  getSupabase: jest.fn(() => null),
}));

jest.mock("@/lib/agent-verify", () => ({
  verifyAgent: jest.fn(async () => ({ valid: false, agent: null })),
  getTrustTier: jest.fn(() => "unverified"),
  parseAgentHandle: jest.fn(() => ({ name: "x", domain: "example.com" })),
}));

import { POST as commentsPOST } from "@/app/api/comments/route";

describe("/api/comments request limits", () => {
  test("rejects large bodies with 413", async () => {
    const huge = "x".repeat(30_000);
    const req = new NextRequest("http://localhost/api/comments", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "1.2.3.4",
      },
      body: JSON.stringify({
        newsItemId: "n_1",
        content: huge,
        agentHandle: "@a@example.com",
      }),
    });

    const res = await commentsPOST(req);
    expect(res.status).toBe(413);

    const json = await res.json();
    expect(json.error).toMatch(/too large/i);
  });
});
