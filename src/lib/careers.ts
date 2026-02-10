import { promises as fs } from "node:fs";
import path from "node:path";

export type CareerDepartment =
  | "engineering"
  | "design"
  | "community"
  | "operations"
  | "product"
  | "growth";

export type CareerType = "full-time" | "part-time" | "contract" | "bounty";
export type CareerStatus = "open" | "closed";
export type CareerLocation = "remote" | "hybrid" | "onsite";

export type CareerPosition = {
  id: string;
  title: string;
  department: CareerDepartment;
  location: CareerLocation;
  type: CareerType;
  description: string;
  requirements: string[];
  salary: string;
  status: CareerStatus;
  updatedAt: string;
  benefits?: string[];
  postedAt?: string;
};

export type CareersFile = {
  positions: CareerPosition[];
  applications?: unknown[];
  [key: string]: unknown;
};

type RawCareer = Partial<CareerPosition> & Record<string, unknown>;

export type CareerFilters = {
  department?: string | null;
  type?: string | null;
  search?: string | null;
  status?: string | null;
};

export type CreateCareerInput = {
  title: string;
  department: CareerDepartment;
  location: CareerLocation;
  type: CareerType;
  description: string;
  requirements: string[];
  salary: string;
  status?: CareerStatus;
};

const CAREERS_PATH = path.join(process.cwd(), "data", "careers.json");

function toIso(value: unknown): string {
  if (typeof value !== "string") return new Date().toISOString();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
}

function normalizeRequirements(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeCareer(raw: RawCareer): CareerPosition | null {
  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const description = typeof raw.description === "string" ? raw.description.trim() : "";
  const department = typeof raw.department === "string" ? raw.department.trim().toLowerCase() : "";
  const location = typeof raw.location === "string" ? raw.location.trim().toLowerCase() : "";
  const type = typeof raw.type === "string" ? raw.type.trim().toLowerCase() : "";
  const salary = typeof raw.salary === "string" ? raw.salary.trim() : "";
  const status = typeof raw.status === "string" ? raw.status.trim().toLowerCase() : "";

  if (!id || !title || !description || !salary) return null;
  if (
    department !== "engineering" &&
    department !== "design" &&
    department !== "community" &&
    department !== "operations" &&
    department !== "product" &&
    department !== "growth"
  ) {
    return null;
  }

  if (location !== "remote" && location !== "hybrid" && location !== "onsite") return null;
  if (type !== "full-time" && type !== "part-time" && type !== "contract" && type !== "bounty") return null;
  if (status !== "open" && status !== "closed") return null;

  const requirements = normalizeRequirements(raw.requirements);

  const normalized: CareerPosition = {
    id,
    title,
    department,
    location,
    type,
    description,
    requirements,
    salary,
    status,
    updatedAt: toIso(raw.updatedAt),
  };

  if (Array.isArray(raw.benefits)) {
    normalized.benefits = raw.benefits
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof raw.postedAt === "string" && raw.postedAt.trim()) {
    normalized.postedAt = toIso(raw.postedAt);
  }

  return normalized;
}

function makeCareerId(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);

  return `${slug || "career-role"}-${Date.now().toString(36)}`;
}

export async function readCareersFile(): Promise<CareersFile> {
  try {
    const raw = await fs.readFile(CAREERS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    const rows =
      Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === "object" && Array.isArray((parsed as { positions?: unknown }).positions)
          ? (parsed as { positions: unknown[] }).positions
          : [];

    const positions = rows
      .map((row) => normalizeCareer((row ?? {}) as RawCareer))
      .filter((row): row is CareerPosition => Boolean(row));

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const base = parsed as Record<string, unknown>;
      return {
        ...base,
        positions,
        applications: Array.isArray(base.applications) ? base.applications : [],
      };
    }

    return { positions, applications: [] };
  } catch {
    return { positions: [], applications: [] };
  }
}

export async function writeCareersFile(data: CareersFile): Promise<void> {
  const dir = path.dirname(CAREERS_PATH);
  await fs.mkdir(dir, { recursive: true });

  const tmp = `${CAREERS_PATH}.tmp`;
  await fs.writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
  await fs.rename(tmp, CAREERS_PATH);
}

export async function getCareers(filters: CareerFilters = {}): Promise<CareerPosition[]> {
  const { positions } = await readCareersFile();
  const department = filters.department?.trim().toLowerCase();
  const type = filters.type?.trim().toLowerCase();
  const search = filters.search?.trim().toLowerCase();
  const status = filters.status?.trim().toLowerCase();

  return positions.filter((job) => {
    const departmentMatch = department ? job.department === department : true;
    const typeMatch = type ? job.type === type : true;
    const statusMatch = status ? job.status === status : true;
    const searchMatch = search
      ? [job.title, job.department, job.description, job.salary, ...job.requirements].join(" ").toLowerCase().includes(search)
      : true;

    return departmentMatch && typeMatch && statusMatch && searchMatch;
  });
}

export async function createCareer(input: CreateCareerInput): Promise<CareerPosition> {
  const careers = await readCareersFile();
  const now = new Date().toISOString();

  const position: CareerPosition = {
    id: makeCareerId(input.title),
    title: input.title,
    department: input.department,
    location: input.location,
    type: input.type,
    description: input.description,
    requirements: input.requirements,
    salary: input.salary,
    status: input.status ?? "open",
    updatedAt: now,
    postedAt: now,
  };

  const next = [...careers.positions, position];
  await writeCareersFile({ ...careers, positions: next });

  return position;
}
