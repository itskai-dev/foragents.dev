"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Agent {
  id: string;
  handle: string;
  name: string;
  avatar: string;
  category: string;
  trustScore: number;
  skills: string[];
}

interface Connection {
  source: string;
  target: string;
  type: string;
  strength: number;
}

interface NetworkClientProps {
  agents: Agent[];
  connections: Connection[];
}

// Map categories to agent types
const categoryToType: Record<string, string> = {
  orchestrator: "autonomous",
  intelligence: "semi-autonomous",
  builder: "autonomous",
  operations: "autonomous",
  quality: "semi-autonomous",
  coding: "tool",
  creative: "tool",
  productivity: "tool",
  general: "semi-autonomous",
  automation: "tool",
  framework: "tool",
};

// Infer protocol from category/skills
const categoryToProtocol: Record<string, string> = {
  orchestrator: "A2A",
  intelligence: "REST",
  builder: "A2A",
  operations: "A2A",
  quality: "A2A",
  coding: "MCP",
  creative: "REST",
  productivity: "REST",
  general: "REST",
  automation: "REST",
  framework: "MCP",
};

function getTrustTier(score: number): string {
  if (score >= 90) return "verified";
  if (score >= 80) return "community";
  return "new";
}

function getTrustColor(score: number): string {
  if (score >= 90) return "#10b981"; // emerald
  if (score >= 80) return "#06b6d4"; // cyan
  return "#a855f7"; // purple
}

function getConnectionStyle(type: string) {
  switch (type) {
    case "depends-on":
      return { strokeDasharray: "0", color: "#f59e0b" }; // solid amber
    case "collaborates-with":
      return { strokeDasharray: "5,5", color: "#06b6d4" }; // dashed cyan
    case "uses-skill-from":
      return { strokeDasharray: "2,3", color: "#a855f7" }; // dotted purple
    default:
      return { strokeDasharray: "0", color: "#64748b" }; // solid slate
  }
}

