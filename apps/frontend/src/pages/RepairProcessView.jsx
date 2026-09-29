import React, { useState, useEffect } from 'react';
import DiffViewer from '../components/DiffViewer';
import apiService from '../services/api';
import {
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
  Cpu,
  Wrench,
  FileCode2,
  Activity,
  ShieldCheck,
  Brain,
  Sparkles,
  Zap,
  Check,
  Play,
  Inbox
} from 'lucide-react';

export default function RepairProcessView({ onBackToErrors }) {
  const [applied, setApplied] = useState(false);
  const [repairs, setRepairs] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    setLoading(true);
    try {
      const res = await apiService.getRepairs();
      if (res.success && Array.isArray(res.data)) {
        setRepairs(res.data);
        if (res.data.length > 0) {
          setSelectedSession(res.data[0]);
        }
      }
    } catch (err) {
      console.error("Fetch repairs error:", err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: '1. Error Telemetry Captured', desc: selectedSession?.target_error || 'Target error registered', icon: AlertTriangle, color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' },
    { title: '2. AST Context Analysis', desc: 'Mapped project structure and symbols', icon: Cpu, color: 'text-blue-400 bg-blue-500/15 border-blue-500/30' },
    { title: '3. Hindsight Memory Query', desc: 'Queried historical fix patterns', icon: Brain, color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' },
    { title: '4. Patch Synthesis', desc: 'Structured LLM provider candidates generated', icon: Wrench, color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
    { title: '5. Sandbox Execution', desc: 'Isolated test execution inside sandbox environment', icon: FileCode2, color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30' },
    { title: '6. Regression Suite Execution', desc: 'Evidence verifier evaluation', icon: Activity, color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30' },
    { title: '7. Patch Verification', desc: `Session Status: ${selectedSession?.status || 'QUEUED'}`, icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToErrors}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Diagnostic Matrix
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-heading font-extrabold text-white tracking-tight">
              AI Patch Synthesis Studio
            </h2>
            {selectedSession && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
                {selectedSession.id}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">Autonomous repair trace with step-by-step verification pipeline.</p>
        </div>

        <div className="flex items-center gap-3">
          {repairs.length > 0 && (
            <select
              value={selectedSession?.id || ''}
              onChange={(e) => setSelectedSession(repairs.find(r => r.id === e.target.value))}
              className="bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              {repairs.map(r => (
                <option key={r.id} value={r.id}>Session: {r.id} ({r.status})</option>
              ))}
            </select>
          )}

          <button
            onClick={() => setApplied(!applied)}
            disabled={!selectedSession}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg ${applied
              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
              : 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-blue-600/30'
              }`}
          >
            {applied ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{applied ? 'Patch Staged to Branch' : 'Stage Patch'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading repair sessions...</div>
      ) : repairs.length === 0 ? (
        <div className="py-16 rounded-2xl bg-[#0b0f19] border border-slate-800/80 glass-panel text-center space-y-3 shadow-xl">
          <Inbox className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-heading font-bold text-white">No repair sessions executed yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Select an error from the Error Diagnostic Matrix to launch an autonomous AI repair session.
          </p>
        </div>
      ) : (
        /* Main Grid: Stepper (Left) & Diff Viewer (Right) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Real-Time Stepper Pipeline (4 Cols) */}
          <div className="lg:col-span-4 p-6 rounded-2xl bg-[#0b0f19] border border-slate-800/80 glass-panel space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                Pipeline Execution Trace
              </h3>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25 uppercase">
                {selectedSession?.status || 'QUEUED'}
              </span>
            </div>

            <div className="space-y-3 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 relative z-10 group">
                    <div className={`p-2 rounded-xl ${step.color} border shrink-0 shadow-md`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">{step.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Code Diff Viewer (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <DiffViewer fileName={selectedSession?.target_error?.split(':')[0] || 'target_file.py'} />

            {/* AI Explanation & Reasoning Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900/90 to-indigo-950/40 border border-blue-500/30 glass-panel space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <Brain className="w-4 h-4 text-cyan-400" />
                  <span>AI Synthesizer Reasoning & Safety Assessment</span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Status: {selectedSession?.status || 'QUEUED'}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Target error analysis: <code className="text-rose-300 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-500/20 font-mono">{selectedSession?.target_error || 'No error target selected'}</code>. CYVORA synthesizes patch candidates and validates them via isolated evidence verification.
              </p>

              <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-400 pt-2 border-t border-slate-800/80">
                <span className="flex items-center gap-1 text-slate-300"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> AST Validated</span>
                <span className="flex items-center gap-1 text-slate-300"><Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Persistent Hindsight Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
