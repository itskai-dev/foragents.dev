import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AUDIT_DATA_PATH = path.join(process.cwd(), "data", "compliance-audits.json");
const FRAMEWORKS = ["GDPR", "SOC2", "HIPAA", "ISO27001"] as const;
const STATUSES = ["pass", "fail", "partial", "na"] as const;

type AuditFramework = (typeof FRAMEWORKS)[number];
type AuditStatus = (typeof STATUSES)[number];

interface ComplianceAudit {
  id: string;
  framework: AuditFramework;
  controlId: string;
  controlName: string;
  status: AuditStatus;
  evidence: string;
  auditor: string;
  auditDate: string;
  nextReviewDate: string;
  notes: string;
}

interface FrameworkScore {
  framework: AuditFramework;
  score: number;
  passed: number;
  partial: number;
  failed: number;
  notApplicable: number;
  totalApplicable: number;
}

function isAuditFramework(value: unknown): value is AuditFramework {
  return typeof value === "string" && FRAMEWORKS.includes(value as AuditFramework);
}

function isAuditStatus(value: unknown): value is AuditStatus {
  return typeof value === "string" && STATUSES.includes(value as AuditStatus);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidDateString(value: unknown): value is string {
  if (!isNonEmptyString(value)) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}

function isComplianceAudit(value: unknown): value is ComplianceAudit {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Record<string, unknown>;

  return (
    isNonEmptyString(entry.id) &&
    isAuditFramework(entry.framework) &&
    isNonEmptyString(entry.controlId) &&
    isNonEmptyString(entry.controlName) &&
    isAuditStatus(entry.status) &&
    isNonEmptyString(entry.evidence) &&
    isNonEmptyString(entry.auditor) &&
    isValidDateString(entry.auditDate) &&
    isValidDateString(entry.nextReviewDate) &&
    isNonEmptyString(entry.notes)
  );
}

async function readAuditData(): Promise<ComplianceAudit[]> {
  const raw = await fs.readFile(AUDIT_DATA_PATH, "utf-8");
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed) || !parsed.every(isComplianceAudit)) {
    throw new Error("Invalid compliance audit dataset");
  }

  return parsed;
}

async function writeAuditData(audits: ComplianceAudit[]): Promise<void> {
  await fs.writeFile(AUDIT_DATA_PATH, JSON.stringify(audits, null, 2));
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function nextAuditId(audits: ComplianceAudit[]): string {
  const maxId = audits.reduce((max, audit) => {
    const parts = audit.id.match(/audit-(\d+)/i);
    if (!parts) {
      return max;
    }

    const value = Number(parts[1]);
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);

  return `audit-${String(maxId + 1).padStart(3, "0")}`;
}

function calculateScores(audits: ComplianceAudit[]): FrameworkScore[] {
  return FRAMEWORKS.map((framework) => {
    const frameworkAudits = audits.filter((audit) => audit.framework === framework);

    const passed = frameworkAudits.filter((audit) => audit.status === "pass").length;
    const partial = frameworkAudits.filter((audit) => audit.status === "partial").length;
    const failed = frameworkAudits.filter((audit) => audit.status === "fail").length;
    const notApplicable = frameworkAudits.filter((audit) => audit.status === "na").length;

    const totalApplicable = passed + partial + failed;
    const weightedPass = passed + partial * 0.5;
    const score = totalApplicable > 0 ? Math.round((weightedPass / totalApplicable) * 100) : 0;

    return {
      framework,
      score,
      passed,
      partial,
      failed,
      notApplicable,
      totalApplicable,
    };
  });
}

function matchesSearch(audit: ComplianceAudit, searchTerm: string): boolean {
  if (!searchTerm) {
    return true;
  }

  const haystack = [
    audit.id,
    audit.framework,
    audit.controlId,
    audit.controlName,
    audit.evidence,
    audit.auditor,
    audit.notes,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(searchTerm);
}

export async function GET(request: NextRequest) {
  try {
    const allAudits = await readAuditData();
    const frameworkParam = request.nextUrl.searchParams.get("framework")?.trim().toUpperCase();
    const statusParam = request.nextUrl.searchParams.get("status")?.trim().toLowerCase();
    const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase() ?? "";

    const filtered = allAudits.filter((audit) => {
      const frameworkMatch = frameworkParam ? audit.framework === frameworkParam : true;
      const statusMatch = statusParam ? audit.status === statusParam : true;
      const searchMatch = matchesSearch(audit, search);
      return frameworkMatch && statusMatch && searchMatch;
    });

    return NextResponse.json(
      {
        audits: filtered,
        total: filtered.length,
        frameworkScores: calculateScores(filtered),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Unable to read compliance audits" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const framework = typeof body.framework === "string" ? body.framework.toUpperCase() : "";
    const status = typeof body.status === "string" ? body.status.toLowerCase() : "";

    const auditDateInput = isNonEmptyString(body.auditDate) ? new Date(body.auditDate) : new Date();
    const nextReviewInput = isNonEmptyString(body.nextReviewDate)
      ? new Date(body.nextReviewDate)
      : new Date(auditDateInput.getTime() + 180 * 24 * 60 * 60 * 1000);

    const validationErrors: string[] = [];

    if (!isAuditFramework(framework)) validationErrors.push("framework must be GDPR, SOC2, HIPAA, or ISO27001");
    if (!isAuditStatus(status)) validationErrors.push("status must be pass, fail, partial, or na");
    if (!isNonEmptyString(body.controlId)) validationErrors.push("controlId is required");
    if (!isNonEmptyString(body.controlName)) validationErrors.push("controlName is required");
    if (!isNonEmptyString(body.evidence)) validationErrors.push("evidence is required");
    if (!isNonEmptyString(body.auditor)) validationErrors.push("auditor is required");
    if (!isNonEmptyString(body.notes)) validationErrors.push("notes is required");
    if (Number.isNaN(auditDateInput.getTime())) validationErrors.push("auditDate is invalid");
    if (Number.isNaN(nextReviewInput.getTime())) validationErrors.push("nextReviewDate is invalid");

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    const audits = await readAuditData();
    const controlId = (body.controlId as string).trim();
    const controlName = (body.controlName as string).trim();
    const evidence = (body.evidence as string).trim();
    const auditor = (body.auditor as string).trim();
    const notes = (body.notes as string).trim();

    const newAudit: ComplianceAudit = {
      id: nextAuditId(audits),
      framework: framework as AuditFramework,
      controlId,
      controlName,
      status: status as AuditStatus,
      evidence,
      auditor,
      auditDate: formatDateOnly(auditDateInput),
      nextReviewDate: formatDateOnly(nextReviewInput),
      notes,
    };

    const updatedAudits = [...audits, newAudit];
    await writeAuditData(updatedAudits);

    return NextResponse.json(
      {
        audit: newAudit,
        total: updatedAudits.length,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}
