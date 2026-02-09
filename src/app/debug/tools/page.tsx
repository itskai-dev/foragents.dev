"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const toolTypes = [
  {
    id: "exec",
    name: "Command Execution (exec)",
    icon: "⚙️",
    failures: [
      {
        issue: "Command Not Found",
        causes: ["Binary not in PATH", "Package not installed", "Typo in command name"],
        solution: `// Check if command exists first
async function execSafe(command) {
  const which = await exec(\`which \${command.split(' ')[0]}\`).catch(() => null);
  
  if (!which) {
    throw new Error(\`Command not found: \${command}\`);
  }
  
  return await exec(command);
}`
      },
      {
        issue: "Permission Denied",
        causes: ["Need sudo", "File permissions", "SELinux/AppArmor blocking"],
        solution: `// Check permissions before exec
import { access, constants } from 'fs/promises';

async function canExecute(path) {
  try {
    await access(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

// Or request elevated execution
if (requiresSudo) {
  result = await exec(\`sudo \${command}\`, { 
    ask: 'always' 
  });
}`
      },
      {
        issue: "Timeout",
        causes: ["Long-running process", "Hanging command", "Network wait"],
        solution: `// Always set timeout
const result = await exec(command, {
  timeout: 30000  // 30 seconds
});

// For long processes, use background mode
const session = await exec(command, {
  background: true,
  yieldMs: 5000
});

// Check status later
const status = await process({ 
  action: 'status', 
  sessionId: session.id 
});`
      }
    ]
  },
  {
    id: "web",
    name: "Web Requests (fetch/web_fetch)",
    icon: "🌐",
    failures: [
      {
        issue: "Network Timeout",
        causes: ["Slow server", "Network congestion", "DNS issues"],
        solution: `// Retry with exponential backoff
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(), 
        10000 + (i * 5000)  // Increase timeout each retry
      );
      
      const response = await fetch(url, {
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      return response;
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      
      const delay = Math.pow(2, i) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}`
      },
      {
        issue: "429 Rate Limit",
        causes: ["Too many requests", "Exceeded quota", "No API key"],
        solution: `// Respect Retry-After header
async function fetchWithRateLimit(url, options = {}) {
  const response = await fetch(url, options);
  
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const delayMs = retryAfter 
      ? parseInt(retryAfter) * 1000 
      : 60000;
    
    console.log(\`Rate limited. Waiting \${delayMs}ms\`);
    await new Promise(r => setTimeout(r, delayMs));
    
    return fetchWithRateLimit(url, options);
  }
  
  return response;
}`
      },
      {
        issue: "CORS Blocked",
        causes: ["Browser security", "Missing headers", "Preflight failed"],
        solution: `// Use server-side fetch or proxy
// Option 1: Use web_fetch tool (server-side)
const content = await web_fetch({ url });

// Option 2: Proxy through your server
const response = await fetch(\`/api/proxy?url=\${encodeURIComponent(url)}\`);

// Option 3: CORS proxy (dev only!)
const response = await fetch(\`https://corsproxy.io/?\${url}\`);`
      }
    ]
  },
  {
    id: "file",
    name: "File Operations (read/write)",
    icon: "📁",
    failures: [
      {
        issue: "File Not Found",
        causes: ["Wrong path", "Relative vs absolute", "File deleted"],
        solution: `// Always check existence first
import { access } from 'fs/promises';

async function safeRead(path) {
  try {
    await access(path);
  } catch {
    throw new Error(\`File not found: \${path}\`);
  }
  
  return await read({ path });
}

// Use absolute paths
import { resolve } from 'path';
const absolutePath = resolve(process.cwd(), relativePath);`
      },
      {
        issue: "Permission Denied",
        causes: ["No read/write permission", "Directory not writable", "File locked"],
        solution: `// Check permissions
import { access, constants } from 'fs/promises';

async function canWrite(path) {
  try {
    await access(path, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

// Create parent directories
import { mkdir } from 'fs/promises';
import { dirname } from 'path';

await mkdir(dirname(filePath), { recursive: true });
await write({ path: filePath, content });`
      },
      {
        issue: "Encoding Issues",
        causes: ["Binary vs text", "Wrong charset", "Unicode errors"],
        solution: `// Specify encoding explicitly
const text = await read({ 
  path: '/tmp/file.txt',
  encoding: 'utf-8' 
});

// For binary data
const buffer = await read({ 
  path: '/tmp/image.png',
  encoding: 'binary'
});

// Handle special characters
const content = text.normalize('NFC');  // Unicode normalization`
      }
    ]
  },
  {
    id: "browser",
    name: "Browser Automation (browser tool)",
    icon: "🌐",
    failures: [
      {
        issue: "Element Not Found",
        causes: ["Wrong selector", "Element not loaded", "Dynamic content", "Frame/shadow DOM"],
        solution: `// Wait for element
await browser({
  action: 'act',
  request: {
    kind: 'wait',
    selector: '.my-element',
    timeMs: 5000
  }
});

// Then interact
await browser({
  action: 'act',
  request: {
    kind: 'click',
    selector: '.my-element'
  }
});

// Better: use snapshot refs
const snap = await browser({ action: 'snapshot', refs: 'aria' });
// Use ref from snapshot: e12, button-submit, etc.
await browser({
  action: 'act',
  request: { kind: 'click', ref: 'e12' },
  targetId: snap.targetId  // Keep same tab
});`
      },
      {
        issue: "Timeout Waiting for Page",
        causes: ["Slow page load", "Infinite loading", "JavaScript errors"],
        solution: `// Increase timeout
await browser({
  action: 'navigate',
  targetUrl: 'https://slow-site.com',
  timeoutMs: 60000  // 60 seconds
});

// Wait for specific element instead of full load
await browser({ action: 'navigate', targetUrl: url });
await browser({
  action: 'act',
  request: {
    kind: 'wait',
    selector: '#content-loaded',
    timeMs: 10000
  }
});`
      },
      {
        issue: "Popup/Modal Blocking",
        causes: ["Alert dialog", "Cookie consent", "Login modal"],
        solution: `// Handle dialogs
await browser({
  action: 'dialog',
  accept: true,
  promptText: 'optional input'
});

// Close modals first
const snapshot = await browser({ action: 'snapshot' });
// Find close button in snapshot
await browser({
  action: 'act',
  request: { kind: 'click', ref: 'close-button' }
});

// Then proceed with main action`
      }
    ]
  }
];

