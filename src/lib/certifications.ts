export type CertificationLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type CertificationModule = {
  name: string;
  description: string;
};

export type Certification = {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: CertificationLevel;
  modules: CertificationModule[];
  requirements: string[];
  enrollmentCount: number;
  badge: string;
};

export type CertificationsApiResponse = {
  certifications: Certification[];
  total: number;
};

export function formatCertificationLevel(level: CertificationLevel): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}
