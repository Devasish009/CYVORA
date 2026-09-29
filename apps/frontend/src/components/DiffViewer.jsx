import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Copy, Check, Code, ShieldCheck } from 'lucide-react';

export default function DiffViewer({ fileName = "auth.py" }) {
  const [copied, setCopied] = useState(false);

  const defaultBefore = [
    { line: 120, code: "def get_user_profile(request):" },
    { line: 121, code: "    user = request.user" },
    { line: 122, code: "    # BUG: Direct unauthenticated attribute access" },
    { line: 123, code: "    if user.is_authenticated:", isDel: true },
    { line: 124, code: "        return render(request, 'profile.html')", isDel: true },
    { line: 125, code: "    else:" },
    { line: 126, code: "        return redirect('login')" },
  ];

  const defaultAfter = [
    { line: 120, code: "def get_user_profile(request):" },
    { line: 121, code: "    user = request.user" },
    { line: 122, code: "    # FIX: Added null check to handle unauthenticated requests" },
    { line: 123, code: "    if not user:", isNew: true },
    { line: 124, code: "        return redirect('login')", isNew: true },
    { line: 125, code: "    if user.is_authenticated:" },
    { line: 126, code: "        return render(request, 'profile.html')" },
    { line: 127, code: "    return redirect('login')" },
  ];

  const handleCopyPatch = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Top Diff Action Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white font-mono">{fileName}</span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">Git Diff</span>
        </div>

        <button
          onClick={handleCopyPatch}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          <span>{copied ? 'Patch Copied!' : 'Copy Patch'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Before Panel */}
        <div className="rounded-2xl bg-[#0b0f19] border border-rose-500/25 overflow-hidden shadow-xl glass-panel">
          <div className="flex items-center justify-between px-4 py-2.5 bg-rose-950/40 border-b border-rose-500/20">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
              <AlertCircle className="w-4 h-4" />
              <span>Original (Buggy Source)</span>
            </div>
            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono font-bold border border-rose-500/30">
              AttributeError
            </span>
          </div>

          <div className="p-3 overflow-x-auto font-mono text-xs leading-relaxed">
            {defaultBefore.map((item, i) => (
              <div 
                key={i} 
                className={`flex items-center gap-3 py-1 px-2 rounded transition-colors ${
                  item.isDel ? 'diff-line-del font-semibold' : 'hover:bg-slate-800/40'
                }`}
              >
                <span className="w-7 text-right text-slate-600 select-none font-mono text-[11px] shrink-0">{item.line}</span>
                <span className="w-4 text-center text-rose-400 select-none font-bold shrink-0">{item.isDel ? '-' : ' '}</span>
                <span className={`flex-1 ${item.isDel ? 'text-rose-300' : 'text-slate-300'}`}>
                  {item.code}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* After Panel */}
        <div className="rounded-2xl bg-[#0b0f19] border border-emerald-500/25 overflow-hidden shadow-xl glass-panel">
          <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-950/40 border-b border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>AI Synthesized Patch</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold border border-emerald-500/30">
              Null Safety Patch
            </span>
          </div>

          <div className="p-3 overflow-x-auto font-mono text-xs leading-relaxed">
            {defaultAfter.map((item, i) => (
              <div 
                key={i} 
                className={`flex items-center gap-3 py-1 px-2 rounded transition-colors ${
                  item.isNew ? 'diff-line-add font-semibold' : 'hover:bg-slate-800/40'
                }`}
              >
                <span className="w-7 text-right text-slate-600 select-none font-mono text-[11px] shrink-0">{item.line}</span>
                <span className="w-4 text-center text-emerald-400 select-none font-bold shrink-0">{item.isNew ? '+' : ' '}</span>
                <span className={`flex-1 ${item.isNew ? 'text-emerald-300' : 'text-slate-300'}`}>
                  {item.code}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

