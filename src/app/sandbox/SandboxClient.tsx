"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

type EndpointTest = {
  url: string;
  reachable: boolean;
  reason?: string;
};

const SAMPLE_TEMPLATES = {
  basic: {
    name: "Basic Agent",
    config: {
      name: "My Agent",
      version: "1.0.0",
      description: "A simple agent configuration",
      capabilities: ["chat", "search"],
      endpoints: {
        chat: "https://api.example.com/chat",
      },
    },
  },
  mcp: {
    name: "MCP-Enabled Agent",
    config: {
      name: "MCP Agent",
      version: "1.0.0",
      description: "Agent with Model Context Protocol support",
      capabilities: ["chat", "mcp"],
      endpoints: {
        chat: "https://api.example.com/chat",
        mcp: "https://api.example.com/mcp",
      },
      mcp: {
        version: "2024-11-05",
        servers: [
          {
            name: "filesystem",
            command: "npx",
            args: ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
          },
        ],
      },
    },
  },
  multiTool: {
    name: "Multi-Tool Agent",
    config: {
      name: "Multi-Tool Agent",
      version: "1.0.0",
      description: "Agent with multiple tool integrations",
      capabilities: ["chat", "search", "code", "browse"],
      endpoints: {
        chat: "https://api.example.com/chat",
        search: "https://api.example.com/search",
        code: "https://api.example.com/code",
      },
      tools: [
        {
          name: "web_search",
          type: "builtin",
        },
        {
          name: "code_interpreter",
          type: "custom",
          endpoint: "https://api.example.com/tools/code",
        },
      ],
    },
  },
};

function validateAgentConfig(configText: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // Check if empty
  if (!configText.trim()) {
    result.valid = false;
    result.errors.push("Configuration is empty");
    return result;
  }

  // Check JSON syntax
  let config: Record<string, unknown>;
  try {
    config = JSON.parse(configText);
  } catch (err) {
    result.valid = false;
    result.errors.push(`Invalid JSON: ${err instanceof Error ? err.message : "Parse error"}`);
    return result;
  }

  // Check required fields
  const requiredFields = ["name", "version", "description"];
  for (const field of requiredFields) {
    if (!(field in config)) {
      result.valid = false;
      result.errors.push(`Missing required field: ${field}`);
    } else if (typeof config[field] !== "string") {
      result.valid = false;
      result.errors.push(`Field '${field}' must be a string`);
    } else if (!(config[field] as string).trim()) {
      result.valid = false;
      result.errors.push(`Field '${field}' cannot be empty`);
    }
  }

  // Check capabilities (optional but recommended)
  if (!("capabilities" in config)) {
    result.warnings.push("No 'capabilities' field found (recommended)");
  } else if (!Array.isArray(config.capabilities)) {
    result.errors.push("Field 'capabilities' must be an array");
    result.valid = false;
  }

  // Check endpoints
  if (!("endpoints" in config)) {
    result.warnings.push("No 'endpoints' field found");
  } else if (typeof config.endpoints !== "object" || config.endpoints === null) {
    result.errors.push("Field 'endpoints' must be an object");
    result.valid = false;
  } else {
    const endpoints = config.endpoints as Record<string, unknown>;
    if (Object.keys(endpoints).length === 0) {
      result.warnings.push("No endpoints defined");
    }
  }

  // Version format check
  if (config.version && typeof config.version === "string") {
    const versionPattern = /^\d+\.\d+\.\d+$/;
    if (!versionPattern.test(config.version)) {
      result.warnings.push("Version should follow semver format (e.g., 1.0.0)");
    }
  }

  return result;
}

function testEndpoints(configText: string): EndpointTest[] {
  const results: EndpointTest[] = [];

  try {
    const config = JSON.parse(configText) as Record<string, unknown>;
    const endpoints = config.endpoints as Record<string, unknown> | undefined;

    if (!endpoints || typeof endpoints !== "object") {
      return results;
    }

    for (const [key, value] of Object.entries(endpoints)) {
      if (typeof value !== "string") {
        results.push({
          url: `${key}: ${String(value)}`,
          reachable: false,
          reason: "URL must be a string",
        });
        continue;
      }

      try {
        const url = new URL(value);
        
        // Check if HTTPS (recommended)
        if (url.protocol !== "https:") {
          results.push({
            url: value,
            reachable: true,
            reason: "Warning: Not using HTTPS",
          });
        } else {
          results.push({
            url: value,
            reachable: true,
          });
        }
      } catch {
        results.push({
          url: value,
          reachable: false,
          reason: "Invalid URL format",
        });
      }
    }
  } catch {
    // JSON parse error - already handled by validation
  }

  return results;
}

