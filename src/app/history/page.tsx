'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface InstallHistoryEntry {
  skillName: string;
  installCommand: string;
  dateCopied: number;
}

type DateFilter = 'today' | 'week' | 'all';

export default function HistoryPage() {
  const [history, setHistory] = useState<InstallHistoryEntry[]>([]);
  const [filter, setFilter] = useState<DateFilter>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('installHistory');
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch (error) {
      console.error('Failed to load install history:', error);
    }
  }, []);

  const getFilteredHistory = () => {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;

    return history.filter((entry) => {
      if (filter === 'today') {
        return now - entry.dateCopied < oneDayMs;
      } else if (filter === 'week') {
        return now - entry.dateCopied < oneWeekMs;
      }
      return true;
    });
  };

  const filteredHistory = getFilteredHistory();

  const copyToClipboard = async (command: string, index: number) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('installHistory');
    setHistory([]);
    setShowClearConfirm(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="text-[#06D6A0] hover:underline text-sm mb-4 inline-block"
          >
            ← Back to Skills
          </Link>
          <h1 className="text-4xl font-bold mb-2">Your Install History</h1>
          <p className="text-gray-400">
            Track your previously copied install commands
          </p>
        </div>

        {history.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('today')}
                  className={`px-4 py-2 rounded ${
                    filter === 'today'
                      ? 'bg-[#06D6A0] text-black'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setFilter('week')}
                  className={`px-4 py-2 rounded ${
                    filter === 'week'
                      ? 'bg-[#06D6A0] text-black'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded ${
                    filter === 'all'
                      ? 'bg-[#06D6A0] text-black'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  All Time
                </button>
              </div>

              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
              >
                Clear History
              </button>
            </div>

            {showClearConfirm && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded">
                <p className="mb-4">
                  Are you sure you want to clear all install history? This
                  can&apos;t be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={clearHistory}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                  >
                    Yes, Clear All
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {filteredHistory.length > 0 ? (
              <div className="space-y-4">
                {filteredHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-[#06D6A0] transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-[#06D6A0] mb-1">
                          {entry.skillName}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Copied {new Date(entry.dateCopied).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(entry.installCommand, index)}
                        className="px-4 py-2 bg-[#06D6A0] hover:bg-[#05c090] text-black rounded font-medium transition-colors"
                      >
                        {copiedIndex === index ? 'Copied!' : 'Copy Again'}
                      </button>
                    </div>
                    <div className="bg-black p-4 rounded font-mono text-sm overflow-x-auto">
                      <code className="text-gray-300">{entry.installCommand}</code>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>No installs found for this time period.</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-300">
              No installs yet
            </h2>
            <p className="text-gray-500 mb-6">
              Browse skills to get started
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-[#06D6A0] hover:bg-[#05c090] text-black rounded font-medium transition-colors"
            >
              Browse Skills
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
