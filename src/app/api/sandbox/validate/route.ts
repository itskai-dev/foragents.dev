import { NextRequest, NextResponse } from "next/server";

type ValidationResponse = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
};

const REQUIRED_FIELDS = ["name", "description", "version", "capabilities"] as const;
const OPTIONAL_FIELDS = ["identity", "endpoints", "protocols", "trust"] as const;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function validateAgentJson(agentJson: string): ValidationResponse {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isNonEmptyString(agentJson)) {
    return {
      valid: false,
      errors: ["agentJson is required and must be a non-empty JSON string."],
      warnings,
      score: 0,
    };
  }

  let parsed: Record<string, unknown>;
  try {
    const json = JSON.parse(agentJson) as unknown;
    if (!json || typeof json !== "object" || Array.isArray(json)) {
      return {
        valid: false,
        errors: ["agentJson must parse to a JSON object."],
        warnings,
        score: 0,
      };
    }
    parsed = json as Record<string, unknown>;
  } catch (error) {
    return {
      valid: false,
      errors: [
        `Invalid JSON: ${error instanceof Error ? error.message : "Unable to parse provided JSON."}`,
      ],
      warnings,
      score: 0,
    };
  }

  let score = 0;

  for (const field of REQUIRED_FIELDS) {
    const value = parsed[field];

    if (value === undefined) {
      errors.push(`Missing required field: ${field}`);
      continue;
    }

    if (field === "capabilities") {
      if (!Array.isArray(value) || value.length === 0) {
        errors.push("Field 'capabilities' must be a non-empty array.");
        continue;
      }

      const invalidCapability = value.find((capability) => !isNonEmptyString(capability));
      if (invalidCapability !== undefined) {
        errors.push("Field 'capabilities' must contain non-empty strings only.");
        continue;
      }

      score += 15;
      continue;
    }

    if (!isNonEmptyString(value)) {
      errors.push(`Field '${field}' must be a non-empty string.`);
      continue;
    }

    if (field === "version") {
      const semverPattern = /^\d+\.\d+\.\d+([-.][0-9A-Za-z.-]+)?$/;
      if (!semverPattern.test(value)) {
        warnings.push("Field 'version' should follow semver format (e.g. 1.0.0).");
      }
    }

    score += 15;
  }

  for (const field of OPTIONAL_FIELDS) {
    const value = parsed[field];

    if (value === undefined) {
      warnings.push(`Optional field '${field}' is missing.`);
      continue;
    }

    if (!value || typeof value !== "object" || Array.isArray(value)) {
      warnings.push(`Optional field '${field}' should be an object.`);
      continue;
    }

    if (field === "endpoints") {
      const endpointEntries = Object.entries(value as Record<string, unknown>);
      if (endpointEntries.length === 0) {
        warnings.push("Optional field 'endpoints' is present but empty.");
      }

      const invalidEndpoint = endpointEntries.find(([, endpoint]) => !isNonEmptyString(endpoint));
      if (invalidEndpoint) {
        warnings.push("Optional field 'endpoints' should contain URL strings as values.");
      }
    }

    score += 10;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: clampScore(score),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { agentJson?: unknown };

    if (typeof body?.agentJson !== "string") {
      return NextResponse.json(
        {
          valid: false,
          errors: ["Request body must include { agentJson: string }."],
          warnings: [],
          score: 0,
        } satisfies ValidationResponse,
        { status: 400 },
      );
    }

    const result = validateAgentJson(body.agentJson);
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        valid: false,
        errors: ["Invalid request body. Expected JSON payload with { agentJson: string }."],
        warnings: [],
        score: 0,
      } satisfies ValidationResponse,
      { status: 400 },
    );
  }
}
