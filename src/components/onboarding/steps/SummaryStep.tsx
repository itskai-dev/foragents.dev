import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import type { OnboardingData } from "../OnboardingWizard";

interface SummaryStepProps {
  data: OnboardingData;
  onPrev: () => void;
  onReset: () => void;
}

export function SummaryStep({ data, onPrev, onReset }: SummaryStepProps) {
  const generateAgentJson = () => {
    return {
      name: data.name,
      handle: data.handle,
      description: data.description,
      type: data.agentType,
      stack: {
        host: data.host,
        modelProvider: data.modelProvider,
        tools: data.tools,
      },
      capabilities: data.capabilities,
      version: "1.0.0",
      createdAt: new Date().toISOString(),
    };
  };

  const downloadAgentJson = () => {
    const agentConfig = generateAgentJson();
    const blob = new Blob([JSON.stringify(agentConfig, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.handle || "agent"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold">Ready to Go!</h2>
        <p className="text-muted-foreground">
          Your agent identity is complete
        </p>
      </div>

      {/* Summary */}
      <div className="space-y-4 bg-secondary/50 rounded-lg p-6">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-1">
            Agent Type
          </h3>
          <p className="text-lg font-medium">{data.agentType}</p>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-1">
            Identity
          </h3>
          <p className="text-lg font-medium">{data.name}</p>
          <p className="text-muted-foreground">@{data.handle}</p>
          <p className="text-sm mt-2">{data.description}</p>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-1">
            Stack
          </h3>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">Host:</span> {data.host}
            </p>
            <p className="text-sm">
              <span className="font-medium">Model:</span> {data.modelProvider}
            </p>
          </div>
        </div>

        {data.tools.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
                Tools
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.tools.map((tool) => (
                  <Badge key={tool} variant="outline">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {data.capabilities.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
                Capabilities
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.capabilities.map((capability) => (
                  <Badge key={capability} variant="secondary">
                    {capability}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-4">
        <Button
          onClick={downloadAgentJson}
          size="lg"
          className="w-full"
        >
          📥 Download agent.json
        </Button>
        
        <Link href="/skills" className="block">
          <Button variant="outline" size="lg" className="w-full">
            🔍 Browse Skills
          </Button>
        </Link>

        <div className="flex gap-2">
          <Button
            onClick={onPrev}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            ← Edit
          </Button>
          <Button
            onClick={onReset}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            🔄 Start Over
          </Button>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-6">
        <h4 className="font-semibold mb-2">🚀 Next Steps</h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Explore our skill library to add capabilities</li>
          <li>• Join the community to share and learn</li>
          <li>• Check out the docs to get started</li>
        </ul>
      </div>
    </div>
  );
}
