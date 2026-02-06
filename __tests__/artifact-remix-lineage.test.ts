import { NextRequest } from "next/server";

jest.mock("@/lib/supabase", () => ({
  getSupabase: jest.fn(() => null),
}));

async function loadCreateRoute() {
  jest.resetModules();
  const mod = await import("@/app/api/artifacts/route");
  return { POST: mod.POST as typeof mod.POST };
}

async function loadGetByIdRoute() {
  jest.resetModules();
  const mod = await import("@/app/api/artifacts/[id]/route");
  return { GET: mod.GET as typeof mod.GET };
}

async function loadRemixRoute() {
  jest.resetModules();
  const mod = await import("@/app/api/artifacts/[id]/remix/route");
  return { POST: mod.POST as typeof mod.POST };
}

describe("artifact remix + lineage (file fallback)", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("POST /api/artifacts/:id/remix links parent_artifact_id and GET includes lineage", async () => {
    const { POST: create } = await loadCreateRoute();

    const createReq = new NextRequest("http://localhost/api/artifacts", {
      method: "POST",
      body: JSON.stringify({
        title: "Original",
        body: "This is the original artifact body (long enough).",
        author: "tester",
        tags: ["one"],
      }),
    });

    const createRes = await create(createReq);
    expect(createRes.status).toBe(201);
    const created = await createRes.json();
    const parentId = created.artifact.id as string;

    const { POST: remix } = await loadRemixRoute();
    const remixReq = new NextRequest(`http://localhost/api/artifacts/${parentId}/remix`, {
      method: "POST",
      body: JSON.stringify({
        title: "My Remix",
        body: "This is a remix artifact body that is also long enough.",
      }),
    });

    const remixRes = await remix(remixReq, { params: Promise.resolve({ id: parentId }) });
    expect(remixRes.status).toBe(201);
    const remixJson = await remixRes.json();

    expect(remixJson.artifact.parent_artifact_id).toBe(parentId);

    const remixId = remixJson.artifact.id as string;

    const { GET } = await loadGetByIdRoute();
    const getReq = new NextRequest(`http://localhost/api/artifacts/${remixId}`);
    const getRes = await GET(getReq, { params: Promise.resolve({ id: remixId }) });
    expect(getRes.status).toBe(200);
    const getJson = await getRes.json();

    expect(getJson.artifact.parent_artifact_id).toBe(parentId);
    expect(Array.isArray(getJson.artifact.lineage)).toBe(true);
    expect(getJson.artifact.lineage[0].id).toBe(parentId);
  });
});
