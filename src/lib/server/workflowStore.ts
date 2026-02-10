import "server-only";

import { promises as fs } from "fs";
import path from "path";

export type WorkflowStep = {
  id: string;
  name: string;
  description: string;
};

export type WorkflowRecord = {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

const WORKFLOWS_PATH = path.join(process.cwd(), "data", "workflows.json");

function normalizeStep(step: unknown, index: number): WorkflowStep {
  if (typeof step === "string") {
    return {
      id: `step-${index + 1}`,
      name: step.trim() || `Step ${index + 1}`,
      description: "",
    };
  }

  if (!step || typeof step !== "object") {
    return {
      id: `step-${index + 1}`,
      name: `Step ${index + 1}`,
      description: "",
    };
  }

  const maybeStep = step as Record<string, unknown>;
  const name = typeof maybeStep.name === "string" ? maybeStep.name.trim() : "";
  const description = typeof maybeStep.description === "string" ? maybeStep.description.trim() : "";
  const id = typeof maybeStep.id === "string" && maybeStep.id.trim().length > 0
    ? maybeStep.id.trim()
    : `step-${index + 1}`;

  return {
    id,
    name: name || `Step ${index + 1}`,
    description,
  };
}

export function normalizeSteps(steps: unknown): WorkflowStep[] {
  if (!Array.isArray(steps)) return [];
  return steps.map((step, index) => normalizeStep(step, index));
}

function normalizeWorkflow(item: unknown): WorkflowRecord | null {
  if (!item || typeof item !== "object") return null;

  const maybeWorkflow = item as Record<string, unknown>;
  const id = typeof maybeWorkflow.id === "string" ? maybeWorkflow.id.trim() : "";
  const name = typeof maybeWorkflow.name === "string" ? maybeWorkflow.name.trim() : "";
  const description = typeof maybeWorkflow.description === "string" ? maybeWorkflow.description.trim() : "";
  const enabled = typeof maybeWorkflow.enabled === "boolean" ? maybeWorkflow.enabled : true;

  if (!id || !name) return null;

  const now = new Date().toISOString();

  return {
    id,
    name,
    description,
    enabled,
    steps: normalizeSteps(maybeWorkflow.steps),
    createdAt: typeof maybeWorkflow.createdAt === "string" ? maybeWorkflow.createdAt : now,
    updatedAt: typeof maybeWorkflow.updatedAt === "string" ? maybeWorkflow.updatedAt : now,
  };
}

export async function readWorkflows(): Promise<WorkflowRecord[]> {
  try {
    const raw = await fs.readFile(WORKFLOWS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => normalizeWorkflow(item))
      .filter((item): item is WorkflowRecord => item !== null);
  } catch {
    return [];
  }
}

export async function writeWorkflows(workflows: WorkflowRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(WORKFLOWS_PATH), { recursive: true });
  await fs.writeFile(WORKFLOWS_PATH, `${JSON.stringify(workflows, null, 2)}\n`, "utf-8");
}
