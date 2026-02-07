import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

jest.mock("@/lib/supabase", () => ({
  getSupabase: jest.fn(() => null),
}));

import { POST as upvotePOST } from "@/app/api/comments/[id]/upvote/route";
import { POST as flagPOST } from "@/app/api/comments/[id]/flag/route";
import { __resetRateLimitsForTests } from "@/lib/requestLimits";

const COMMENTS_PATH = path.join(process.cwd(), "data", "comments.json");

async function seedComments() {
  await fs.mkdir(path.dirname(COMMENTS_PATH), { recursive: true });
  await fs.writeFile(
    COMMENTS_PATH,
    JSON.stringify(
      [
        {
          id: "cmt_1_abc123",
          newsItemId: "n_1",
          content: "hello",
          author: "anon",
          createdAt: new Date().toISOString(),
          upvotes: 0,
          flags: 0,
        },
      ],
      null,
      2
    )
  );
}

describe("/api/comments/[id] actions request limits", () => {
  beforeEach(async () => {
    __resetRateLimitsForTests();
    await seedComments();
  });

  test("/upvote rate limits after the configured max", async () => {
    const ip = "7.7.7.7";
    let lastStatus = 0;

    for (let i = 0; i < 31; i++) {
      const req = new NextRequest("http://localhost/api/comments/cmt_1_abc123/upvote", {
        method: "POST",
        headers: {
          "x-forwarded-for": ip,
        },
        body: "", // explicit empty body
      });

      const res = await upvotePOST(req, { params: Promise.resolve({ id: "cmt_1_abc123" }) });
      lastStatus = res.status;
    }

    expect(lastStatus).toBe(429);
  });

  test("/flag rejects large bodies with 413", async () => {
    const ip = "8.8.8.8";
    const huge = "x".repeat(10_000);

    const req = new NextRequest("http://localhost/api/comments/cmt_1_abc123/flag", {
      method: "POST",
      headers: {
        "x-forwarded-for": ip,
      },
      body: huge,
    });

    const res = await flagPOST(req, { params: Promise.resolve({ id: "cmt_1_abc123" }) });
    expect(res.status).toBe(413);

    const json = await res.json();
    expect(json.error).toMatch(/too large/i);
  });
});