const retryStrategies = [
  {
    name: "Exponential Backoff",
    description: "Increase delay between retries exponentially",
    code: `async function withExponentialBackoff(fn, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = Math.min(
        Math.pow(2, i) * 1000,  // Exponential
        30000  // Max 30 seconds
      );
      
      console.log(\`Retry \${i + 1}/\${maxRetries} after \${delay}ms\`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// Usage
const result = await withExponentialBackoff(
  () => exec('flaky-command')
);`,
    useCase: "Transient failures, rate limits, network issues"
  },
  {
    name: "Circuit Breaker",
    description: "Stop retrying after consecutive failures",
    code: `class CircuitBreaker {
  constructor(threshold = 5, resetTimeout = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.state = 'CLOSED';  // CLOSED, OPEN, HALF_OPEN
    this.resetTimeout = resetTimeout;
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker is OPEN');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
    }
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      setTimeout(() => {
        this.state = 'HALF_OPEN';
        this.failureCount = 0;
      }, this.resetTimeout);
    }
  }
}

// Usage
const breaker = new CircuitBreaker();
const result = await breaker.execute(() => callExternalAPI());`,
    useCase: "Protect against cascading failures, external service down"
  },
  {
    name: "Fallback Chain",
    description: "Try alternative methods if primary fails",
    code: `async function withFallback(methods) {
  const errors = [];
  
  for (const method of methods) {
    try {
      return await method();
    } catch (error) {
      console.log(\`Method failed: \${error.message}\`);
      errors.push(error);
    }
  }
  
  throw new Error(
    \`All methods failed: \${errors.map(e => e.message).join(', ')}\`
  );
}

// Usage
const data = await withFallback([
  // Try primary API
  () => fetch('https://api.example.com/data').then(r => r.json()),
  
  // Fall back to cache
  () => readCache('data'),
  
  // Last resort: static data
  () => Promise.resolve(DEFAULT_DATA)
]);`,
    useCase: "Multiple data sources, graceful degradation"
  }
];

