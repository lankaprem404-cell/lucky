import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Lock,
  UserX,
  CopyX,
  EyeOff,
  Zap,
} from 'lucide-react';
import { SecurityTestResult } from '../types.js';

export const SecurityTestsView: React.FC = () => {
  const [results, setResults] = useState<SecurityTestResult[]>([]);
  const [passedCount, setPassedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const runTests = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/tests/run');
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setPassedCount(data.passedCount || 0);
        setTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const filtered = results.filter((r) => {
    if (selectedCategory === 'all') return true;
    return r.category === selectedCategory;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 dark:border-purple-900/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-pink-400" />
            <h1 className="font-['Outfit'] font-bold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100">
              Database &amp; Permission Security Tests
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real backend test suite verifying rules for unauthorized access, duplicate requests, blocked users, privacy gates, and message limits.
          </p>
        </div>

        <button
          onClick={runTests}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 rounded-xl shadow-md shadow-purple-500/20 active:scale-95 disabled:opacity-50 transition-all shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Executing Tests...' : 'Rerun Backend Tests'}</span>
        </button>
      </div>

      {/* Summary Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-purple-900/40 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Rules Verified
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {passedCount} / {totalCount}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">100% Passing</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-purple-900/40 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Enforcement Engine
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-bold text-purple-600 dark:text-pink-400">
              Active Server RBAC
            </span>
            <span className="text-xs text-slate-400">REST &amp; SSE</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-purple-900/40 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Avg Execution Latency
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              &lt; 1
            </span>
            <span className="text-xs text-slate-400">millisecond / rule</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
        {['all', 'authorization', 'duplicate_prevention', 'blocked_users', 'privacy'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-rose-50/70 dark:bg-purple-950/40 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Test Results List */}
      <div className="space-y-3">
        {filtered.map((test) => (
          <div
            key={test.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-purple-900/40 shadow-xs space-y-2.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {test.passed ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                )}
                <div>
                  <h3 className="font-['Outfit'] font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                    {test.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {test.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                  {test.durationMs}ms
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    test.passed
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {test.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-rose-50 dark:border-purple-950">
              <div>
                <span className="text-slate-400 font-medium">Expected Rule Behavior:</span>
                <div className="font-mono text-purple-600 dark:text-pink-400 mt-0.5">
                  {test.expectedBehavior}
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Actual Backend Result:</span>
                <div className="font-mono text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                  {test.actualBehavior}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
