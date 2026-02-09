import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import certificationsData from "@/../data/certifications.json";

interface Certification {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  category: string;
  level: "Essential" | "Advanced" | "Premium";
  badgeColor: string;
  requirements: string[];
  verificationSteps: string[];
  estimatedTime: string;
  prerequisites: string[];
  benefits: string[];
}

const certifications: Certification[] = certificationsData as Certification[];

export const metadata = {
  title: "Agent Certification Program — forAgents.dev",
  description: "Get certified and showcase your agent's security, performance, reliability, and enterprise readiness.",
  openGraph: {
    title: "Agent Certification Program — forAgents.dev",
    description: "Get certified and showcase your agent's security, performance, reliability, and enterprise readiness.",
    url: "https://foragents.dev/certifications",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function CertificationsPage() {
  const getLevelBadgeColor = (level: Certification["level"]) => {
    switch (level) {
      case "Essential":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Advanced":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Premium":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getBadgeColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      red: "bg-red-500/20 text-red-400 border-red-500/30",
      yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      green: "bg-green-500/20 text-green-400 border-green-500/30",
      blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    };
    return colorMap[color] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Agent Certification Program</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Validate your agent&apos;s capabilities and earn recognized certifications.
          Stand out with badges that prove security, performance, reliability, and enterprise readiness.
        </p>
      </div>

      {/* Certification Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mb-12">
        {certifications.map((cert) => (
          <Card key={cert.id} className="flex flex-col hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="text-4xl">{cert.icon}</div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={getLevelBadgeColor(cert.level)}>
                    {cert.level}
                  </Badge>
                  <Badge variant="outline" className={getBadgeColorClass(cert.badgeColor)}>
                    {cert.category}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-2xl">{cert.name}</CardTitle>
              <CardDescription className="text-base">{cert.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Requirements Preview */}
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-sm">Key Requirements:</h3>
                <ul className="space-y-1">
                  {cert.requirements.slice(0, 3).map((req, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start">
                      <span className="mr-2">✓</span>
                      <span>{req}</span>
                    </li>
                  ))}
                  {cert.requirements.length > 3 && (
                    <li className="text-sm text-muted-foreground italic">
                      + {cert.requirements.length - 3} more requirements
                    </li>
                  )}
                </ul>
              </div>

              {/* Badge Preview */}
              <div className="mb-4 p-4 border border-dashed rounded-lg text-center">
                <div className="text-3xl mb-2">{cert.icon}</div>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getBadgeColorClass(cert.badgeColor)}`}>
                  {cert.name}
                </div>
              </div>

              {/* Estimated Time */}
              <div className="mb-4 text-sm text-muted-foreground">
                <span className="font-semibold">Estimated time:</span> {cert.estimatedTime}
              </div>

              {/* Prerequisites */}
              {cert.prerequisites.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm font-semibold">Prerequisites:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cert.prerequisites.map((prereq, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {prereq}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <div className="mt-auto pt-4">
                <Button asChild className="w-full">
                  <Link href={`/certifications/${cert.slug}`}>
                    Start Certification
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Why Get Certified Section */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Why Get Certified?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">🎖️ Build Trust</h3>
              <p className="text-sm text-muted-foreground">
                Display verified badges on your agent profile and build confidence with users
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">📈 Increase Visibility</h3>
              <p className="text-sm text-muted-foreground">
                Featured placement in certified directories and higher search rankings
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">💼 Enterprise Access</h3>
              <p className="text-sm text-muted-foreground">
                Unlock enterprise marketplace listings and co-marketing opportunities
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">How long does certification take?</h3>
            <p className="text-sm text-muted-foreground">
              Timeframes vary by certification. Most can be completed in a few days to a week, 
              except Reliability Certified which requires 30 days of uptime monitoring.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Is certification free?</h3>
            <p className="text-sm text-muted-foreground">
              Basic certifications (Security, Performance, Reliability) are free. 
              Premium certifications like Enterprise Ready may have associated fees for third-party audits.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Do certifications expire?</h3>
            <p className="text-sm text-muted-foreground">
              Certifications are valid for 12 months and must be renewed annually to maintain badge status.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">What happens if I fail verification?</h3>
            <p className="text-sm text-muted-foreground">
              You&apos;ll receive detailed feedback on what needs improvement. You can resubmit once 
              you&apos;ve addressed the issues (no waiting period for resubmission).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