const errorRecovery = [
  {
    scenario: "Tool execution failed mid-workflow",
    strategy: "Checkpoint and resume",
    code: `class WorkflowExecutor {
  constructor() {
    this.checkpoints = new Map();
  }

  async execute(steps) {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      // Check if already completed
      if (this.checkpoints.has(step.id)) {
        console.log(\`Skipping completed step: \${step.id}\`);
        continue;
      }

      try {
        const result = await step.execute();
        
        // Save checkpoint
        this.checkpoints.set(step.id, {
          result,
          timestamp: Date.now()
        });
        
      } catch (error) {
        console.error('Step ' + step.id + ' failed:', error);
        
        // Save partial progress
        await this.saveCheckpoints();
        
        throw new Error('Workflow failed at step ' + (i + 1) + '/' + steps.length);
      }
    }
    
    return this.checkpoints;
  }

  async saveCheckpoints() {
    await write({
      path: '/tmp/workflow-checkpoints.json',
      content: JSON.stringify(Array.from(this.checkpoints.entries()))
    });
  }

  async loadCheckpoints() {
    try {
      const data = await read({ path: '/tmp/workflow-checkpoints.json' });
      this.checkpoints = new Map(JSON.parse(data));
    } catch {
      // No checkpoints to load
    }
  }
}`
  },
  {
    scenario: "Network request hanging",
    strategy: "Timeout with cleanup",
    code: `async function fetchWithTimeout(url, timeoutMs = 10000) {
  const controller = new AbortController();
  
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.log('Request timeout, aborting...');
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error(\`Request timeout after \${timeoutMs}ms\`);
    }
    
    throw error;
  }
}`
  },
  {
    scenario: "Multiple tools needed, some fail",
    strategy: "Parallel execution with Promise.allSettled",
    code: `async function executeToolsParallel(tools) {
  const results = await Promise.allSettled(
    tools.map(tool => tool.execute())
  );

  const succeeded = [];
  const failed = [];

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      succeeded.push({
        tool: tools[i],
        result: result.value
      });
    } else {
      failed.push({
        tool: tools[i],
        error: result.reason
      });
    }
  });

  // Decide what to do based on success rate
  if (failed.length === tools.length) {
    throw new Error('All tools failed');
  }

  if (failed.length > 0) {
    console.warn(\`\${failed.length} tools failed, continuing with \${succeeded.length} results\`);
  }

  return { succeeded, failed };
}`
  }
];

export default function ToolCallInspectorPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const displayedTypes = selectedType 
    ? toolTypes.filter(t => t.id === selectedType)
    : toolTypes;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-5xl">🔧</span>
          <div>
            <h1 className="text-4xl font-bold">Tool Call Inspector</h1>
            <p className="text-muted-foreground text-lg mt-1">
              Debug tool execution failures and implement recovery patterns
            </p>
          </div>
        </div>
      </div>

      {/* Tool Type Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedType === null ? "default" : "outline"}
            onClick={() => setSelectedType(null)}
          >
            All Tools
          </Button>
          {toolTypes.map(type => (
            <Button
              key={type.id}
              variant={selectedType === type.id ? "default" : "outline"}
              onClick={() => setSelectedType(type.id === selectedType ? null : type.id)}
            >
              {type.icon} {type.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Tool Failure Modes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Common Failure Modes</h2>

        <div className="space-y-8">
          {displayedTypes.map(type => (
            <div key={type.id}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">{type.icon}</span>
                {type.name}
              </h3>

              <div className="grid gap-4">
                {type.failures.map((failure, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <CardTitle className="text-lg">{failure.issue}</CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {failure.causes.map((cause, j) => (
                          <Badge key={j} variant="outline" className="text-xs">
                            {cause}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Solution</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyCode(failure.solution, `${type.id}-${i}`)}
                        >
                          {copiedCode === `${type.id}-${i}` ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                      <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
                        <code>{failure.solution}</code>
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Retry Strategies */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Retry Strategies</h2>

        <div className="grid gap-6">
          {retryStrategies.map((strategy, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>{strategy.name}</CardTitle>
                <CardDescription>{strategy.description}</CardDescription>
                <Badge variant="outline" className="w-fit mt-2">
                  Use case: {strategy.useCase}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Implementation</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyCode(strategy.code, `retry-${i}`)}
                  >
                    {copiedCode === `retry-${i}` ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
                  <code>{strategy.code}</code>
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Error Recovery Patterns */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Error Recovery Patterns</h2>

        <div className="grid gap-6">
          {errorRecovery.map((pattern, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>Scenario: {pattern.scenario}</CardTitle>
                <Badge variant="outline" className="w-fit mt-2">
                  Strategy: {pattern.strategy}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Implementation</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyCode(pattern.code, `recovery-${i}`)}
                  >
                    {copiedCode === `recovery-${i}` ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
                  <code>{pattern.code}</code>
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Debugging Checklist */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Debugging Checklist</h2>

        <Card>
          <CardHeader>
            <CardTitle>When a tool call fails...</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {[
                {
                  step: "Check the error message",
                  details: "Look for error codes, stack traces, and specific failure points"
                },
                {
                  step: "Verify inputs",
                  details: "Confirm parameters are correct type and format"
                },
                {
                  step: "Test in isolation",
                  details: "Run the tool call separately from main workflow"
                },
                {
                  step: "Check permissions",
                  details: "Ensure agent has required access (filesystem, network, etc.)"
                },
                {
                  step: "Add timeout",
                  details: "Prevent hanging on slow or stuck operations"
                },
                {
                  step: "Implement retry",
                  details: "Use exponential backoff for transient failures"
                },
                {
                  step: "Add fallback",
                  details: "Have alternative approaches if primary method fails"
                },
                {
                  step: "Log everything",
                  details: "Capture inputs, outputs, errors, and timing for debugging"
                }
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{item.step}</div>
                    <div className="text-sm text-muted-foreground">{item.details}</div>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
