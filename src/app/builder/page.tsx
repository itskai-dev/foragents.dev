"use client";

import { useState, useEffect } from "react";

type Step = 1 | 2 | 3 | 4;

interface ExamplePair {
  input: string;
  output: string;
}

interface SkillData {
  // Step 1: Info
  name: string;
  description: string;
  category: string;
  tags: string[];

  // Step 2: Config
  model: string;
  temperature: number;
  toolsNeeded: string[];

  // Step 3: Logic
  systemPrompt: string;
  examples: ExamplePair[];
}

const CATEGORIES = [
  "Automation",
  "Communication",
  "Data Analysis",
  "Development Tools",
  "File Management",
  "Media Processing",
  "System Integration",
  "Web Scraping",
  "Security",
  "Creative",
  "Other",
];

const AVAILABLE_TOOLS = [
  "read",
  "write",
  "edit",
  "exec",
  "process",
  "web_search",
  "web_fetch",
  "browser",
  "canvas",
  "nodes",
  "message",
  "image",
  "tts",
];

const MODELS = [
  "anthropic/claude-opus-4",
  "anthropic/claude-sonnet-4",
  "anthropic/claude-sonnet-3.5",
  "anthropic/claude-haiku-3.5",
  "openai/gpt-4o",
  "openai/gpt-4-turbo",
  "openai/o1",
  "openai/o1-mini",
];

const SAMPLE_SKILL: SkillData = {
  name: "Code Reviewer",
  description: "Analyzes code for bugs, security issues, and best practices",
  category: "Development Tools",
  tags: ["code-review", "security", "best-practices"],
  model: "anthropic/claude-sonnet-4",
  temperature: 0.3,
  toolsNeeded: ["read", "write", "exec"],
  systemPrompt: `You are an expert code reviewer with deep knowledge of security, performance, and best practices.

When reviewing code:
1. Identify security vulnerabilities
2. Check for performance issues
3. Suggest improvements following industry best practices
4. Point out potential bugs
5. Recommend better design patterns when applicable

Always be constructive and explain the reasoning behind your suggestions.`,
  examples: [
    {
      input: "Review this function for security issues:\n\nfunction getUserData(userId) {\n  return db.query('SELECT * FROM users WHERE id = ' + userId);\n}",
      output: "🚨 **Critical Security Issue: SQL Injection Vulnerability**\n\nThis code is vulnerable to SQL injection attacks. An attacker could manipulate the userId parameter to execute arbitrary SQL.\n\n**Fixed version:**\n```javascript\nfunction getUserData(userId) {\n  return db.query('SELECT * FROM users WHERE id = ?', [userId]);\n}\n```\n\nUse parameterized queries to safely handle user input.",
    },
    {
      input: "Is this code efficient?\n\nfor (let i = 0; i < array.length; i++) {\n  console.log(array[i]);\n}",
      output: "⚠️ **Performance Issue: Recalculating array.length**\n\nWhile not critical, this recalculates array.length on each iteration.\n\n**Better approach:**\n```javascript\nconst len = array.length;\nfor (let i = 0; i < len; i++) {\n  console.log(array[i]);\n}\n```\n\nOr use a more modern approach:\n```javascript\narray.forEach(item => console.log(item));\n```",
    },
  ],
};

