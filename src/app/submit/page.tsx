"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

type Step = 1 | 2 | 3 | 4;

interface FormData {
  name: string;
  author: string;
  shortDescription: string;
  githubUrl: string;
  longDescription: string;
  tags: string[];
  category: string;
  hostCompatibility: string[];
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
  "Other",
];

const HOST_OPTIONS = [
  "OpenClaw",
  "Claude Code",
  "Cursor",
  "Aider",
  "Continue.dev",
  "Windsurf",
  "Other",
];

const POPULAR_TAGS = [
  "automation",
  "web",
  "api",
  "data",
  "files",
  "github",
  "chat",
  "media",
  "terminal",
  "ai",
];

export default function SubmitPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>(() => {
    // Initialize from localStorage on first mount
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("skillSubmissionDraft");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to load draft:", e);
        }
      }
    }
    return {
      name: "",
      author: "",
      shortDescription: "",
      githubUrl: "",
      longDescription: "",
      tags: [],
      category: "",
      hostCompatibility: [],
    };
  });

  // Save to localStorage whenever formData changes
  useEffect(() => {
    if (!isSubmitted) {
      localStorage.setItem("skillSubmissionDraft", JSON.stringify(formData));
    }
  }, [formData, isSubmitted]);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const toggleHost = (host: string) => {
    setFormData((prev) => ({
      ...prev,
      hostCompatibility: prev.hostCompatibility.includes(host)
        ? prev.hostCompatibility.filter((h) => h !== host)
        : [...prev.hostCompatibility, host],
    }));
  };

  const canProceed = (step: Step): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.name.trim() &&
          formData.author.trim() &&
          formData.shortDescription.trim() &&
          formData.githubUrl.trim()
        );
      case 2:
        return !!(
          formData.longDescription.trim() &&
          formData.tags.length > 0 &&
          formData.category &&
          formData.hostCompatibility.length > 0
        );
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    // Save to localStorage as submitted
    localStorage.setItem("skillSubmission", JSON.stringify(formData));
    localStorage.removeItem("skillSubmissionDraft");
    setIsSubmitted(true);
    setCurrentStep(4);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      author: "",
      shortDescription: "",
      githubUrl: "",
      longDescription: "",
      tags: [],
      category: "",
      hostCompatibility: [],
    });
    setIsSubmitted(false);
    setCurrentStep(1);
    localStorage.removeItem("skillSubmissionDraft");
  };

  const renderProgressIndicator = () => (
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
      1: "Basic Information",
      2: "Details & Compatibility",
      3: "Preview",
      4: "Submitted!",
    };
    return (
      <h2 className="text-2xl font-bold text-center mb-2">
        {titles[currentStep]}
      </h2>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Skill Name <span className="text-red-400">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="My Awesome Skill"
          className="w-full px-4 py-3 rounded-lg bg-card border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="author" className="block text-sm font-medium mb-2">
          Author <span className="text-red-400">*</span>
        </label>
        <input
          id="author"
          type="text"
          value={formData.author}
          onChange={(e) => updateField("author", e.target.value)}
          placeholder="Your name or GitHub handle"
          className="w-full px-4 py-3 rounded-lg bg-card border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="shortDescription"
          className="block text-sm font-medium mb-2"
        >
          Short Description <span className="text-red-400">*</span>
        </label>
        <textarea
          id="shortDescription"
          value={formData.shortDescription}
          onChange={(e) => updateField("shortDescription", e.target.value)}
          placeholder="A brief one-liner describing what your skill does"
          rows={2}
          className="w-full px-4 py-3 rounded-lg bg-card border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 transition-colors resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.shortDescription.length}/100 characters
        </p>
      </div>

      <div>
        <label htmlFor="githubUrl" className="block text-sm font-medium mb-2">
          GitHub URL <span className="text-red-400">*</span>
        </label>
        <input
          id="githubUrl"
          type="url"
          value={formData.githubUrl}
          onChange={(e) => updateField("githubUrl", e.target.value)}
          placeholder="https://github.com/username/repo"
          className="w-full px-4 py-3 rounded-lg bg-card border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 transition-colors font-mono text-sm"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="longDescription"
          className="block text-sm font-medium mb-2"
        >
          Long Description <span className="text-red-400">*</span>
        </label>
        <textarea
          id="longDescription"
          value={formData.longDescription}
          onChange={(e) => updateField("longDescription", e.target.value)}
          placeholder="Detailed description in Markdown...&#10;&#10;## Features&#10;- Feature 1&#10;- Feature 2&#10;&#10;## Installation&#10;```bash&#10;npm install your-skill&#10;```"
          rows={8}
          className="w-full px-4 py-3 rounded-lg bg-card border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 transition-colors resize-none font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Markdown supported
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Tags <span className="text-red-400">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                formData.tags.includes(tag)
                  ? "bg-cyan/20 text-cyan border border-cyan/30"
                  : "bg-card text-muted-foreground border border-white/10 hover:border-white/20"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Selected: {formData.tags.length > 0 ? formData.tags.join(", ") : "none"}
        </p>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-2">
          Category <span className="text-red-400">*</span>
        </label>
        <select
          id="category"
          value={formData.category}
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
          Host Compatibility <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {HOST_OPTIONS.map((host) => (
            <label
              key={host}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                formData.hostCompatibility.includes(host)
                  ? "bg-cyan/10 border-cyan/30"
                  : "bg-card border-white/10 hover:border-white/20"
              }`}
            >
              <input
                type="checkbox"
                checked={formData.hostCompatibility.includes(host)}
                onChange={() => toggleHost(host)}
                className="w-4 h-4 rounded border-white/20 text-cyan focus:ring-cyan/50 focus:ring-offset-0 bg-card"
              />
              <span className="text-sm">{host}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-card border border-white/10 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-2">
              {formData.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              by {formData.author}
            </p>
            <p className="text-foreground mb-4">{formData.shortDescription}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs rounded-md bg-cyan/10 text-cyan border border-cyan/20"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                📁 {formData.category}
              </span>
              <span className="flex items-center gap-1">
                🔗{" "}
                <a
                  href={formData.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan hover:underline"
                >
                  GitHub
                </a>
              </span>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-4">
          <h4 className="text-sm font-semibold mb-2">Compatible Hosts:</h4>
          <div className="flex flex-wrap gap-2">
            {formData.hostCompatibility.map((host) => (
              <span
                key={host}
                className="px-2 py-1 text-xs rounded-md bg-purple/10 text-purple border border-purple/20"
              >
                {host}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-white/10 rounded-lg p-6">
        <h4 className="text-sm font-semibold mb-3">Description Preview:</h4>
        <div className="prose prose-invert prose-sm max-w-none">
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono bg-background/50 p-4 rounded-lg">
            {formData.longDescription}
          </pre>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 mx-auto rounded-full bg-cyan/20 border-4 border-cyan flex items-center justify-center">
        <svg
          className="w-10 h-10 text-cyan"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-2">Submission Received!</h3>
        <p className="text-muted-foreground mb-6">
          Your skill &quot;{formData.name}&quot; has been saved locally. In a real
          implementation, this would be sent to the review queue.
        </p>
      </div>

      <div className="bg-card border border-white/10 rounded-lg p-6 text-left">
        <h4 className="text-sm font-semibold mb-3">What&apos;s next?</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-cyan">•</span>
            <span>Your submission would be reviewed by the forAgents.dev team</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan">•</span>
            <span>You&apos;d receive a notification once it&apos;s approved</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan">•</span>
            <span>Your skill would appear in the directory for agents to discover</span>
          </li>
        </ul>
      </div>

      <button
        onClick={handleReset}
        className="px-6 py-3 rounded-lg bg-cyan/20 border border-cyan/30 text-cyan font-medium hover:bg-cyan/30 transition-colors"
      >
        Submit Another Skill
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Submit a <span className="aurora-text">Skill</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Share your creation with the agent community
          </p>
        </div>

        {renderProgressIndicator()}
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
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1) as Step)}
              disabled={currentStep === 1}
              className="px-6 py-3 rounded-lg bg-card border border-white/10 text-foreground font-medium hover:bg-card/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            {currentStep < 3 && (
              <button
                onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1) as Step)}
                disabled={!canProceed(currentStep)}
                className="px-6 py-3 rounded-lg bg-cyan/20 border border-cyan/30 text-cyan font-medium hover:bg-cyan/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            )}

            {currentStep === 3 && (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 rounded-lg bg-cyan text-background font-medium hover:bg-cyan/90 transition-colors"
              >
                Submit Skill ✓
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-16">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
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
