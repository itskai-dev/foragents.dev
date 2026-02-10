"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

type SkillResult = {
  id: string;
  slug: string;
  name: string;
  tags?: string[];
};

type McpResult = {
  id: string;
  name: string;
  category?: string;
};

type ResultItem = {
  key: string;
  type: "skill" | "mcp";
  label: string;
  meta: string;
  href: string;
};

export function HomeSkillDiscoverySearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [skills, setSkills] = useState<SkillResult[]>([]);
  const [mcpServers, setMcpServers] = useState<McpResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) {
      return;
    }

    const controller = new AbortController();

    async function searchAll() {
      try {
        const encoded = encodeURIComponent(debouncedQuery);
        const [skillsResponse, mcpResponse] = await Promise.all([
          fetch(`/api/skills?search=${encoded}&limit=5`, {
            signal: controller.signal,
            cache: "no-store",
          }),
          fetch(`/api/mcp?search=${encoded}`, {
            signal: controller.signal,
            cache: "no-store",
          }),
        ]);

        if (!skillsResponse.ok || !mcpResponse.ok) return;

        const skillsPayload = (await skillsResponse.json()) as {
          skills?: SkillResult[];
        };
        const mcpPayload = (await mcpResponse.json()) as {
          servers?: McpResult[];
        };

        const nextSkills = Array.isArray(skillsPayload.skills) ? skillsPayload.skills : [];
        const nextMcp = Array.isArray(mcpPayload.servers) ? mcpPayload.servers : [];

        setSkills(nextSkills);
        setMcpServers(nextMcp);
        setActiveIndex(nextSkills.length + nextMcp.length > 0 ? 0 : -1);
      } catch {
        // Keep current state on transient network failures.
      }
    }

    void searchAll();

    return () => controller.abort();
  }, [debouncedQuery]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const results = useMemo<ResultItem[]>(() => {
    const skillItems = skills.map((skill) => ({
      key: `skill-${skill.id}`,
      type: "skill" as const,
      label: skill.name,
      meta: skill.tags?.[0] ?? "Skill",
      href: `/skills/${skill.slug}`,
    }));

    const mcpItems = mcpServers.map((server) => ({
      key: `mcp-${server.id}`,
      type: "mcp" as const,
      label: server.name,
      meta: server.category ?? "MCP",
      href: `/mcp?search=${encodeURIComponent(server.name)}`,
    }));

    return [...skillItems, ...mcpItems];
  }, [skills, mcpServers]);

  function navigateTo(href: string) {
    setOpen(false);
    router.push(href);
  }

  function submitSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;

    if (activeIndex >= 0 && results[activeIndex]) {
      navigateTo(results[activeIndex].href);
      return;
    }

    navigateTo(`/skills?search=${encodeURIComponent(trimmed)}`);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      if (results.length === 0) return;
      event.preventDefault();
      setOpen(true);
      setActiveIndex((prev) => (prev + 1) % results.length);
      return;
    }

    if (event.key === "ArrowUp") {
      if (results.length === 0) return;
      event.preventDefault();
      setOpen(true);
      setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      submitSearch();
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-card/30 p-6 hover:border-cyan/30 transition-all">
        <div className="flex items-center gap-4">
          <div className="text-2xl" aria-hidden="true">
            🔍
          </div>
          <div className="flex-1">
            <label htmlFor="home-skill-search" className="sr-only">
              Search skills and MCP servers
            </label>
            <input
              id="home-skill-search"
              type="search"
              value={query}
              onFocus={() => setOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onKeyDown={onKeyDown}
              placeholder="Search skills, agents, MCP servers..."
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
              autoComplete="off"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 font-mono">↑↓</kbd>
            <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 font-mono">Enter</kbd>
          </div>
        </div>
      </div>

      {showDropdown && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-[#0A0E17] shadow-xl p-3 space-y-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-cyan/80 mb-2">Skills</p>
            {skills.length === 0 ? (
              <p className="text-sm text-muted-foreground px-2 py-1">No skills found.</p>
            ) : (
              <ul className="space-y-1">
                {skills.map((skill, index) => {
                  const selected = activeIndex === index;
                  return (
                    <li key={`skill-${skill.id}`}>
                      <button
                        type="button"
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => navigateTo(`/skills/${skill.slug}`)}
                        className={`w-full text-left px-2 py-2 rounded-lg transition-colors ${
                          selected ? "bg-cyan/10" : "hover:bg-white/5"
                        }`}
                      >
                        <div className="text-sm text-foreground">{skill.name}</div>
                        <div className="text-xs text-muted-foreground">{skill.tags?.[0] ?? "Skill"}</div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wider text-purple/80 mb-2">MCP Servers</p>
            {mcpServers.length === 0 ? (
              <p className="text-sm text-muted-foreground px-2 py-1">No MCP servers found.</p>
            ) : (
              <ul className="space-y-1">
                {mcpServers.map((server, mcpIndex) => {
                  const index = skills.length + mcpIndex;
                  const selected = activeIndex === index;
                  return (
                    <li key={`mcp-${server.id}`}>
                      <button
                        type="button"
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => navigateTo(`/mcp?search=${encodeURIComponent(server.name)}`)}
                        className={`w-full text-left px-2 py-2 rounded-lg transition-colors ${
                          selected ? "bg-purple/10" : "hover:bg-white/5"
                        }`}
                      >
                        <div className="text-sm text-foreground">{server.name}</div>
                        <div className="text-xs text-muted-foreground">{server.category ?? "MCP"}</div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
