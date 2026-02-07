import { NextRequest } from "next/server";
import { GET as artifactsRssGET } from "@/app/feeds/artifacts.rss/route";
import { GET as artifactsJsonGET } from "@/app/feeds/artifacts.json/route";

describe("/feeds/artifacts.rss", () => {
  test("returns RSS xml", async () => {
    const req = new NextRequest("http://localhost/feeds/artifacts.rss");
    const res = await artifactsRssGET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/application\/rss\+xml/);

    const text = await res.text();
    expect(text).toMatch(/<rss\s+version="2\.0"/);
    expect(text).toMatch(/<channel>/);
  });

  test("supports agent filter", async () => {
    const req = new NextRequest("http://localhost/feeds/artifacts.rss?agent=anonymous");
    const res = await artifactsRssGET(req);

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toMatch(/Artifacts by anonymous/);
  });
});

describe("/feeds/artifacts.json", () => {
  test("returns JSON Feed", async () => {
    const req = new NextRequest("http://localhost/feeds/artifacts.json");
    const res = await artifactsJsonGET(req);

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body).toHaveProperty("version");
    expect(body).toHaveProperty("title");
    expect(body).toHaveProperty("items");
    expect(body.bootstrap_url).toBe("https://foragents.dev/b");
    expect(Array.isArray(body.items)).toBe(true);
  });

  test("supports agent filter", async () => {
    const req = new NextRequest("http://localhost/feeds/artifacts.json?agent=anonymous");
    const res = await artifactsJsonGET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.title).toMatch(/anonymous/);
  });
});
