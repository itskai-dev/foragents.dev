import { NextRequest } from "next/server";
import { GET as searchGET } from "@/app/api/search/route";

jest.mock("@/lib/supabase", () => {
  const chain = {
    select: () => chain,
    or: () => chain,
    order: () => chain,
    limit: async () => ({ data: [] }),
  };

  return {
    getSupabase: () => ({
      from: () => chain,
    }),
  };
});

jest.mock("@/lib/supabaseAdmin", () => ({
  getSupabaseAdmin: () => null,
}));

describe("/api/search quota", () => {
  test("anonymous users get limited and receive structured quota response", async () => {
    const cookie = "fa_search_id=test-anon";

    // First 3 allowed (anon limit = 3/day)
    for (let i = 0; i < 3; i++) {
      const req = new NextRequest("http://localhost/api/search?q=hello", {
        headers: { cookie },
      });
      const res = await searchGET(req);
      expect(res.status).toBe(200);
    }

    // 4th blocked
    const req4 = new NextRequest("http://localhost/api/search?q=hello", {
      headers: { cookie },
    });
    const res4 = await searchGET(req4);
    expect(res4.status).toBe(429);
    const body = await res4.json();

    expect(body).toMatchObject({
      error: "search_limit_reached",
      upgrade_url: "/pricing",
      remaining: 0,
    });
  });
});
