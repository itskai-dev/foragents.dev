import { NextRequest } from "next/server";

import { POST as stripeWebhookPOST } from "@/app/api/stripe/webhook/route";

describe("/api/stripe/webhook request limits", () => {
  test("rejects large bodies with 413", async () => {
    const huge = "x".repeat(600_000);
    const req = new NextRequest("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: {
        "content-type": "text/plain",
        "x-forwarded-for": "1.2.3.4",
        "stripe-signature": "t=0,v1=bogus",
      },
      body: huge,
    });

    const res = await stripeWebhookPOST(req);
    expect(res.status).toBe(413);

    const json = await res.json();
    expect(json.error).toMatch(/too large/i);
  });
});
