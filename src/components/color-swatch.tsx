"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ColorSwatchProps {
  name: string;
  hex: string;
  description: string;
  usage: string;
}

export function ColorSwatch({ name, hex, description, usage }: ColorSwatchProps) {
  return (
    <Card className="bg-card/50 border-white/5 overflow-hidden">
      <div
        className="h-32 relative group cursor-pointer"
        style={{ backgroundColor: hex }}
        onClick={() => {
          navigator.clipboard.writeText(hex);
        }}
        title="Click to copy"
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <Badge variant="outline" className="bg-black/60 text-white border-white/20">
            Click to copy
          </Badge>
        </div>
      </div>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <code className="text-sm font-mono text-[#06D6A0]">{hex}</code>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-1">{description}</p>
        <p className="text-xs text-muted-foreground/70">Usage: {usage}</p>
      </CardContent>
    </Card>
  );
}
