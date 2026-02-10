import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import type {
  AccessibilityApiResponse,
  AccessibilityAuditCheck,
  AccessibilityAuditData,
  AccessibilityCheckStatus,
  AccessibilityComplianceStatus,
} from "@/lib/accessibility";

export const runtime = "nodejs";

const ACCESSIBILITY_DATA_PATH = path.join(process.cwd(), "data", "accessibility.json");
const VALID_STATUSES: AccessibilityCheckStatus[] = ["pass", "warning", "fail"];

function isValidCheck(check: AccessibilityAuditCheck): boolean {
  return (
    typeof check.name === "string" &&
    VALID_STATUSES.includes(check.status) &&
    typeof check.description === "string" &&
    typeof check.recommendation === "string"
  );
}

function isValidAuditData(data: AccessibilityAuditData): boolean {
  return (
    typeof data.overallScore === "number" &&
    data.overallScore >= 0 &&
    data.overallScore <= 100 &&
    ["AA", "AAA"].includes(data.wcagLevelTarget) &&
    Array.isArray(data.auditChecks) &&
    data.auditChecks.length === 8 &&
    data.auditChecks.every(isValidCheck)
  );
}

function getComplianceStatus(data: AccessibilityAuditData): AccessibilityComplianceStatus {
  const failCount = data.auditChecks.filter((check) => check.status === "fail").length;

  if (data.overallScore >= 90 && failCount === 0) {
    return "compliant";
  }

  if (data.overallScore >= 75 && failCount <= 2) {
    return "partial";
  }

  return "non-compliant";
}

function buildResponse(data: AccessibilityAuditData): AccessibilityApiResponse {
  const pass = data.auditChecks.filter((check) => check.status === "pass").length;
  const warning = data.auditChecks.filter((check) => check.status === "warning").length;
  const fail = data.auditChecks.filter((check) => check.status === "fail").length;

  return {
    ...data,
    complianceStatus: getComplianceStatus(data),
    summary: {
      pass,
      warning,
      fail,
      totalChecks: data.auditChecks.length,
    },
  };
}

async function readAccessibilityData(): Promise<AccessibilityAuditData | null> {
  try {
    const raw = await fs.readFile(ACCESSIBILITY_DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw) as AccessibilityAuditData;

    if (!isValidAuditData(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function GET() {
  const data = await readAccessibilityData();

  if (!data) {
    return NextResponse.json(
      {
        error: "Accessibility audit data unavailable",
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json(buildResponse(data), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