export default function SandboxClient() {
  const [configText, setConfigText] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [endpointTests, setEndpointTests] = useState<EndpointTest[]>([]);

  const handleValidate = () => {
    const result = validateAgentConfig(configText);
    setValidation(result);
    setEndpointTests([]);
  };

  const handleTestEndpoints = () => {
    const tests = testEndpoints(configText);
    setEndpointTests(tests);
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const template = e.target.value;
    if (template && template in SAMPLE_TEMPLATES) {
      const config = SAMPLE_TEMPLATES[template as keyof typeof SAMPLE_TEMPLATES].config;
      setConfigText(JSON.stringify(config, null, 2));
      setValidation(null);
      setEndpointTests([]);
    }
  };

  const validationColor = useMemo(() => {
    if (!validation) return "";
    if (validation.valid && validation.warnings.length === 0) return "text-emerald-400";
    if (validation.valid && validation.warnings.length > 0) return "text-amber-400";
    return "text-red-400";
  }, [validation]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] max-w-[520px] max-h-[520px] bg-[#06D6A0]/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Agent Sandbox</h1>
          <p className="text-muted-foreground max-w-3xl">
            Test and validate your agent.json configurations. Check syntax, required fields, and endpoint accessibility.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Editor Panel */}
          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#06D6A0]">Configuration Editor</h2>
                <div className="flex items-center gap-2">
                  <label htmlFor="template-select" className="text-sm text-slate-300">
                    Template:
                  </label>
                  <select
                    id="template-select"
                    onChange={handleTemplateChange}
                    className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#06D6A0] focus:ring-1 focus:ring-[#06D6A0]"
                  >
                    <option value="">Select...</option>
                    {Object.entries(SAMPLE_TEMPLATES).map(([key, { name }]) => (
                      <option key={key} value={key}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <textarea
                value={configText}
                onChange={(e) => {
                  setConfigText(e.target.value);
                  setValidation(null);
                  setEndpointTests([]);
                }}
                placeholder='{\n  "name": "My Agent",\n  "version": "1.0.0",\n  "description": "Agent description",\n  "capabilities": ["chat"],\n  "endpoints": {\n    "chat": "https://api.example.com/chat"\n  }\n}'
                className="w-full h-[400px] bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#06D6A0] focus:ring-1 focus:ring-[#06D6A0] resize-none"
                spellCheck={false}
              />

              <div className="flex items-center gap-3 mt-4">
                <Button
                  onClick={handleValidate}
                  disabled={!configText.trim()}
                  className="bg-[#06D6A0] hover:bg-[#06D6A0]/90 text-black font-semibold"
                >
                  Validate
                </Button>

                <Button
                  onClick={handleTestEndpoints}
                  disabled={!configText.trim()}
                  variant="outline"
                  className="border-white/10 hover:bg-white/5"
                >
                  Test Endpoints
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setConfigText("");
                    setValidation(null);
                    setEndpointTests([]);
                  }}
                  className="text-sm text-slate-400 hover:text-slate-200 transition-colors ml-auto"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-[#06D6A0] mb-4">Results</h2>

              {!validation && endpointTests.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Click "Validate" to check your configuration or "Test Endpoints" to verify URLs.
                </div>
              ) : null}

              {/* Validation Results */}
              {validation ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`text-sm font-semibold ${validationColor}`}>
                        {validation.valid && validation.warnings.length === 0
                          ? "✓ Valid Configuration"
                          : validation.valid
                            ? "⚠ Valid with Warnings"
                            : "✗ Invalid Configuration"}
                      </div>
                    </div>

                    {validation.errors.length > 0 ? (
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-red-400 mb-2">Errors:</div>
                        <ul className="space-y-1">
                          {validation.errors.map((error, i) => (
                            <li key={i} className="text-xs text-red-300 flex items-start gap-2">
                              <span className="text-red-400 mt-0.5">•</span>
                              <span>{error}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {validation.warnings.length > 0 ? (
                      <div>
                        <div className="text-xs font-semibold text-amber-400 mb-2">Warnings:</div>
                        <ul className="space-y-1">
                          {validation.warnings.map((warning, i) => (
                            <li key={i} className="text-xs text-amber-300 flex items-start gap-2">
                              <span className="text-amber-400 mt-0.5">•</span>
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {validation.valid && validation.errors.length === 0 && validation.warnings.length === 0 ? (
                      <div className="text-xs text-emerald-300">
                        All required fields are present and valid.
                      </div>
                    ) : null}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <strong>Required fields:</strong> name, version, description
                    <br />
                    <strong>Recommended fields:</strong> capabilities, endpoints
                  </div>
                </div>
              ) : null}

              {/* Endpoint Test Results */}
              {endpointTests.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                    <div className="text-sm font-semibold text-[#06D6A0] mb-3">
                      Endpoint Tests ({endpointTests.length})
                    </div>

                    <div className="space-y-2">
                      {endpointTests.map((test, i) => (
                        <div
                          key={i}
                          className="rounded border border-white/5 bg-black/20 px-3 py-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-mono text-slate-300 break-all">
                                {test.url}
                              </div>
                              {test.reason ? (
                                <div className="text-xs text-amber-300 mt-1">{test.reason}</div>
                              ) : null}
                            </div>
                            <div
                              className={`text-xs font-semibold ${
                                test.reachable
                                  ? test.reason
                                    ? "text-amber-400"
                                    : "text-emerald-400"
                                  : "text-red-400"
                              }`}
                            >
                              {test.reachable ? (test.reason ? "⚠" : "✓") : "✗"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Note: This performs basic URL validation only. Actual endpoint availability requires
                    network requests.
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Related Tools */}
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-[#06D6A0] mb-2">Related Tools</div>
            <div className="flex flex-wrap gap-2">
              <a
                href="/playground"
                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-black/20 hover:bg-black/30 text-slate-300 hover:text-white transition-colors"
              >
                API Playground →
              </a>
              <a
                href="/diagnostics"
                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-black/20 hover:bg-black/30 text-slate-300 hover:text-white transition-colors"
              >
                Diagnostics →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
