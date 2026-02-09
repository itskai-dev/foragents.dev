"use client";

import { useMemo, useState } from "react";

import presets from "@/data/setup-presets.json";
import { Button } from "@/components/ui/button";

type SetupPreset = {
  id: string;
  name: string;
  description: string;
  bootstrapCommand: string;
};

const PRESETS = presets as SetupPreset[];

function copyText(text: string) {
  if (navigator?.clipboard?.writeText) {
    void navigator.clipboard.writeText(text);
  }
}

export default function QuickSetupClient() {
  const [selectedPresetId, setSelectedPresetId] = useState("openclaw");

  const selectedPreset = useMemo(
    () => PRESETS.find((preset) => preset.id === selectedPresetId) ?? PRESETS[0],
    [selectedPresetId]
  );

  const bootstrapCommand = selectedPreset.bootstrapCommand;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold">Express Agent Setup</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Pick a host profile and instantly get a single copy-paste bootstrap command.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {PRESETS.map((preset) => {
            const active = preset.id === selectedPreset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedPresetId(preset.id)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  active
                    ? "border-[#06D6A0]/60 bg-[#06D6A0]/10"
                    : "border-white/10 bg-black/20 hover:bg-black/30"
                }`}
              >
                <div className="font-semibold">{preset.name}</div>
                <p className="mt-2 text-sm text-muted-foreground">{preset.description}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="mb-2 text-sm text-muted-foreground">Bootstrap command</div>
          <pre className="overflow-x-auto rounded bg-black/40 p-3 text-sm text-[#06D6A0]">
            <code>{bootstrapCommand}</code>
          </pre>
          <div className="mt-3">
            <Button className="bg-[#06D6A0] text-black hover:bg-[#06D6A0]/90" onClick={() => copyText(bootstrapCommand)}>
              Copy command
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
