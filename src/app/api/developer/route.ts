import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

type ResourceType = "sdk" | "library" | "example" | "tutorial" | "tool";

interface DeveloperResource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  description: string;
  language: string;
  stars: number;
  updatedAt: string;
}

const VALID_TYPES: ResourceType[] = ["sdk", "library", "example", "tutorial", "tool"];
const DATA_FILE = path.join(process.cwd(), "data", "developer-resources.json");

const readResources = async (): Promise<DeveloperResource[]> => {
  const file = await fs.readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(file) as DeveloperResource[];
  return Array.isArray(parsed) ? parsed : [];
};

const writeResources = async (resources: DeveloperResource[]) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(resources, null, 2), "utf8");
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get("type")?.toLowerCase();
    const searchParam = searchParams.get("search")?.toLowerCase().trim();

    const resources = await readResources();

    const filtered = resources.filter((resource) => {
      const matchesType = !typeParam || typeParam === "all" || resource.type === typeParam;

      const matchesSearch =
        !searchParam ||
        resource.title.toLowerCase().includes(searchParam) ||
        resource.description.toLowerCase().includes(searchParam) ||
        resource.language.toLowerCase().includes(searchParam);

      return matchesType && matchesSearch;
    });

    return NextResponse.json({ resources: filtered });
  } catch (error) {
    console.error("Failed to load developer resources", error);
    return NextResponse.json(
      { error: "Failed to load developer resources" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<DeveloperResource>;

    const title = body.title?.trim();
    const url = body.url?.trim();
    const type = body.type;
    const description = body.description?.trim();

    if (!title || !url || !type || !description) {
      return NextResponse.json(
        { error: "title, url, type, and description are required" },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "url must be a valid URL" }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "url must start with http:// or https://" }, { status: 400 });
    }

    const resources = await readResources();

    const newResource: DeveloperResource = {
      id: crypto.randomUUID(),
      title,
      url,
      type,
      description,
      language: "Unknown",
      stars: 0,
      updatedAt: new Date().toISOString(),
    };

    resources.unshift(newResource);
    await writeResources(resources);

    return NextResponse.json({ resource: newResource }, { status: 201 });
  } catch (error) {
    console.error("Failed to create developer resource", error);
    return NextResponse.json(
      { error: "Failed to create developer resource" },
      { status: 500 }
    );
  }
}
