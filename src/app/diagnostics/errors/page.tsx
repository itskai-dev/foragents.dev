"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, TrendingUp, Wrench } from "lucide-react";

interface ErrorPattern {
  type: string;
  category: "timeout" | "overflow" | "rate_limit" | "auth" | "hallucination";
  description: string;
  frequency: number;
  lastOccurrence: string;
  trend: "increasing" | "stable" | "decreasing";
  suggestedFix: string;
  exampleError: string;
}

// Sample error patterns - in production, this would come from logs/analytics
const errorPatterns: ErrorPattern[] = [
  {
    type: "Tool Timeout",
    category: "timeout",
    description: "Tool execution exceeds configured timeout threshold",
    frequency: 47,
    lastOccurrence: "2 hours ago",
    trend: "increasing",
    suggestedFix: "Increase timeout in tool config or optimize tool implementation. For browser/exec tools, consider splitting long operations into smaller chunks.",
    exampleError: "TimeoutError: Tool 'web_search' exceeded 30s timeout at query='complex research topic with many results'",
  },
  {
    type: "Context Window Overflow",
    category: "overflow",
    description: "Agent context exceeds model's maximum token limit",
    frequency: 23,
    lastOccurrence: "45 minutes ago",
    trend: "stable",
    suggestedFix: "Implement conversation summarization or sliding window. Reduce system prompt size. Use external memory (vector DB) for long-term context.",
    exampleError: "ContextLengthExceededError: Request tokens (128,450) exceed model limit (128,000). Consider summarizing conversation history.",
  },
  {
    type: "API Rate Limit",
    category: "rate_limit",
    description: "Provider API rate limits exceeded",
    frequency: 156,
    lastOccurrence: "12 minutes ago",
    trend: "stable",
    suggestedFix: "Implement exponential backoff with jitter. Add request queuing. Consider upgrading API tier or distributing load across multiple keys.",
    exampleError: "RateLimitError: Anthropic API rate limit exceeded (429). Retry after 15s. Daily quota: 9,847 / 10,000 requests.",
  },
  {
    type: "Authentication Failure",
    category: "auth",
    description: "Tool authentication or API key issues",
    frequency: 8,
    lastOccurrence: "3 days ago",
    trend: "decreasing",
    suggestedFix: "Verify API keys are valid and not expired. Check key permissions/scopes. Ensure credentials are properly injected into tool configs.",
    exampleError: "AuthenticationError: Invalid API key for tool 'web_search'. Key format: 'sk-proj-...' (length: 48). Received: 'sk-...' (length: 32).",
  },
  {
    type: "Hallucinated Tool Call",
    category: "hallucination",
    description: "Agent invokes non-existent tools or malformed parameters",
    frequency: 34,
    lastOccurrence: "5 hours ago",
    trend: "increasing",
    suggestedFix: "Strengthen system prompt with explicit tool schemas. Use strict JSON mode. Add validation layer before tool execution. Consider function calling over text parsing.",
    exampleError: "ToolNotFoundError: Agent attempted to call 'browse_webpage' (not in toolkit). Did you mean 'browser'? Raw output: '<tool>browse_webpage</tool>'",
  },
  {
    type: "Network Connectivity",
    category: "timeout",
    description: "Network failures when calling external APIs",
    frequency: 19,
    lastOccurrence: "1 hour ago",
    trend: "stable",
    suggestedFix: "Implement retry logic with exponential backoff. Add circuit breaker pattern. Check DNS resolution and firewall rules. Monitor endpoint health.",
    exampleError: "NetworkError: ECONNREFUSED connecting to https://api.example.com. Check network connectivity and endpoint availability.",
  },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "timeout":
      return "border-yellow-500/50 text-yellow-500";
    case "overflow":
      return "border-red-500/50 text-red-500";
    case "rate_limit":
      return "border-orange-500/50 text-orange-500";
    case "auth":
      return "border-purple-500/50 text-purple-500";
    case "hallucination":
      return "border-pink-500/50 text-pink-500";
    default:
      return "border-gray-500/50 text-gray-500";
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "increasing":
      return <TrendingUp className="w-3 h-3 text-red-500" />;
    case "decreasing":
      return <TrendingUp className="w-3 h-3 text-green-500 rotate-180" />;
    default:
      return <span className="w-3 h-3 inline-block">—</span>;
  }
};

