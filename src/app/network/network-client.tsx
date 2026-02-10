/* eslint-disable react/no-unescaped-entities */

"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Group = "skills" | "agents" | "mcp";

type NodeType = "skill" | "agent" | "mcp";

type NetworkNode = {
  id: string;
  label: string;
  type: NodeType;
  group: Group;
};

type NetworkEdge = {
  source: string;
  target: string;
  type: "depends-on" | "agent-uses-skill" | "mcp-provides-tool";
};

type NetworkResponse = {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    clusters: number;
  };
};

function edgeTypeLabel(type: NetworkEdge["type"]): string {
  if (type === "depends-on") return "depends-on";
  if (type === "agent-uses-skill") return "agent-uses-skill";
  return "mcp-provides-tool";
}

function groupBadgeClass(group: Group): string {
  if (group === "skills") return "bg-purple-500/20 text-purple-200 border-purple-500/30";
  if (group === "agents") return "bg-cyan-500/20 text-cyan-200 border-cyan-500/30";
  return "bg-emerald-500/20 text-emerald-200 border-emerald-500/30";
}

export function NetworkClient() {
  const [data, setData] = useState<NetworkResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState<Group | "all">("all");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const response = await fetch("/api/network", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to load network (${response.status})`);
        }

        const payload = (await response.json()) as NetworkResponse;
        if (!active) return;
        setData(payload);
      } catch (fetchError) {
        if (!active) return;
        const message =
          fetchError instanceof Error ? fetchError.message : "Failed to load network data";
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const nodeById = useMemo(() => {
    const map = new Map<string, NetworkNode>();
    for (const node of data?.nodes ?? []) {
      map.set(node.id, node);
    }
    return map;
  }, [data]);

  const visibleNodes = useMemo(() => {
    const allNodes = data?.nodes ?? [];
    return allNodes.filter((node) => {
      if (groupFilter !== "all" && node.group !== groupFilter) return false;
      if (!search) return true;

      return node.label.toLowerCase().includes(search.toLowerCase());
    });
  }, [data, groupFilter, search]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes]);

  const visibleEdges = useMemo(() => {
    const allEdges = data?.edges ?? [];
    return allEdges.filter(
      (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, [data, visibleNodeIds]);

  const highlightedNodeIds = useMemo(() => {
    const ids = new Set<string>();
    if (!search) return ids;

    for (const node of visibleNodes) {
      if (node.label.toLowerCase().includes(search.toLowerCase())) {
        ids.add(node.id);
      }
    }
    return ids;
  }, [search, visibleNodes]);

  const selectedEdges = useMemo(() => {
    if (!selectedNodeId) return [];

    return visibleEdges.filter(
      (edge) => edge.source === selectedNodeId || edge.target === selectedNodeId
    );
  }, [selectedNodeId, visibleEdges]);

  const selectedNode = selectedNodeId ? nodeById.get(selectedNodeId) ?? null : null;

  if (loading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6 text-muted-foreground">Loading network graph…</CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6 text-red-300">
          {error ?? "Unable to load network graph."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-cyan-300">{data.stats.totalNodes}</div>
            <div className="text-sm text-muted-foreground">Total Nodes</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-300">{data.stats.totalEdges}</div>
            <div className="text-sm text-muted-foreground">Total Edges</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-300">{data.stats.clusters}</div>
            <div className="text-sm text-muted-foreground">Clusters</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4 space-y-3">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search nodes to highlight…"
            className="bg-white/5 border-white/10"
          />

          <div className="flex flex-wrap gap-2">
            {(["all", "skills", "agents", "mcp"] as const).map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => setGroupFilter(group)}
                className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                  groupFilter === group
                    ? "bg-white/20 border-white/40 text-foreground"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                }`}
              >
                {group === "all" ? "All" : group.charAt(0).toUpperCase() + group.slice(1)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle>Node List ({visibleNodes.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[480px] overflow-y-auto">
            {visibleNodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              const isHighlighted = highlightedNodeIds.has(node.id);

              return (
                <button
                  type="button"
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`w-full text-left rounded-md border px-3 py-2 transition-colors ${
                    isSelected
                      ? "border-cyan-400 bg-cyan-500/15"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  } ${isHighlighted ? "ring-1 ring-yellow-300" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-foreground">{node.label}</span>
                    <Badge className={groupBadgeClass(node.group)}>{node.group}</Badge>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle>
              Edge List {selectedNode ? `(connected to ${selectedNode.label})` : `(${visibleEdges.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[480px] overflow-y-auto">
            {(selectedNode ? selectedEdges : visibleEdges).map((edge, index) => {
              const source = nodeById.get(edge.source)?.label ?? edge.source;
              const target = nodeById.get(edge.target)?.label ?? edge.target;

              return (
                <div
                  key={`${edge.source}-${edge.target}-${edge.type}-${index}`}
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
                >
                  <div className="text-sm text-foreground">
                    <span className="font-medium">{source}</span>
                    <span className="text-muted-foreground"> → </span>
                    <span className="font-medium">{target}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{edgeTypeLabel(edge.type)}</div>
                </div>
              );
            })}

            {(selectedNode ? selectedEdges : visibleEdges).length === 0 && (
              <div className="text-sm text-muted-foreground">No edges for current selection/filter.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
