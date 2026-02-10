import { promises as fs } from "fs";
import path from "path";

export type GovernancePillar = {
  slug: string;
  title: string;
  description: string;
  keyPrinciples: string[];
  maturity: {
    basic: string;
    intermediate: string;
    advanced: string;
  };
};

export type GovernanceReadinessItem = {
  id: string;
  label: string;
};

export type GovernanceMaturityBand = {
  range: [number, number];
  label: string;
  guidance: string;
};

export type GovernanceFrameworkData = {
  overview: {
    title: string;
    description: string;
    whyItMatters: string[];
  };
  pillars: GovernancePillar[];
  readinessChecklist: GovernanceReadinessItem[];
  maturityCriteria: {
    basic: GovernanceMaturityBand;
    intermediate: GovernanceMaturityBand;
    advanced: GovernanceMaturityBand;
  };
  accountability: {
    auditTrailRequirements: string[];
    decisionLoggingPatterns: string[];
    escalationProtocols: string[];
  };
  safety: {
    sandboxingStrategies: string[];
    rateLimitingAndCaps: string[];
    rollbackAndKillSwitch: string[];
    incidentResponseTemplate: string[];
  };
};

const GOVERNANCE_FRAMEWORK_PATH = path.join(process.cwd(), "data", "governance-framework.json");

export async function readGovernanceFramework(): Promise<GovernanceFrameworkData> {
  const raw = await fs.readFile(GOVERNANCE_FRAMEWORK_PATH, "utf-8");
  return JSON.parse(raw) as GovernanceFrameworkData;
}
