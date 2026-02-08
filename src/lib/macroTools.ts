import macroToolsData from "@/data/macro-tools.json";

export type MacroToolStep = {
  tool: string;
  server: string;
  description: string;
};

export type MacroTool = {
  id: string;
  name: string;
  description: string;
  steps: MacroToolStep[];
  tags: string[];
  author: string;
  createdAt: string; // YYYY-MM-DD
  installs: number;
};

export function getMacroTools(): MacroTool[] {
  return macroToolsData as MacroTool[];
}

export function getMacroToolById(id: string): MacroTool | undefined {
  const q = id.trim();
  return (macroToolsData as MacroTool[]).find((m) => m.id === q);
}

export function getMacroToolsByTag(tag: string): MacroTool[] {
  const q = tag.trim().toLowerCase();
  if (!q) return getMacroTools();
  return (macroToolsData as MacroTool[]).filter((m) => m.tags.some((t) => t.toLowerCase() === q));
}