export function NetworkClient({ agents, connections }: NetworkClientProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterTrust, setFilterTrust] = useState<string>("all");
  const [filterProtocol, setFilterProtocol] = useState<string>("all");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Filter agents
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      // Search filter
      if (
        searchQuery &&
        !agent.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !agent.handle.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Type filter
      if (filterType !== "all" && categoryToType[agent.category] !== filterType) {
        return false;
      }

      // Trust tier filter
      if (filterTrust !== "all" && getTrustTier(agent.trustScore) !== filterTrust) {
        return false;
      }

      // Protocol filter
      if (filterProtocol !== "all" && categoryToProtocol[agent.category] !== filterProtocol) {
        return false;
      }

      return true;
    });
  }, [agents, searchQuery, filterType, filterTrust, filterProtocol]);

  // Filter connections based on filtered agents
  const filteredConnections = useMemo(() => {
    const agentIds = new Set(filteredAgents.map((a) => a.id));
    return connections.filter(
      (conn) => agentIds.has(conn.source) && agentIds.has(conn.target)
    );
  }, [filteredAgents, connections]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalAgents = filteredAgents.length;
    const totalConnections = filteredConnections.length;
    const avgTrust =
      filteredAgents.reduce((sum, a) => sum + a.trustScore, 0) / totalAgents || 0;

    // Most connected agent
    const connectionCounts = new Map<string, number>();
    filteredConnections.forEach((conn) => {
      connectionCounts.set(conn.source, (connectionCounts.get(conn.source) || 0) + 1);
      connectionCounts.set(conn.target, (connectionCounts.get(conn.target) || 0) + 1);
    });

    let mostConnectedId = "";
    let maxConnections = 0;
    connectionCounts.forEach((count, id) => {
      if (count > maxConnections) {
        maxConnections = count;
        mostConnectedId = id;
      }
    });

    const mostConnected = agents.find((a) => a.id === mostConnectedId);

    return {
      totalAgents,
      totalConnections,
      avgTrust: avgTrust.toFixed(1),
      mostConnected: mostConnected?.name || "—",
    };
  }, [filteredAgents, filteredConnections, agents]);

  // Simple circular layout for nodes
  const nodePositions = useMemo(() => {
    const positions = new Map<string, { x: number; y: number }>();
    const centerX = 400;
    const centerY = 300;
    const radius = 250;

    filteredAgents.forEach((agent, index) => {
      const angle = (index / filteredAgents.length) * 2 * Math.PI;
      positions.set(agent.id, {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    });

    return positions;
  }, [filteredAgents]);

  const effectiveSelectedAgent = useMemo(() => {
    if (!selectedAgent) return null;
    return filteredAgents.find((a) => a.id === selectedAgent.id) ?? null;
  }, [selectedAgent, filteredAgents]);

  // Get connected agents for selected agent
  const connectedAgents = useMemo(() => {
    if (!effectiveSelectedAgent) return [];

    const connectedIds = new Set<string>();
    filteredConnections.forEach((conn) => {
      if (conn.source === effectiveSelectedAgent.id) connectedIds.add(conn.target);
      if (conn.target === effectiveSelectedAgent.id) connectedIds.add(conn.source);
    });

    return filteredAgents.filter((a) => connectedIds.has(a.id));
  }, [effectiveSelectedAgent, filteredConnections, filteredAgents]);

  return (
    <div className="space-y-6">
      {/* Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-cyan">{stats.totalAgents}</div>
            <div className="text-sm text-muted-foreground">Total Agents</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple">{stats.totalConnections}</div>
            <div className="text-sm text-muted-foreground">Connections</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-400">{stats.avgTrust}</div>
            <div className="text-sm text-muted-foreground">Avg Trust Score</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="text-xl font-bold text-amber-400 truncate">
              {stats.mostConnected}
            </div>
            <div className="text-sm text-muted-foreground">Most Connected</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4 space-y-4">
          {/* Search */}
          <div>
            <Input
              type="text"
              placeholder="Search agents by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border-white/10 text-foreground"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Agent Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground"
              >
                <option value="all">All Types</option>
                <option value="autonomous">Autonomous</option>
                <option value="semi-autonomous">Semi-Autonomous</option>
                <option value="tool">Tool</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Trust Tier</label>
              <select
                value={filterTrust}
                onChange={(e) => setFilterTrust(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground"
              >
                <option value="all">All Tiers</option>
                <option value="verified">Verified (90+)</option>
                <option value="community">Community (80-89)</option>
                <option value="new">New (&lt;80)</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Protocol</label>
              <select
                value={filterProtocol}
                onChange={(e) => setFilterProtocol(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground"
              >
                <option value="all">All Protocols</option>
                <option value="MCP">MCP</option>
                <option value="A2A">A2A</option>
                <option value="REST">REST</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Connection Types</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <svg width="40" height="2">
                <line
                  x1="0"
                  y1="1"
                  x2="40"
                  y2="1"
                  stroke="#f59e0b"
                  strokeWidth="2"
                />
              </svg>
              <span className="text-muted-foreground">Depends On</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="40" height="2">
                <line
                  x1="0"
                  y1="1"
                  x2="40"
                  y2="1"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              </svg>
              <span className="text-muted-foreground">Collaborates With</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="40" height="2">
                <line
                  x1="0"
                  y1="1"
                  x2="40"
                  y2="1"
                  stroke="#a855f7"
                  strokeWidth="2"
                  strokeDasharray="2,3"
                />
              </svg>
              <span className="text-muted-foreground">Uses Skill From</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Graph and Agent Card Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Graph */}
        <Card className="bg-white/5 border-white/10 lg:col-span-2">
          <CardContent className="p-4">
            <div className="relative w-full" style={{ height: "600px" }}>
              {filteredAgents.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No agents match the current filters
                </div>
              ) : (
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 800 600"
                  className="bg-black/20 rounded-lg"
                >
                  {/* Draw connections */}
                  {filteredConnections.map((conn, idx) => {
                    const sourcePos = nodePositions.get(conn.source);
                    const targetPos = nodePositions.get(conn.target);
                    if (!sourcePos || !targetPos) return null;

                    const style = getConnectionStyle(conn.type);
                    const isHighlighted =
                      effectiveSelectedAgent &&
                      (conn.source === effectiveSelectedAgent.id || conn.target === effectiveSelectedAgent.id);

                    return (
                      <line
                        key={`conn-${idx}`}
                        x1={sourcePos.x}
                        y1={sourcePos.y}
                        x2={targetPos.x}
                        y2={targetPos.y}
                        stroke={isHighlighted ? style.color : "#64748b"}
                        strokeWidth={isHighlighted ? 2 : 1}
                        strokeDasharray={style.strokeDasharray}
                        opacity={isHighlighted ? 0.9 : 0.3}
                      />
                    );
                  })}

                  {/* Draw nodes */}
                  {filteredAgents.map((agent) => {
                    const pos = nodePositions.get(agent.id);
                    if (!pos) return null;

                    const isSelected = effectiveSelectedAgent?.id === agent.id;
                    const isConnected = connectedAgents.some((a) => a.id === agent.id);
                    const isHovered = hoveredNode === agent.id;
                    const isHighlighted =
                      searchQuery &&
                      (agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        agent.handle.toLowerCase().includes(searchQuery.toLowerCase()));

                    const radius = isSelected ? 28 : isHovered ? 24 : 20;
                    const opacity =
                      !effectiveSelectedAgent || isSelected || isConnected ? 1 : 0.3;

                    return (
                      <g
                        key={agent.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedAgent(agent)}
                        onMouseEnter={() => setHoveredNode(agent.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                      >
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={radius}
                          fill={getTrustColor(agent.trustScore)}
                          opacity={opacity}
                          stroke={isSelected || isHighlighted ? "#fff" : "none"}
                          strokeWidth={isSelected ? 3 : 2}
                        />
                        <text
                          x={pos.x}
                          y={pos.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={radius > 22 ? "20" : "16"}
                        >
                          {agent.avatar}
                        </text>
                        {(isHovered || isSelected) && (
                          <text
                            x={pos.x}
                            y={pos.y + radius + 14}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#fff"
                            fontWeight="600"
                          >
                            {agent.name}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Agent Card */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            {effectiveSelectedAgent ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{effectiveSelectedAgent.avatar}</div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {effectiveSelectedAgent.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">@{effectiveSelectedAgent.handle}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Type: </span>
                    <Badge variant="secondary" className="ml-1">
                      {categoryToType[effectiveSelectedAgent.category]}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Trust Score: </span>
                    <span
                      className="font-semibold"
                      style={{ color: getTrustColor(effectiveSelectedAgent.trustScore) }}
                    >
                      {effectiveSelectedAgent.trustScore}
                    </span>
                    <Badge variant="secondary" className="ml-2">
                      {getTrustTier(effectiveSelectedAgent.trustScore)}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Protocol: </span>
                    <Badge variant="secondary" className="ml-1">
                      {categoryToProtocol[effectiveSelectedAgent.category]}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Capabilities
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {effectiveSelectedAgent.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="text-xs border-white/20"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Connected Agents ({connectedAgents.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {connectedAgents.map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center gap-2 p-2 bg-white/5 rounded cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => setSelectedAgent(agent)}
                      >
                        <span className="text-xl">{agent.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {agent.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Trust: {agent.trustScore}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <div>
                  <p className="text-lg mb-2">Click on a node</p>
                  <p className="text-sm">to view agent details</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
