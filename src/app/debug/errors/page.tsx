"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import debugErrors from "@/data/debug-errors.json";

const severityColors = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300"
};

export default function ErrorReferencePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    return debugErrors.categories.map(category => {
      const filteredErrors = category.errors.filter(error => {
        const matchesSearch = searchQuery === "" || 
          error.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          error.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          error.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesSeverity = !selectedSeverity || error.severity === selectedSeverity;
        
        return matchesSearch && matchesSeverity;
      });

      return { ...category, errors: filteredErrors };
    }).filter(category => 
      (!selectedCategory || category.id === selectedCategory) &&
      category.errors.length > 0
    );
  }, [searchQuery, selectedCategory, selectedSeverity]);

  const totalErrors = useMemo(() => {
    return filteredCategories.reduce((sum, cat) => sum + cat.errors.length, 0);
  }, [filteredCategories]);

  const copyToClipboard = async (text: string, code: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-5xl">🔍</span>
          <div>
            <h1 className="text-4xl font-bold">Error Code Reference</h1>
            <p className="text-muted-foreground text-lg mt-1">
              Comprehensive database of {debugErrors.categories.reduce((sum, cat) => sum + cat.errors.length, 0)} common agent errors
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              placeholder="Search errors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="flex-1"
            >
              All Categories
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={selectedSeverity === null ? "default" : "outline"}
              onClick={() => setSelectedSeverity(null)}
              className="flex-1"
            >
              All Severities
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {debugErrors.categories.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Severity Filters */}
        <div className="flex flex-wrap gap-2">
          {['critical', 'high', 'medium', 'low'].map(severity => (
            <Button
              key={severity}
              variant={selectedSeverity === severity ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSeverity(selectedSeverity === severity ? null : severity)}
              className={selectedSeverity === severity ? severityColors[severity as keyof typeof severityColors] : ""}
            >
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </Button>
          ))}
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {totalErrors} error{totalErrors !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Error Categories */}
      <div className="space-y-8">
        {filteredCategories.map(category => (
          <section key={category.id} id={category.id}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
              <p className="text-muted-foreground">{category.description}</p>
            </div>

            <div className="space-y-6">
              {category.errors.map(error => (
                <Card key={error.code} id={error.code} className="scroll-mt-20">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                            {error.code}
                          </code>
                          <Badge 
                            variant="outline" 
                            className={severityColors[error.severity as keyof typeof severityColors]}
                          >
                            {error.severity}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{error.name}</CardTitle>
                        <p className="text-muted-foreground mt-2">{error.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Common Causes */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <span>🔎</span>
                        Common Causes
                      </h4>
                      <ul className="space-y-2">
                        {error.causes.map((cause, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-muted-foreground mt-0.5">•</span>
                            <span>{cause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Fix Steps */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <span>✅</span>
                        How to Fix
                      </h4>
                      <ol className="space-y-2">
                        {error.fixes.map((fix, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-muted-foreground font-medium">{i + 1}.</span>
                            <span>{fix}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Code Example */}
                    {error.example && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold flex items-center gap-2">
                            <span>💻</span>
                            Code Example
                          </h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(error.example, error.code)}
                          >
                            {copiedCode === error.code ? "Copied!" : "Copy"}
                          </Button>
                        </div>
                        <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto border">
                          <code>{error.example}</code>
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* No Results */}
      {totalErrors === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No errors match your filters</p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
                setSelectedSeverity(null);
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="mt-12 p-6 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-3">🤖 For AI Agents</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Machine-readable format:</strong> Access raw JSON at{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded">/data/debug-errors.json</code>
          </p>
          <p>
            <strong>Direct error lookup:</strong> Append <code className="bg-muted px-1.5 py-0.5 rounded">#ERROR_CODE</code>{" "}
            to URL to jump to specific error
          </p>
          <p>
            <strong>Self-debugging:</strong> Parse error messages, match to codes, apply fixes automatically
          </p>
        </div>
      </div>
    </div>
  );
}
