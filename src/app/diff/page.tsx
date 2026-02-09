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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { GitCompare, LayoutList, Columns2, Plus, Minus, FileText } from "lucide-react";
import * as Diff from "diff";
import skillVersionsData from "@/data/skill-versions.json";

interface SkillVersion {
  version: string;
  releaseDate: string;
  content: string;
}

interface Skill {
  id: string;
  name: string;
  versions: SkillVersion[];
}

type ViewMode = "unified" | "split";

export default function DiffPage() {
  const skills = skillVersionsData as Skill[];
  
  const [selectedSkillId, setSelectedSkillId] = useState<string>(skills[0]?.id || "");
  const [version1, setVersion1] = useState<string>("");
  const [version2, setVersion2] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("unified");

  const selectedSkill = useMemo(
    () => skills.find((s) => s.id === selectedSkillId),
    [selectedSkillId, skills]
  );

  // Auto-select first two versions when skill changes
  useMemo(() => {
    if (selectedSkill && selectedSkill.versions.length > 0) {
      const versions = selectedSkill.versions;
      setVersion1(versions[0].version);
      setVersion2(versions[versions.length > 1 ? 1 : 0].version);
    }
  }, [selectedSkill]);

  const version1Content = useMemo(
    () => selectedSkill?.versions.find((v) => v.version === version1)?.content || "",
    [selectedSkill, version1]
  );

  const version2Content = useMemo(
    () => selectedSkill?.versions.find((v) => v.version === version2)?.content || "",
    [selectedSkill, version2]
  );

  // Calculate diff
  const diffResult = useMemo(() => {
    if (!version1Content || !version2Content) return null;
    
    const changes = Diff.diffLines(version1Content, version2Content);
    
    let linesAdded = 0;
    let linesRemoved = 0;
    
    changes.forEach((change) => {
      if (change.added) {
        linesAdded += change.count || 0;
      } else if (change.removed) {
        linesRemoved += change.count || 0;
      }
    });
    
    return {
      changes,
      linesAdded,
      linesRemoved,
      filesChanged: 1, // In this simple case, we're comparing one "file"
    };
  }, [version1Content, version2Content]);

  const renderUnifiedDiff = () => {
    if (!diffResult) return null;

    let lineNumber1 = 1;
    let lineNumber2 = 1;

    return (
      <div className="font-mono text-sm overflow-auto">
        {diffResult.changes.map((change, idx) => {
          const lines = change.value.split("\n").filter((line, i, arr) => {
            // Keep all lines except the last empty one
            return i < arr.length - 1 || line !== "";
          });

          return lines.map((line, lineIdx) => {
            const currentLine1 = change.removed ? lineNumber1++ : change.added ? "" : lineNumber1++;
            const currentLine2 = change.added ? lineNumber2++ : change.removed ? "" : lineNumber2++;

            return (
              <div
                key={`${idx}-${lineIdx}`}
                className={`flex border-b border-white/5 ${
                  change.added
                    ? "bg-green-500/10 text-green-400"
                    : change.removed
                    ? "bg-red-500/10 text-red-400"
                    : "text-white/70"
                }`}
              >
                <div className="flex-shrink-0 w-16 px-2 py-1 text-right text-muted-foreground border-r border-white/5 select-none">
                  {currentLine1}
                </div>
                <div className="flex-shrink-0 w-16 px-2 py-1 text-right text-muted-foreground border-r border-white/5 select-none">
                  {currentLine2}
                </div>
                <div className="flex-shrink-0 w-8 px-2 py-1 text-center border-r border-white/5">
                  {change.added ? (
                    <Plus className="w-3 h-3 inline text-green-400" />
                  ) : change.removed ? (
                    <Minus className="w-3 h-3 inline text-red-400" />
                  ) : (
                    ""
                  )}
                </div>
                <div className="flex-1 px-4 py-1 overflow-x-auto whitespace-pre">
                  {line || " "}
                </div>
              </div>
            );
          });
        })}
      </div>
    );
  };

  const renderSplitDiff = () => {
    if (!diffResult) return null;

    let lineNumber1 = 1;
    let lineNumber2 = 1;

    // Build separate arrays for left and right sides
    const leftLines: Array<{ lineNum: number; content: string; type: "removed" | "unchanged" }> = [];
    const rightLines: Array<{ lineNum: number; content: string; type: "added" | "unchanged" }> = [];

    diffResult.changes.forEach((change) => {
      const lines = change.value.split("\n").filter((line, i, arr) => {
        return i < arr.length - 1 || line !== "";
      });

      lines.forEach((line) => {
        if (change.removed) {
          leftLines.push({ lineNum: lineNumber1++, content: line, type: "removed" });
        } else if (change.added) {
          rightLines.push({ lineNum: lineNumber2++, content: line, type: "added" });
        } else {
          leftLines.push({ lineNum: lineNumber1++, content: line, type: "unchanged" });
          rightLines.push({ lineNum: lineNumber2++, content: line, type: "unchanged" });
        }
      });
    });

    // Pad arrays to equal length
    const maxLength = Math.max(leftLines.length, rightLines.length);
    while (leftLines.length < maxLength) {
      leftLines.push({ lineNum: 0, content: "", type: "unchanged" });
    }
    while (rightLines.length < maxLength) {
      rightLines.push({ lineNum: 0, content: "", type: "unchanged" });
    }

    return (
      <div className="grid grid-cols-2 gap-px bg-white/5 font-mono text-sm overflow-auto">
        {/* Left side (old version) */}
        <div className="overflow-auto">
          <div className="sticky top-0 bg-[#1a1a1a] border-b border-white/10 px-4 py-2 text-sm font-semibold text-white z-10">
            {version1}
          </div>
          {leftLines.map((line, idx) => (
            <div
              key={`left-${idx}`}
              className={`flex border-b border-white/5 ${
                line.type === "removed"
                  ? "bg-red-500/10 text-red-400"
                  : "text-white/70"
              }`}
            >
              <div className="flex-shrink-0 w-16 px-2 py-1 text-right text-muted-foreground border-r border-white/5 select-none">
                {line.lineNum || ""}
              </div>
              <div className="flex-shrink-0 w-8 px-2 py-1 text-center border-r border-white/5">
                {line.type === "removed" && <Minus className="w-3 h-3 inline text-red-400" />}
              </div>
              <div className="flex-1 px-4 py-1 overflow-x-auto whitespace-pre">
                {line.content || " "}
              </div>
            </div>
          ))}
        </div>

        {/* Right side (new version) */}
        <div className="overflow-auto">
          <div className="sticky top-0 bg-[#1a1a1a] border-b border-white/10 px-4 py-2 text-sm font-semibold text-white z-10">
            {version2}
          </div>
          {rightLines.map((line, idx) => (
            <div
              key={`right-${idx}`}
              className={`flex border-b border-white/5 ${
                line.type === "added"
                  ? "bg-green-500/10 text-green-400"
                  : "text-white/70"
              }`}
            >
              <div className="flex-shrink-0 w-16 px-2 py-1 text-right text-muted-foreground border-r border-white/5 select-none">
                {line.lineNum || ""}
              </div>
              <div className="flex-shrink-0 w-8 px-2 py-1 text-center border-r border-white/5">
                {line.type === "added" && <Plus className="w-3 h-3 inline text-green-400" />}
              </div>
              <div className="flex-1 px-4 py-1 overflow-x-auto whitespace-pre">
                {line.content || " "}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 text-xs bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30">
            <GitCompare className="w-3 h-3 mr-1 inline" />
            Diff Viewer
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Skill Diff Viewer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Compare different versions of agent skills side-by-side. Track changes, understand evolution, and see what&apos;s new.
          </p>
        </div>
      </section>

      {/* Controls */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <Card className="bg-card/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Configuration</CardTitle>
            <CardDescription>Select skill and versions to compare</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Skill Selection */}
              <div className="space-y-2">
                <Label htmlFor="skill" className="text-sm font-medium text-white">
                  Skill
                </Label>
                <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
                  <SelectTrigger id="skill" className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    {skills.map((skill) => (
                      <SelectItem
                        key={skill.id}
                        value={skill.id}
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        {skill.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Version 1 Selection */}
              <div className="space-y-2">
                <Label htmlFor="version1" className="text-sm font-medium text-white">
                  Version 1 (Old)
                </Label>
                <Select value={version1} onValueChange={setVersion1}>
                  <SelectTrigger id="version1" className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    {selectedSkill?.versions.map((version) => (
                      <SelectItem
                        key={version.version}
                        value={version.version}
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        v{version.version}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Version 2 Selection */}
              <div className="space-y-2">
                <Label htmlFor="version2" className="text-sm font-medium text-white">
                  Version 2 (New)
                </Label>
                <Select value={version2} onValueChange={setVersion2}>
                  <SelectTrigger id="version2" className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    {selectedSkill?.versions.map((version) => (
                      <SelectItem
                        key={version.version}
                        value={version.version}
                        className="text-white focus:bg-white/10 focus:text-white"
                      >
                        v{version.version}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <Label className="text-sm font-medium text-white">View Mode</Label>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "unified" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("unified")}
                  className={
                    viewMode === "unified"
                      ? "bg-[#06D6A0] text-black hover:bg-[#06D6A0]/90"
                      : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  }
                >
                  <LayoutList className="w-4 h-4 mr-2" />
                  Unified
                </Button>
                <Button
                  variant={viewMode === "split" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("split")}
                  className={
                    viewMode === "split"
                      ? "bg-[#06D6A0] text-black hover:bg-[#06D6A0]/90"
                      : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  }
                >
                  <Columns2 className="w-4 h-4 mr-2" />
                  Split
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Stats Bar */}
      {diffResult && (
        <section className="max-w-7xl mx-auto px-4 pb-8">
          <Card className="bg-gradient-to-br from-[#06D6A0]/10 via-card/80 to-purple/5 border-[#06D6A0]/30">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-green-500/10 text-green-400">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Lines Added</div>
                    <div className="text-2xl font-bold text-green-400">
                      {diffResult.linesAdded}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-red-500/10 text-red-400">
                    <Minus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Lines Removed</div>
                    <div className="text-2xl font-bold text-red-400">
                      {diffResult.linesRemoved}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-[#06D6A0]/10 text-[#06D6A0]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Files Changed</div>
                    <div className="text-2xl font-bold text-[#06D6A0]">
                      {diffResult.filesChanged}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Diff View */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <Card className="bg-card/50 border-white/10 overflow-hidden">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white flex items-center gap-2">
              <GitCompare className="w-5 h-5" />
              Comparing {version1} → {version2}
            </CardTitle>
            <CardDescription>
              {selectedSkill?.name} - {viewMode === "unified" ? "Unified" : "Split"} view
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 max-h-[600px] overflow-auto">
            {viewMode === "unified" ? renderUnifiedDiff() : renderSplitDiff()}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
