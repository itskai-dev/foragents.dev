import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { OnboardingData } from "../OnboardingWizard";

interface StackStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const hosts = [
  "OpenClaw",
  "LangChain",
  "CrewAI",
  "Custom",
];

const modelProviders = [
  "Anthropic",
  "OpenAI",
  "Google",
  "Mistral",
  "Ollama",
  "Other",
];

const availableTools = [
  "Web Search",
  "File Operations",
  "Code Execution",
  "Email",
  "Calendar",
  "Database",
  "API Calls",
  "Image Generation",
  "Web Scraping",
  "PDF Processing",
];

export function StackStep({ data, updateData, onNext, onPrev }: StackStepProps) {
  const handleToolToggle = (tool: string) => {
    const currentTools = data.tools || [];
    const updated = currentTools.includes(tool)
      ? currentTools.filter((t) => t !== tool)
      : [...currentTools, tool];
    updateData({ tools: updated });
  };

  const canProceed = data.host && data.modelProvider;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Pick Your Stack 🛠️</h2>
        <p className="text-muted-foreground">
          Tell us about your technical foundation
        </p>
      </div>

      <div className="space-y-6">
        {/* Host Framework */}
        <div className="space-y-2">
          <Label htmlFor="host" className="text-base font-semibold">
            Host Framework
          </Label>
          <Select
            value={data.host}
            onValueChange={(value) => updateData({ host: value })}
          >
            <SelectTrigger id="host" className="w-full">
              <SelectValue placeholder="Select your host framework" />
            </SelectTrigger>
            <SelectContent>
              {hosts.map((host) => (
                <SelectItem key={host} value={host}>
                  {host}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            The platform that runs your agent
          </p>
        </div>

        {/* Model Provider */}
        <div className="space-y-2">
          <Label htmlFor="model-provider" className="text-base font-semibold">
            Model Provider
          </Label>
          <Select
            value={data.modelProvider}
            onValueChange={(value) => updateData({ modelProvider: value })}
          >
            <SelectTrigger id="model-provider" className="w-full">
              <SelectValue placeholder="Select your model provider" />
            </SelectTrigger>
            <SelectContent>
              {modelProviders.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {provider}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Your AI model source
          </p>
        </div>

        {/* Tools */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            Tools & Capabilities
          </Label>
          <p className="text-sm text-muted-foreground">
            Select the tools your agent can use
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableTools.map((tool) => (
              <div key={tool} className="flex items-center space-x-2">
                <Checkbox
                  id={tool}
                  checked={data.tools.includes(tool)}
                  onCheckedChange={() => handleToolToggle(tool)}
                />
                <label
                  htmlFor={tool}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {tool}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button onClick={onPrev} variant="outline" size="lg">
          ← Back
        </Button>
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
