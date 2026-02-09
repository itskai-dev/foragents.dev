"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Download,
  Upload,
  Code2,
  Workflow,
  Play,
  Zap,
  GitBranch,
  Filter,
  Activity,
  FileOutput,
} from "lucide-react";
import workflowTemplates from "@/data/workflow-templates.json";

// Types
type StepType = "trigger" | "transform" | "condition" | "action" | "output";

type WorkflowStep = {
  id: string;
  name: string;
  type: StepType;
  description: string;
  config: Record<string, unknown>;
};

type Workflow = {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
};

// Step type configuration
const stepTypes: Record<StepType, { icon: typeof Play; color: string; description: string }> = {
  trigger: { icon: Zap, color: "text-yellow-400", description: "Initiates the workflow" },
  transform: { icon: GitBranch, color: "text-blue-400", description: "Transforms data" },
  condition: { icon: Filter, color: "text-purple-400", description: "Conditional logic" },
  action: { icon: Activity, color: "text-green-400", description: "Performs an action" },
  output: { icon: FileOutput, color: "text-cyan-400", description: "Outputs results" },
};

export default function WorkflowBuilderPage() {
  const [workflow, setWorkflow] = useState<Workflow>(() => ({
    id: `workflow-${crypto.randomUUID()}`,
    name: "New Workflow",
    description: "Describe your workflow",
    category: "Custom",
    steps: [],
  }));
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [previewTab, setPreviewTab] = useState("yaml");

  // Load template
  const loadTemplate = (template: Workflow) => {
    setWorkflow({
      ...template,
      id: `workflow-${crypto.randomUUID()}`,
    });
    setShowTemplateDialog(false);
    setSelectedStepIndex(null);
  };

  // Add new step
  const addStep = (type: StepType) => {
    const newStep: WorkflowStep = {
      id: `step-${crypto.randomUUID()}`,
      name: `New ${type} step`,
      type,
      description: "",
      config: {},
    };
    setWorkflow({
      ...workflow,
      steps: [...workflow.steps, newStep],
    });
    setSelectedStepIndex(workflow.steps.length);
  };

  // Remove step
  const removeStep = (index: number) => {
    const newSteps = workflow.steps.filter((_, i) => i !== index);
    setWorkflow({ ...workflow, steps: newSteps });
    if (selectedStepIndex === index) {
      setSelectedStepIndex(null);
    } else if (selectedStepIndex !== null && selectedStepIndex > index) {
      setSelectedStepIndex(selectedStepIndex - 1);
    }
  };

  // Move step
  const moveStep = (index: number, direction: "up" | "down") => {
    const newSteps = [...workflow.steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;

    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setWorkflow({ ...workflow, steps: newSteps });
    setSelectedStepIndex(targetIndex);
  };

  // Update step
  const updateStep = (index: number, updates: Partial<WorkflowStep>) => {
    const newSteps = [...workflow.steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setWorkflow({ ...workflow, steps: newSteps });
  };

  // Generate YAML
  const generateYAML = () => {
    const yaml = `# ${workflow.name}
# ${workflow.description}

name: ${workflow.name}
category: ${workflow.category}
description: ${workflow.description}

steps:
${workflow.steps
  .map(
    (step) => `  - id: ${step.id}
    name: ${step.name}
    type: ${step.type}
    description: ${step.description}
    config:
${Object.entries(step.config)
  .map(([key, value]) => `      ${key}: ${typeof value === "string" ? `"${value}"` : value}`)
  .join("\n")}`,
  )
  .join("\n")}
`;
    return yaml;
  };

  // Generate JSON
  const generateJSON = () => {
    return JSON.stringify(workflow, null, 2);
  };

  // Export
  const exportWorkflow = (format: "yaml" | "json") => {
    const content = format === "yaml" ? generateYAML() : generateJSON();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflow.name.toLowerCase().replace(/\s+/g, "-")}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedStep = selectedStepIndex !== null ? workflow.steps[selectedStepIndex] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* Header */}
      <div className="border-b border-white/10 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Workflow className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">{workflow.name}</h1>
                <p className="text-sm text-muted-foreground">{workflow.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Load Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Workflow Templates</DialogTitle>
                    <DialogDescription>
                      Choose a pre-built workflow template to get started quickly
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 mt-4">
                    {workflowTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className="cursor-pointer hover:border-purple-500/50 transition-colors"
                        onClick={() => loadTemplate(template as Workflow)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{template.name}</CardTitle>
                              <CardDescription>{template.description}</CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                              {template.category}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Workflow className="w-4 h-4" />
                            <span>{template.steps.length} steps</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={() => exportWorkflow("yaml")}>
                <Download className="w-4 h-4 mr-2" />
                Export YAML
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportWorkflow("json")}>
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Workflow Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Workflow Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Workflow Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="workflow-name">Name</Label>
                  <Input
                    id="workflow-name"
                    value={workflow.name}
                    onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                    placeholder="Enter workflow name"
                  />
                </div>
                <div>
                  <Label htmlFor="workflow-description">Description</Label>
                  <Textarea
                    id="workflow-description"
                    value={workflow.description}
                    onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
                    placeholder="Describe what this workflow does"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="workflow-category">Category</Label>
                  <Input
                    id="workflow-category"
                    value={workflow.category}
                    onChange={(e) => setWorkflow({ ...workflow, category: e.target.value })}
                    placeholder="e.g., Data, DevOps, Marketing"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Step Builder */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Workflow Steps</CardTitle>
                  <div className="flex gap-2">
                    {(Object.keys(stepTypes) as StepType[]).map((type) => {
                      const StepIcon = stepTypes[type].icon;
                      return (
                        <Button
                          key={type}
                          size="sm"
                          variant="outline"
                          onClick={() => addStep(type)}
                          className="h-8"
                          title={`Add ${type} step`}
                        >
                          <StepIcon className={`w-4 h-4 ${stepTypes[type].color}`} />
                        </Button>
                      );
                    })}
                  </div>
                </div>
                <CardDescription>Build your workflow by adding and configuring steps</CardDescription>
              </CardHeader>
              <CardContent>
                {workflow.steps.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Workflow className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No steps yet. Add your first step to begin.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workflow.steps.map((step, index) => {
                      const StepIcon = stepTypes[step.type].icon;
                      const isSelected = selectedStepIndex === index;
                      return (
                        <div key={step.id}>
                          <Card
                            className={`cursor-pointer transition-all ${
                              isSelected
                                ? "border-purple-500 bg-purple-500/5"
                                : "border-white/10 hover:border-white/20"
                            }`}
                            onClick={() => setSelectedStepIndex(index)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="flex flex-col items-center gap-1">
                                    <StepIcon className={`w-5 h-5 ${stepTypes[step.type].color}`} />
                                    <span className="text-xs text-muted-foreground">{index + 1}</span>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium text-white">{step.name}</h4>
                                      <Badge variant="outline" className="text-xs">
                                        {step.type}
                                      </Badge>
                                    </div>
                                    {step.description && (
                                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveStep(index, "up");
                                    }}
                                    disabled={index === 0}
                                    className="h-8 w-8 p-0"
                                  >
                                    <ArrowUp className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveStep(index, "down");
                                    }}
                                    disabled={index === workflow.steps.length - 1}
                                    className="h-8 w-8 p-0"
                                  >
                                    <ArrowDown className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeStep(index);
                                    }}
                                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          {index < workflow.steps.length - 1 && (
                            <div className="flex justify-center py-2">
                              <div className="w-px h-4 bg-white/20" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Step Config & Preview */}
          <div className="space-y-6">
            {/* Step Configuration */}
            {selectedStep && selectedStepIndex !== null && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {(() => {
                      const StepIcon = stepTypes[selectedStep.type].icon;
                      return <StepIcon className={`w-5 h-5 ${stepTypes[selectedStep.type].color}`} />;
                    })()}
                    Step Configuration
                  </CardTitle>
                  <CardDescription>{stepTypes[selectedStep.type].description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="step-name">Name</Label>
                    <Input
                      id="step-name"
                      value={selectedStep.name}
                      onChange={(e) => updateStep(selectedStepIndex, { name: e.target.value })}
                      placeholder="Step name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="step-type">Type</Label>
                    <Select
                      value={selectedStep.type}
                      onValueChange={(value: StepType) => updateStep(selectedStepIndex, { type: value })}
                    >
                      <SelectTrigger id="step-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(stepTypes) as StepType[]).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="step-description">Description</Label>
                    <Textarea
                      id="step-description"
                      value={selectedStep.description}
                      onChange={(e) => updateStep(selectedStepIndex, { description: e.target.value })}
                      placeholder="Describe what this step does"
                      rows={3}
                    />
                  </div>
                  <Separator />
                  <div>
                    <Label htmlFor="step-config">Configuration (JSON)</Label>
                    <Textarea
                      id="step-config"
                      value={JSON.stringify(selectedStep.config, null, 2)}
                      onChange={(e) => {
                        try {
                          const config = JSON.parse(e.target.value);
                          updateStep(selectedStepIndex, { config });
                        } catch {
                          // Invalid JSON, don't update
                        }
                      }}
                      placeholder='{"key": "value"}'
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preview Panel */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-cyan-400" />
                  <CardTitle>Preview</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={previewTab} onValueChange={setPreviewTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="yaml">YAML</TabsTrigger>
                    <TabsTrigger value="json">JSON</TabsTrigger>
                  </TabsList>
                  <TabsContent value="yaml" className="mt-4">
                    <pre className="bg-black/20 rounded-lg p-4 text-xs overflow-x-auto border border-white/10">
                      <code className="text-white/80">{generateYAML()}</code>
                    </pre>
                  </TabsContent>
                  <TabsContent value="json" className="mt-4">
                    <pre className="bg-black/20 rounded-lg p-4 text-xs overflow-x-auto border border-white/10">
                      <code className="text-white/80">{generateJSON()}</code>
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
