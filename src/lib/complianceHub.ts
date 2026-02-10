export type ComplianceStatus = "compliant" | "partial" | "non-compliant";

export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  pass: boolean;
  category: string;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  status: ComplianceStatus;
  score: number;
  lastAudit: string;
  requirements: ComplianceRequirement[];
}

export interface ComplianceHubData {
  overallComplianceScore: number;
  frameworks: ComplianceFramework[];
}

export interface ComplianceCheck extends ComplianceRequirement {
  frameworkId: string;
  frameworkName: string;
}
