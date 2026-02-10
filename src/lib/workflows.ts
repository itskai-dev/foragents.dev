export type WorkflowStep = {
  id: string;
  name: string;
  description: string;
};

export type Workflow = {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export function parseStepsFromText(text: string): WorkflowStep[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((name, index) => ({
      id: `step-${index + 1}`,
      name,
      description: "",
    }));
}

export function stepsToText(steps: WorkflowStep[]): string {
  return steps.map((step) => step.name).join("\n");
}
