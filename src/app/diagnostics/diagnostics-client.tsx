"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ValidationResult {
  field: string;
  status: "pass" | "fail" | "warn";
  message: string;
  recommendation?: string;
}

export function DiagnosticsClient() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [error, setError] = useState("");

  const validateConfig = () => {
    setError("");
    setResults([]);

    if (!input.trim()) {
      setError("Please paste your agent.json configuration");
      return;
    }

    let config: Record<string, unknown>;
    try {
      config = JSON.parse(input);
    } catch {
      setError("Invalid JSON format. Please check your syntax.");
      return;
    }

    const validations: ValidationResult[] = [];

    // Required fields
    const requiredFields = [
      { key: "name", desc: "Agent name" },
      { key: "version", desc: "Version string" },
      { key: "description", desc: "Agent description" },
    ];

    for (const field of requiredFields) {
      if (!config[field.key] || String(config[field.key]).trim() === "") {
        validations.push({
          field: field.key,
          status: "fail",
          message: `Missing required field: ${field.desc}`,
          recommendation: `Add "${field.key}" to your agent.json`,
        });
      } else {
        validations.push({
          field: field.key,
          status: "pass",
          message: `${field.desc} is present`,
        });
      }
    }

    // Version format check
    if (config.version) {
      const semverRegex = /^\d+\.\d+\.\d+/;
      if (!semverRegex.test(config.version)) {
        validations.push({
          field: "version",
          status: "warn",
          message: "Version doesn't follow semver (e.g., 1.0.0)",
          recommendation: "Use semantic versioning for better compatibility",
        });
      } else {
        validations.push({
          field: "version",
          status: "pass",
          message: "Version follows semver format",
        });
      }
    }

    // Endpoint validation
    if (config.endpoint) {
      try {
        const url = new URL(String(config.endpoint));
        if (url.protocol === "http:" || url.protocol === "https:") {
          validations.push({
            field: "endpoint",
            status: "pass",
            message: "Endpoint URL is valid",
          });
        } else {
          validations.push({
            field: "endpoint",
            status: "fail",
            message: "Endpoint must use HTTP or HTTPS protocol",
            recommendation: "Use https:// for production endpoints",
          });
        }
      } catch {
        validations.push({
          field: "endpoint",
          status: "fail",
          message: "Invalid endpoint URL format",
          recommendation: "Provide a valid HTTP/HTTPS URL",
        });
      }
    } else {
      validations.push({
        field: "endpoint",
        status: "warn",
        message: "No endpoint specified",
        recommendation: "Add an endpoint if your agent is remotely accessible",
      });
    }

    // MCP compatibility checks
    if (config.mcp || config.mcpServers || config.capabilities?.mcp) {
      validations.push({
        field: "mcp",
        status: "pass",
        message: "MCP configuration detected",
      });

      // Check for MCP server format
      if (config.mcpServers && typeof config.mcpServers === "object") {
        const serverCount = Object.keys(config.mcpServers).length;
        validations.push({
          field: "mcpServers",
          status: "pass",
          message: `${serverCount} MCP server(s) configured`,
        });

        // Validate each server
        for (const [name, server] of Object.entries(config.mcpServers)) {
          const s = server as Record<string, unknown>;
          if (!s.command && !s.url) {
            validations.push({
              field: `mcpServers.${name}`,
              status: "fail",
              message: `Server "${name}" missing command or url`,
              recommendation: "Each MCP server needs either a command or url",
            });
          } else {
            validations.push({
              field: `mcpServers.${name}`,
              status: "pass",
              message: `Server "${name}" properly configured`,
            });
          }
        }
      }
    } else {
      validations.push({
        field: "mcp",
        status: "warn",
        message: "No MCP configuration found",
        recommendation: "Add MCP servers to enable Model Context Protocol support",
      });
    }

    // Capabilities check
    if (config.capabilities && typeof config.capabilities === "object") {
      const caps = Object.keys(config.capabilities);
      validations.push({
        field: "capabilities",
        status: "pass",
        message: `${caps.length} capability/capabilities declared`,
      });
    } else {
      validations.push({
        field: "capabilities",
        status: "warn",
        message: "No capabilities declared",
        recommendation: "Consider listing supported capabilities for better discovery",
      });
    }

    // Author/contact info
    if (config.author || config.maintainer || config.contact) {
      validations.push({
        field: "contact",
        status: "pass",
        message: "Contact information provided",
      });
    } else {
      validations.push({
        field: "contact",
        status: "warn",
        message: "No author/contact information",
        recommendation: "Add author or contact field for better trust signals",
      });
    }

    setResults(validations);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "fail":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "warn":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return "✓";
      case "fail":
        return "✗";
      case "warn":
        return "⚠";
      default:
        return "";
    }
  };

  const passCount = results.filter((r) => r.status === "pass").length;
  const failCount = results.filter((r) => r.status === "fail").length;
  const warnCount = results.filter((r) => r.status === "warn").length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuration Input</CardTitle>
          <CardDescription>
            Paste your agent.json content below. It will be validated locally in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder='{\n  "name": "my-agent",\n  "version": "1.0.0",\n  "description": "My AI agent",\n  ...\n}'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="font-mono text-sm min-h-[300px]"
          />
          <div className="flex gap-3">
            <Button onClick={validateConfig}>Validate Configuration</Button>
            <Button
              variant="outline"
              onClick={() => {
                setInput("");
                setResults([]);
                setError("");
              }}
            >
              Clear
            </Button>
          </div>
          {error && (
            <div className="p-4 border border-red-500/20 bg-red-500/10 text-red-500 rounded-lg">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Validation Summary</CardTitle>
              <div className="flex gap-3 mt-2">
                <Badge className={getStatusColor("pass")}>
                  {getStatusIcon("pass")} {passCount} Passed
                </Badge>
                <Badge className={getStatusColor("fail")}>
                  {getStatusIcon("fail")} {failCount} Failed
                </Badge>
                <Badge className={getStatusColor("warn")}>
                  {getStatusIcon("warn")} {warnCount} Warnings
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.map((result, idx) => (
                  <div key={idx}>
                    <div className="flex items-start gap-3">
                      <Badge className={getStatusColor(result.status)} variant="outline">
                        {getStatusIcon(result.status)}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-medium">{result.message}</div>
                        {result.recommendation && (
                          <div className="text-sm text-muted-foreground mt-1">
                            💡 {result.recommendation}
                          </div>
                        )}
                      </div>
                    </div>
                    {idx < results.length - 1 && <Separator className="mt-3" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {failCount > 0 && (
                <div className="p-3 border border-red-500/20 bg-red-500/5 rounded">
                  <strong>Critical issues found.</strong> Fix all failures before deploying.
                </div>
              )}
              {failCount === 0 && warnCount > 0 && (
                <div className="p-3 border border-yellow-500/20 bg-yellow-500/5 rounded">
                  <strong>Configuration looks good!</strong> Consider addressing warnings for better compatibility.
                </div>
              )}
              {failCount === 0 && warnCount === 0 && (
                <div className="p-3 border border-green-500/20 bg-green-500/5 rounded">
                  <strong>Excellent!</strong> Your configuration passes all checks.
                </div>
              )}
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-3">
                <li>Review the <Link href="/docs" className="text-primary hover:underline">agent specification docs</Link></li>
                <li>Check out <Link href="/observability" className="text-primary hover:underline">observability tools</Link> to monitor your agent</li>
                <li>Submit your agent to <Link href="/submit" className="text-primary hover:underline">forAgents.dev</Link></li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
