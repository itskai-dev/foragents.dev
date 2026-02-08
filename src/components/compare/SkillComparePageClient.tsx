"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { parseCompareIdsParam } from "@/lib/compare";
import type { Skill } from "@/lib/data";

export default function SkillComparePageClient({
  initialIds,
  initialSkills,
  allSkills,
}: {
  initialIds: string[];
  initialSkills: Array<Skill | null>;
  allSkills: Skill[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive ids from searchParams to avoid setState in effect
  const ids = useMemo(() => {
    const a = searchParams.get("a");
    return parseCompareIdsParam(a);
  }, [searchParams]);

  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);

  // Sync selectedIds when ids change
  useEffect(() => {
    setSelectedIds(ids);
  }, [ids]);

  function setIdsAndSync(next: string[]) {
    setSelectedIds(next);
    const url = next.length > 0 
      ? `/skills/compare?a=${encodeURIComponent(next.join(","))}`
      : "/skills/compare";
    router.replace(url);
  }

  function handleSkillSelect(skillId: string, index: number) {
    const newIds = [...selectedIds];
    if (skillId === "") {
      newIds[index] = "";
    } else {
      newIds[index] = skillId;
    }
    setIdsAndSync(newIds.filter(id => id !== ""));
  }

  function addSkillSlot() {
    if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, ""]);
    }
  }

  function removeSkill(index: number) {
    const newIds = selectedIds.filter((_, i) => i !== index);
    setIdsAndSync(newIds);
  }

  const resolvedSkills = useMemo(() => {
    const map = new Map(initialIds.map((id, i) => [id, initialSkills[i] || null]));
    return ids.map((id) => map.get(id) ?? allSkills.find(s => s.id === id) ?? null);
  }, [ids, initialIds, initialSkills, allSkills]);

  async function copyLink() {
    const url = window.location.href;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      return;
    }
    const el = document.createElement("textarea");
    el.value = url;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }

  // Calculate unique tags for highlighting
  const allTagsPerSkill = resolvedSkills.map(s => new Set(s?.tags || []));
  const uniqueTagsPerSkill = allTagsPerSkill.map((tags, idx) => {
    const otherTags = allTagsPerSkill
      .filter((_, i) => i !== idx)
      .flatMap(set => Array.from(set));
    return Array.from(tags).filter(tag => !otherTags.includes(tag));
  });

  const empty = ids.length === 0;
  const notEnough = ids.length > 0 && ids.length < 2;
  const canCompare = ids.length >= 2;

  const rows: Array<{ 
    label: string; 
    render: (s: Skill | null, idx: number) => React.ReactNode 
  }> = [
    {
      label: "Author",
      render: (s) => (
        <span className="text-sm text-foreground/90">
          {s?.author || "—"}
        </span>
      ),
    },
    {
      label: "Description",
      render: (s) => (
        <p className="text-sm text-foreground/80 leading-relaxed">
          {s?.description || "—"}
        </p>
      ),
    },
    {
      label: "Tags",
      render: (s, idx) => (
        <div className="flex flex-wrap gap-1">
          {(s?.tags || []).map((tag) => {
            const isUnique = uniqueTagsPerSkill[idx]?.includes(tag);
            return (
              <span
                key={tag}
                className={`text-[11px] font-mono rounded border px-2 py-0.5 ${
                  isUnique
                    ? "bg-cyan/20 border-cyan/40 text-cyan"
                    : "border-white/10 bg-white/5 text-foreground/70"
                }`}
              >
                {tag}
              </span>
            );
          })}
          {(s?.tags || []).length === 0 && (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>
      ),
    },
    {
      label: "Install Command",
      render: (s) => (
        <code className="text-xs font-mono text-foreground/80 block overflow-x-auto">
          {s?.install_cmd || "—"}
        </code>
      ),
    },
    {
      label: "Repository",
      render: (s) => (
        s?.repo_url ? (
          <a
            className="text-sm text-cyan hover:underline break-all"
            href={s.repo_url}
            target="_blank"
            rel="noreferrer"
          >
            {s.repo_url}
          </a>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )
      ),
    },
    {
      label: "Verification",
      render: (s) => (
        <span className="text-sm text-foreground/90">
          {s?.author === "Team Reflectt" ? "✓ Verified" : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Compare Skills</h1>
          <p className="text-sm text-muted-foreground">
            Pick 2-3 skills to compare side-by-side.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/#skills"
            className="h-9 px-3 rounded-md text-xs border border-white/10 text-muted-foreground hover:text-foreground hover:border-cyan/30 transition-colors inline-flex items-center"
          >
            Browse Skills
          </Link>
          {ids.length > 0 && (
            <>
              <button
                type="button"
                className="h-9 px-3 rounded-md text-xs border border-white/10 text-muted-foreground hover:text-foreground hover:border-cyan/30 transition-colors"
                onClick={() => setIdsAndSync([])}
              >
                Clear all
              </button>
              <button
                type="button"
                className="h-9 px-3 rounded-md text-xs bg-cyan text-[#0A0E17] font-semibold hover:brightness-110 transition-all"
                onClick={() => {
                  copyLink().catch(() => null);
                }}
              >
                Copy link
              </button>
            </>
          )}
        </div>
      </header>

      {/* Skill Selectors */}
      <div className="mb-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {selectedIds.map((selectedId, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/10 bg-card/40 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono text-muted-foreground">
                  Skill {index + 1}
                </label>
                {selectedIds.length > 2 && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => removeSkill(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
              <select
                value={selectedId}
                onChange={(e) => handleSkillSelect(e.target.value, index)}
                className="w-full bg-background border border-white/10 rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-cyan/50"
              >
                <option value="">— Select a skill —</option>
                {allSkills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name} ({skill.author})
                  </option>
                ))}
              </select>
            </div>
          ))}
          
          {selectedIds.length < 3 && (
            <button
              type="button"
              onClick={addSkillSlot}
              className="rounded-xl border border-dashed border-white/20 bg-card/20 p-4 hover:border-cyan/40 hover:bg-card/30 transition-all text-muted-foreground hover:text-cyan flex items-center justify-center gap-2 min-h-[100px]"
            >
              <span className="text-lg">+</span>
              <span className="text-sm">Add skill</span>
            </button>
          )}
        </div>
      </div>

      {empty && (
        <div className="rounded-xl border border-white/10 bg-card/40 p-6 text-center">
          <p className="text-muted-foreground">
            Select skills from the dropdowns above to start comparing.
          </p>
        </div>
      )}

      {notEnough && (
        <div className="rounded-xl border border-white/10 bg-card/40 p-6 text-center">
          <p className="text-muted-foreground">
            Add at least 2 skills to compare.
          </p>
        </div>
      )}

      {canCompare && (
        <div className="rounded-xl border border-white/10 bg-card/30 overflow-hidden">
          <div className="overflow-x-auto">
            <div
              className="grid"
              style={{
                gridTemplateColumns: `minmax(140px, 200px) repeat(${ids.length}, minmax(280px, 1fr))`,
              }}
            >
              {/* Header row */}
              <div className="sticky left-0 z-20 bg-background/90 backdrop-blur border-b border-white/10 p-4">
                <span className="text-xs font-mono text-muted-foreground">
                  Field
                </span>
              </div>
              {resolvedSkills.map((s, idx) => (
                <div key={ids[idx]} className="border-b border-white/10 p-4">
                  {s ? (
                    <div className="min-w-0">
                      <h3 className="font-semibold text-lg text-foreground mb-1">
                        {s.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        ID: {s.id}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-muted-foreground">
                        Unknown skill
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ID: {ids[idx]}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {/* Data rows */}
              {rows.map((row) => (
                <div key={row.label} className="contents">
                  <div className="sticky left-0 z-10 bg-background/90 backdrop-blur border-b border-white/5 p-4">
                    <span className="text-xs font-mono text-muted-foreground">
                      {row.label}
                    </span>
                  </div>
                  {resolvedSkills.map((s, i) => (
                    <div
                      key={`${row.label}:${ids[i]}`}
                      className="border-b border-white/5 p-4"
                    >
                      {row.render(s, i)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {canCompare && (
        <div className="mt-6 rounded-xl border border-cyan/20 bg-cyan/5 p-4">
          <p className="text-sm text-foreground/90">
            <span className="font-semibold text-cyan">💡 Tip:</span> Tags
            highlighted in <span className="text-cyan">cyan</span> are unique to
            that skill and don&apos;t appear in the other selected skills.
          </p>
        </div>
      )}
    </div>
  );
}
