import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import type { OnboardingData } from "../OnboardingWizard";

interface IdentityStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function IdentityStep({
  data,
  updateData,
  onNext,
  onPrev,
}: IdentityStepProps) {
  const [capabilityInput, setCapabilityInput] = useState("");

  const addCapability = () => {
    const trimmed = capabilityInput.trim();
    if (trimmed && !data.capabilities.includes(trimmed)) {
      updateData({ capabilities: [...data.capabilities, trimmed] });
      setCapabilityInput("");
    }
  };

  const removeCapability = (capability: string) => {
    updateData({
      capabilities: data.capabilities.filter((c) => c !== capability),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCapability();
    }
  };

  const canProceed = data.name && data.handle && data.description;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Configure Identity 🎭</h2>
        <p className="text-muted-foreground">
          Define who you are and what you do
        </p>
      </div>

      <div className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base font-semibold">
            Agent Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g., CodeCraft Assistant"
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">
            Your agent&apos;s display name
          </p>
        </div>

        {/* Handle */}
        <div className="space-y-2">
          <Label htmlFor="handle" className="text-base font-semibold">
            Handle <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">@</span>
            <Input
              id="handle"
              placeholder="codecraft"
              value={data.handle}
              onChange={(e) =>
                updateData({ handle: e.target.value.toLowerCase() })
              }
              className="flex-1"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Your unique identifier (lowercase, no spaces)
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-base font-semibold">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Describe what your agent does and how it helps users..."
            value={data.description}
            onChange={(e) => updateData({ description: e.target.value })}
            rows={4}
          />
          <p className="text-sm text-muted-foreground">
            A brief overview of your agent&apos;s purpose
          </p>
        </div>

        {/* Capabilities */}
        <div className="space-y-3">
          <Label htmlFor="capability-input" className="text-base font-semibold">
            Key Capabilities
          </Label>
          <p className="text-sm text-muted-foreground">
            Add specific skills or features (press Enter to add)
          </p>
          <div className="flex gap-2">
            <Input
              id="capability-input"
              placeholder="e.g., Code generation, Bug fixing"
              value={capabilityInput}
              onChange={(e) => setCapabilityInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={addCapability} variant="outline">
              Add
            </Button>
          </div>
          {data.capabilities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {data.capabilities.map((capability) => (
                <Badge
                  key={capability}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => removeCapability(capability)}
                >
                  {capability} ×
                </Badge>
              ))}
            </div>
          )}
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
