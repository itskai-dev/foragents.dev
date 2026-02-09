"use client";

import { useMemo, useState } from "react";

type ChecklistItem = {
  id: string;
  label: string;
};

type MaturityBand = {
  range: [number, number];
  label: string;
  guidance: string;
};

type Props = {
  checklist: ChecklistItem[];
  maturityCriteria: {
    basic: MaturityBand;
    intermediate: MaturityBand;
    advanced: MaturityBand;
  };
};

export default function GovernanceReadiness({ checklist, maturityCriteria }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const score = useMemo(() => {
    return checklist.reduce((total, item) => total + (checked[item.id] ? 1 : 0), 0);
  }, [checklist, checked]);

  const percentage = Math.round((score / checklist.length) * 100);

  const maturity = useMemo(() => {
    if (score <= maturityCriteria.basic.range[1]) return maturityCriteria.basic;
    if (score <= maturityCriteria.intermediate.range[1]) return maturityCriteria.intermediate;
    return maturityCriteria.advanced;
  }, [maturityCriteria, score]);

  return (
    <section className="mt-12 rounded-xl border border-white/10 bg-card/40 p-6 md:p-8">
      <h2 className="text-2xl font-bold">Governance Readiness Checklist</h2>
      <p className="mt-2 text-sm text-foreground/70">
        Check each control that is currently implemented in your environment. Score updates instantly.
      </p>

      <div className="mt-6 space-y-3">
        {checklist.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-black/20 p-3"
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-[#06D6A0]"
              checked={Boolean(checked[item.id])}
              onChange={(event) => {
                setChecked((prev) => ({ ...prev, [item.id]: event.target.checked }));
              }}
            />
            <span className="text-sm text-foreground/90">{item.label}</span>
          </label>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-[#06D6A0]/25 bg-[#06D6A0]/10 p-4">
        <p className="text-sm text-foreground/80">Self-assessment score</p>
        <p className="mt-1 text-2xl font-bold text-[#06D6A0]">
          {score}/{checklist.length} ({percentage}%)
        </p>
        <p className="mt-1 text-sm text-foreground/90">
          Maturity: <span className="font-semibold">{maturity.label}</span>
        </p>
        <p className="mt-1 text-sm text-foreground/70">{maturity.guidance}</p>
      </div>
    </section>
  );
}
