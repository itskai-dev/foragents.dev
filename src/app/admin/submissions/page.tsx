"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Submission = {
  id: string;
  type: "skill" | "mcp" | "agent" | "llms-txt";
  name: string;
  description: string;
  url: string;
  author: string;
  tags: string[];
  install_cmd?: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
};

type StatusFilter = "pending" | "approved" | "rejected" | "all";

export default function AdminSubmissionsPage() {
  const [secret, setSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load secret from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("foragents_admin_secret");
    if (stored) {
      setSecret(stored);
      setIsAuthenticated(true);
    }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/submissions?status=${statusFilter}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch submissions");
      }

      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // Fetch submissions when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSubmissions();
    }
  }, [isAuthenticated, statusFilter, fetchSubmissions]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (secret.trim()) {
      localStorage.setItem("foragents_admin_secret", secret.trim());
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("foragents_admin_secret");
    setSecret("");
    setIsAuthenticated(false);
    setSubmissions([]);
  };

  const handleAction = async (
    id: string,
    action: "approve" | "reject",
    reason?: string
  ) => {
    setActionLoading(id);

    try {
      const body = action === "reject" && reason ? { reason } : undefined;

      const res = await fetch(`/api/submissions/${id}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setError("Invalid admin secret. Please log out and try again.");
          return;
        }
        throw new Error(data.error || `Failed to ${action} submission`);
      }

      // Refresh list
      await fetchSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = (id: string) => {
    handleAction(id, "approve");
  };

  const handleReject = (id: string) => {
    const reason = prompt("Rejection reason (optional):");
    handleAction(id, "reject", reason || undefined);
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">🔐 Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Admin Secret
              </label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                placeholder="Enter ADMIN_SECRET"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors"
            >
              Login
            </button>
          </form>
          <p className="text-sm text-zinc-500 mt-4">
            The secret is stored in localStorage for convenience.
          </p>
          <Link
            href="/"
            className="text-sm text-emerald-400 hover:underline mt-4 block"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  // Admin dashboard
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">📋 Submission Review</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-zinc-400 hover:text-zinc-200"
          >
            Logout
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(["pending", "approved", "rejected", "all"] as StatusFilter[]).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            )
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-400 hover:text-red-200"
            >
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-zinc-400">Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="text-zinc-500 py-8 text-center">
            No {statusFilter === "all" ? "" : statusFilter} submissions found.
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{sub.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-zinc-800 rounded text-zinc-400">
                        {sub.type}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          sub.status === "pending"
                            ? "bg-yellow-900/50 text-yellow-400"
                            : sub.status === "approved"
                              ? "bg-emerald-900/50 text-emerald-400"
                              : "bg-red-900/50 text-red-400"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 mb-2">
                      {sub.description}
                    </p>
                    <div className="text-xs text-zinc-500 space-y-1">
                      <div>
                        <span className="text-zinc-600">Author:</span>{" "}
                        {sub.author}
                      </div>
                      <div>
                        <span className="text-zinc-600">URL:</span>{" "}
                        <a
                          href={sub.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:underline"
                        >
                          {sub.url}
                        </a>
                      </div>
                      {sub.install_cmd && (
                        <div>
                          <span className="text-zinc-600">Install:</span>{" "}
                          <code className="text-zinc-300">
                            {sub.install_cmd}
                          </code>
                        </div>
                      )}
                      <div>
                        <span className="text-zinc-600">Tags:</span>{" "}
                        {sub.tags.join(", ")}
                      </div>
                      <div>
                        <span className="text-zinc-600">Submitted:</span>{" "}
                        {new Date(sub.submitted_at).toLocaleString()}
                      </div>
                      <div>
                        <span className="text-zinc-600">ID:</span>{" "}
                        <code className="text-zinc-500">{sub.id}</code>
                      </div>
                    </div>
                  </div>

                  {sub.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(sub.id)}
                        disabled={actionLoading === sub.id}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded text-sm font-medium transition-colors"
                      >
                        {actionLoading === sub.id ? "..." : "✓ Approve"}
                      </button>
                      <button
                        onClick={() => handleReject(sub.id)}
                        disabled={actionLoading === sub.id}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded text-sm font-medium transition-colors"
                      >
                        {actionLoading === sub.id ? "..." : "✕ Reject"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-zinc-800">
          <Link
            href="/"
            className="text-sm text-emerald-400 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
