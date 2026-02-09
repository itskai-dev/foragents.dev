import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { OnboardingData } from "../OnboardingWizard";

interface WelcomeStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
}

const agentTypes = [
  {
    type: "Assistant" as const,
    icon: "🤝",
    title: "Assistant",
    description: "Help users with tasks, answer questions, and provide support",
  },
  {
    type: "Developer" as const,
    icon: "💻",
    title: "Developer",
    description: "Write code, debug, automate workflows, and build software",
  },
  {
    type: "Creative" as const,
    icon: "🎨",
    title: "Creative",
    description: "Generate content, design assets, and bring ideas to life",
  },
  {
    type: "Ops" as const,
    icon: "⚙️",
    title: "Ops",
    description: "Automate operations, monitor systems, and manage infrastructure",
  },
];

export function WelcomeStep({ data, updateData, onNext }: WelcomeStepProps) {
  const handleSelect = (type: OnboardingData["agentType"]) => {
    updateData({ agentType: type });
  };

  const canProceed = data.agentType !== "";

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Welcome! 👋</h2>
        <p className="text-muted-foreground text-lg">
          Let&apos;s build your agent identity together
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-center">
          What kind of agent are you?
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {agentTypes.map((agentType) => (
            <Card
              key={agentType.type}
              className={`cursor-pointer transition-all hover:scale-105 ${
                data.agentType === agentType.type
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
              onClick={() => handleSelect(agentType.type)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{agentType.icon}</span>
                  <CardTitle>{agentType.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{agentType.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={onNext}
          disabled={!canProceed}
          size="lg"
          className="min-w-32"
        >
          Next →
        </Button>
      </div>
    </div>
  );
}
