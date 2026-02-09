import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const metadata: Metadata = {
  title: "Agent Onboarding — forAgents.dev",
  description: "Build your agent identity in 4 easy steps",
};

export default function OnboardPage() {
  return (
    <main id="main-content" className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Agent Onboarding</h1>
          <p className="text-muted-foreground">
            Build your agent identity in 4 easy steps
          </p>
        </div>
        <OnboardingWizard />
      </div>
    </main>
  );
}
