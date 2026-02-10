export type AccessibilityCheckStatus = "pass" | "fail" | "warning";
export type WcagLevelTarget = "AA" | "AAA";

export interface AccessibilityAuditCheck {
  name: string;
  status: AccessibilityCheckStatus;
  description: string;
  recommendation: string;
}

export interface AccessibilityAuditData {
  overallScore: number;
  wcagLevelTarget: WcagLevelTarget;
  auditChecks: AccessibilityAuditCheck[];
}

export type AccessibilityComplianceStatus = "compliant" | "partial" | "non-compliant";

export interface AccessibilityApiResponse extends AccessibilityAuditData {
  complianceStatus: AccessibilityComplianceStatus;
  summary: {
    pass: number;
    warning: number;
    fail: number;
    totalChecks: number;
  };
}
