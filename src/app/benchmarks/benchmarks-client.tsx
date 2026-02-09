"use client";

import { useState, useMemo } from "react";

type Benchmark = {
  id: string;
  name: string;
  category: string;
  responseTime: number;
  accuracy: number;
  costEfficiency: number;
  reliability: number;
};

type SortKey = "name" | "responseTime" | "accuracy" | "costEfficiency" | "reliability";
type SortDirection = "asc" | "desc";

interface BenchmarksClientProps {
  benchmarks: Benchmark[];
}

// Components defined outside render
function SortIcon({ column, sortKey, sortDirection }: { column: SortKey; sortKey: SortKey; sortDirection: SortDirection }) {
  if (sortKey !== column) return <span className="text-muted-foreground ml-1">⇅</span>;
  return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
}

function MetricBar({ value }: { value: number }) {
  const color =
    value >= 90 ? "bg-green-500" : value >= 70 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 bg-gray-700 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-sm font-medium w-10 text-right">{value}%</span>
    </div>
  );
}

export function BenchmarksClient({ benchmarks }: BenchmarksClientProps) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(benchmarks.map((b) => b.category));
    return ["all", ...Array.from(cats).sort()];
  }, [benchmarks]);

  // Filter and sort benchmarks
  const filteredAndSorted = useMemo(() => {
    let result = benchmarks;

    // Filter by category
    if (categoryFilter !== "all") {
      result = result.filter((b) => b.category === categoryFilter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      // For strings, use localeCompare
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      // For numbers
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return result;
  }, [benchmarks, categoryFilter, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              categoryFilter === cat
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Benchmarks Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-800">
              <th
                className="text-left py-3 px-4 cursor-pointer hover:bg-gray-900"
                onClick={() => handleSort("name")}
              >
                Agent <SortIcon column="name" sortKey={sortKey} sortDirection={sortDirection} />
              </th>
              <th className="text-left py-3 px-4">Category</th>
              <th
                className="text-left py-3 px-4 cursor-pointer hover:bg-gray-900"
                onClick={() => handleSort("responseTime")}
              >
                Response Time (ms) <SortIcon column="responseTime" sortKey={sortKey} sortDirection={sortDirection} />
              </th>
              <th
                className="text-left py-3 px-4 cursor-pointer hover:bg-gray-900"
                onClick={() => handleSort("accuracy")}
              >
                Accuracy <SortIcon column="accuracy" sortKey={sortKey} sortDirection={sortDirection} />
              </th>
              <th
                className="text-left py-3 px-4 cursor-pointer hover:bg-gray-900"
                onClick={() => handleSort("costEfficiency")}
              >
                Cost Efficiency <SortIcon column="costEfficiency" sortKey={sortKey} sortDirection={sortDirection} />
              </th>
              <th
                className="text-left py-3 px-4 cursor-pointer hover:bg-gray-900"
                onClick={() => handleSort("reliability")}
              >
                Reliability <SortIcon column="reliability" sortKey={sortKey} sortDirection={sortDirection} />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map((benchmark) => (
              <tr
                key={benchmark.id}
                className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors"
              >
                <td className="py-3 px-4 font-medium">{benchmark.name}</td>
                <td className="py-3 px-4">
                  <span className="inline-block px-2 py-1 text-xs rounded bg-gray-800 text-gray-300">
                    {benchmark.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm">{benchmark.responseTime.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <MetricBar value={benchmark.accuracy} />
                </td>
                <td className="py-3 px-4">
                  <MetricBar value={benchmark.costEfficiency} />
                </td>
                <td className="py-3 px-4">
                  <MetricBar value={benchmark.reliability} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No benchmarks found for this category.
        </div>
      )}
    </div>
  );
}