export default function BuilderPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [customTagInput, setCustomTagInput] = useState("");
  const [skillData, setSkillData] = useState<SkillData>(() => {
    // Load from localStorage or use sample
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("skillBuilderDraft");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to load draft:", e);
        }
      }
    }
    return SAMPLE_SKILL;
  });

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem("skillBuilderDraft", JSON.stringify(skillData));
  }, [skillData]);

  const updateField = <K extends keyof SkillData>(
    key: K,
    value: SkillData[K]
  ) => {
    setSkillData((prev) => ({ ...prev, [key]: value }));
  };

  const addCustomTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !skillData.tags.includes(trimmed)) {
      setSkillData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmed],
      }));
    }
  };

  const removeTag = (tag: string) => {
    setSkillData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const toggleTool = (tool: string) => {
    setSkillData((prev) => ({
      ...prev,
      toolsNeeded: prev.toolsNeeded.includes(tool)
        ? prev.toolsNeeded.filter((t) => t !== tool)
        : [...prev.toolsNeeded, tool],
    }));
  };

  const addExample = () => {
    setSkillData((prev) => ({
      ...prev,
      examples: [...prev.examples, { input: "", output: "" }],
    }));
  };

  const updateExample = (index: number, field: "input" | "output", value: string) => {
    setSkillData((prev) => ({
      ...prev,
      examples: prev.examples.map((ex, i) =>
        i === index ? { ...ex, [field]: value } : ex
      ),
    }));
  };

  const removeExample = (index: number) => {
    setSkillData((prev) => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index),
    }));
  };

  const canProceed = (step: Step): boolean => {
    switch (step) {
      case 1:
        return !!(
          skillData.name.trim() &&
          skillData.description.trim() &&
          skillData.category &&
          skillData.tags.length > 0
        );
      case 2:
        return !!(skillData.model && skillData.toolsNeeded.length > 0);
      case 3:
        return !!skillData.systemPrompt.trim();
      default:
        return false;
    }
  };

  const generateSkillJson = () => {
    return JSON.stringify(
      {
        name: skillData.name,
        description: skillData.description,
        category: skillData.category,
        tags: skillData.tags,
        config: {
          model: skillData.model,
          temperature: skillData.temperature,
          tools: skillData.toolsNeeded,
        },
        systemPrompt: skillData.systemPrompt,
        examples: skillData.examples.filter(
          (ex) => ex.input.trim() || ex.output.trim()
        ),
      },
      null,
      2
    );
  };

  const handleDownload = () => {
    const json = generateSkillJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${skillData.name.toLowerCase().replace(/\s+/g, "-")}-skill.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePublish = () => {
    // In a real implementation, this would POST to an API
    alert(
      "🚀 In production, this would publish your skill to forAgents.dev!\n\nFor now, the skill has been downloaded locally."
    );
    handleDownload();
  };

  const handleReset = () => {
    if (
      confirm(
        "Are you sure you want to reset? This will clear all your current work."
      )
    ) {
      setSkillData(SAMPLE_SKILL);
      setCurrentStep(1);
      localStorage.removeItem("skillBuilderDraft");
    }
  };

  const renderProgressBar = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              currentStep === step
                ? "bg-cyan text-background ring-4 ring-cyan/20"
                : currentStep > step
                ? "bg-cyan/30 text-cyan"
                : "bg-card border border-white/10 text-muted-foreground"
            }`}
          >
            {step}
          </div>
          {step < 4 && (
            <div
              className={`w-12 h-0.5 mx-1 ${
                currentStep > step ? "bg-cyan" : "bg-white/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepTitle = () => {
    const titles = {
      1: "Skill Information",
      2: "Configuration",
      3: "Logic & Examples",
      4: "Publish Your Skill",
    };
    return (
      <h2 className="text-2xl font-bold text-center mb-2">
        {titles[currentStep]}
      </h2>
    );
  };

  const renderStep1 = () => {
    return (
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Skill Name <span className="text-red-400">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={skillData.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="e.g., Code Reviewer, Image Generator, Data Analyzer"
            className="w-full px-4 py-3 rounded-lg bg-card border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-2"
          >
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            id="description"
            value={skillData.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Brief description of what this skill does..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-card border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 transition-colors resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {skillData.description.length}/200 characters
          </p>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-2">
            Category <span className="text-red-400">*</span>
          </label>
          <select
            id="category"
            value={skillData.category}
            onChange={(e) => updateField("category", e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-card border border-white/10 text-foreground focus:outline-none focus:border-cyan/50 transition-colors"
          >
            <option value="">Select a category...</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Tags <span className="text-red-400">*</span>
          </label>
          
          {/* Selected tags */}
          {skillData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {skillData.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-cyan/20 text-cyan border border-cyan/30 flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add custom tag */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomTag(customTagInput);
                  setCustomTagInput("");
                }
              }}
              placeholder="Type a tag and press Enter"
              className="flex-1 px-4 py-2 rounded-lg bg-card border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 transition-colors text-sm"
            />
            <button
              type="button"
              onClick={() => {
                addCustomTag(customTagInput);
                setCustomTagInput("");
              }}
              className="px-4 py-2 rounded-lg bg-cyan/20 border border-cyan/30 text-cyan font-medium hover:bg-cyan/30 transition-colors text-sm"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Add tags to help agents discover this skill
          </p>
        </div>
      </div>
    );
  };

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="model" className="block text-sm font-medium mb-2">
          Model <span className="text-red-400">*</span>
        </label>
        <select
          id="model"
          value={skillData.model}
          onChange={(e) => updateField("model", e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-card border border-white/10 text-foreground focus:outline-none focus:border-cyan/50 transition-colors font-mono text-sm"
        >
          <option value="">Select a model...</option>
          {MODELS.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          Choose the AI model that will power this skill
        </p>
      </div>

      <div>
        <label htmlFor="temperature" className="block text-sm font-medium mb-2">
          Temperature: {skillData.temperature.toFixed(1)}
        </label>
        <div className="flex items-center gap-4">
          <input
            id="temperature"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={skillData.temperature}
            onChange={(e) => updateField("temperature", parseFloat(e.target.value))}
            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-card border border-white/10"
            style={{
              background: `linear-gradient(to right, rgb(34 211 238) 0%, rgb(34 211 238) ${skillData.temperature * 100}%, rgb(39 39 42) ${skillData.temperature * 100}%, rgb(39 39 42) 100%)`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Precise (0.0)</span>
          <span>Creative (1.0)</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Tools Needed <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {AVAILABLE_TOOLS.map((tool) => (
            <label
              key={tool}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                skillData.toolsNeeded.includes(tool)
                  ? "bg-cyan/10 border-cyan/30"
                  : "bg-card border-white/10 hover:border-white/20"
              }`}
            >
              <input
                type="checkbox"
                checked={skillData.toolsNeeded.includes(tool)}
                onChange={() => toggleTool(tool)}
                className="w-4 h-4 rounded border-white/20 text-cyan focus:ring-cyan/50 focus:ring-offset-0 bg-card"
              />
              <span className="text-sm font-mono">{tool}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Select the tools this skill needs to function
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="systemPrompt"
          className="block text-sm font-medium mb-2"
        >
          System Prompt <span className="text-red-400">*</span>
        </label>
        <textarea
          id="systemPrompt"
          value={skillData.systemPrompt}
          onChange={(e) => updateField("systemPrompt", e.target.value)}
          placeholder="You are an expert in...&#10;&#10;Your primary responsibilities:&#10;1. First task&#10;2. Second task&#10;3. Third task"
          rows={12}
          className="w-full px-4 py-3 rounded-lg bg-card border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 transition-colors resize-none font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Define the behavior and personality of this skill
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium">
            Example Input/Output Pairs
          </label>
          <button
            type="button"
            onClick={addExample}
            className="px-3 py-1.5 rounded-lg bg-cyan/20 border border-cyan/30 text-cyan font-medium hover:bg-cyan/30 transition-colors text-sm"
          >
            + Add Example
          </button>
        </div>

        <div className="space-y-4">
          {skillData.examples.map((example, index) => (
            <div
              key={index}
              className="bg-card border border-white/10 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-muted-foreground">
                  Example {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeExample(index)}
                  className="text-red-400 hover:text-red-300 transition-colors text-sm"
                >
                  Remove
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">
                    Input
                  </label>
                  <textarea
                    value={example.input}
                    onChange={(e) =>
                      updateExample(index, "input", e.target.value)
                    }
                    placeholder="User message or input..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 transition-colors resize-none text-sm font-mono"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">
                    Output
                  </label>
                  <textarea
                    value={example.output}
                    onChange={(e) =>
                      updateExample(index, "output", e.target.value)
                    }
                    placeholder="Expected agent response..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 transition-colors resize-none text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          ))}

          {skillData.examples.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No examples yet. Add some to help demonstrate how this skill works.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      {/* Preview Card */}
      <div className="bg-card border border-white/10 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-2">
              {skillData.name}
            </h3>
            <p className="text-foreground mb-4">{skillData.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {skillData.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs rounded-md bg-cyan/10 text-cyan border border-cyan/20"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Category:</span>
                <span className="ml-2 text-foreground">{skillData.category}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Model:</span>
                <span className="ml-2 text-foreground font-mono text-xs">
                  {skillData.model}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Temperature:</span>
                <span className="ml-2 text-foreground">
                  {skillData.temperature.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Tools:</span>
                <span className="ml-2 text-foreground">
                  {skillData.toolsNeeded.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <h4 className="text-sm font-semibold mb-2">Required Tools:</h4>
          <div className="flex flex-wrap gap-2">
            {skillData.toolsNeeded.map((tool) => (
              <span
                key={tool}
                className="px-2 py-1 text-xs rounded-md bg-purple/10 text-purple border border-purple/20 font-mono"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* JSON Preview */}
      <div className="bg-card border border-white/10 rounded-lg p-6">
        <h4 className="text-sm font-semibold mb-3">skill.json</h4>
        <pre className="bg-background/50 p-4 rounded-lg overflow-x-auto text-xs font-mono text-muted-foreground border border-white/10">
          {generateSkillJson()}
        </pre>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleDownload}
          className="px-6 py-4 rounded-lg bg-card border border-white/10 text-foreground font-medium hover:bg-card/80 transition-colors flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download JSON
        </button>

        <button
          onClick={handlePublish}
          className="px-6 py-4 rounded-lg bg-cyan text-background font-medium hover:bg-cyan/90 transition-colors flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          Publish to forAgents
        </button>
      </div>

      <div className="text-center">
        <button
          onClick={handleReset}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
        >
          Start a new skill
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Skill <span className="aurora-text">Builder</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Create and share custom agent skills visually
          </p>
        </div>

        {renderProgressBar()}
        {renderStepTitle()}

        <div className="bg-card border border-white/10 rounded-xl p-8 mt-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Navigation */}
        {currentStep < 4 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() =>
                setCurrentStep((prev) => Math.max(1, prev - 1) as Step)
              }
              disabled={currentStep === 1}
              className="px-6 py-3 rounded-lg bg-card border border-white/10 text-foreground font-medium hover:bg-card/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            <button
              onClick={() =>
                setCurrentStep((prev) => Math.min(4, prev + 1) as Step)
              }
              disabled={!canProceed(currentStep)}
              className="px-6 py-3 rounded-lg bg-cyan/20 border border-cyan/30 text-cyan font-medium hover:bg-cyan/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Built by</span>
            <a
              href="https://reflectt.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="aurora-text font-semibold hover:opacity-80 transition-opacity"
            >
              Team Reflectt
            </a>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <a href="/llms.txt" className="hover:text-cyan transition-colors">
              llms.txt
            </a>
            <a
              href="https://github.com/reflectt"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