export default function ErrorsPage() {
  // Calculate summary stats
  const totalErrors = errorPatterns.reduce((sum, p) => sum + p.frequency, 0);
  const increasingErrors = errorPatterns.filter(p => p.trend === "increasing").length;
  const categoryBreakdown = errorPatterns.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + p.frequency;
    return acc;
  }, {} as Record<string, number>);

  return (
    <main id="main-content" className="min-h-screen bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Error <span className="aurora-text">Pattern Analyzer</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Categorize common agent failure modes with suggested fixes and real-time trends.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-[#0f0f0f] border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Errors (7d)</p>
                  <p className="text-3xl font-bold mt-1">{totalErrors}</p>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f0f0f] border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Increasing Patterns</p>
                  <p className="text-3xl font-bold mt-1">{increasingErrors}</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/10">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f0f0f] border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Most Common</p>
                  <p className="text-xl font-bold mt-1">API Rate Limit</p>
                </div>
                <div className="p-3 rounded-lg bg-[#06D6A0]/10">
                  <Clock className="w-6 h-6 text-[#06D6A0]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card className="bg-[#0f0f0f] border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Error Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(categoryBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count], idx) => {
                  const percentage = ((count / totalErrors) * 100).toFixed(1);
                  
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">{category.replace('_', ' ')}</span>
                        <span className="text-muted-foreground">
                          {count} errors ({percentage}%)
                        </span>
                      </div>
                      
                      {/* Pure CSS Bar */}
                      <div className="relative w-full h-3 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#06D6A0] to-[#06D6A0]/60 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Error Patterns */}
        <div className="space-y-6">
          {errorPatterns
            .sort((a, b) => b.frequency - a.frequency)
            .map((pattern, idx) => (
              <Card key={idx} className="bg-[#0f0f0f] border-white/10">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl">{pattern.type}</CardTitle>
                        <Badge variant="outline" className={getCategoryColor(pattern.category)}>
                          {pattern.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{pattern.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {getTrendIcon(pattern.trend)}
                      <span className="capitalize">{pattern.trend}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Frequency: </span>
                      <span className="font-semibold">{pattern.frequency} occurrences</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last seen: </span>
                      <span className="font-semibold">{pattern.lastOccurrence}</span>
                    </div>
                  </div>

                  {/* Example Error */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      Example Error
                    </h4>
                    <pre className="px-4 py-3 bg-[#0a0a0a] border border-red-500/20 rounded text-xs text-red-400 font-mono overflow-x-auto">
                      {pattern.exampleError}
                    </pre>
                  </div>

                  {/* Suggested Fix */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-[#06D6A0]" />
                      Suggested Fix
                    </h4>
                    <div className="px-4 py-3 bg-[#06D6A0]/5 border border-[#06D6A0]/20 rounded text-sm text-foreground/90">
                      {pattern.suggestedFix}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Agent-Readable Format Section */}
        <Card className="bg-[#0f0f0f] border-white/10 mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Agent-Readable Error Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded text-xs text-foreground/80 font-mono overflow-x-auto">
{`ERROR_PATTERNS:
${errorPatterns.map(p => `
[${p.type.toUpperCase().replace(/ /g, '_')}]
Category: ${p.category}
Frequency: ${p.frequency}
Trend: ${p.trend}
Fix: ${p.suggestedFix.slice(0, 100)}...
`).join('')}
`}
            </pre>
            <p className="text-sm text-muted-foreground mt-4">
              💡 <strong>For agents:</strong> This structured format can be parsed programmatically 
              to implement self-healing behaviors or automated error recovery.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
