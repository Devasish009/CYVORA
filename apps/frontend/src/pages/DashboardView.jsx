import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import apiService from '../services/api';
import { 
  FolderGit2, 
  FileCode2, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  TrendingUp, 
  Wrench,
  Clock,
  RefreshCw,
  Cpu,
  ShieldCheck,
  ArrowUpRight,
  Inbox
} from 'lucide-react';

export default function DashboardView({ onNavigate }) {
  const [timeRange, setTimeRange] = useState('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const res = await apiService.getDashboardSummary();
      if (res.success && res.data) {
        setData(res.data);
      }
      setError(null);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to connect to backend telemetry.");
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const activeAgents = [
    { name: 'Code Architecture Scanner', status: 'Active', detail: `${data?.files_scanned || 0} files indexed`, color: 'text-cyan-400 bg-cyan-500/10' },
    { name: 'Root Cause Predictor', status: 'Ready', detail: 'AST & dynamic error analysis active', color: 'text-blue-400 bg-blue-500/10' },
    { name: 'AI Patch Synthesizer', status: 'Ready', detail: 'Structured LLM provider ready', color: 'text-purple-400 bg-purple-500/10' },
    { name: 'Regression Test Runner', status: data?.tests_passed > 0 ? 'Passed' : 'Standby', detail: `${data?.tests_passed || 0} passed test executions`, color: 'text-emerald-400 bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-heading font-extrabold text-white tracking-tight">
              AI Command Center
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live DB Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Real-time database metrics, automated repairs, and AI execution pipeline.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            {['24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  timeRange === range
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={() => onNavigate('repairs')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Open Patch Studio</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={fetchDashboardData} className="underline font-bold">Retry</button>
        </div>
      )}

      {/* 5 Real KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard 
          title="Active Projects" 
          value={loading ? "..." : (data?.projects ?? 0).toString()} 
          change={data?.projects > 0 ? `${data.projects} Active` : "No projects"} 
          changeType={data?.projects > 0 ? "positive" : "neutral"}
          icon={FolderGit2} 
          color="blue" 
          subtext="SQLAlchemy Persisted"
        />
        <StatCard 
          title="Files Analyzed" 
          value={loading ? "..." : (data?.files_scanned ?? 0).toString()} 
          change={data?.files_scanned > 0 ? `${data.files_scanned} Indexed` : "0 Indexed"} 
          changeType={data?.files_scanned > 0 ? "positive" : "neutral"}
          icon={FileCode2} 
          color="cyan" 
          subtext="Project Intelligence"
        />
        <StatCard 
          title="Errors Detected" 
          value={loading ? "..." : (data?.errors_detected ?? 0).toString()} 
          change={data?.errors_detected > 0 ? `${data.errors_detected} Total` : "0 Detected"} 
          changeType={data?.errors_detected > 0 ? "negative" : "positive"}
          icon={AlertTriangle} 
          color="rose" 
          subtext="Static & Dynamic AST"
        />
        <StatCard 
          title="Repairs Fixed" 
          value={loading ? "..." : (data?.repairs_successful ?? 0).toString()} 
          change={data?.repairs_attempted > 0 ? `${data.repair_success_rate}% Success` : "0 Patches"} 
          changeType={data?.repairs_successful > 0 ? "positive" : "neutral"}
          icon={Wrench} 
          color="emerald" 
          subtext={`${data?.repairs_successful ?? 0}/${data?.repairs_attempted ?? 0} Verified`}
        />
        <StatCard 
          title="Tests Passed" 
          value={loading ? "..." : (data?.tests_passed ?? 0).toString()} 
          change={data?.tests_executed > 0 ? `${data.tests_passed}/${data.tests_executed} Passed` : "0 Executed"} 
          changeType={data?.tests_passed > 0 ? "positive" : "neutral"}
          icon={CheckCircle2} 
          color="purple" 
          subtext="Evidence Verifier"
        />
      </div>

      {/* Main Grid: Health Chart & Active AI Subagents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Project Health Overview Dual-Series Chart (Spans 8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#0b0f19] border border-slate-800/80 glass-panel space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Error Detection vs Autonomous Repair Velocity
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Real-time metrics stream</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> 
                <span className="text-slate-300">Errors ({data?.errors_detected ?? 0})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> 
                <span className="text-slate-300">Repairs ({data?.repairs_successful ?? 0})</span>
              </div>
            </div>
          </div>

          {/* SVG Dual-Line Series Chart */}
          <div className="h-64 w-full pt-4 flex flex-col justify-end">
            <svg className="w-full h-48 overflow-visible" viewBox="0 0 500 150">
              <defs>
                <linearGradient id="gradientRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="gradientGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>

              <line x1="0" y1="0" x2="500" y2="0" stroke="#1f293d" strokeDasharray="3 3" />
              <line x1="0" y1="40" x2="500" y2="40" stroke="#1f293d" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#1f293d" strokeDasharray="3 3" />

              <polygon points="0,150 0,140 250,130 500,120 500,150" fill="url(#gradientRed)" />
              <polygon points="0,150 0,145 250,140 500,135 500,150" fill="url(#gradientGreen)" />

              <path d="M0,140 Q250,130 500,120" fill="none" stroke="#ef4444" strokeWidth="2.5" />
              <path d="M0,145 Q250,140 500,135" fill="none" stroke="#10b981" strokeWidth="3" />

              <circle cx="500" cy="135" r="5" fill="#10b981" className="animate-ping" />
              <circle cx="500" cy="135" r="4" fill="#34d399" />
            </svg>

            <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-3 border-t border-slate-800">
              <span>00:00</span>
              <span>04:00</span>
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
            </div>
          </div>
        </div>

        {/* Active AI Subagents Pipeline (Spans 4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#0b0f19] border border-slate-800/80 glass-panel space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              AI Agent Pipeline
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">4 Active</span>
          </div>

          <div className="space-y-3">
            {activeAgents.map((agent, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-colors space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{agent.name}</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${agent.color}`}>
                    {agent.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">{agent.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline Bar */}
      <div className="p-6 rounded-2xl bg-[#0b0f19] border border-slate-800/80 glass-panel space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Live Database Audit Activity Feed
          </h3>
          <button 
            onClick={() => onNavigate('activity-logs')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View Audit Log</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {data?.recent_activities && data.recent_activities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {data.recent_activities.map((act, index) => (
              <div key={act.id || index} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono text-slate-500 font-bold">{act.time}</span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                </div>
                <div className="text-xs font-bold text-slate-200 truncate">{act.action}</div>
                <div className="text-[10px] text-slate-400 truncate font-mono">
                  {JSON.stringify(act.details)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center space-y-2">
            <Inbox className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-medium">No activity log entries recorded in database yet.</p>
            <p className="text-[11px] text-slate-500">Perform an action like scanning a project or launching a repair session.</p>
          </div>
        )}
      </div>
    </div>
  );
}
