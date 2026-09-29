import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { 
  BrainCircuit, 
  Search, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  RefreshCw,
  Zap,
  Inbox
} from 'lucide-react';

export default function HindsightView() {
  const [activeTab, setActiveTab] = useState('recall');
  const [recallQuery, setRecallQuery] = useState('TypeError');
  const [recallResults, setRecallResults] = useState(null);
  const [reflectData, setReflectData] = useState(null);
  const [runbooks, setRunbooks] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReflect();
    fetchRunbooks();
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await apiService.getHindsightRecords();
      if (res.success && res.data) {
        setRecords(res.data.records || []);
      }
    } catch (e) {
      console.error("Hindsight records fetch error:", e);
    }
  };

  const fetchReflect = async () => {
    try {
      const res = await apiService.getHindsightReflect();
      if (res.success && res.data) {
        setReflectData(res.data);
      }
    } catch (e) {
      console.error("Reflect fetch error:", e);
    }
  };

  const fetchRunbooks = async () => {
    try {
      const res = await apiService.getRunbooks();
      if (res.success && res.data) {
        setRunbooks(res.data.runbooks || []);
      }
    } catch (e) {
      console.error("Runbooks fetch error:", e);
    }
  };

  const handleRecallSearch = async () => {
    if (!recallQuery) return;
    setLoading(true);
    try {
      const res = await apiService.recallHindsight({ error_message: recallQuery, min_similarity: 0.1 });
      if (res.success && res.data) {
        setRecallResults(res.data);
      } else if (res.matched_records) {
        setRecallResults(res);
      }
      setError(null);
    } catch (e) {
      setError(e.message || "Failed to query Hindsight memory.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Hindsight Persistent Memory</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">CYVORA's operational memory layer storing historical incidents, resolutions, and runbooks.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Persistent Memory Active ({records.length} Records)
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab('recall')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'recall'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Search className="w-3.5 h-3.5" /> RECALL (Incident Search)
        </button>

        <button
          onClick={() => setActiveTab('reflect')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'reflect'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" /> REFLECT (Pattern Analytics)
        </button>

        <button
          onClick={() => setActiveTab('runbooks')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'runbooks'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> RUNBOOKS ({runbooks.length})
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Tab 1: RECALL Search */}
      {activeTab === 'recall' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0b0f19] border border-slate-800/80 glass-panel space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Search Hindsight Memory for Historical Solutions
            </h3>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={recallQuery}
                  onChange={(e) => setRecallQuery(e.target.value)}
                  placeholder="Enter error message, exception type, or affected file..."
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <button
                onClick={handleRecallSearch}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2 shrink-0"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Query Memory
              </button>
            </div>
          </div>

          {/* Recall Results List */}
          {recallResults ? (
            <div className="p-6 rounded-2xl bg-[#0b0f19] border border-slate-800/80 glass-panel space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300">
                  Matches Found: <span className="text-cyan-400">{recallResults.matches_found ?? 0}</span>
                </h4>
              </div>

              {recallResults.matched_records && recallResults.matched_records.length > 0 ? (
                recallResults.matched_records.map((rec, i) => (
                  <div key={rec.record_id || i} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-400">{rec.incident_id || rec.record_id}</span>
                        <span className="text-xs font-semibold text-white">{rec.error_type}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{rec.category}</span>
                      </div>

                      {rec.similarity_score !== undefined && (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          Similarity Match: {(rec.similarity_score * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 font-mono">{rec.error_message}</p>

                    <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/20 text-xs space-y-1">
                      <div className="font-bold text-cyan-300">Root Cause Strategy:</div>
                      <div className="text-slate-300">{rec.recommended_fix_strategy || rec.repair_strategy}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center space-y-2">
                  <Inbox className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">No matching historical memory records found for query.</p>
                </div>
              )}
            </div>
          ) : records.length > 0 ? (
            <div className="p-6 rounded-2xl bg-[#0b0f19] border border-slate-800/80 glass-panel space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">All Persistent Hindsight Records ({records.length})</h4>
              <div className="space-y-3">
                {records.map((rec) => (
                  <div key={rec.record_id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-400 font-mono">{rec.record_id}</span>
                      <span className="text-xs font-semibold text-slate-300">{rec.error_type}</span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono">{rec.error_message}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 rounded-2xl bg-[#0b0f19] border border-slate-800/80 glass-panel text-center space-y-3">
              <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No repair memories yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Hindsight automatically retains verified patch patterns after executing successful repair sessions.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: REFLECT Analytics */}
      {activeTab === 'reflect' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0b0f19] border border-slate-800/80 glass-panel space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Incident Pattern Summary
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-xs py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Total Incidents Recorded:</span>
                <span className="font-bold text-white">{reflectData?.total_incidents_recorded ?? records.length}</span>
              </div>
              <div className="flex justify-between text-xs py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Successful Repairs Retained:</span>
                <span className="font-bold text-emerald-400">{reflectData?.successful_repairs_count ?? records.length}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0b0f19] border border-slate-800/80 glass-panel space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Recurring Pattern Insights
            </h3>

            <div className="space-y-2">
              {reflectData?.recurring_patterns && reflectData.recurring_patterns.length > 0 ? (
                reflectData.recurring_patterns.map((pat, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{pat}</span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-slate-500">No recurring pattern insights generated yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Operational Runbooks */}
      {activeTab === 'runbooks' && (
        <div className="space-y-4">
          {runbooks.length > 0 ? (
            runbooks.map((rb) => (
              <div key={rb.runbook_id} className="p-6 rounded-2xl bg-[#0b0f19] border border-slate-800/80 glass-panel space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{rb.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">Runbook ID: {rb.runbook_id}</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-300 space-y-2">
                  <p><strong className="text-cyan-400">Error Pattern:</strong> {rb.error_pattern}</p>
                  <p><strong className="text-emerald-400">Resolution Strategy:</strong> {rb.resolution_strategy}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 rounded-2xl bg-[#0b0f19] border border-slate-800/80 glass-panel text-center space-y-3">
              <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No runbooks compiled yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                CYVORA automatically synthesizes structured operational runbooks when multiple similar errors are fixed.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
