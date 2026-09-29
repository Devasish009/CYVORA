import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { Search, AlertTriangle, Eye, Sparkles, Filter, CheckCircle2, ChevronRight, X, Cpu, ArrowUpRight, Inbox } from 'lucide-react';

export default function ErrorsView({ onSelectError }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [selectedErrorModal, setSelectedErrorModal] = useState(null);
  
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const projRes = await apiService.getProjects();
        if (projRes.success && Array.isArray(projRes.data) && projRes.data.length > 0) {
          setProjects(projRes.data);
          const firstProjId = projRes.data[0].id;
          setSelectedProjectId(firstProjId);
          await fetchErrorsForProject(firstProjId, severityFilter);
        } else {
          setProjects([]);
          setErrors([]);
        }
        setErrorMsg(null);
      } catch (err) {
        console.error("ErrorsView fetch error:", err);
        setErrorMsg(err.message || "Failed to load errors from database.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const fetchErrorsForProject = async (projId, severity) => {
    try {
      const errRes = await apiService.getProjectErrors(projId, severity);
      if (errRes.success && Array.isArray(errRes.data)) {
        setErrors(errRes.data);
      }
    } catch (err) {
      console.error("Project errors fetch failed:", err);
    }
  };

  const handleProjectChange = (projId) => {
    setSelectedProjectId(projId);
    fetchErrorsForProject(projId, severityFilter);
  };

  const handleSeverityChange = (sev) => {
    setSeverityFilter(sev);
    if (selectedProjectId) {
      fetchErrorsForProject(selectedProjectId, sev);
    }
  };

  const filteredErrors = errors.filter(e => {
    const matchesSearch = (e.id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (e.file || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (e.error_type || e.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (e.message || e.detail || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Matrix Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-heading font-extrabold text-white tracking-tight">
              Error Diagnostic Matrix
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-mono">
              {errors.length} Detected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Filtered telemetry list of bugs detected by AST scan and runtime traces.</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {projects.length > 0 && (
            <select
              value={selectedProjectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search file, error, trace..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-cyan-500 w-56 font-mono"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => handleSeverityChange(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Severities</option>
            <option value="HIGH">HIGH Severity</option>
            <option value="MEDIUM">MEDIUM Severity</option>
            <option value="LOW">LOW Severity</option>
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Errors Data Table Card */}
      <div className="rounded-2xl bg-[#0b0f19] border border-slate-800/80 glass-panel overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading error diagnostic matrix from database...</div>
        ) : filteredErrors.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No errors detected</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
              Selected project has zero recorded static AST or runtime errors in the database.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">File Location</th>
                  <th className="px-6 py-4">Error Exception</th>
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">Pipeline Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredErrors.map((err) => (
                  <tr key={err.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-cyan-400">{err.id}</td>
                    <td className="px-6 py-4 font-mono text-slate-200">
                      <span className="text-white font-bold">{err.file}</span>
                      {err.line && <span className="text-slate-500 text-[11px] ml-1.5">:L{err.line}</span>}
                    </td>
                    <td className="px-6 py-4 space-y-0.5">
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{err.error_type || err.type}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate max-w-xs">{err.message || err.detail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        err.severity === 'HIGH' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                        err.severity === 'MEDIUM' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                        'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      }`}>
                        {err.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        err.status === 'Fixed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                        err.status === 'Analyzing' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 animate-pulse' :
                        'bg-slate-800 text-slate-300 border border-slate-700/60'
                      }`}>
                        {err.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedErrorModal(err)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                          title="Quick Inspect"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onSelectError(err)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/25"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Synthesize Patch</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Inspection Modal Drawer */}
      {selectedErrorModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full rounded-3xl bg-[#0b0f19] border border-blue-500/30 glass-panel p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedErrorModal(null)}
              className="absolute top-5 right-5 p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-xs text-cyan-400 font-bold">{selectedErrorModal.id}</span>
                <h3 className="text-lg font-bold text-white">{selectedErrorModal.error_type || selectedErrorModal.type}</h3>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-rose-300 space-y-1">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Exception Traceback:</div>
              <p>{selectedErrorModal.message || selectedErrorModal.detail}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedErrorModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const err = selectedErrorModal;
                  setSelectedErrorModal(null);
                  onSelectError(err);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
              >
                <span>Proceed to Patch Studio</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
