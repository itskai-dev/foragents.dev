import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import type { ComplianceCheck, ComplianceFramework, ComplianceHubData } from "@/lib/complianceHub";

export const runtime = "nodejs";

const COMPLIANCE_DATA_PATH = path.join(process.cwd(), "data", "compliance-hub.json");

function isValidFramework(framework: ComplianceFramework): boolean {
  return (
    typeof framework.id === "string" &&
    typeof framework.name === "string" &&
    ["compliant", "partial", "non-compliant"].includes(framework.status) &&
    typeof framework.score === "number" &&
    framework.score >= 0 &&
    framework.score <= 100 &&
    typeof framework.lastAudit === "string" &&
    Array.isArray(framework.requirements) &&
    framework.requirements.every(
      (requirement) =>
        typeof requirement.id === "string" &&
        typeof requirement.title === "string" &&
        typeof requirement.description === "string" &&
        typeof requirement.pass === "boolean" &&
        typeof requirement.category === "string"
    )
  );
}

async function readComplianceData(): Promise<ComplianceHubData | null> {
  try {
    const raw = await fs.readFile(COMPLIANCE_DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw) as ComplianceHubData;

    if (
      typeof parsed?.overallComplianceScore !== "number" ||
      parsed.overallComplianceScore < 0 ||
      parsed.overallComplianceScore > 100 ||
      !Array.isArray(parsed.frameworks) ||
      !parsed.frameworks.every(isValidFramework)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function filterFrameworks(frameworks: ComplianceFramework[], category: string | null): ComplianceFramework[] {
  if (!category || category === "all") {
    return frameworks;
  }

  return frameworks.filter((framework) => {
    const normalizedId = framework.id.toLowerCase();
    const normalizedName = framework.name.toLowerCase();

    if (normalizedId === category || normalizedName === category) {
      return true;
    }

    return framework.requirements.some(
      (requirement) => requirement.category.toLowerCase() === category
    );
  });
}

function flattenChecks(frameworks: ComplianceFramework[]): ComplianceCheck[] {
  return frameworks.flatMap((framework) =>
    framework.requirements.map((requirement) => ({
      ...requirement,
      frameworkId: framework.id,
      frameworkName: framework.name,
    }))
  );
}

export async function GET(request: Request) {
  const data = await readComplianceData();

  if (!data) {
    return NextResponse.json(
      {
        error: "Compliance hub data unavailable",
      },
      {
        status: 500,
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category")?.trim().toLowerCase() ?? null;
  const frameworks = filterFrameworks(data.frameworks, category);
  const checks = flattenChecks(frameworks);

  return NextResponse.json(
    {
      overallComplianceScore: data.overallComplianceScore,
      frameworks,
      checks,
      summary: {
        totalFrameworks: frameworks.length,
        totalChecks: checks.length,
        passingChecks: checks.filter((check) => check.pass).length,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
