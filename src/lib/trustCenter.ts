export type ComplianceStatus = "passed" | "in-progress";
export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentStatus = "resolved" | "investigating";

export interface SecurityCategoryScore {
  id: "data-protection" | "authentication" | "encryption" | "access-control" | "monitoring";
  label: string;
  score: number;
}

export interface AuditFindings {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface AuditResults {
  overallStatus: "passed" | "in-progress";
  lastAudit: string;
  nextAudit: string;
  findings: AuditFindings;
}

export interface CertificationItem {
  name: string;
  status: ComplianceStatus;
  lastAudit: string;
}

export interface IncidentItem {
  date: string;
  severity: IncidentSeverity;
  description: string;
  status: IncidentStatus;
}

export interface TrustCenterData {
  overallTrustScore: number;
  securityCategories: SecurityCategoryScore[];
  auditResults: AuditResults;
  certifications: CertificationItem[];
  incidentHistory: IncidentItem[];
}
