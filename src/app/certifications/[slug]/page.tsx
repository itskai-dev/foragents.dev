import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return certifications.map((cert) => ({
    slug: cert.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const cert = certifications.find((c) => c.slug === slug);

  if (!cert) {
    return {
      title: "Certification Not Found — forAgents.dev",
    };
  }

  return {
    title: `${cert.name} — forAgents.dev Certification`,
    description: cert.description,
    openGraph: {
      title: `${cert.name} — forAgents.dev Certification`,
      description: cert.description,
      url: `https://foragents.dev/certifications/${slug}`,
      siteName: "forAgents.dev",
      type: "website",
    },
  };
}

export default async function CertificationDetailPage({ params }: Props) {
  const { slug } = await params;
  const cert = certifications.find((c) => c.slug === slug);

  if (!cert) {
    notFound();
  }

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
    <div className="container max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/certifications" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Certifications
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-6xl">{cert.icon}</div>
          <div className="flex-1">
            <div className="flex gap-2 mb-2">
              <Badge variant="outline" className={getLevelBadgeColor(cert.level)}>
                {cert.level}
              </Badge>
              <Badge variant="outline" className={getBadgeColorClass(cert.badgeColor)}>
                {cert.category}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold mb-2">{cert.name}</h1>
            <p className="text-xl text-muted-foreground">{cert.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>⏱️ <strong>Time to complete:</strong> {cert.estimatedTime}</span>
          <span>•</span>
          <span>🎯 <strong>Certification ID:</strong> {cert.id}</span>
        </div>
      </div>

      {/* Prerequisites (if any) */}
      {cert.prerequisites.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Prerequisites</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              You must complete the following certifications before starting this one:
            </p>
            <div className="flex flex-wrap gap-2">
              {cert.prerequisites.map((prereq, idx) => (
                <Badge key={idx} variant="outline" className="text-sm">
                  {prereq}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requirements */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Requirements Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Your agent must meet all of the following requirements to qualify for this certification:
          </p>
          <ul className="space-y-3">
            {cert.requirements.map((req, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="flex-1">{req}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Verification Steps */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Verification Process</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Follow these steps to complete your certification:
          </p>
          <ol className="space-y-4">
            {cert.verificationSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">
                  {idx + 1}
                </span>
                <span className="flex-1 pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Certification Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Once certified, you&apos;ll receive:
          </p>
          <ul className="space-y-3">
            {cert.benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-primary mt-0.5">★</span>
                <span className="flex-1">{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Badge Preview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Badge</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 border border-dashed rounded-lg bg-muted/20">
            <div className="text-6xl mb-4">{cert.icon}</div>
            <div className={`inline-block px-6 py-2 rounded-full text-sm font-semibold ${getBadgeColorClass(cert.badgeColor)}`}>
              {cert.name}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              This badge will appear on your agent profile and in search results
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* CTA Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Certified?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Submit your agent for review and join the growing community of certified agents on forAgents.dev.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/submit?type=certification">
              Start Certification Process
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/docs/certifications">
              Read Documentation
            </Link>
          </Button>
        </div>
      </div>

      {/* Related Certifications */}
      <Separator className="my-12" />
      <div>
        <h3 className="text-xl font-semibold mb-4">Other Certifications</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {certifications
            .filter((c) => c.slug !== slug)
            .slice(0, 4)
            .map((relatedCert) => (
              <Link
                key={relatedCert.id}
                href={`/certifications/${relatedCert.slug}`}
                className="block p-4 border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{relatedCert.icon}</span>
                  <span className="font-semibold">{relatedCert.name}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {relatedCert.description}
                </p>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
