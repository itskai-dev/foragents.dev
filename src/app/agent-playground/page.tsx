"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Beaker, 
  Play, 
  Trash2, 
  History, 
  Copy,
  Check,
  Sparkles
} from "lucide-react";

// Mock AI models
const models = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
  { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "Google" },
];

// Template prompts
const templatePrompts = [
  {
    id: "customer-support",
    name: "Customer Support Agent",
    systemPrompt: "You are a helpful customer support agent. Be friendly, professional, and solution-oriented. Always acknowledge the customer's concerns and provide clear, actionable steps.",
    userMessage: "My order hasn't arrived yet and it's been a week. What should I do?",
  },
  {
    id: "code-reviewer",
    name: "Code Reviewer",
    systemPrompt: "You are an experienced code reviewer. Analyze code for best practices, potential bugs, performance issues, and security concerns. Provide constructive feedback with specific suggestions for improvement.",
    userMessage: "Can you review this function:\n\nfunction processData(data) {\n  for (var i = 0; i < data.length; i++) {\n    console.log(data[i]);\n  }\n}",
  },
  {
    id: "creative-writer",
    name: "Creative Writer",
    systemPrompt: "You are a creative writer with a talent for storytelling. Craft engaging narratives with vivid descriptions, compelling characters, and interesting plot twists.",
    userMessage: "Write a short story about a robot who discovers emotions for the first time.",
  },
  {
    id: "data-analyst",
    name: "Data Analyst",
    systemPrompt: "You are a data analyst specializing in extracting insights from data. Provide clear, actionable insights with supporting evidence. Use structured formats when presenting findings.",
    userMessage: "Analyze this sales data and provide key insights:\n- Q1: $120k\n- Q2: $145k\n- Q3: $132k\n- Q4: $178k",
  },
  {
    id: "blank",
    name: "Blank Slate",
    systemPrompt: "",
    userMessage: "",
  },
];

// Response format types
type ResponseFormat = "text" | "json" | "markdown";

interface TestResult {
  id: string;
  timestamp: Date;
  model: string;
  systemPrompt: string;
  userMessage: string;
  temperature: number;
  format: ResponseFormat;
  response: string;
}

// Mock response generator
function generateMockResponse(
  systemPrompt: string,
  userMessage: string,
  model: string,
  temperature: number,
  format: ResponseFormat
): string {
  const responses: Record<ResponseFormat, string> = {
    text: `[Mock response from ${model}]\n\nThank you for your question! Based on your input, here's my analysis:\n\nYou mentioned: "${userMessage.slice(0, 100)}${userMessage.length > 100 ? "..." : ""}"\n\nGiven the system context about being ${systemPrompt.slice(0, 50)}..., I would recommend:\n\n1. First, consider the immediate requirements\n2. Evaluate the trade-offs involved\n3. Implement a solution that balances all constraints\n\nWith temperature set to ${temperature}, this response aims to be ${temperature < 0.3 ? "precise and deterministic" : temperature < 0.7 ? "balanced" : "creative and diverse"}.\n\nLet me know if you'd like me to elaborate on any specific aspect!`,
    
    json: JSON.stringify({
      model: model,
      temperature: temperature,
      response: {
        status: "success",
        message: "Request processed successfully",
        analysis: {
          user_intent: "Query about " + userMessage.slice(0, 30),
          system_role: systemPrompt.slice(0, 40) || "general assistant",
          confidence: 0.85,
        },
        suggestions: [
          "Consider breaking down complex tasks into smaller steps",
          "Validate assumptions before proceeding",
          "Test the solution in a controlled environment",
        ],
        metadata: {
          processing_time_ms: Math.floor(Math.random() * 500) + 100,
          tokens_used: Math.floor(Math.random() * 1000) + 200,
          timestamp: new Date().toISOString(),
        },
      },
    }, null, 2),
    
    markdown: `# Response from ${model}\n\n## Summary\n\nThank you for your question! I've analyzed your request and prepared a comprehensive response.\n\n## Your Input\n\n> ${userMessage.slice(0, 150)}${userMessage.length > 150 ? "..." : ""}\n\n## Analysis\n\n### Context\n\nBased on the system prompt: *${systemPrompt.slice(0, 80)}${systemPrompt.length > 80 ? "..." : ""}*\n\n### Recommendations\n\n1. **Primary Action**: Start with the most critical requirement\n2. **Secondary Consideration**: Account for edge cases\n3. **Validation**: Verify the solution meets all criteria\n\n## Configuration\n\n- **Model**: ${model}\n- **Temperature**: ${temperature} (${temperature < 0.3 ? "deterministic" : temperature < 0.7 ? "balanced" : "creative"})\n- **Format**: Markdown\n\n## Next Steps\n\n- [ ] Review the recommendations\n- [ ] Implement the solution\n- [ ] Test and validate\n\n---\n\n*Generated at ${new Date().toLocaleTimeString()}*`,
  };

  return responses[format];
}

