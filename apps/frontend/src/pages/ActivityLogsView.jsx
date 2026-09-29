import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { 
  CheckCircle2, 
  Activity, 
  Wrench, 
  AlertTriangle, 
  FileCode2, 
  FolderGit2, 
  Brain,
  Terminal,
  Copy,
  Check,
  Inbox
} from 'lucide-react';

export default function ActivityLogsView() {
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiService.getActivityLogs();
      if (res.success && Array.isArray(res.data)) {
        setLogs(res.data);
      }
      setError(null);
    } catch (err) {
      console.error("Fetch audit logs error:", err);
      setError(err.message || "Failed to load audit logs from database.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(JSON.stringify(logs, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-heading font-extrabold text-white tracking-tight">System Audit Event Stream</h2>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              DATABASE AUDIT LOGS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-normal">Real-time audit log stream from PostgreSQL/SQLAlchemy audit_logs table.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleCopyLogs}
            disabled={logs.length === 0}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied JSON' : 'Copy Logs'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Terminal Log Console */}
      <div className="rounded-2xl bg-[#070a11] border border-slate-800/80 glass-panel p-5 font-mono shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-300">CYVORA Database Audit Log Stream ({logs.length})</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> DB Stream Active
          </span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading system audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Inbox className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-medium">No database audit log entries recorded yet.</p>
            <p className="text-[11px] text-slate-500 font-sans">
              System events like project scans, session creations, and security checks are automatically recorded here.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            {logs.map((log) => (
              <div key={log.id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-2 border-b border-slate-800/40 last:border-0 hover:bg-slate-900/60 px-2 rounded transition-colors text-xs">
                <span className="text-[11px] text-slate-500 w-36 shrink-0 font-mono">
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'N/A'}
                </span>
                <span className="font-bold text-cyan-400 w-44 shrink-0 font-mono">{log.action}</span>
                <span className="text-slate-300 flex-1 font-mono text-[11px] truncate">
                  {JSON.stringify(log.details)}
                </span>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">{log.id}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
