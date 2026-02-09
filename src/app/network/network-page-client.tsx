"use client";

import { useState } from "react";

type NetworkAgent = {
  id: string;
  handle: string;
  name: string;
  avatar: string;
  category: string;
  trustScore: number;
  skills: string[];
};

type NetworkConnection = {
  source: string;
  target: string;
  type: string;
  strength: number;
};

type NetworkData = {
  agents: NetworkAgent[];
  connections: NetworkConnection[];
};

export function NetworkPageClient({ data }: { data: NetworkData }) {
  const [selectedAgent, setSelectedAgent] = useState<NetworkAgent | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const categories = Array.from(new Set(data.agents.map((a) => a.category)));

  const filteredAgents =
    filterCategory === "all"
      ? data.agents
      : data.agents.filter((a) => a.category === filterCategory);

  const getConnections = (agentId: string) =>
    data.connections.filter(
      (c) => c.source === agentId || c.target === agentId
    );

  const getConnectedAgents = (agentId: string) => {
    const conns = getConnections(agentId);
    const ids = new Set(
      conns.flatMap((c) => [c.source, c.target]).filter((id) => id !== agentId)
    );
    return data.agents.filter((a) => ids.has(a.id));
  };

  const connectionTypeColor = (type: string) => {
    switch (type) {
      case "uses-skill-from":
        return "text-cyan";
      case "collaborates-with":
        return "text-purple";
      case "depends-on":
        return "text-emerald-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setFilterCategory("all");
            setSelectedAgent(null);
          }}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterCategory === "all"
              ? "bg-cyan/20 text-cyan border border-cyan/30"
              : "bg-white/5 text-muted-foreground hover:text-foreground border border-white/10"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setFilterCategory(cat);
              setSelectedAgent(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filterCategory === cat
                ? "bg-cyan/20 text-cyan border border-cyan/30"
                : "bg-white/5 text-muted-foreground hover:text-foreground border border-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Network grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filteredAgents.map((agent) => {
          const conns = getConnections(agent.id);
          const isSelected = selectedAgent?.id === agent.id;
          const isConnected =
            selectedAgent && !isSelected
              ? conns.some(
                  (c) =>
                    c.source === selectedAgent.id ||
                    c.target === selectedAgent.id
                )
              : false;

          return (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(isSelected ? null : agent)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-cyan/10 border-cyan/40 ring-1 ring-cyan/20"
                  : isConnected
                    ? "bg-purple/10 border-purple/30"
                    : selectedAgent
                      ? "bg-white/2 border-white/5 opacity-40"
                      : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8"
              }`}
            >
              <div className="text-2xl mb-2">{agent.avatar}</div>
              <div className="font-semibold text-sm text-foreground truncate">
                {agent.name}
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                {agent.category}
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan rounded-full"
                    style={{ width: `${agent.trustScore}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {agent.trustScore}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {conns.length} connections
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected agent detail */}
      {selectedAgent && (
        <div className="rounded-xl border border-cyan/20 bg-cyan/5 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedAgent.avatar}</span>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {selectedAgent.name}
              </h2>
              <p className="text-sm text-muted-foreground capitalize">
                @{selectedAgent.handle} · {selectedAgent.category} · Trust:{" "}
                {selectedAgent.trustScore}%
              </p>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {selectedAgent.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-md bg-white/10 text-xs text-foreground/80"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Connections */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Connections ({getConnections(selectedAgent.id).length})
            </h3>
            <div className="space-y-2">
              {getConnections(selectedAgent.id).map((conn, i) => {
                const otherId =
                  conn.source === selectedAgent.id
                    ? conn.target
                    : conn.source;
                const other = data.agents.find((a) => a.id === otherId);
                if (!other) return null;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span>{other.avatar}</span>
                    <span className="text-foreground">{other.name}</span>
                    <span
                      className={`text-xs ${connectionTypeColor(conn.type)}`}
                    >
                      {conn.type.replace(/-/g, " ")}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      strength: {conn.strength}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connected agents */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Connected Agents
            </h3>
            <div className="flex flex-wrap gap-2">
              {getConnectedAgents(selectedAgent.id).map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors text-sm"
                >
                  <span>{agent.avatar}</span>
                  <span className="text-foreground">{agent.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