export default function AgentPlaygroundPage() {
  // Input state
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("claude-3.5-sonnet");
  const [temperature, setTemperature] = useState(0.7);
  const [responseFormat, setResponseFormat] = useState<ResponseFormat>("text");
  
  // Output state
  const [currentResponse, setCurrentResponse] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [copied, setCopied] = useState(false);

  // Load template
  const loadTemplate = (templateId: string) => {
    const template = templatePrompts.find((t) => t.id === templateId);
    if (template) {
      setSystemPrompt(template.systemPrompt);
      setUserMessage(template.userMessage);
    }
  };

  // Run test
  const runTest = async () => {
    setIsGenerating(true);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const response = generateMockResponse(
      systemPrompt,
      userMessage,
      selectedModel,
      temperature,
      responseFormat
    );
    
    setCurrentResponse(response);
    
    // Add to history
    const testResult: TestResult = {
      id: Date.now().toString(),
      timestamp: new Date(),
      model: selectedModel,
      systemPrompt,
      userMessage,
      temperature,
      format: responseFormat,
      response,
    };
    
    setTestHistory((prev) => [testResult, ...prev.slice(0, 9)]); // Keep last 10
    setIsGenerating(false);
  };

  // Copy response
  const copyResponse = () => {
    navigator.clipboard.writeText(currentResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clear all
  const clearAll = () => {
    setSystemPrompt("");
    setUserMessage("");
    setCurrentResponse("");
  };

  // Load from history
  const loadFromHistory = (result: TestResult) => {
    setSystemPrompt(result.systemPrompt);
    setUserMessage(result.userMessage);
    setSelectedModel(result.model);
    setTemperature(result.temperature);
    setResponseFormat(result.format);
    setCurrentResponse(result.response);
  };

  const currentModel = useMemo(
    () => models.find((m) => m.id === selectedModel) || models[0],
    [selectedModel]
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative overflow-hidden py-12">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4">
          <Badge variant="outline" className="mb-3 text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
            <Beaker className="w-3 h-3 mr-1 inline" />
            Interactive Testing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">
            Agent Playground
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Test and iterate on agent prompts in real-time. Experiment with different models, temperatures, and response formats.
          </p>
        </div>
      </section>

      {/* Main Content - Split Pane */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Pane - Input Configuration */}
          <div className="space-y-6">
            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Configuration
                </CardTitle>
                <CardDescription>Set up your agent test parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Template Selector */}
                <div className="space-y-2">
                  <Label htmlFor="template" className="text-sm font-medium text-white">
                    Template
                  </Label>
                  <Select onValueChange={loadTemplate}>
                    <SelectTrigger id="template" className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select a template..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10">
                      {templatePrompts.map((template) => (
                        <SelectItem 
                          key={template.id} 
                          value={template.id}
                          className="text-white focus:bg-white/10 focus:text-white"
                        >
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Model Selection */}
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-sm font-medium text-white">
                    Model
                  </Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger id="model" className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10">
                      {models.map((model) => (
                        <SelectItem 
                          key={model.id} 
                          value={model.id}
                          className="text-white focus:bg-white/10 focus:text-white"
                        >
                          {model.name} <span className="text-muted-foreground text-xs">({model.provider})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Temperature Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="temperature" className="text-sm font-medium text-white">
                      Temperature
                    </Label>
                    <span className="text-sm font-mono text-purple-400">{temperature.toFixed(1)}</span>
                  </div>
                  <input
                    id="temperature"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Precise</span>
                    <span>Balanced</span>
                    <span>Creative</span>
                  </div>
                </div>

                {/* Response Format */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white">
                    Response Format
                  </Label>
                  <div className="flex gap-2">
                    {(["text", "json", "markdown"] as ResponseFormat[]).map((format) => (
                      <Button
                        key={format}
                        variant={responseFormat === format ? "default" : "outline"}
                        size="sm"
                        onClick={() => setResponseFormat(format)}
                        className={
                          responseFormat === format
                            ? "bg-purple-500 text-white hover:bg-purple-600"
                            : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        }
                      >
                        {format.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* System Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="system-prompt" className="text-sm font-medium text-white">
                    System Prompt
                  </Label>
                  <Textarea
                    id="system-prompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="You are a helpful assistant..."
                    className="bg-white/5 border-white/10 text-white min-h-[120px] resize-y"
                  />
                  <p className="text-xs text-muted-foreground">
                    Define the agent&apos;s role and behavior
                  </p>
                </div>

                {/* User Message */}
                <div className="space-y-2">
                  <Label htmlFor="user-message" className="text-sm font-medium text-white">
                    User Message
                  </Label>
                  <Textarea
                    id="user-message"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="Enter your test message here..."
                    className="bg-white/5 border-white/10 text-white min-h-[120px] resize-y"
                  />
                  <p className="text-xs text-muted-foreground">
                    The input message to test
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={runTest}
                    disabled={isGenerating || !userMessage}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isGenerating ? "Generating..." : "Run Test"}
                  </Button>
                  <Button
                    onClick={clearAll}
                    variant="outline"
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Pane - Output */}
          <div className="space-y-6">
            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Response</CardTitle>
                    <CardDescription>
                      {currentResponse ? `${currentModel.name} • ${responseFormat.toUpperCase()}` : "Run a test to see results"}
                    </CardDescription>
                  </div>
                  {currentResponse && (
                    <Button
                      onClick={copyResponse}
                      variant="outline"
                      size="sm"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 mx-auto border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                      <p className="text-sm text-muted-foreground">Generating response...</p>
                    </div>
                  </div>
                ) : currentResponse ? (
                  <div className="bg-[#0a0a0a] rounded-lg border border-white/5 p-4">
                    <pre className="text-sm text-white whitespace-pre-wrap font-mono overflow-x-auto">
                      {currentResponse}
                    </pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-16 text-muted-foreground">
                    <div className="text-center space-y-2">
                      <Beaker className="w-12 h-12 mx-auto opacity-20" />
                      <p className="text-sm">No test results yet</p>
                      <p className="text-xs">Configure your test and click Run Test</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Test History */}
            {testHistory.length > 0 && (
              <Card className="bg-card/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Test History
                  </CardTitle>
                  <CardDescription>Recent test runs (max 10)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {testHistory.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => loadFromHistory(result)}
                        className="w-full text-left p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                                {result.model}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-white/20 text-muted-foreground">
                                {result.format}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                T={result.temperature}
                              </span>
                            </div>
                            <p className="text-sm text-white truncate">
                              {result.userMessage}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {result.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Info Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
              <div>
                <h3 className="text-white font-semibold mb-2">About the Playground</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This is a <strong className="text-white">mock testing environment</strong> for experimenting with agent configurations. 
                  All responses are simulated client-side and do not call real AI APIs. Use this tool to prototype prompts, 
                  test different parameters, and iterate on your agent design before deploying to production.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
