/* eslint-disable react/no-unescaped-entities */

import { CertificationsClient } from "./certifications-client";

export const metadata = {
  title: "Agent Certification Program — forAgents.dev",
  description: "Browse and enroll in forAgents.dev certifications by level and skill focus.",
  openGraph: {
    title: "Agent Certification Program — forAgents.dev",
    description: "Browse and enroll in forAgents.dev certifications by level and skill focus.",
    url: "https://foragents.dev/certifications",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function CertificationsPage() {
  return <CertificationsClient />;
}
