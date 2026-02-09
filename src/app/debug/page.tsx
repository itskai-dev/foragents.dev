"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const debugTools = [
  {
    title: "Error Code Reference",
    description: "50+ common agent errors organized by category",
    icon: "🔍",
    href: "/debug/errors",
    categories: ["Authentication", "Rate Limiting", "Context", "Tools", "Network", "Data", "Model"],
    badge: "50+ errors"
  },
  {
    title: "Prompt Debugger",
    description: "Debug prompt injection, context overflow, hallucinations, and system conflicts",
    icon: "📝",
    href: "/debug/prompts",
    categories: ["Injection", "Context", "Hallucination", "Conflicts"],
    badge: "Guide"
  },
  {
    title: "Tool Call Inspector",
    description: "Common failure modes and debugging patterns for tool execution",
    icon: "🔧",
    href: "/debug/tools",
    categories: ["Exec", "Web", "File", "Browser", "Timeouts", "Recovery"],
    badge: "Patterns"
  }
];

const commonIssues = [
  {
    category: "Authentication",
    issues: [
      { code: "AUTH_001", name: "Invalid API Key", severity: "high" },
      { code: "AUTH_002", name: "Insufficient Permissions", severity: "medium" },
      { code: "AUTH_003", name: "OAuth Token Expired", severity: "medium" }
    ]
  },
  {
    category: "Rate Limiting",
    issues: [
      { code: "RATE_001", name: "Requests Per Minute Exceeded", severity: "high" },
      { code: "RATE_002", name: "Tokens Per Minute Exceeded", severity: "high" },
      { code: "RATE_003", name: "Daily Quota Exceeded", severity: "critical" }
    ]
  },
  {
    category: "Context",
    issues: [
      { code: "CTX_001", name: "Context Window Overflow", severity: "critical" },
      { code: "CTX_004", name: "Context Injection Attack", severity: "critical" }
    ]
  }
];

const quickDiagnostics = [
  {
    symptom: "API calls failing with 401/403",
    likelyIssue: "AUTH_001 or AUTH_002",
    quickFix: "Verify API key in dashboard, check scopes"
  },
  {
    symptom: "429 Too Many Requests",
    likelyIssue: "RATE_001, RATE_002, or RATE_003",
    quickFix: "Implement rate limiter, check usage dashboard"
  },
  {
    symptom: "Responses cut off mid-sentence",
    likelyIssue: "CTX_001 or MODEL_003",
    quickFix: "Reduce context size, increase max_tokens"
  },
  {
    symptom: "Tool execution times out",
    likelyIssue: "TOOL_002 or NET_001",
    quickFix: "Implement timeout wrapper, check network"
  },
  {
    symptom: "Model ignoring instructions",
    likelyIssue: "Prompt injection or CTX_004",
    quickFix: "Use XML tags, sanitize user input"
  },
  {
    symptom: "Invalid JSON responses",
    likelyIssue: "MODEL_005 or DATA_001",
    quickFix: "Use JSON mode, add format examples"
  }
];

const severityColors = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
};

export default function DebugToolkitPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-5xl">🛠️</span>
          <div>
            <h1 className="text-4xl font-bold">Agent Debugging Toolkit</h1>
            <p className="text-muted-foreground text-lg mt-1">
              Agent-first debugging resources for developers
            </p>
          </div>
        </div>
        
        <div className="bg-muted/50 border rounded-lg p-4 mt-6">
          <p className="text-sm">
            <strong>Machine-readable format:</strong> All error codes and patterns are structured for easy parsing.
            Use the JSON data directly or navigate the interactive guides below.
          </p>
        </div>
      </div>

      {/* Main Debug Tools */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Debug Tools</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {debugTools.map((tool) => (
            <Link key={tool.href} href={tool.href}>
              <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{tool.icon}</span>
                      <div>
                        <CardTitle className="text-xl">{tool.title}</CardTitle>
                        <Badge variant="outline" className="mt-2">{tool.badge}</Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-3">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tool.categories.map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Common Issues Database */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Common Issues</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {commonIssues.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle className="text-lg">{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.issues.map((issue) => (
                    <Link
                      key={issue.code}
                      href={`/debug/errors#${issue.code}`}
                      className="block group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-xs text-muted-foreground">
                            {issue.code}
                          </div>
                          <div className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                            {issue.name}
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs shrink-0 ${severityColors[issue.severity as keyof typeof severityColors]}`}
                        >
                          {issue.severity}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
                
                <Link
                  href={`/debug/errors?category=${category.category.toLowerCase().replace(' ', '-')}`}
                  className="text-sm text-primary hover:underline mt-4 block"
                >
                  View all {category.category.toLowerCase()} errors →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Troubleshooting Wizard */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Quick Diagnostics</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Symptom → Solution</CardTitle>
            <CardDescription>
              Match your symptom to likely issues and quick fixes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quickDiagnostics.map((item, i) => (
                <div key={i} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        SYMPTOM
                      </div>
                      <div className="text-sm font-medium">
                        {item.symptom}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        LIKELY ISSUE
                      </div>
                      <div className="font-mono text-sm">
                        {item.likelyIssue}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        QUICK FIX
                      </div>
                      <div className="text-sm">
                        {item.quickFix}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* For Agents Section */}
      <section className="mb-12">
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🤖</span>
              For AI Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Machine-Readable Data</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  All error codes available in structured JSON format:
                </p>
                <code className="block bg-muted px-3 py-2 rounded text-xs">
                  GET /data/debug-errors.json
                </code>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Error Code Format</h3>
                <pre className="bg-muted px-3 py-2 rounded text-xs overflow-x-auto">
{`{
  "code": "ERROR_CODE",
  "name": "Human-readable name",
  "description": "What went wrong",
  "severity": "critical|high|medium|low",
  "causes": ["Common cause 1", "..."],
  "fixes": ["Fix step 1", "..."],
  "example": "Code example"
}`}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Self-Debugging Pattern</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  When you encounter an error:
                </p>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Match error message to error code</li>
                  <li>Review common causes</li>
                  <li>Apply fixes in order</li>
                  <li>Verify with provided example code</li>
                  <li>Log successful resolution for future reference</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Resources */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Additional Resources</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/api-docs">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>📚</span>
                  API Documentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Complete API reference and integration guides
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/connectors">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>🔌</span>
                  Connectors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pre-built integrations and authentication guides
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/benchmarks">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>📊</span>
                  Benchmarks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Performance testing and optimization guides
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/community">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>💬</span>
                  Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get help from other agent developers
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
