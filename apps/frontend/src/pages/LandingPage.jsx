import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  Wrench, 
  AlertTriangle, 
  Activity, 
  Brain,
  Code2,
  Terminal,
  Zap,
  Lock,
  Flame
} from 'lucide-react';

export default function LandingPage({ onStartAnalysis }) {
  const [activeCodeStep, setActiveCodeStep] = useState(0);

  const demoSteps = [
    { label: '1. Detected Issue', code: 'if user.is_authenticated: # AttributeError: NoneType', status: 'error', text: 'Error in auth.py:142' },
    { label: '2. AI Root Cause', code: 'user variable evaluated as None in context', status: 'analyzing', text: 'Analyzing context tree...' },
    { label: '3. Synthesizing Patch', code: 'if not user: return redirect("login")', status: 'fixing', text: 'Generated null guard' },
    { label: '4. Verified & Passed', code: 'PyTest unit & integration test suites passed', status: 'verified', text: '0 regressions found' },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans">
      {/* Top Navbar */}
      <header className="px-8 py-4 flex items-center justify-between border-b border-slate-800/70 glass-nav sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-heading font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              CYVORA
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/15 text-cyan-400 border border-blue-500/30">
              AI ENGINE v2.4
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
          <a href="#pipeline" className="hover:text-cyan-400 transition-colors">Pipeline</a>
          <a href="#hindsight" className="hover:text-cyan-400 transition-colors">Hindsight Memory</a>
          <a href="#enterprise" className="hover:text-cyan-400 transition-colors">Enterprise</a>
        </nav>

        <div className="flex items-center gap-3">
          <button 
            onClick={onStartAnalysis}
            className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-300 hover:text-white transition-colors"
          >
            Log in
          </button>
          <button 
            onClick={onStartAnalysis}
            className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 group"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Headline & Value Prop */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Autonomous AI Software Repair & Auto-Debugging</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight leading-[1.12] text-white">
            Self-Healing Code. <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Zero-Regression AI Repair.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl font-normal">
            CYVORA autonomously analyzes, diagnoses, and patches complex codebase errors. Powered by <b>Hindsight Memory</b>, it references historical incidents to craft accurate fixes and executes automated test verification before applying patches.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button 
              onClick={onStartAnalysis}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs transition-all shadow-xl shadow-blue-600/30 flex items-center gap-2 group"
            >
              <span>Analyze Your Repository</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button 
              onClick={onStartAnalysis}
              className="px-6 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              <span>Explore Interactive Demo</span>
            </button>
          </div>

          {/* Interactive Stepper Pipeline Pills */}
          <div className="pt-6 border-t border-slate-800/80 space-y-3">
            <div className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>5-Step Autonomous Repair Workflow</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Detect
              </span>
              <span className="text-slate-600">→</span>
              <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> Diagnose
              </span>
              <span className="text-slate-600">→</span>
              <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-400 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" /> Patch
              </span>
              <span className="text-slate-600">→</span>
              <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Test
              </span>
              <span className="text-slate-600">→</span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verify
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Code Repair Simulator */}
        <div className="lg:col-span-5 relative">
          <div className="absolute w-72 h-72 rounded-full bg-blue-600/20 blur-3xl pointer-events-none -top-10 -right-10"></div>
          
          <div className="relative rounded-3xl bg-[#0b0f19] border border-blue-500/30 glass-panel shadow-2xl overflow-hidden space-y-4 p-5">
            {/* Window Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                <span className="ml-2 font-mono text-xs text-slate-400 font-semibold">CYVORA Live Simulator</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                ACTIVE
              </span>
            </div>

            {/* Interactive Code Simulator Widget */}
            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2">
                {demoSteps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveCodeStep(idx)}
                    className={`px-3 py-2 rounded-xl text-left transition-all border ${
                      activeCodeStep === idx
                        ? 'bg-blue-600/20 border-blue-500 text-white font-bold shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold text-slate-400">{step.label}</div>
                    <div className="text-xs truncate">{step.text}</div>
                  </button>
                ))}
              </div>

              {/* Code Preview Terminal Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 relative">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>Target File: engine/auth/auth_service.py</span>
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                
                <pre className="text-slate-200 text-xs font-mono overflow-x-auto p-2 rounded bg-slate-900/80 border border-slate-800/80">
                  {demoSteps[activeCodeStep].code}
                </pre>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400 text-[11px]">Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeCodeStep === 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    activeCodeStep === 1 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse' :
                    activeCodeStep === 2 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {demoSteps[activeCodeStep].text}
                  </span>
                </div>
              </div>
            </div>

            {/* Launch CTA */}
            <button
              onClick={onStartAnalysis}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              <span>Test This Workflow Live</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </main>

      {/* Enterprise Statistics Bar */}
      <section className="border-t border-slate-800/80 bg-[#090d16]/90 py-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <h4 className="text-4xl font-heading font-extrabold text-white tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              70%
            </h4>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Faster Debug Cycle</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-4xl font-heading font-extrabold text-white tracking-tight bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              99.4%
            </h4>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Test Verification</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-4xl font-heading font-extrabold text-white tracking-tight bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
              Multi-
            </h4>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Python, JS, Go & Java</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-4xl font-heading font-extrabold text-white tracking-tight bg-gradient-to-r from-indigo-400 to-rose-400 bg-clip-text text-transparent">
              100%
            </h4>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">SOC2 & Enterprise Ready</p>
          </div>
        </div>
      </section>
    </div>
  );
}

