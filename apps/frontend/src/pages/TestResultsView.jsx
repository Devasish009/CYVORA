import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { CheckCircle2, Clock, ShieldAlert, Award, Play, Check, Filter, Search, Terminal, Inbox } from 'lucide-react';

export default function TestResultsView() {
  const [testRuns, setTestRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTestRuns();
  }, []);

  const fetchTestRuns = async () => {
    setLoading(true);
    try {
      const res = await apiService.getTestRuns();
      if (res.success && Array.isArray(res.data)) {
        setTestRuns(res.data);
      }
      setError(null);
    } catch (err) {
      console.error("Test runs fetch error:", err);
      setError(err.message || "Failed to load test runs from database.");
    } finally {
      setLoading(false);
    }
  };

  const totalExecuted = testRuns.reduce((acc, tr) => acc + (tr.total_tests || 0), 0);
  const totalPassed = testRuns.reduce((acc, tr) => acc + (tr.passed_tests || 0), 0);
  const totalFailed = testRuns.reduce((acc, tr) => acc + (tr.failed_tests || 0), 0);
  const passRate = totalExecuted > 0 ? ((totalPassed / totalExecuted) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-heading font-extrabold text-white tracking-tight">Regression Test Execution Suite</h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {testRuns.length > 0 ? `${passRate}% VERIFIED PASS` : '0 EXECUTED'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Automated test execution telemetry following AI candidate patch application.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchTestRuns}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Refresh Test Runs</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading test execution history...</div>
      ) : testRuns.length === 0 ? (
        <div className="py-16 rounded-2xl bg-[#0b0f19] border border-slate-800/80 glass-panel text-center space-y-3 shadow-xl">
          <Inbox className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-heading font-bold text-white">No test runs executed yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Test suites are automatically discovered and executed inside isolated sandboxes when candidate patches are generated.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Donut Gauge Chart Card (4 Cols) */}
          <div className="lg:col-span-4 p-8 rounded-2xl bg-[#0b0f19] border border-slate-800/80 glass-panel flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#1f293d" strokeWidth="10" fill="none" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="#10b981" 
                  strokeWidth="10" 
                  fill="none" 
                  strokeDasharray="251.2" 
                  strokeDashoffset={251.2 - (251.2 * passRate) / 100}
                  strokeLinecap="round" 
                  className="transition-all duration-1000"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-heading font-extrabold text-white">{totalPassed}/{totalExecuted}</span>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Tests Passed</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4" /> {totalFailed} Failures
            </div>
          </div>

          {/* Stat Breakdown Column (8 Cols) */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-[#0b0f19] border border-slate-800/80 glass-panel space-y-6 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span>Test Suite Execution Breakdown</span>
              <span className="text-xs font-mono text-cyan-400">Database Evidence</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/25">
                <div className="text-2xl font-heading font-extrabold text-emerald-400">{totalPassed}</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Passed</div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/25">
                <div className="text-2xl font-heading font-extrabold text-rose-400">{totalFailed}</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Failed</div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/25">
                <div className="text-2xl font-heading font-extrabold text-amber-400">0</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Skipped</div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/25">
                <div className="text-2xl font-heading font-extrabold text-cyan-400">{passRate}%</div>
                <div className="text-xs text-slate-400 mt-1 font-medium font-mono">Pass Rate</div>
              </div>
            </div>

            {/* Test Case Log Feed */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Executed Verification Runs ({testRuns.length})
              </div>

              {testRuns.map((tr) => (
                <div key={tr.id} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${tr.status === 'PASSED' ? 'text-emerald-400' : 'text-rose-400'}`} />
                    <div>
                      <div className="font-mono font-bold text-slate-200">{tr.id}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Candidate: {tr.candidate_id}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-slate-400">{tr.execution_time_s}s</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tr.status === 'PASSED' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}>
                      {tr.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
