import { NextRequest } from "next/server";

jest.mock("@/lib/supabase", () => ({
  getSupabase: jest.fn(() => null),
}));

import { __resetRateLimitsForTests } from "@/lib/requestLimits";
import { POST as approvePOST } from "@/app/api/submissions/[id]/approve/route";

describe("/api/submissions/[id]/approve", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    __resetRateLimitsForTests();
    process.env.ADMIN_SECRET = "test_admin_secret";
  });

  test("rejects overly large payloads", async () => {
    const bigSlug = "a".repeat(10_000);

    const req = new NextRequest("http://localhost/api/submissions/abc/approve", {
      method: "POST",
      headers: {
        "x-forwarded-for": "1.2.3.4",
        Authorization: "Bearer test_admin_secret",
      },
      body: JSON.stringify({ directory_slug: bigSlug }),
    });

    const res = await approvePOST(req, { params: Promise.resolve({ id: "abc" }) });
    expect(res.status).toBe(413);
  });
});
